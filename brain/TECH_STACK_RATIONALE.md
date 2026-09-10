# AgriMandi — Technology Stack Rationale & Judge Defense Guide

> **Location in Project:** `d:\AgriMandi\brain\TECH_STACK_RATIONALE.md`  
> **Purpose:** Detailed rationale for every dependency, tool, and service. When judges ask *"Why did you use this library?"*, use this document to give the exact technical defense.

---

## 1. Frontend Technologies

| Library / Tool | Exact Role in AgriMandi | Where is it used? (File/Folder) | Why used? (Advantage over alternatives) |
| :--- | :--- | :--- | :--- |
| **React 18** | Core UI component framework | `frontend/src/` | Component-based, large ecosystem, virtual DOM for fast price card updates. |
| **Vite** | Build tool & dev server | `frontend/vite.config.js` | 10x faster hot module replacement (HMR) than Webpack; builds compact static production bundles. |
| **Tailwind CSS** | Styling & UI design system | `frontend/tailwind.config.js` | Utility-first, zero runtime overhead, high-contrast mobile responsiveness for farmers in rural sunlight. |
| **React Router v6** | Client-side routing pipeline | `frontend/src/routes/AppRoutes.jsx` | Declarative routing, nested layouts for portal separation, protected route guards. |
| **Recharts** | Interactive price charts | `frontend/src/modules/farmer/MandiPriceExplorerPage.jsx` | Lightweight SVG-based charting; renders 30-day min/max/modal price trends with tooltips. |
| **Lucide React** | Clean agricultural icons | All UI components | Lightweight SVG icons with tree-shaking (no bloated font files). |
| **Axios** | HTTP client for backend REST API | `frontend/src/shared/services/api.js` | Request/response interceptors for auto-attaching JWT auth tokens and handling global 401 errors. |

---

## 2. Backend Technologies

| Library / Tool | Exact Role in AgriMandi | Where is it used? (File/Folder) | Why used? (Advantage over alternatives) |
| :--- | :--- | :--- | :--- |
| **Node.js (v20+)** | Server JavaScript runtime | `backend/src/server.js` | Event-driven, non-blocking I/O; perfect for high-concurrency marketplace operations. |
| **Express.js** | REST API micro-framework | `backend/src/app.js` | Minimalist, robust middleware pipeline, easiest for 2nd-year engineers to maintain without hidden magic. |
| **Prisma 7 ORM** | Type-safe database client & migrations | `backend/src/prisma/schema.prisma` | Replaced legacy Rust engine with TypeScript/WASM (1.6MB bundle); guarantees type safety and prevents SQL injection. |
| **Zod** | Schema validation & sanitization | `backend/src/validations/*.schema.js` | Strict runtime type-checking; blocks malicious or invalid data (e.g. negative prices, invalid crops) before reaching controllers. |
| **JSON Web Token (jsonwebtoken)** | Stateless authentication | `backend/src/middlewares/auth.middleware.js` | Secure session tokens with role claims (`FARMER`, `BUYER`, `ADMIN`) stored in HTTP-Only cookies. |
| **Bcryptjs** | Password hashing | `backend/src/controllers/auth.controller.js` | One-way salted hashing (12 salt rounds) protecting user credentials against database leaks. |
| **node-cache** | In-memory API caching | `backend/src/services/priceCache.service.js` | Sub-5 millisecond response for repetitive mandi price queries; zero external signup needed. |

---

## 3. Database & Cloud Services

| Service | Exact Role in AgriMandi | Connection Configuration | Why used? (Advantage over alternatives) |
| :--- | :--- | :--- | :--- |
| **Supabase (PostgreSQL 15)** | Relational database persistence | `DATABASE_URL` in `backend/.env` | Strict ACID compliance, relational integrity, row-level locking (prevents double-selling), and free 24/7 cloud hosting. |
| **Vercel** | Frontend PWA hosting | Connected to GitHub repo root | Free tier, global edge CDN, automatic HTTPS SSL certificates, auto-deploys on `git push`. |
| **Render** | Backend Express API hosting | Web Service #1 | Free tier, seamless GitHub CI/CD, environmental secrets management. |
| **Hugging Face Spaces** | Python FastAPI ML microservice | Docker / Python Space | 16 GB free RAM, permanent CPU runtime, native support for Python ML packages. |
| **UptimeRobot** | Prevents server cold starts | Pings `/health` every 5 mins | Keeps both Render and Hugging Face services warm 24/7; ensures zero lag when judges open demo. |

---

## 4. Machine Learning & Analytics Stack

| Library / Algorithm | Exact Role in AgriMandi | Where is it used? (File/Folder) | Why used? (Advantage over alternatives) |
| :--- | :--- | :--- | :--- |
| **XGBoost (Regressor & Classifier)** | 7-day price band forecast & Sell/Hold decision | `ml_engine/models/xgboost_price_model.joblib` | Industry gold-standard for tabular data; handles nonlinear seasonality; provides exact feature importance. |
| **Isolation Forest (Scikit-learn)** | Ingestion anomaly detection (bad/stale price filter) | `ml_engine/models/isolation_forest.joblib` | Isolates outliers by randomly partitioning feature space; catches data entry typos before storing. |
| **Cosine Similarity (Scikit-learn)** | Farmer lot $\leftrightarrow$ Buyer demand matching | `backend/src/services/matching.service.js` | Deterministic vector similarity; explainable 0–100% match score with zero training lag. |
| **Haversine Formula** | Great-circle distance math | `backend/src/services/realization.service.js` | Accurate road/aerial distance calculation using latitude & longitude for dynamic freight estimation. |
| **FastAPI** | Python REST microservice | `ml_engine/app.py` | Asynchronous Python framework; generates interactive Swagger docs (`/docs`); sub-10ms model execution. |
