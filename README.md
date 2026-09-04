# LUSH LAYERS — Artisanal Luxury Confectionery Atelier & Processing Engine

> **"Made with Love"**  
> An ultra-luxury, high-performance cake e-commerce catalog and local automated media ingestion system.

---

## 🎂 Architectural Overview

LUSH LAYERS is deliberately designed around a **Strict Zero-Price Policy**:
- **No Prices & No Online Checkout**: Cakes are artisanal and bespoke. Customers browse visual collections and enquire/order directly via an interactive **WhatsApp Order Flow**.
- **Two Interconnected Subsystems**:
  1. **Public Next.js 16 Web Application & Admin Atelier**: Built with Next.js App Router, React 19, TypeScript, Vanilla CSS design tokens (Deep Obsidian `#0E0B0A`, Champagne Gold `#D4AF37`), Masonry galleries, and On-Demand ISR revalidation.
  2. **Local Python FastAPI Processing Engine**: Local LAN-accessible (`0.0.0.0:8000`) background worker queue with `rembg` background removal, studio white compositing with ambient shadow, auto-crop to WebP, AI metadata suggestion, and Cloudinary/Supabase dual synchronization.

---

## ✨ Key Features

- **Strict Zero Price Enforcement**: Database schema and user interfaces completely omit price columns, currency symbols, and cart/checkout systems.
- **WhatsApp Direct Inquiries**: An interactive ordering modal pre-formats structured WhatsApp messages (`wa.me/{number}`) containing cake name, flavour note, tier size, customer name, phone number, and special inscriptions.
- **Mandatory Human Approval**: Bulk uploads enter an isolated `pending` state. AI generates suggestions (name, category, flavour, description) but never automatically publishes without baker review.
- **Parallel Background Engine**: Async worker queue (`MAX_CONCURRENT_JOBS = 3`) that processes 20+ high-res images in parallel without freezing the UI.
- **Studio White Compositing**: Automatically removes distracting photo backdrops and places cakes on pure studio white `#FFFFFF` with an ambient ground shadow.
- **Cloudinary CDN Integration**: Uploaded master assets (1200x1200px) and thumbnails (600x600px) are stored on Cloudinary with secure WebP URLs.
- **Supabase PostgreSQL Persistence**: Managed cloud PostgreSQL storing cakes, categories, reviews, and processing jobs with real-time replication.
- **LAN Bulk Upload Portal**: Access the drag-and-drop ingestion interface from any device on your local Wi-Fi (`http://<LAN-IP>:8000/portal`).

---

## 📁 Repository Structure

```
lush_layers/
├── backend/                  # Local Python FastAPI Processing Backend
│   ├── ai_analyzer.py        # Gemini Vision & Luxury Visual Taxonomy Engine
│   ├── config.py             # Configuration & Environment Parser
│   ├── db.py                 # Dual Database (Supabase PostgreSQL + SQLite cache)
│   ├── main.py               # FastAPI Server & LAN Upload Portal (/portal)
│   ├── processor.py          # rembg Cutout & Studio White Compositor
│   ├── queue_manager.py      # Async Semaphore Job Queue (3 Concurrent Workers)
│   ├── storage.py            # Cloudinary Integration & Media Handler
│   ├── requirements.txt      # Python Dependencies
│   └── .env.example          # Backend Environment Template
├── frontend/                 # Public Next.js 16 Website & Admin Dashboard
│   ├── src/
│   │   ├── app/              # Next.js App Router (Public + /admin routes)
│   │   ├── components/       # UI Components (Masonry, WhatsApp Modal, Header, Footer)
│   │   └── lib/              # Types & API Client
│   ├── package.json          # Node Dependencies & Scripts
│   └── .env.example          # Frontend Environment Template
├── supabase/
│   └── schema.sql            # Complete Supabase PostgreSQL DDL Schema
└── tests/
    └── run_acceptance_test.py# Automated Acceptance Test Suite (24 Test Steps)
```

---

## 🚀 Quick Start

### 1. Backend Setup (Python 3.10+)

```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Cloudinary and Supabase credentials

python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

- Local Access: [http://localhost:8000](http://localhost:8000)
- LAN Bulk Upload Portal: [http://localhost:8000/portal](http://localhost:8000/portal)
- API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Frontend Setup (Node.js 18+)

```bash
cd frontend
npm install
cp .env.example .env.local

npm run dev
```

- Public Website: [http://localhost:3000](http://localhost:3000)
- Artisanal Catalog: [http://localhost:3000/cakes](http://localhost:3000/cakes)
- Admin Atelier: [http://localhost:3000/admin](http://localhost:3000/admin)
- Pending Approval Queue: [http://localhost:3000/admin/cakes/pending](http://localhost:3000/admin/cakes/pending)

### 3. Run Acceptance Tests

```bash
python tests/run_acceptance_test.py
```

---

## 🛡️ License

Private and proprietary. Crafted for **LUSH LAYERS**. All rights reserved.
