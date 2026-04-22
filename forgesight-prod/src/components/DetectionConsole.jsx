import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import MediaUploadForm from "./MediaUploadForm";
import VerdictCard from "./VerdictCard";
import { api } from "../utils/api";

export default function DetectionConsole() {
  const [loading, setLoading] = useState(false);
  const [verdictResult, setVerdictResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleUpload = async (file) => {
    setLoading(true);
    setPreviewUrl(URL.createObjectURL(file));
    try {
      const result = await api.analyzeFrame(file);
      setVerdictResult(result);
    } catch (error) {
      console.error("API Error:", error);
      // Re-throw so MediaUploadForm can show the message to the user.
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setVerdictResult(null);
    setPreviewUrl(null);
  };

  return (
    <section
      id="detection"
      className="relative overflow-hidden bg-[#030910] scroll-mt-24 py-24"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(37,136,233,0.16),rgba(3,9,16,0)_40%)]" />

      <div className="relative mx-auto max-w-[1440px] px-6 lg:px-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-12"
        >
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="font-display text-5xl md:text-6xl font-semibold text-white leading-tight">
              Detection Console
            </h2>
            <p className="text-lg text-white/65">
              Upload an image to see Forgesight in action.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Frame / Upload Form */}
            <motion.div
              whileHover={{ borderColor: "rgba(125,199,255,0.45)" }}
              className="border border-white/12 bg-[linear-gradient(180deg,rgba(10,23,38,0.72)_0%,rgba(7,15,25,0.9)_100%)] p-6 md:p-8 rounded-2xl transition-colors flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="h-10 w-10 rounded-lg border border-[#67c8ff]/25 bg-[#0f2740]/60 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-[#84d2ff]" />
                </div>
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/50">
                  {previewUrl ? "ACQUIRED" : "AWAITING UPLOAD"}
                </div>
              </div>
              
              {!previewUrl ? (
                <div className="flex-1 flex flex-col justify-center">
                  <MediaUploadForm onSubmit={handleUpload} loading={loading} />
                </div>
              ) : (
                <>
                  <div className="aspect-[16/10] bg-griddim border border-white/20 rounded-xl flex items-center justify-center mb-4 relative overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Uploaded frame"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 border border-[#77cdff]/35" />
                  </div>
                  <div className="space-y-1 font-mono text-[9px] text-white/60">
                    <div>ROI_00</div>
                    <div>LOCAL FILE UPLOADED</div>
                  </div>
                </>
              )}
            </motion.div>

            <motion.div
              whileHover={{ borderColor: "rgba(125,199,255,0.45)" }}
              className="border border-white/12 bg-[linear-gradient(180deg,rgba(10,23,38,0.72)_0%,rgba(7,15,25,0.9)_100%)] p-6 md:p-8 rounded-2xl transition-colors flex flex-col justify-between"
            >
              {!verdictResult ? (
                <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center">
                  <div className="h-11 w-11 rounded-xl border border-[#67c8ff]/25 bg-[#0f2740]/60 flex items-center justify-center mb-4">
                    <Shield className="h-5 w-5 text-[#84d2ff]" />
                  </div>
                  <h3 className="font-display text-3xl text-white mb-2">Waiting for media...</h3>
                  <p className="text-white/55">Analysis will appear here.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <VerdictCard result={verdictResult} />
                  <button
                    onClick={reset}
                    className="w-full border border-white/25 text-white text-sm font-medium py-2.5 rounded-xl hover:border-[#84d2ff]/55 hover:text-[#b4e6ff] transition-colors"
                  >
                    Reset
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
