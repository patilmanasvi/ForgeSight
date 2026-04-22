import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const navItems = [
  { label: "Detect", href: "#detection" },
  { label: "How it works", href: "#how-it-works" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      data-testid="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-[#030910]/80 backdrop-blur-xl border-b border-white/10" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10 h-16 flex items-center justify-between">
        <a href="#top" data-testid="nav-logo" className="group">
          <div className="font-display text-xl md:text-2xl font-semibold tracking-tight text-white drop-shadow-[0_0_14px_rgba(111,205,255,0.45)]">
            ForgeSight
          </div>
        </a>

        <div className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              data-testid={`nav-${item.label.toLowerCase()}`}
              className="relative pb-3 text-sm text-white/65 hover:text-white transition-colors after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-full after:rounded-full after:bg-[#5ec9ff] after:origin-right after:scale-x-0 after:opacity-90 after:transition-transform after:duration-300 after:ease-out hover:after:origin-left hover:after:scale-x-100"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#detection"
            data-testid="nav-launch-btn"
            className="group inline-flex items-center gap-2 text-sm text-white/90 hover:text-white transition-colors"
          >
            Try it
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
