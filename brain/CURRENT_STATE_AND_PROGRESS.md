# AgriMandi (कृषीसेतू) — Live System State & Progress Journal

> **CRITICAL CONTEXT FOR ANY AI ASSISTANT / DEVELOPER:**  
> This file tracks the exact runtime state, active ports, installed dependencies, verified database credentials, tested API endpoints, and user preferences. Read this file first to know where the project currently stands.

**Last Updated:** September 10, 2026  
**Active Project Phase:** Phase 4 — GitHub Repository & Vercel Automated CI/CD Setup  
**User Working Mode:** Mentoring & Teaching Mode (Friendly Hinglish, Step-by-Step Guidance)

---

## 🖥️ 1. Active Services & Runtime Status

Both backend and frontend services are compiled, verified, and running live:

| Service | Port | Directory | Run Command | Status |
| :--- | :---: | :--- | :--- | :---: |
| **Frontend** | `5173` | `d:\AgriMandi\frontend` | `npm run dev -- --host` | 🟢 **RUNNING** (Vite v6.4, React 19, Tailwind 3.4, SuperAdmin Dashboard `/admin`) |
| **Backend API** | `5000` | `d:\AgriMandi\backend` | `node src/server.js` | 🟢 **RUNNING** (Express v4.21, 100% Supabase PostgreSQL `eizzzlnlcdfuylnojijn.supabase.co`) |
| **Git & CI/CD** | — | `d:\AgriMandi` | `git push -u origin main` | 🟢 **ACTIVE & LIVE** (Pushed to `teamasiacore/AgriMandi`, auto-deploying to `agrimandi.asiacore.in`) |

---

### 🔒 Security & Bug Fixes Applied
1. **24x7 Cloud Vercel Serverless Architecture Implemented**: Resolved "Network Error" on production (`agrimandi.asiacore.in`). Express backend deployed as Vercel Serverless Function (`/api/index.js`), with relative `/api` paths.
2. **Unregistered Login Auto-Creation Glitch Resolved**: Completely removed prototype auto-generation fallback (`Pragati Shetkari`) from `authRoutes.js`. Entering an unregistered number in Sign-In returns strict HTTP 404 (`NOT_REGISTERED`).
3. **Duplicate Registration Guard**: Registration endpoint checks existing records and returns HTTP 409 (`ALREADY_REGISTERED`) with direct 1-click CTA to Sign-In.
4. **Role Mismatch Protection**: Added checks preventing a registered Farmer from logging in under Buyer tab (HTTP 400 `ROLE_MISMATCH`).
5. **SuperAdmin Account Management**: Added 1-click deletion endpoint (`DELETE /admin/farmers/:id` and `DELETE /admin/buyers/:id`) with trash button in SuperAdmin Dashboard.
6. **Admin Farmer Desk Crash Resolved**: Fixed missing `BadgeCheck` icon import from `lucide-react`.
7. **Defensive Normalization**: Added robust fallbacks for `farmer.name || farmer.full_name`, `crops || primary_crops`, and `id || user_id`.
8. **React ErrorBoundary Added**: Wrapped main application routes with a fallback `ErrorBoundary` component in `App.jsx`.
9. **100% Pure Localization Across ALL Tabs**: Pure English, Hindi, and Marathi dictionaries across all inner portal tabs without mixed text.
10. **New Farmer Lots Isolation (Zero Dummy Lots)**: Removed hardcoded demo lot `lot-101` from memory cache. Updated `FarmerPortal.jsx` and `marketRoutes.js` with `farmer_phone` and `farmer_id` filters. Freshly registered farmers now start with exactly 0 lots and a clean empty-state CTA to list their first crop.
11. **Net Realization Engine 100% Complete & Active**:
    - Resolved async promise crash (`TypeError: buyers.map is not a function`) in `realizationRoutes.js`.
    - Added full multi-crop dictionary (Soybean, Cotton, Onion, Tur, Chana, Maize, Wheat) and Maharashtra district coordinates with Haversine distance.
    - Added vehicle tariffs (Eicher Truck ₹4.20/km, Bolero Pickup ₹4.80/km, Tractor Trolley ₹5.20/km) and warehouse holding cost (₹0.50/qtl/day).
    - Added interactive UI controls with quantity pills [25] [50] [100], prominent "खरा नफा मोजा (Calculate Net Realization)" button, and live status badge 🟢.
    - Added Hero Profit Callout (+₹12,700 extra cash), side-by-side APMC vs Direct Mill route cards, and Top Matching Verified Buyers with 1-click lot listing action.
12. **Zero Mock Buyers Policy (Strict Real-Buyer Match Only)**:
    - Completely deleted pre-seeded dummy buyers (`Shree Ganesh`, `Vardhman`, `Sai Krishi`) from Supabase `buyer_profiles` table, `memoryCache.buyers`, and `supabase_schema.sql`.
    - Removed hardcoded fallback buyers array from `backend/src/routes/realizationRoutes.js`.
    - In `FarmerPortal.jsx`, if no verified direct mill has registered from the farmer's selected location yet, the UI displays a clean authentic status ("No registered direct mills in {district} yet — List your harvest lot so verified buyers across Maharashtra can bid") instead of showing fake mock mills. Real registered verified mills appear automatically once they register and are approved by Admin.
13. **Buyer Procurement & Live Bidding Engine Complete (Phase 3)**:
    - Built comprehensive B2B marketplace in `BuyerPortal.jsx` with real-time Haversine distance calculations from Buyer facility to farmer harvest lots.
    - Implemented Interactive Digital Bidding Modal with requested quantity validation (`requested <= available`), delivery gate input, and live total price math.
    - Created official B2B Deal Contract & Escrow Inspector Modal with full legal contract metadata (Deal ID, Seller/Buyer details, unit rate, total consideration, zero APMC cess waiver, and 100% Escrow Bank Protection Guarantee).
    - Resolved PostgreSQL foreign key constraint exceptions in Supabase (`produce_lots_farmer_id_fkey` and `offers_buyer_id_fkey`) ensuring user profiles exist in `users` table before lot/offer insertion.
    - Resolved schema mismatch in `db.createUser` separating `users` core columns from `farmer_profiles` extended fields (`bank_ifsc`, `land_size_acres`, `saat_bara_number`, `primary_crops`).
    - Verified full end-to-end deal execution: Buyer bids ➔ Farmer reviews & accepts ➔ Lot status becomes `DEAL_LOCKED`, competing offers auto-rejected, and locked deal record generated in `deals` table.
14. **Production 'Network Error' on Lot Creation & Dual-Lookup Resolution**:
    - Resolved Vercel serverless preflight failure by adding `app.options('*', cors())` and dual-mounting `/api/*` and root `/*` in `api/index.js`.
    - Resolved PostgreSQL unique constraint and foreign key collision in `db.createLot` and `db.createOffer` by checking existing user records by both `id` and `phone` before insert/upsert.
    - Added comprehensive error message extraction in `FarmerPortal.jsx` ensuring network or validation errors output actual server error messages instead of generic alerts.

## 📦 2. Installed Dependencies & Architecture Breakdown

### Modular Architecture Structure (No Micro-Component Clutter)
- `frontend/src/pages/SuperAdminDashboard.jsx` — Dedicated SuperAdmin console at `/admin` (Username: `ASIACore`, Password: `Satya123`). Controls Buyer verification (GSTIN/APMC license approval), Farmer 7/12 land inspection, and storage telemetry.
- `backend/src/routes/adminRoutes.js` — Secure SuperAdmin endpoints for authentication, buyer approval/rejection, farmer verification, and system telemetry.
- `backend/supabase_schema.sql` — Official Supabase PostgreSQL DDL script for all tables (`users`, `farmer_profiles`, `buyer_profiles`, `produce_lots`, `offers`, `deals`, `mandi_prices`).
- `frontend/src/utils/translations.js` — 100% Pure translation dictionaries for Marathi (`mr`), Hindi (`hi`), and English (`en`) including 7/12 land records, GSTIN, PAN, and APMC license strings.
- `frontend/src/components/ProtectedRoute.jsx` — Route guard preventing unauthenticated access to `/farmer` or `/buyer`.
- `frontend/src/pages/LandingPage.jsx` — Commercial landing page with direct footer access to ASIACore Admin Desk.
- `frontend/src/pages/FarmerPortal.jsx` — Protected Farmer Desk featuring the "७/१२ सत्यापित शेतकरी" (7/12 Verified Landholder) badge.
- `frontend/src/pages/BuyerPortal.jsx` — Protected Buyer Desk with pending verification banner and bidding activation upon SuperAdmin approval.
- `frontend/src/pages/AuthPage.jsx` — Extended Farmer (7/12 number, land size, crops) and Buyer (GSTIN, PAN, APMC license, crushing capacity) registration.
- `backend/src/services/db.js` — 100% Pure Supabase Cloud PostgreSQL client with zero local JSON file persistence.

### Layer 1: Frontend (`frontend/package.json`)
- **Framework & Core:** `react` (v19.2), `react-dom` (v19.2), `vite` (v8.2)
- **Routing:** `react-router-dom` (v7.18) — Client-side SPA routing for Landing, Farmer, Buyer, FPO, APMC.
- **Charts & Data Viz:** `recharts` (v3.10) — 30-day time series price charts & 7-day ML trajectory bands.
- **Icons & Styling:** `lucide-react` (v1.43), `tailwindcss` (v3.4), `postcss`, `autoprefixer`.
- **Localization:** `i18next` (v26.4), `react-i18next` (v17.0) with trilingual dictionaries:
  - `frontend/src/locales/mr.json` (Marathi - Default)
  - `frontend/src/locales/hi.json` (Hindi)
  - `frontend/src/locales/en.json` (English)
- **HTTP Client:** `axios` (v1.20) — Communicates with backend on `http://localhost:5000`.
- **Build Status:** Production build tested cleanly (`npm run build` in 1.00s, 0 errors).

### Layer 2: Backend API (`backend/package.json`)
- **Server:** `express` (v4.21, ES Modules), `cors` (v2.8).
- **Environment Config:** `dotenv` (v16.4) loading `backend/.env`.
- **Cloud Database:** `@supabase/supabase-js` (v2.116) connected to project `eizzzlnlcdfuylnojijn.supabase.co`.
- **Government Feed:** Real `data.gov.in` Agmarknet live API (`579b464db66ec23bdd000001d4d3eb54d4134d624b3aecd686e285a1`).
- **Caching:** `node-cache` (v5.1) with 15-minute TTL to prevent government rate limits and deliver <5ms responses.
- **Validation & Auth:** `zod` (v4.5), `jsonwebtoken` (v9.0), `bcryptjs` (v3.0).
- **ORM:** `@prisma/client` (v7.10), `prisma`.

### Layer 3: Machine Learning Engine (`ml_engine/requirements.txt`)
- **Python Runtime:** Python 3.13 isolated virtual environment (`ml_engine/.venv/`).
- **API Framework:** `fastapi` (v0.141), `uvicorn` (v0.52).
- **Forecasting & ML:** `xgboost` (v3.4), `scikit-learn` (v1.9, Isolation Forest for APMC typo anomaly check).
- **Math & Data:** `pandas` (v3.0), `numpy` (v2.5), `joblib` (v1.6), `pydantic` (v2.13), `python-dotenv`.
- **Hosting Integration:** `huggingface-hub` (v1.30) for Hugging Face Spaces (16 GB free RAM permanent runtime).

---

## 🌐 3. Verified & Live Endpoints

| Method | Endpoint | Source Layer | Description |
| :---: | :--- | :---: | :--- |
| `GET` | `/health` (Port 8000) | ML Engine | Confirms ML Engine status and active algorithms. |
| `POST` | `/predict/forecast` (Port 8000) | ML Engine | Calculates SMA-30, 7-day momentum, 7-day price forecast, carrying cost (₹0.50/qtl/day), and SELL/HOLD/MONITOR advisory. |
| `GET` | `/api/mandi/live` (Port 5000) | Backend | Real Agmarknet arrivals from data.gov.in (cached 15 mins). |
| `GET` | `/api/mandi/history` (Port 5000) | Backend | 30-day historical time-series from Supabase `mandi_prices`. |
| `GET` | `/api/mandi/summary` (Port 5000) | Backend | Summary cards for top Maharashtra APMC commodities. |
| `GET` | `/api/mandi/ticker` (Port 5000) | Backend | Live moving ticker data for top APMC trades. |
| `GET` | `/api/buyers` (Port 5000) | Backend | Verified GSTIN buyer registry (Shree Ganesh Agro, Vardhman, Sai Krishi, etc.). |
| `POST` | `/api/realization/discover` (Port 5000) | Backend | Haversine distance math + APMC cess + freight deduction = Net Haath-me-aane-wala return. |
| `POST` | `/api/mandi/advisor` (Port 5000) | Backend -> ML | Calls ML Engine on `:8000` with Supabase history; provides localized Sell/Hold advisory. |

---

## 🗄️ 4. Verified Database Schema (Supabase)

- **Cloud Project ID:** `eizzzlnlcdfuylnojijn`
- **Active Tables (100% Verified Live in Cloud PostgreSQL):**
  1. `public.users` — Verified (1 record: `Abhi Kendre`, `8605168653`, `FARMER`)
  2. `public.farmer_profiles` — Verified (`fp-farmer-abhi`, 11 acres, Saat-Bara `88`)
  3. `public.buyer_profiles` — Verified (3 records: `Shree Ganesh Agro`, `Vardhman`, `Sai Krishi`)
  4. `public.produce_lots` — Farm-gate produce listings with GPS lat/lng and moisture %
  5. `public.offers` — Competitive buyer digital bids
  6. `public.deals` — Locked transaction contracts with escrow status
  7. `public.mandi_prices` — 210 historical daily Agmarknet records
- **Row Level Security (RLS) & Grants:** `anon` and `authenticated` roles have full CRUD access. Zero permission denial.

---

## 🧑‍🏫 5. User Preferences & Mentoring Rules

1. **Communication Language:** Friendly, natural **Hinglish**.
2. **Mentoring / Teaching Approach:** The user wants to learn everything step-by-step. Do not blindly dump files without explaining:
   - **Concept (Why):** The real-world problem being solved.
   - **Architecture (What & Where):** File location and purpose.
   - **Implementation (How):** Step-by-step code walkthrough.
   - **Verification:** Testing together in the browser.
3. **Inviolable Architectural Rules:**
   - **Zero Simulation / Zero Mock Math:** Real data only.
   - **Zero Hackathon / Govt Clutter:** Professional commercial B2B platform design.
   - **Unified Theme & Visual Identity:** Exact Landing Page design DNA (`#FAF7F2` earth base, `#1B4332` forest green, `#FCFAF6` header, `#E5DFD4` sand borders, `#C86432` terracotta accents, official logo PNG, `font-heading` Outfit, `font-sans` Jakarta, `font-mono` JetBrains).
   - **Localization Rule:** ONLY the Landing Page uses dynamic translation hooks (`mr.json`, `hi.json`, `en.json`). All other inner portals (Farmer, Buyer, FPO, Admin) simply display the language selector dropdown in the header for visual consistency, while keeping their UI text natural, standard, and direct without writing translation files/keys.
   - **Modular Code:** Components under 150–200 lines.
   - **One Page at a Time:** Build step-by-step with user consent.

---

## 🗺️ 6. Roadmap Status
 
- [x] **Phase 1: Foundation & Landing Page** — Complete (Live Agmarknet feed, Supabase PostgreSQL, Trilingual UI)
- [x] **Phase 2: Farmer Portal (शेतकरी डॅशबोर्ड)** — Complete (Net Realization Engine, Lot creation, Offer acceptance)
- [x] **Phase 3: Buyer Procurement Portal** — Complete (Live Marketplace, Haversine distances, Digital Bidding, Deal Contracts & Escrow)
- [ ] **Phase 4: FPO Aggregation Desk** — Upcoming
- [ ] **Phase 5: Digital APMC Mandi Desk & Logistics** — Upcoming
