import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "../utils/api";

export default function ForensicLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const response = await api.getAuditLog({ limit: 10 });
      setLogs(response.logs || []);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // Poll for new logs every 5 seconds for a dynamic feel
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="audit-logs" className="relative min-h-screen bg-void py-24 overflow-hidden border-t border-white/5">
      <div className="absolute inset-0 grid-bg opacity-10" />

      <div className="relative mx-auto max-w-[1440px] px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-12"
        >
          <div className="space-y-4">
            <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-bio/80">
              02 // FORENSIC AUDIT LOG
            </div>
            <h2 className="font-display text-5xl lg:text-6xl font-bold text-white leading-tight">
              Real-time Detection Provenance.
            </h2>
            <p className="text-lg text-white/70 max-w-2xl">
              Every inference is cryptographically hashed and logged to the local SQLite ledger. 
              Review the live stream of recent image analysis sessions below.
            </p>
          </div>

          <div className="border border-white/10 bg-surface/50 rounded-lg overflow-hidden backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 font-mono text-[10px] tracking-[0.2em] text-white/50 uppercase">
                    <th className="px-6 py-4 font-normal">Timestamp</th>
                    <th className="px-6 py-4 font-normal">Media Hash (SHA-256)</th>
                    <th className="px-6 py-4 font-normal">Verdict</th>
                    <th className="px-6 py-4 font-normal">Confidence</th>
                    <th className="px-6 py-4 font-normal">C2PA Valid</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-sm text-white/80">
                  {loading && logs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-white/30">
                        AWAITING DB CONNECTION...
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-white/30">
                        NO DETECTIONS LOGGED YET. UPLOAD A FRAME ABOVE.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <motion.tr 
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-white/50">
                          {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : "---"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[11px] text-quantum/70">
                          {log.media_hash ? `${log.media_hash.substring(0, 16)}...` : "---"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-[10px] tracking-widest rounded ${log.verdict === 'REAL' ? 'bg-bio/20 text-bio border border-bio/30' : 'bg-crimson/20 text-crimson border border-crimson/30'}`}>
                            {log.verdict}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {log.confidence_score ? `${(log.confidence_score * 100).toFixed(1)}%` : "---"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-[10px] tracking-widest rounded ${log.c2pa_valid ? 'bg-bio/20 text-bio' : 'bg-white/10 text-white/30'}`}>
                            {log.c2pa_valid ? "VALID" : "MISSING"}
                          </span>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
