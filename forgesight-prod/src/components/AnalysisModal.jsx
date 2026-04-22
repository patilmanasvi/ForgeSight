import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function AnalysisModal({ isOpen, onClose, data }) {
  const [activeTab, setActiveTab] = useState("summary");

  const tabs = ["summary", "explanation", "provenance", "report"];

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", damping: 25, stiffness: 300 },
    },
    exit: { opacity: 0, scale: 0.95, y: 20 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 backdrop-blur-sm"
        >
          <motion.div
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[90vh] bg-surface rounded-lg border border-quantum/30 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-quantum/10 bg-void">
              <div>
                <h2 className="font-display text-xl font-bold text-white">
                  Analysis Results
                </h2>
                <p className="font-mono text-[10px] text-quantum/60 mt-1">
                  {data?.assetId || "Asset ID: unknown"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-griddim rounded transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-6 pt-4 border-b border-quantum/10 bg-void">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`font-mono text-[10px] tracking-[0.2em] uppercase px-4 py-3 border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-quantum text-quantum"
                      : "border-transparent text-white/50 hover:text-white/70"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeTab === "summary" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-griddim/50 p-4 rounded">
                      <div className="font-mono text-[10px] text-white/50 mb-2">
                        VERDICT
                      </div>
                      <div className="font-display text-2xl font-bold text-crimson">
                        {data?.verdict || "PENDING"}
                      </div>
                    </div>
                    <div className="bg-griddim/50 p-4 rounded">
                      <div className="font-mono text-[10px] text-white/50 mb-2">
                        CONFIDENCE
                      </div>
                      <div className="font-display text-2xl font-bold text-quantum">
                        {data?.confidence?.toFixed(1) || "0"}%
                      </div>
                    </div>
                  </div>
                  <div className="bg-griddim/50 p-4 rounded">
                    <div className="font-mono text-[10px] text-white/50 mb-2">
                      ANALYSIS
                    </div>
                    <p className="text-sm text-white/70">
                      {data?.summary ||
                        "Analysis in progress..."}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "explanation" && (
                <div className="bg-griddim/50 p-4 rounded">
                  <div className="font-mono text-[10px] text-white/50 mb-2">
                    WHY THE MODEL FLAGGED IT
                  </div>
                  <div className="text-sm text-white/70 whitespace-pre-line">
                    {data?.explanation || "No explanation available (Gemini not configured)."}
                  </div>
                </div>
              )}

              {activeTab === "provenance" && (
                <div className="space-y-3 font-mono text-[9px]">
                  {data?.provenance && (
                    <>
                      <div className="bg-griddim/50 p-3 rounded">
                        <div className="text-white/50 mb-1">C2PA MANIFEST</div>
                        <div className="text-quantum break-all">
                          {data.provenance.c2pa}
                        </div>
                      </div>
                      <div className="bg-griddim/50 p-3 rounded">
                        <div className="text-white/50 mb-1">POLYGON TX</div>
                        <div className="text-quantum break-all">
                          {data.provenance.txHash}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === "report" && (
                <div className="bg-void p-4 rounded font-mono text-[9px] text-quantum leading-relaxed">
                  {data?.report || "Generating forensic report..."}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-quantum/10 bg-void flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-2 border border-white/30 text-white rounded hover:border-quantum hover:text-quantum transition-colors"
              >
                CLOSE
              </button>
              <button className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-2 bg-quantum text-void rounded hover:bg-quantum/90 transition-colors">
                EXPORT REPORT
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
