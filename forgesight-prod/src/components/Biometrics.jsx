import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Biometrics() {
  const [waveData1, setWaveData1] = useState([]);
  const [waveData2, setWaveData2] = useState([]);

  useEffect(() => {
    // Generate wave data
    const generateWave = () => {
      const data = [];
      for (let i = 0; i < 100; i++) {
        data.push(
          Math.sin(i * 0.1) * 20 + 50 + (Math.random() - 0.5) * 10
        );
      }
      return data;
    };

    setWaveData1(generateWave());
    setWaveData2(generateWave());

    const interval = setInterval(() => {
      setWaveData1(generateWave());
      setWaveData2(generateWave());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const drawWave = (data) => {
    if (data.length === 0) return "";
    const points = data
      .map((val, i) => `${(i / data.length) * 100},${val}`)
      .join(" ");
    return `M0,${data[0]} L${points}`;
  };

  return (
    <section id="biometrics" className="relative min-h-screen bg-void py-24 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-bio/5 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-[1440px] px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-12"
        >
          <div className="space-y-4">
            <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-bio/80">
              02 // MULTI-MODAL BIOMETRICS
            </div>
            <h2 className="font-display text-5xl lg:text-6xl font-bold text-white leading-tight">
              Three independent signals. One biological ground truth.
            </h2>
            <p className="text-lg text-white/70 max-w-2xl">
              MediaPipe surfaces micro-signals the eye can't see: blood-flow from rPPG, point-of-gaze drift, and phoneme-to-viseme alignment — all fused into a coherence score.
            </p>
          </div>

          {/* Signals grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left column: Two signal charts */}
            <div className="space-y-6">
              {/* rPPG Signal */}
              <motion.div
                whileHover={{ borderColor: "rgba(0,240,255,0.4)" }}
                className="border border-bio/40 bg-surface p-6 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-bio">
                    🟢 rPPG // REMOTE PHOTOPLETHYSMOGRAPHY
                  </div>
                  <div className="font-mono text-[10px] text-white/50">T2 BPM</div>
                </div>

                <svg
                  viewBox="0 0 100 50"
                  className="w-full h-20 mb-4"
                  preserveAspectRatio="none"
                >
                  <path
                    d={drawWave(waveData1)}
                    stroke="#00FF66"
                    strokeWidth="0.3"
                    fill="none"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                <div className="grid grid-cols-3 gap-4 text-[9px] font-mono">
                  <div>
                    <div className="text-white/50">PEAK SNR</div>
                    <div className="text-bio font-bold">14.2 dB</div>
                  </div>
                  <div>
                    <div className="text-white/50">Δ FOREHEAD</div>
                    <div className="text-white/70">0.42%</div>
                  </div>
                  <div>
                    <div className="text-white/50">Δ CHEEK-L</div>
                    <div className="text-white/70">0.38%</div>
                  </div>
                </div>
              </motion.div>

              {/* Flagged Subject */}
              <motion.div
                whileHover={{ borderColor: "rgba(255,42,42,0.4)" }}
                className="border border-crimson/40 bg-surface p-6 rounded-lg transition-colors"
              >
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-crimson mb-4">
                  🔴 SUBJECT-B // FLAGGED
                </div>

                <svg
                  viewBox="0 0 100 50"
                  className="w-full h-20 mb-4"
                  preserveAspectRatio="none"
                >
                  <path
                    d={drawWave(waveData2)}
                    stroke="#FF2A2A"
                    strokeWidth="0.3"
                    fill="none"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                <div className="font-mono text-[9px] text-white/50">
                  ANOMALIES DETECTED
                </div>
              </motion.div>
            </div>

            {/* Right column: Fusion score + signal matrix */}
            <div className="space-y-6">
              {/* Coherence Fusion */}
              <motion.div
                whileHover={{ borderColor: "rgba(0,240,255,0.4)" }}
                className="border border-quantum/40 bg-surface p-6 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/60">
                    🟡 COHERENCE // FUSION
                  </div>
                  <div className="font-mono text-[10px] text-crimson">LOW</div>
                </div>

                {/* Circular score display */}
                <div className="flex items-center justify-center relative h-32 mb-6">
                  <svg className="w-24 h-24" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#1A1A1A" strokeWidth="2" />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#FF2A2A"
                      strokeWidth="2"
                      strokeDasharray={`${(18 / 100) * 282} 282`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                    <text
                      x="50"
                      y="55"
                      textAnchor="middle"
                      className="font-mono font-bold text-2xl fill-crimson"
                    >
                      18
                    </text>
                  </svg>
                  <div className="absolute text-center">
                    <div className="font-mono text-[10px] text-white/60">OUT OF 100</div>
                  </div>
                </div>
              </motion.div>

              {/* Signal Matrix */}
              <motion.div
                whileHover={{ borderColor: "rgba(0,240,255,0.4)" }}
                className="border border-quantum/20 bg-surface p-6 rounded-lg transition-colors"
              >
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/60 mb-4">
                  🔵 SIGNAL MATRIX // FUSION
                </div>

                <div className="space-y-2 font-mono text-[9px]">
                  <div className="flex justify-between">
                    <span className="text-white/60">♥ rPPG</span>
                    <span className="text-white/50">R=0.42</span>
                    <span className="text-crimson">0.12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">🔍 PoG</span>
                    <span className="text-white/50">R=0.28</span>
                    <span className="text-crimson">0.23</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom info section */}
          <div className="border-t border-quantum/10 pt-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              { label: "POINT-OF-GAZE", detail: "TRACKING", alert: "DRIFT DETECTED" },
              { label: "PHONEME", detail: "VISEME SYNC", alert: "0.48" },
              { label: "Δ RPA", detail: "STABILITY", alert: "ACTIVE" },
              { label: "MULTI-MODAL", detail: "AGREEMENT SCORE", alert: "ACTIVE" },
            ].map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="font-mono text-[9px] text-white/50 uppercase">{item.label}</div>
                <div className="font-mono text-[10px] text-white/70">{item.detail}</div>
                <div className="font-mono text-[11px] font-bold text-quantum">{item.alert}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
