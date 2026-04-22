
import os

path = "/kaggle/input/datasets/manjilkarki/deepfake-and-real-images/Dataset"

for root, dirs, files in os.walk(path):
    print("Current:", root)
    print("Folders:", dirs)
    break

# =========================================
# INSTALL
# =========================================
# !pip install flax optax tensorflow

# =========================================
# IMPORTS
# =========================================
import os
import jax
import jax.numpy as jnp
from flax import linen as nn
import optax
import tensorflow as tf
import flax.serialization
from functools import partial

tf.config.set_visible_devices([], 'GPU')


# =========================================
# MODEL — IMPROVED HYBRID ViT
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


def create_model():
    model = HybridViT()
    variables = model.init(
        {'params': jax.random.PRNGKey(0), 'dropout': jax.random.PRNGKey(1)},
        jnp.ones((1, 224, 224, 3)),
        deterministic=False
    )
    return model, variables['params'], variables.get('batch_stats', {})


# =========================================
# DATASET — STRONGER AUGMENTATION
# =========================================
def build_dataset(batch_size: int = 32):
    base = "/kaggle/input/datasets/manjilkarki/deepfake-and-real-images"

    train_path = os.path.join(base, "Dataset", "Train")
    val_path   = os.path.join(base, "Dataset", "Validation")

    print("Train path:", train_path)
    print("Val path:", val_path)

    train_ds = tf.keras.utils.image_dataset_from_directory(
        train_path,
        label_mode="categorical",
        image_size=(224, 224),
        batch_size=None,
        shuffle=True,
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
        val_path,
        label_mode="categorical",
        image_size=(224, 224),
        batch_size=None,
        shuffle=False,
    )

    def augment(x, y):
        x = tf.image.random_flip_left_right(x)
        x = tf.image.random_brightness(x, 0.2)
        x = tf.cast(x, tf.float32) / 255.0
        return x, y

    def preprocess_val(x, y):
        x = tf.cast(x, tf.float32) / 255.0
        return x, y

    train_ds = (train_ds
                .map(augment, num_parallel_calls=tf.data.AUTOTUNE)
                .batch(batch_size)
                .prefetch(tf.data.AUTOTUNE))

    val_ds = (val_ds
              .map(preprocess_val, num_parallel_calls=tf.data.AUTOTUNE)
              .batch(batch_size)
              .prefetch(tf.data.AUTOTUNE))

    return train_ds, val_ds

    print("Dataset path:", path)

    common_kwargs = dict(
        validation_split=0.2,
        seed=42,
        label_mode="categorical",
        image_size=(224, 224),
        batch_size=None,
        shuffle=True,
    )

    train_ds = tf.keras.utils.image_dataset_from_directory(
        path, subset="training", **common_kwargs)
    val_ds = tf.keras.utils.image_dataset_from_directory(
        path, subset="validation", **common_kwargs)

    def augment(x, y):
        # Geometric
        x = tf.image.random_flip_left_right(x)
        x = tf.image.random_flip_up_down(x)

        # Color jitter — important for deepfakes
        x = tf.image.random_brightness(x, 0.2)
        x = tf.image.random_contrast(x, 0.75, 1.25)
        x = tf.image.random_saturation(x, 0.75, 1.25)
        x = tf.image.random_hue(x, 0.05)

        # JPEG compression artifacts — critical signal for deepfake detection
        x = tf.cast(x, tf.uint8)
        x = tf.image.random_jpeg_quality(x, min_jpeg_quality=50,
                                         max_jpeg_quality=100)
        x = tf.cast(x, tf.float32) / 255.0

        # Random crop + resize (scale jitter)
        crop_size = tf.random.uniform([], 160, 224, dtype=tf.int32)
        x = tf.image.random_crop(x, [crop_size, crop_size, 3])
        x = tf.image.resize(x, [224, 224])

        # Normalize with ImageNet stats
        mean = tf.constant([0.485, 0.456, 0.406])
        std  = tf.constant([0.229, 0.224, 0.225])
        x = (x - mean) / std
        return x, y

    def preprocess_val(x, y):
        x = tf.cast(x, tf.float32) / 255.0
        mean = tf.constant([0.485, 0.456, 0.406])
        std  = tf.constant([0.229, 0.224, 0.225])
        x = (x - mean) / std
        return x, y

    train_ds = (train_ds
                .map(augment, num_parallel_calls=tf.data.AUTOTUNE)
                .batch(batch_size)
                .prefetch(tf.data.AUTOTUNE))

    val_ds = (val_ds
              .map(preprocess_val, num_parallel_calls=tf.data.AUTOTUNE)
              .batch(batch_size)
              .prefetch(tf.data.AUTOTUNE))

    return train_ds, val_ds


# =========================================
# MIXUP AUGMENTATION (JAX-side)
# =========================================

def mixup(x, y, rng, alpha: float = 0.4):
    """Mixup in JAX — interpolates pairs of samples."""
    lam_rng, perm_rng = jax.random.split(rng)
    lam = jax.random.beta(lam_rng, alpha, alpha)
    lam = jnp.maximum(lam, 1 - lam)

    perm = jax.random.permutation(perm_rng, x.shape[0])
    x_mix = lam * x + (1 - lam) * x[perm]
    y_mix = lam * y + (1 - lam) * y[perm]
    return x_mix, y_mix


# =========================================
# TRAIN STEP
# =========================================

def create_train_step(model, tx):

    @jax.jit
    def train_step(params, batch_stats, opt_state, x, y, rng):
        mix_rng, drop_rng = jax.random.split(rng)

        # Mixup
        x, y = mixup(x, y, mix_rng, alpha=0.4)

        def loss_fn(p):
            logits, updates = model.apply(
                {'params': p, 'batch_stats': batch_stats},
                x,
                deterministic=False,
                rngs={'dropout': drop_rng},
                mutable=['batch_stats']
            )
            # Label-smoothed cross-entropy
            smooth = 0.1
            n = y.shape[-1]
            soft_y = y * (1 - smooth) + smooth / n
            loss = jnp.mean(optax.softmax_cross_entropy(logits, soft_y))
            return loss, (logits, updates)

        (loss, (logits, updates)), grads = jax.value_and_grad(
            loss_fn, has_aux=True)(params)

        # Gradient clipping applied via optax chain below
        updates_tx, opt_state_new = tx.update(grads, opt_state, params)
        params_new = optax.apply_updates(params, updates_tx)
        new_batch_stats = updates.get('batch_stats', batch_stats)

        # Accuracy on hard labels (pre-mixup soft labels still useful for loss)
        acc = jnp.mean(jnp.argmax(logits, -1) == jnp.argmax(y, -1))
        return params_new, new_batch_stats, opt_state_new, loss, acc

    return train_step


@partial(jax.jit, static_argnums=(0,))
def eval_step(model, params, batch_stats, x, y):
    logits = model.apply(
        {'params': params, 'batch_stats': batch_stats},
        x,
        deterministic=True
    )
    loss = jnp.mean(optax.softmax_cross_entropy(logits, y))
    acc = jnp.mean(jnp.argmax(logits, -1) == jnp.argmax(y, -1))
    return loss, acc


# =========================================
# TRAIN LOOP
# =========================================

def train():
    print("Devices:", jax.device_count())

    model, params, batch_stats = create_model()

    # Count and display param count
    n_params = sum(x.size for x in jax.tree_util.tree_leaves(params))
    print(f"Model parameters: {n_params:,}")

    # ---- LR Schedule: warmup → cosine decay ----
    train_ds, val_ds = build_dataset(batch_size=32)
    
    steps_per_epoch = 140002 // 32 
    total_steps = steps_per_epoch * 25       # 25 epochs
    warmup_steps = steps_per_epoch * 2       # 2 epoch warmup

    schedule = optax.warmup_cosine_decay_schedule(
        init_value=0.0,
        peak_value=3e-4,
        warmup_steps=warmup_steps,
        decay_steps=total_steps,
        end_value=1e-6,
    )

    # Optimizer: AdamW + gradient clipping
    tx = optax.chain(
        optax.clip_by_global_norm(1.0),
        optax.adamw(learning_rate=schedule, weight_decay=1e-4),
    )
    opt_state = tx.init(params)

    train_step = create_train_step(model, tx)

    rng = jax.random.PRNGKey(42)
    best_val_acc = 0.0
    epochs = 25

    for epoch in range(epochs):
        print(f"\n{'='*50}")
        print(f"Epoch {epoch+1}/{epochs}  |  LR: {schedule(epoch*steps_per_epoch):.2e}")

        # ---- TRAIN ----
        t_loss, t_acc = [], []
        for xb, yb in train_ds:
            x = jnp.array(xb.numpy())
            y = jnp.array(yb.numpy())
            rng, sub = jax.random.split(rng)
            params, batch_stats, opt_state, loss, acc = train_step(
                params, batch_stats, opt_state, x, y, sub)
            t_loss.append(float(loss))
            t_acc.append(float(acc))

        # ---- VALIDATION (full) ----
        v_loss, v_acc = [], []
        for xb, yb in val_ds:
            x = jnp.array(xb.numpy())
            y = jnp.array(yb.numpy())
            loss, acc = eval_step(model, params, batch_stats, x, y)
            v_loss.append(float(loss))
            v_acc.append(float(acc))

        tr_loss = sum(t_loss) / len(t_loss)
        tr_acc  = sum(t_acc)  / len(t_acc)  * 100
        vl_loss = sum(v_loss) / len(v_loss)
        vl_acc  = sum(v_acc)  / len(v_acc)  * 100

        print(f"Train  →  Loss: {tr_loss:.4f}  Acc: {tr_acc:.2f}%")
        print(f"Val    →  Loss: {vl_loss:.4f}  Acc: {vl_acc:.2f}%")

        # ---- Save best checkpoint ----
        if vl_acc > best_val_acc:
            best_val_acc = vl_acc
            ckpt = {'params': params, 'batch_stats': batch_stats}
            with open('/kaggle/working/forgesight_vit_best.msgpack', 'wb') as f:
                f.write(flax.serialization.msgpack_serialize(ckpt))
            print(f"  ★ New best saved  ({best_val_acc:.2f}%)")

    # ---- Save final weights ----
    ckpt = {'params': params, 'batch_stats': batch_stats}
    with open('/kaggle/working/forgesight_vit_final.msgpack', 'wb') as f:
        f.write(flax.serialization.msgpack_serialize(ckpt))

    print(f"\nTraining complete.")
    print(f"Best Val Accuracy : {best_val_acc:.2f}%")
    print("Weights saved to /kaggle/working/")


# =========================================
# RUN
# =========================================
if __name__ == "__main__":
    train()

train_ds, val_ds = build_dataset()

for x, y in train_ds.take(1):
    print(x.shape, y.shape)