// src/utils/animations.js

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
};

export const hoverGlow = {
  whileHover: { boxShadow: "0 0 40px rgba(0,240,255,0.4)" },
};

export const pulseAnimation = {
  animate: {
    opacity: [0.4, 1, 0.4],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const scanlineAnimation = {
  animate: {
    y: ["0%", "100%"],
    transition: {
      duration: 2.4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const flickerAnimation = {
  animate: {
    opacity: [1, 0.85, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Reveal on scroll animation
export const useScrollReveal = (ref, options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = "0px 0px -100px 0px",
  } = options;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, threshold, rootMargin]);
};

// Parallax scroll effect
export const useParallax = (ref, speed = 0.5) => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setOffset(rect.top * speed);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [ref, speed]);

  return offset;
};

// src/utils/constants.js
export const COLORS = {
  quantum: "#00F0FF",
  bio: "#00FF66",
  crimson: "#FF2A2A",
  void: "#050505",
  surface: "#0C0C0C",
  elevated: "#121212",
  griddim: "#1A1A1A",
};

export const SECTION_IDS = {
  TOP: "top",
  DETECTION: "detection",
  BIOMETRICS: "biometrics",
  ARCHITECTURE: "architecture",
  PROVENANCE: "provenance",
  EXTENSION: "extension",
};

export const VERDICTS = {
  SYNTHETIC: "SYNTHETIC",
  AUTHENTIC: "AUTHENTIC",
  FLAGGED: "FLAGGED",
  PENDING: "PENDING",
};

export const CONFIDENCE_THRESHOLDS = {
  SYNTHETIC: 0.85,
  SUSPICIOUS: 0.5,
  AUTHENTIC: 0.9,
};

export const API_ENDPOINTS = {
  DETECT_FRAME: "/v1/detect/frame",
  BIOMETRICS: "/v1/biometrics",
  PROVENANCE: "/v1/provenance",
  AUDIT_LOG: "/v1/audit",
  C2PA: "/v1/c2pa",
  POLYGON: "/v1/polygon",
  REPORT: "/v1/report",
};

export const BIOMETRIC_SIGNALS = [
  { name: "rPPG", color: "text-bio", label: "Remote Photoplethysmography" },
  { name: "PoG", color: "text-quantum", label: "Point-of-Gaze" },
  { name: "Phoneme", color: "text-crimson", label: "Phoneme-Viseme Sync" },
];
