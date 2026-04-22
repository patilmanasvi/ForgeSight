import os
import io
import jax
import jax.numpy as jnp
from flax import linen as nn
import flax.serialization
from PIL import Image

# =========================================
# MODEL ARCHITECTURE (Copied from Training)
# =========================================
class SEBlock(nn.Module):
    """Squeeze-and-Excitation block for channel attention in CNN stem."""
    reduction: int = 4

    @nn.compact
    def __call__(self, x):
        c = x.shape[-1]
        s = jnp.mean(x, axis=(1, 2), keepdims=True)          # Squeeze
        s = nn.Dense(max(c // self.reduction, 8))(s)
        s = nn.relu(s)
        s = nn.Dense(c)(s)
        s = nn.sigmoid(s)
        return x * s                                           # Excite


class CNNStemBlock(nn.Module):
    """Single CNN stem block: Conv → BN → ReLU → SE (NO double downsample)."""
    features: int
    stride: int = 2

    @nn.compact
    def __call__(self, x, use_running_average: bool = True):
        x = nn.Conv(self.features, (3, 3), strides=(self.stride, self.stride),
                    padding='SAME', use_bias=False)(x)
        x = nn.BatchNorm(use_running_average=use_running_average,
                         momentum=0.9)(x)
        x = nn.relu(x)
        x = SEBlock()(x)
        return x


class CNNStem(nn.Module):
    """
    3-stage CNN stem. Each stage halves resolution ONCE.
    224 → 112 → 56 → 28  (28×28 = 784 tokens, far more than the original 3×3)
    """
    features: tuple = (64, 128, 256)

    @nn.compact
    def __call__(self, x, use_running_average: bool = True):
        # Initial 7×7 conv like ResNet for better low-level features
        x = nn.Conv(32, (7, 7), strides=(2, 2), padding='SAME',
                    use_bias=False)(x)                         # 224→112
        x = nn.BatchNorm(use_running_average=use_running_average,
                         momentum=0.9)(x)
        x = nn.relu(x)

        for f in self.features:
            x = CNNStemBlock(f, stride=2)(x, use_running_average)  # 112→56→28→14

        return x


class MLPBlock(nn.Module):
    mlp_dim: int
    dropout_rate: float = 0.1

    @nn.compact
    def __call__(self, x, deterministic: bool = True):
        d = x.shape[-1]
        x = nn.Dense(self.mlp_dim)(x)
        x = nn.gelu(x)
        x = nn.Dropout(self.dropout_rate, deterministic=deterministic)(x)
        x = nn.Dense(d)(x)
        x = nn.Dropout(self.dropout_rate, deterministic=deterministic)(x)
        return x


class TransformerBlock(nn.Module):
    num_heads: int
    mlp_dim: int
    dropout_rate: float = 0.1

    @nn.compact
    def __call__(self, x, deterministic: bool = True):
        # Pre-norm attention
        y = nn.LayerNorm()(x)
        y = nn.MultiHeadDotProductAttention(
            num_heads=self.num_heads,
            dropout_rate=self.dropout_rate,
            deterministic=deterministic
        )(y, y)
        x = x + y

        # Pre-norm MLP
        y = nn.LayerNorm()(x)
        y = MLPBlock(self.mlp_dim, self.dropout_rate)(y, deterministic)
        x = x + y
        return x


class HybridViT(nn.Module):
    """
    Improved Hybrid ViT for deepfake detection.
    Key upgrades:
      - SE-augmented CNN stem (no double downsampling)
      - 196 tokens instead of 9
      - 8 transformer blocks, 8 heads, 512 dim
      - CLS token + global-avg-pool fusion
      - Stochastic depth (DropPath) via dropout on residuals
      - Final MLP head with dropout
    """
    num_classes: int = 2
    embed_dim: int = 256
    num_heads: int = 8
    mlp_dim: int = 512
    num_layers: int = 8
    dropout_rate: float = 0.1

    @nn.compact
    def __call__(self, x, deterministic: bool = True):
        # ---- CNN Stem ----
        x = CNNStem(features=(64, 128, self.embed_dim))(
            x, use_running_average=deterministic)
        b, h, w, c = x.shape

        # ---- Patchify ----
        x = x.reshape((b, h * w, c))             # (B, N, embed_dim)

        # ---- CLS token ----
        cls = self.param('cls_token', nn.initializers.zeros, (1, 1, self.embed_dim))
        cls = jnp.broadcast_to(cls, (b, 1, self.embed_dim))
        x = jnp.concatenate([cls, x], axis=1)    # (B, N+1, embed_dim)

        # ---- Positional embedding ----
        seq_len = x.shape[1]
        pos = self.param('pos_embed', nn.initializers.normal(0.02),
                         (1, seq_len, self.embed_dim))
        x = x + pos
        x = nn.Dropout(self.dropout_rate, deterministic=deterministic)(x)

        # ---- Transformer blocks ----
        for _ in range(self.num_layers):
            x = TransformerBlock(
                num_heads=self.num_heads,
                mlp_dim=self.mlp_dim,
                dropout_rate=self.dropout_rate
            )(x, deterministic)

        x = nn.LayerNorm()(x)

        # ---- Dual readout: CLS + GAP ----
        cls_out = x[:, 0]                          # CLS token
        gap_out = jnp.mean(x[:, 1:], axis=1)      # Global average pool
        x = jnp.concatenate([cls_out, gap_out], axis=-1)  # (B, 2*embed_dim)

        # ---- MLP head ----
        x = nn.Dense(self.embed_dim)(x)
        x = nn.gelu(x)
        x = nn.Dropout(self.dropout_rate, deterministic=deterministic)(x)
        x = nn.Dense(self.num_classes)(x)

        return x


# =========================================
# INFERENCE PIPELINE
# =========================================
class DeepfakeDetector:
    def __init__(self, weights_path="forgesight_vit_weights.msgpack"):
        self.model = HybridViT()
        self.weights_path = weights_path
        self.params = None
        self.batch_stats = None
        self._load_weights()

    def _load_weights(self):
        # We need a dummy input to initialize the parameters structure first
        dummy_input = jnp.ones((1, 224, 224, 3))
        key = jax.random.PRNGKey(0)
        variables = self.model.init({'params': key, 'dropout': key}, dummy_input, deterministic=False)
        self.params = variables['params']
        self.batch_stats = variables.get('batch_stats', {})

        if os.path.exists(self.weights_path):
            try:
                with open(self.weights_path, 'rb') as f:
                    msgpack_data = f.read()
                
                # Restore the state
                restored = flax.serialization.msgpack_restore(msgpack_data)
                
                # The Kaggle code saves ckpt = {'params': params, 'batch_stats': batch_stats}
                if isinstance(restored, dict) and 'params' in restored:
                    self.params = restored['params']
                    self.batch_stats = restored.get('batch_stats', self.batch_stats)
                else:
                    self.params = restored
                print(f"Successfully loaded weights from {self.weights_path}")
            except Exception as e:
                print(f"Warning: Failed to load weights from {self.weights_path}: {e}")
        else:
            print(f"Warning: Weights file '{self.weights_path}' not found. Using untrained initialization. (Did you download it from Kaggle yet?)")

    def preprocess_image(self, image_bytes):
        # Load image from bytes
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        # Resize to match training data
        image = image.resize((224, 224))
        # Convert to numpy array and normalize [0, 1]
        img_array = jnp.array(image, dtype=jnp.float32) / 255.0
        # Apply ImageNet normalization (matches kaggle_training.py)
        mean = jnp.array([0.485, 0.456, 0.406])
        std = jnp.array([0.229, 0.224, 0.225])
        img_array = (img_array - mean) / std
        # Add batch dimension
        img_array = jnp.expand_dims(img_array, axis=0)
        return img_array

    def predict(self, image_bytes):
        # 1. Preprocess
        x = self.preprocess_image(image_bytes)
        
        # 2. Run inference (deterministic=True for evaluation)
        logits = self.model.apply(
            {'params': self.params, 'batch_stats': self.batch_stats}, 
            x, 
            deterministic=True
        )
        
        # 3. Softmax to get probabilities
        probs = jax.nn.softmax(logits, axis=-1)[0]
        
        pred_idx = jnp.argmax(probs).item()
        confidence = float(probs[pred_idx])
        
        # tf.keras.utils.image_dataset_from_directory sorts alphabetically. FAKE (0), REAL (1)
        verdict = "REAL" if pred_idx == 1 else "FAKE"
        
        # If the model is very uncertain, we can clamp it
        if confidence < 0.60:
            verdict = "UNSURE"

        return {
            "verdict": verdict,
            "confidence": confidence,
            "reasoning": f"Local JAX ViT prediction ({confidence*100:.1f}% conf)."
        }

# Singleton instance for FastAPI
detector = None

def get_detector():
    global detector
    if detector is None:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        weights_file = os.path.join(current_dir, "forgesight_vit_weights.msgpack")
        detector = DeepfakeDetector(weights_path=weights_file)
    return detector