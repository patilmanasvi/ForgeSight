import React, { useState, useEffect } from "react";
import { motion, useTransform, useViewportScroll } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function HeroAdvanced() {
  const { scrollY } = useViewportScroll();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const y = useTransform(scrollY, [0, 500], [0, 100]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section
      id="top"
      className="relative min-h-screen bg-void overflow-hidden pt-32 pb-20"
    >
      {/* Animated background grid */}
      <motion.div
        className="absolute inset-0 grid-bg opacity-30"
        style={{ y: useTransform(scrollY, [0, 1000], [0, 200]) }}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-quantum/5 via-transparent to-void" />

      {/* Floating orbs */}
      <motion.div
        className="absolute top-20 left-10 w-64 h-64 bg-quantum/10 rounded-full blur-3xl"
        animate={{
          x: Math.sin(Date.now() / 3000) * 20,
          y: Math.cos(Date.now() / 3000) * 20,
        }}
      />
      <motion.div
        className="absolute bottom-40 right-20 w-96 h-96 bg-bio/5 rounded-full blur-3xl"
        animate={{
          x: Math.cos(Date.now() / 4000) * 30,
          y: Math.sin(Date.now() / 4000) * 30,
        }}
      />

      <div className="relative mx-auto max-w-[1440px] px-6 lg:px-10">
        <motion.div
          style={{ y, opacity }}
          className="space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-quantum/80 mb-4">
              01 // SHIPS AS A MANIFEST V3 EXTENSION
            </div>
            <h1 className="font-display text-6xl lg:text-7xl font-bold leading-tight text-white">
              ForgeSight lives in your browser. Every pixel you see, verified in flight.
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-lg text-white/70 max-w-2xl"
          >
            A lightweight Manifest V3 Chrome extension hooks into page media, runs inference
            on-device via WebGPU, and stamps each asset with a provenance badge before you
            ever see it.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 pt-6"
          >
            <a
              href="#detection"
              className="group relative font-mono text-[11px] font-bold tracking-[0.25em] uppercase px-6 py-3 bg-quantum text-void rounded hover:bg-quantum/90 transition-all flex items-center gap-2"
            >
              ⚡ LAUNCH CONSOLE
              <ChevronDown className="w-3 h-3 group-hover:translate-y-1 transition-transform" />
            </a>
            <a
              href="#architecture"
              className="font-mono text-[11px] font-bold tracking-[0.25em] uppercase px-6 py-3 border border-quantum/50 text-quantum rounded hover:bg-quantum/10 transition-colors"
            >
              INSPECT ARCHITECTURE →
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-5 h-5 text-quantum/60" />
        </motion.div>
      </div>
    </section>
  );
}
