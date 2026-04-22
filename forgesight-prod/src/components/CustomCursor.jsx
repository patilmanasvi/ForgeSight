import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [hidden, setHidden] = useState(true);
  const [interactive, setInteractive] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 600, damping: 40, mass: 0.2 });
  const sy = useSpring(y, { stiffness: 600, damping: 40, mass: 0.2 });

  useEffect(() => {
    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setHidden(false);
      const t = e.target;
      if (
        t &&
        (t.tagName === "A" ||
          t.tagName === "BUTTON" ||
          t.closest?.("a,button,[role=button],[data-hover]"))
      ) {
        setInteractive(true);
      } else setInteractive(false);
    };
    const leave = () => setHidden(true);
    const handleOut = (e) => {
      if (!e.relatedTarget && !e.toElement) setHidden(true);
    };
    const hideOnBlur = () => setHidden(true);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseleave", leave);
    window.addEventListener("mouseout", handleOut);
    window.addEventListener("blur", hideOnBlur);
    document.addEventListener("visibilitychange", hideOnBlur);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseleave", leave);
      window.removeEventListener("mouseout", handleOut);
      window.removeEventListener("blur", hideOnBlur);
      document.removeEventListener("visibilitychange", hideOnBlur);
    };
  }, [x, y]);

  return (
    <>
      <motion.div
        data-testid="cursor-crosshair"
        style={{
          x: sx,
          y: sy,
          opacity: hidden ? 0 : 1,
          translateX: "-50%",
          translateY: "-50%",
        }}
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block"
      >
        <div
          className={`relative transition-all duration-200 ${interactive ? "scale-150" : "scale-100"}`}
        >
          {/* crosshair */}
          <div className="h-6 w-6 relative">
            <div className="absolute left-1/2 top-0 h-2 w-px bg-quantum -translate-x-1/2" />
            <div className="absolute left-1/2 bottom-0 h-2 w-px bg-quantum -translate-x-1/2" />
            <div className="absolute top-1/2 left-0 w-2 h-px bg-quantum -translate-y-1/2" />
            <div className="absolute top-1/2 right-0 w-2 h-px bg-quantum -translate-y-1/2" />
            <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 bg-quantum rounded-full" />
          </div>
        </div>
      </motion.div>
      <motion.div
        style={{
          x: sx,
          y: sy,
          opacity: hidden ? 0 : 0.4,
          translateX: "-50%",
          translateY: "-50%",
        }}
        className="pointer-events-none fixed left-0 top-0 z-[9998] hidden md:block"
      >
        <div
          className={`border border-quantum/40 transition-all duration-300 ${interactive ? "h-10 w-10" : "h-6 w-6"}`}
        />
      </motion.div>
    </>
  );
}
