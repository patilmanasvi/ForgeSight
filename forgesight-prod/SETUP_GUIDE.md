# ForgeSight — Complete Setup & Deployment Guide

## 📦 What's Included

### Core Components (8 React JSX)
- **CustomCursor.jsx** - Interactive crosshair with Framer Motion
- **Navbar.jsx** - Fixed navbar with scroll detection
- **Hero.jsx** - Landing section with mock browser
- **HeroAdvanced.jsx** - Enhanced hero with parallax & animation
- **DetectionConsole.jsx** - Three-column analysis interface
- **Biometrics.jsx** - Animated signal charts (rPPG, PoG)
- **Architecture.jsx** - Live metrics dashboard
- **Provenance.jsx** - Blockchain audit & C2PA
- **Footer.jsx** - Multi-column footer

### Advanced Components
- **AnalysisModal.jsx** - Tabbed results modal
- **MediaUploadForm.jsx** - Drag-drop file uploader

### Utilities
- **api.js** - API client with retry logic
- **animations.js** - Framer Motion presets + constants
- **useDetection.js** - Custom React hooks

### Configuration
- **tailwind.config.js** - Theme with quantum cyan/bio green
- **postcss.config.js** - CSS processing
- **.env.example** - Environment variables template
- **Dockerfile** - Docker containerization
- **docker-compose.yml** - Local dev environment
- **vercel.json** - Vercel deployment config
- **.github/workflows/ci.yml** - CI/CD pipeline

---

## 🚀 Quick Start (5 minutes)

### 1. Extract & Install
```bash
unzip forgesight-complete.zip
cd forgesight-prod
npm install
```

### 2. Start Development Server
```bash
npm start
```
Open http://localhost:3000

### 3. Build for Production
```bash
npm run build
```

---

## 🔧 Configuration

### Environment Variables
Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your values:
```
REACT_APP_API_URL=https://api.forgesight.dev
REACT_APP_POLYGON_RPC=https://polygon-rpc.com
REACT_APP_GCP_PROJECT_ID=your-project-id
```

---

## 🐳 Docker Deployment

### Build & Run with Docker
```bash
# Build image
docker build -t forgesight .

# Run container
docker run -p 3000:3000 forgesight
```

### Using Docker Compose
```bash
docker-compose up
```

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)
```bash
npm install -g vercel
vercel deploy --prod
```

Or connect repo on vercel.com:
1. Push to GitHub
2. Go to vercel.com
3. Import repository
4. Add environment variables
5. Deploy

### Option 2: Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Option 3: Self-hosted (Ubuntu/Linux)
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone & build
git clone <repo-url> forgesight
cd forgesight
npm ci
npm run build

# Serve with PM2
npm install -g pm2
pm2 start npm --name "forgesight" -- start
pm2 save
```

### Option 4: AWS Amplify
```bash
npm install -g @aws-amplify/cli
amplify init
amplify publish
```

---

## 📊 Project Structure

```
forgesight-prod/
├── src/
│   ├── components/          # 10 React components
│   │   ├── CustomCursor.jsx
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── HeroAdvanced.jsx
│   │   ├── DetectionConsole.jsx
│   │   ├── Biometrics.jsx
│   │   ├── Architecture.jsx
│   │   ├── Provenance.jsx
│   │   ├── AnalysisModal.jsx
│   │   ├── MediaUploadForm.jsx
│   │   └── Footer.jsx
│   ├── hooks/               # Custom React hooks
│   │   └── useDetection.js  # Detection, biometrics, provenance hooks
│   ├── utils/               # Utilities
│   │   ├── api.js           # API client
│   │   └── animations.js    # Animation presets
│   ├── App.jsx              # Main app
│   ├── index.js             # React entry
│   └── index.css            # Global styles
├── public/
│   └── index.html           # HTML template
├── tailwind.config.js       # Tailwind theme
├── postcss.config.js        # PostCSS config
├── package.json             # Dependencies
├── Dockerfile               # Container config
├── docker-compose.yml       # Dev environment
├── vercel.json              # Vercel config
├── .env.example             # Env template
├── .gitignore               # Git ignores
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions CI/CD
└── README.md                # Documentation
```

---

## 🎨 Design System

### Colors
- **Quantum Cyan**: `#00F0FF` (primary accent)
- **Bio Green**: `#00FF66` (success/authentic)
- **Crimson Red**: `#FF2A2A` (alert/synthetic)
- **Void Black**: `#050505` (background)
- **Surface Gray**: `#0C0C0C` (secondary bg)

### Typography
- **Display**: Outfit (700, 800) - headings
- **Body**: IBM Plex Sans (400, 500, 600) - text
- **Mono**: Azeret Mono (400, 500, 600) - code/data

### Custom Classes
```css
.glow-cyan              /* Cyan glow effect */
.glow-cyan-strong       /* Stronger glow */
.grid-bg                /* Grid background pattern */
.grid-bg-sm             /* Smaller grid */
.scanline-bg            /* Scanline animation */
.bracket-corner         /* Corner brackets */
.text-shadow-cyan       /* Cyan text glow */
```

---

## 🔌 API Integration

### Setup API Client
The `api.js` utility provides methods for:

```javascript
import { api } from './utils/api';

// Analyze media
const result = await api.analyzeFrame(file);

// Get biometrics
const metrics = await api.analyzeBiometrics(frameHash);

// Get provenance
const prov = await api.getProvenance(assetHash);

// Get audit log
const log = await api.getAuditLog({ verdict: 'SYNTHETIC' });

// Get C2PA manifest
const manifest = await api.getC2PAManifest(assetId);

// Verify on Polygon
const verified = await api.verifyOnPolygon(txHash);

// Generate report
const report = await api.generateReport(analysisId);
```

### Backend Requirements
Your backend API should implement:
```
POST   /v1/detect/frame          # Analyze image
POST   /v1/detect/video          # Analyze video
GET    /v1/biometrics/{hash}     # Get biometric data
GET    /v1/provenance/{hash}     # Get provenance
GET    /v1/audit                 # Get audit log
GET    /v1/c2pa/{id}             # Get C2PA manifest
GET    /v1/polygon/verify/{tx}   # Verify on Polygon
GET    /v1/report/{id}           # Generate report
```

---

## 📱 Responsive Design

The site is fully responsive:
- **Mobile**: Vertical stack, touch-friendly
- **Tablet**: 2-column layouts
- **Desktop**: Full 3+ column layouts

Tailwind's responsive prefixes used:
```
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

---

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **API Keys**: Use secrets manager (Vercel, AWS Secrets)
3. **CORS**: Configure backend to allow frontend origin
4. **CSP**: Add Content Security Policy headers
5. **HTTPS**: Always use HTTPS in production
6. **Token Management**: Store JWT tokens securely (httpOnly cookies)

---

## 📈 Performance Optimization

### Implemented
- Code splitting via React lazy loading
- CSS-in-JS with Tailwind (critical CSS)
- GPU-accelerated animations (transform, opacity)
- Image lazy loading
- Custom cursor hidden on mobile

### Further Optimization
```javascript
// Lazy load components
const DetectionConsole = React.lazy(() => import('./components/DetectionConsole'));

// Use Suspense
<Suspense fallback={<Loading />}>
  <DetectionConsole />
</Suspense>
```

---

## 🧪 Testing

### Add Testing
```bash
npm install --save-dev jest @testing-library/react
```

### Example Test
```javascript
// src/components/Navbar.test.jsx
import { render, screen } from '@testing-library/react';
import Navbar from './Navbar';

test('renders ForgeSight logo', () => {
  render(<Navbar />);
  expect(screen.getByText('ForgeSight')).toBeInTheDocument();
});
```

---

## 🚨 Troubleshooting

### Port 3000 Already in Use
```bash
kill -9 $(lsof -t -i:3000)
# or
PORT=3001 npm start
```

### Module Not Found
```bash
rm -rf node_modules package-lock.json
npm install
```

### Tailwind Classes Not Loading
```bash
# Clear cache
rm -rf .tailwind-cache
npm run build
```

### Environment Variables Not Loading
- Restart dev server after adding `.env`
- Prefix variables with `REACT_APP_`
- Check `.env` is in root directory

---

## 📞 Support

- Issues? Check GitHub issues
- Questions? Read the documentation
- Need help? Open a discussion

---

## 📄 License

MIT — Use freely in personal & commercial projects

---

## 🎉 Next Steps

1. ✅ Extract & install
2. ✅ Run `npm start`
3. ✅ Customize branding/colors in `tailwind.config.js`
4. ✅ Connect your backend API (update `REACT_APP_API_URL`)
5. ✅ Deploy to Vercel/Netlify
6. ✅ Set up CI/CD with GitHub Actions
7. ✅ Monitor with analytics (GA, Sentry)

Happy coding! 🚀
