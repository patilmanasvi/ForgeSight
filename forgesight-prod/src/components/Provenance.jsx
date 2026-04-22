import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Code } from "lucide-react";

export default function Provenance() {
  const [auditRows, setAuditRows] = useState([]);

  useEffect(() => {
    const rows = [
      {
        ts: "09:14:222",
        hash: "0x4a2f...e8b",
        verdict: "SYNTHETIC",
        confidence: "97.3%",
        anchor: "#48392104",
      },
      {
        ts: "09:14:192",
        hash: "0xb0de...71c2",
        verdict: "AUTHENTIC",
        confidence: "99.1%",
        anchor: "#48392102",
      },
      {
        ts: "09:14:152",
        hash: "0x02d2p...b3fd",
        verdict: "SYNTHETIC",
        confidence: "94.0%",
        anchor: "#48392100",
      },
    ];
    setAuditRows(rows);
  }, []);

  return (
    <section id="provenance" className="relative min-h-screen bg-void py-24 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-quantum/5 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-[1440px] px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-12"
        >
          <div className="space-y-4">
            <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-quantum/80">
              04 // PROVENANCE + GEMINI AUDIT
            </div>
            <h2 className="font-display text-5xl lg:text-6xl font-bold text-white leading-tight">
              Every verdict is cryptographically anchored, every report speaks plain English.
            </h2>
            <p className="text-lg text-white/70 max-w-2xl">
              Cloud Run microservices hash, prove, and anchor each analysis to Polygon via zk-SNARK. Gemini 1.5 Flash narrates the forensic evidence for non-technical stakeholders.
            </p>
          </div>

          {/* Two column: Report + C2PA metadata */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gemini Report */}
            <motion.div
              whileHover={{ borderColor: "rgba(0,240,255,0.4)" }}
              className="border border-quantum/30 bg-surface p-6 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-quantum">
                  💬 GEMINI-1.5-FLASH // FORENSIC-REPORT.MD
                </div>
                <div className="font-mono text-[10px] text-bio">LIVE</div>
              </div>

              <div className="bg-void p-4 rounded font-mono text-[9px] text-quantum leading-relaxed overflow-y-auto max-h-96">
                <div>// GEMINI 1.5 FLASH // FORENSIC ANALYSIS</div>
                <div>// Asset: frame_0x442f...e91b.jpg</div>
                <div>// Generated 2026-02-14T09:14:222</div>
                <div className="mt-4 text-white/60">
                  <div className="mb-2">SUMMARY:</div>
                  <div>
                    Frame exhibits multi-modal inconsistencies consistent with diffusion-model synthesis. Blood-flow signals (rPPG) show 0.12 coherence across forehead and cheek ROIs — authentic subjects typically exceed 0.68.
                  </div>
                  <div className="mt-3 mb-2">Gaze dynamics display an anomalous 2.41° drift relative to the expected saccadic trajectory, and phoneme-viseme alignment lags by 184ms.</div>
                  <div className="mt-3 mb-2 text-crimson">
                    CONCLUSION: SYNTHETIC [97.3% confidence]
                  </div>
                  <div className="mt-2">
                    RECOMMENDATION: Flag asset, anchor hash to Pol
                  </div>
                </div>
              </div>
            </motion.div>

            {/* C2PA Metadata */}
            <div className="space-y-6">
              {/* C2PA Section */}
              <motion.div
                whileHover={{ borderColor: "rgba(0,240,255,0.4)" }}
                className="border border-quantum/30 bg-surface p-6 rounded-lg transition-colors"
              >
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-quantum mb-4">
                  🔐 C2PA // MANIFEST
                </div>

                <div className="space-y-3 font-mono text-[9px]">
                  <div>
                    <div className="text-white/60">CLAIM_GENERATOR</div>
                    <div className="text-white">ForgeSight/2026.02</div>
                  </div>
                  <div>
                    <div className="text-white/60">FORMAT</div>
                    <div className="text-white">image/jpeg</div>
                  </div>
                  <div>
                    <div className="text-white/60">SIGNATURE</div>
                    <div className="text-quantum break-all">ed29519 • verified</div>
                  </div>
                  <div>
                    <div className="text-white/60">ISSUER</div>
                    <div className="text-white">vertex-ai.googleapis.com</div>
                  </div>
                </div>
              </motion.div>

              {/* zk-SNARK Proof */}
              <motion.div
                whileHover={{ borderColor: "rgba(0,240,255,0.4)" }}
                className="border border-quantum/30 bg-surface p-6 rounded-lg transition-colors"
              >
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-quantum mb-4">
                  🔒 zk-SNARK // PROOF
                </div>

                <div className="space-y-2 font-mono text-[8px] text-white/60 break-all">
                  <div>π = (A:0xb9e8a..., B:0xd2e7e..., C:0xea01f...)</div>
                  <div className="mt-2">input[] = {"{0x0d9e8a..., 0:0d2e7e..., ...}"}</div>
                </div>

                <div className="mt-3 font-mono text-[9px] text-white/60">
                  OROTHIS : PN284 • VERIFY TIME: 2.1ms
                </div>
              </motion.div>

              {/* Polygon Anchor */}
              <motion.div
                whileHover={{ borderColor: "rgba(0,240,255,0.4)" }}
                className="border border-quantum/30 bg-surface p-6 rounded-lg transition-colors"
              >
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-quantum mb-4">
                  ⛓️ POLYGON // ANCHOR
                </div>

                <div className="space-y-2 font-mono text-[9px]">
                  <div>
                    <div className="text-white/60">tx_hash</div>
                    <div className="text-white break-all">0x4a2f01d3b70cc80b...</div>
                  </div>
                  <div>
                    <div className="text-white/60">BLOCK #48,392,104</div>
                    <div className="text-quantum">CONFIRMED • 12 VALIDATORS</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* BigQuery Audit Log */}
          <motion.div
            whileHover={{ borderColor: "rgba(0,240,255,0.4)" }}
            className="border border-quantum/20 bg-surface rounded-lg overflow-hidden transition-colors"
          >
            <div className="p-6 border-b border-quantum/10">
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/60">
                📊 BIGQUERY // PUBLIC AUDIT LOG
              </div>
              <div className="font-mono text-[10px] text-bio mt-2">
                0,124 ROWS/H
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-[9px]">
                <thead className="border-b border-quantum/10 bg-void">
                  <tr>
                    <th className="text-left px-6 py-3 text-white/60">TS</th>
                    <th className="text-left px-6 py-3 text-white/60">ASSET HASH</th>
                    <th className="text-left px-6 py-3 text-white/60">VERDICT</th>
                    <th className="text-left px-6 py-3 text-white/60">CONFIDENCE</th>
                    <th className="text-left px-6 py-3 text-white/60">ANCHOR</th>
                  </tr>
                </thead>
                <tbody>
                  {auditRows.map((row, i) => (
                    <tr key={i} className="border-b border-quantum/5 hover:bg-griddim/30 transition-colors">
                      <td className="px-6 py-3 text-white/70">{row.ts}</td>
                      <td className="px-6 py-3 text-quantum">{row.hash}</td>
                      <td className="px-6 py-3">
                        <span className={row.verdict === "SYNTHETIC" ? "text-crimson" : "text-bio"}>
                          {row.verdict}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-white/70">{row.confidence}</td>
                      <td className="px-6 py-3 text-quantum">{row.anchor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
