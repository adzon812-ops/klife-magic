# K-LIFE | The Magic of Purity

> Immersive 3D landing page for premium Korean home care products.

![K-LIFE Preview](./public/preview.jpg)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/klife-landing)

---

## ✨ Features

- **3D Sky Scene** — Avatar-style floating island with volumetric clouds (Three.js + @react-three/drei)
- **Boids Algorithm** — Realistic bird flocking behavior
- **Procedural 3D Products** — Interactive K-BUBBLE, K-FRESH, K-CLEASTAR models
- **Holographic Popups** — Click any product for ingredient details
- **Web Audio API** — Ambient nature sounds + interaction chimes
- **Framer Motion** — Cinematic scroll animations
- **Particle Preloader** — Builds K-LIFE logo from particles
- **Custom Cursor** — Magnetic soft cursor
- **Next.js API** — `/api/products` serverless route

---

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/klife-landing.git
cd klife-landing

# 2. Install
npm install

# 3. Dev server
npm run dev
# → Open http://localhost:3000
```

---

## 📁 Project Structure

```
klife-landing/
├── app/
│   ├── layout.js          # Root layout + metadata
│   ├── page.js            # Main landing page (all sections)
│   └── api/
│       └── products/
│           └── route.js   # GET /api/products[?id=bubble]
├── components/
│   ├── three/
│   │   ├── SkyScene.jsx   # Full 3D sky, island, birds, sun, clouds
│   │   └── ProductCanvas.jsx  # Per-product 3D viewer
│   └── ui/
│       ├── Preloader.jsx  # Particle preloader
│       └── AudioManager.jsx  # Web Audio API + controls
├── lib/
│   └── products.js        # Product data + helpers
├── styles/
│   └── globals.css        # All styles + animations
├── public/               # Images, icons
├── next.config.js
└── package.json
```

---

## 🌐 Deploy to Vercel

### Option 1 — One-click
Click the **Deploy with Vercel** button above.

### Option 2 — CLI
```bash
npm i -g vercel
vercel
```

### Option 3 — GitHub Auto-deploy
1. Push to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repo → Deploy

---

## 🔧 Customization

### Change product data
Edit `lib/products.js` — add prices, descriptions, buy URLs.

### Replace 3D models
Swap procedural geometry in `ProductCanvas.jsx` with real glTF files:
```jsx
import { useGLTF } from '@react-three/drei'
const { scene } = useGLTF('/models/kbubble.glb')
```
Place `.glb` files in `/public/models/`.

### Add real audio files
Replace Web Audio synthesis in `AudioManager.jsx`:
```js
const audio = new Audio('/sounds/ambient.mp3')
audio.loop = true
audio.volume = 0.4
audio.play()
```

### Environment variables
```bash
# .env.local (optional — for CMS integration)
NEXT_PUBLIC_SITE_URL=https://klife.vercel.app
DATABASE_URL=your_database_url
```

---

## 📦 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| 3D | Three.js + @react-three/fiber + @react-three/drei |
| Animation | Framer Motion + CSS |
| Audio | Web Audio API (no deps) |
| State | React hooks + Zustand |
| Hosting | Vercel |

---

## 📝 License

MIT © K-LIFE 2025
