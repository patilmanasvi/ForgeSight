import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  return (
    <section id="top" className="relative min-h-screen overflow-hidden bg-[#030910] flex items-center pt-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_20%,rgba(34,139,230,0.22),rgba(3,9,16,0)_40%),radial-gradient(circle_at_50%_80%,rgba(16,92,174,0.2),rgba(3,9,16,0)_40%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#02070f]/30 via-transparent to-[#030910]" />

      <div className="relative mx-auto max-w-[1440px] px-6 lg:px-10 w-full py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto space-y-8"
        >
          <motion.div variants={itemVariants}>
            <h1 className="font-display text-5xl md:text-7xl font-semibold leading-[1.03] text-white">
              Know what's real.
              <br />
              In one upload.
            </h1>
          </motion.div>

          <motion.p variants={itemVariants} className="text-xl text-white/70 max-w-3xl mx-auto">
            Forgesight inspects images for the subtle cues AI leaves behind -
            and gives you a clear verdict you can trust.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center items-center gap-5 pt-2">
            <a
              href="#detection"
              className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#4bc8ff] to-[#6bd8ff] text-[#02111e] font-semibold shadow-[0_0_30px_rgba(92,202,255,0.45)] hover:brightness-110 transition"
            >
              Analyze image
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#how-it-works"
              className="text-white/85 hover:text-white font-medium"
            >
              See what we check
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
