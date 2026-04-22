import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, AlertCircle, CheckCircle } from "lucide-react";

export default function MediaUploadForm({ onSubmit, loading = false }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const ALLOWED_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];
  const MAX_SIZE = 1024 * 1024 * 500; // 500MB

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (f) => {
    setError(null);
    setSuccess(false);

    // Some browsers/files can report an empty MIME type; fall back to extension.
    const byType = ALLOWED_TYPES.includes(f.type);
    const byName = /\.(jpe?g|png|webp)$/i.test(f.name || "");
    if (!byType && !byName) {
      setError("File type not supported. Use JPEG, PNG, or WebP.");
      return;
    }

    if (f.size > MAX_SIZE) {
      setError("File size exceeds 500MB limit.");
      return;
    }

    setFile(f);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    try {
      await onSubmit(file);
    } catch (err) {
      setError(err.message || "Upload failed.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Drop Zone */}
      <motion.div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        animate={{
          borderColor: dragActive ? "rgba(0,240,255,0.5)" : "rgba(0,240,255,0.2)",
          backgroundColor: dragActive ? "rgba(0,240,255,0.05)" : "transparent",
        }}
        className="border-2 border-dashed border-quantum/20 rounded-lg p-8 text-center cursor-pointer transition-colors"
      >
        <input
          type="file"
          onChange={handleFileChange}
          accept={ALLOWED_TYPES.join(",")}
          className="hidden"
          id="file-input"
        />

        <label htmlFor="file-input" className="cursor-pointer block">
          <motion.div
            animate={{ y: dragActive ? -4 : 0 }}
            className="space-y-2"
          >
            <Upload className="w-12 h-12 mx-auto text-quantum/60" />
            <div className="font-display font-bold text-white">
              Drop your file here
            </div>
            <div className="font-mono text-[11px] text-white/50">
              or click to browse
            </div>
          </motion.div>
        </label>

        {file && (
          <div className="mt-4 font-mono text-[10px] text-quantum">
            Selected: {file.name}
          </div>
        )}
      </motion.div>

      {/* Status Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-crimson/10 border border-crimson/30 rounded text-crimson"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="font-mono text-[10px]">{error}</p>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-bio/10 border border-bio/30 rounded text-bio"
        >
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <p className="font-mono text-[10px]">File ready for analysis</p>
        </motion.div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!file || loading}
        className="w-full font-mono text-[11px] font-bold tracking-[0.25em] uppercase px-6 py-3 bg-quantum text-void rounded hover:bg-quantum/90 disabled:bg-quantum/50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? "ANALYZING..." : "RUN ANALYSIS"}
      </button>

      {/* Info */}
      <div className="font-mono text-[9px] text-white/40 space-y-1">
        <p>Supported: JPEG, PNG, WebP</p>
        <p>Max size: 500MB • All processing on-device</p>
      </div>
    </form>
  );
}
