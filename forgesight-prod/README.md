# ForgeSight

**Synthetic Media Forensics Platform** — Real-time deepfake detection with cryptographic provenance anchoring.

## Overview

ForgeSight is a multi-modal deepfake detection platform built on the Google Cloud ecosystem. It delivers:

- **On-device inference** via WebGPU (distilled Hybrid-ViT)
- **Multi-modal biometric verification** (rPPG, Point-of-Gaze, Phoneme-Viseme)
- **Cryptographic provenance** (C2PA + zk-SNARK + Polygon)
- **Manifest V3 Chrome extension** for browser-native detection
- **Gemini 1.5 Flash** for forensic report generation

## Tech Stack

- **Frontend**: React 18 + Tailwind CSS + Framer Motion
- **Styling**: Tailwind CSS with custom theme
- **Animations**: Framer Motion + GSAP
- **Icons**: Lucide React
- **Build**: React Scripts (Create React App)

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm build
```

## Project Structure

```
forgesight-prod/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── CustomCursor.jsx
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── DetectionConsole.jsx
│   │   ├── Biometrics.jsx
│   │   ├── Provenance.jsx
│   │   └── Footer.jsx
│   ├── App.jsx
│   ├── index.js
│   └── index.css
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── README.md
```

## Features

### 1. Custom Cursor
Interactive crosshair cursor with scale animation on interactive elements.

### 2. Navbar
- Fixed navigation with scroll detection
- Real-time system status indicator
- Smooth animations

### 3. Hero Section
- Prominent headline with mock browser window
- Feature list with interactive hover states
- Grid background effect

### 4. Detection Console
- Three-column layout (Input / Grad-CAM / Verdict)
- Real-time frame analysis simulation
- Interactive buttons

### 5. Biometrics Section
- Animated waveform charts (rPPG, PoG)
- Multi-signal fusion visualization
- Coherence scoring

### 6. Architecture Section
- Live metric updates
- 6-column stats grid
- System information matrix

### 7. Provenance Section
- Gemini report generation simulation
- C2PA manifest details
- zk-SNARK proof display
- BigQuery audit log table

### 8. Footer
- Social links
- Multi-column navigation
- Legal information

## Design System

### Colors

- **Primary**: Quantum Cyan (#00F0FF)
- **Accent**: Bio Green (#00FF66)
- **Alert**: Crimson Red (#FF2A2A)
- **Background**: Void Black (#050505)
- **Surface**: Dark Gray (#0C0C0C)

### Typography

- **Display**: Outfit (700, 800)
- **Body**: IBM Plex Sans (400, 500, 600)
- **Mono**: Azeret Mono (400, 500, 600)

### Custom Classes

- `.glow-cyan` - Cyan glow effect
- `.grid-bg` - Grid background pattern
- `.scanline-bg` - Scanline animation
- `.bracket-corner` - Corner brackets
- `.text-shadow-cyan` - Cyan text glow

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Requires WebGPU support for full functionality

## Performance Optimizations

- Code splitting via React lazy loading
- Image optimization
- CSS-in-JS via Tailwind (critical CSS)
- Smooth animations with GPU acceleration
- Custom cursor hidden on non-pointer devices

## Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

### Netlify

```bash
netlify deploy --prod --dir=build
```

### Self-hosted

```bash
npm build
# Serve the `build` folder with any static host
```

## License

MIT

## Credits

Built with ❤️ for the 2026 Hackathon
Not affiliated with Google, Polygon, or the Ethereum Foundation.
