import React from "react";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#030910] py-8 overflow-hidden">

      <div className="relative mx-auto max-w-[1440px] px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <div className="font-mono text-[10px] tracking-[0.12em] text-white/45">
            © 2026 FORGESIGHT
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
