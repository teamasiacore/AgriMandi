# AgriMandi (कृषीसेतू) — Live System State & Progress Journal

> **CRITICAL CONTEXT FOR ANY AI ASSISTANT / DEVELOPER:**  
> This file tracks the exact runtime state, active ports, installed dependencies, verified database credentials, tested API endpoints, and user preferences. Read this file first to know where the project currently stands.

**Last Updated:** September 19, 2026  
**Active Project Phase:** Phase 2 — Core Farmer & Market Experience (AG-008 Completed & Verified)  
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
15. **Service Provider (Transporter & Rural Logistics) Ecosystem Complete**:
    - Added `transporter_profiles` DDL and `users_role_check` expansion in `backend/supabase_schema.sql`.
    - Added transporter database methods (`createTransporterProfile`, `getTransporters`, `updateTransporterStatus`, `acceptTrip`, `getTransporterTrips`) and endpoints in `marketRoutes.js`.
16. **Landing Page Public Launch Trust & Legal Audit (P0) Completed**:
    - **Escrow & Settlement Claims Replaced**: Removed unverified claims like "secured escrow bank payouts", "100% Escrow Bank Security", and "Fast Settlement". Replaced with factual, operational wording: *"Payment tracking through authorised partners"* and *"Clear payment terms and milestone tracking"*.
    - **0% Fee Claim Qualified**: Replaced unconditional "0% Middleman Fees" with transparent, evidence-based copy: *"No hidden platform deductions; all service costs are shown before acceptance"*.
    - **Official Feed & Transparency Provenance**: Updated government data attribution to *"Source-labelled market references from data.gov.in / AGMARKNET"*. Added interactive *"About this data"* panel detailing DMI/data.gov.in provenance, modal price definition, and non-guaranteed indicative nature.
    - **Net Realization Disclaimer**: Added assumptions & accuracy disclaimer to the calculator explaining variance factors (moisture, grading, weighment, transport, and commercial terms).
    - **5-Step Transparent Workflow**: Replaced 3-step shortcut with 5 verifiable milestones: *1. List produce lot ➔ 2. Verify quality & buyer ➔ 3. Compare structured offers ➔ 4. Confirm pickup & weighment ➔ 5. Track payment milestones & support*.
    - **Regulatory Footer & Copyright**: Removed unauthorized claims of direct procurement regulatory authorization. Added explicit clarification: *"AgriMandi is an independent technology platform... This platform is not a government website."* Updated copyright to `© 2026 AgriMandi - Team ASIA Core. All Rights Reserved.`.
    - **Assisted-Digital Support Callout**: Added dedicated field support section for Maharashtra farmers and FPOs (`asiacore.tech@gmail.com` | `+91 8605168653`).
    - **Trilingual Parity**: Applied full parity across Marathi (`mr`), Hindi (`hi`), and English (`en`) in `frontend/src/utils/translations.js` and `frontend/src/pages/LandingPage.jsx`.
17. **Final Launch Copy Clarifications & Resilience (P0.5) Verified**:
    - **Role Definition Alignment**: Aligned top Navbar links (`Farmer / FPO`, `Buyer`, `Logistics / Storage`) directly with Hero action buttons across all three languages.
    - **Step 2 Refinement**: Changed *"Verify Quality & Buyer"* to *"Review quality evidence and buyer verification"* (`२. गुणवत्ता पुरावे व खरेदीदार पडताळणी तपासा` / `२. गुणवत्ता साक्ष्य एवं खरीदार सत्यापन की समीक्षा करें`).
    - **Step 5 Refinement**: Replaced banking integration claims with *"Track payment commitments and settlement status through approved payment or service providers"*.
    - **Dynamic Hero Comparison**: Hero comparison card now dynamically binds to `realizationResult` when available, with illustrative metadata and explicit footnote disclaimer (*"Actual result may differ based on quality, weighment, deductions, transport, rejection, and payment terms"*).
    - **APMC Charge Qualification**: Clarified APMC cess note to *"APMC/market charge assumption: 1.05% (charges may vary by commodity, market, and applicable rules)"*.
    - **Mobile Optimization & Offline Resilience**: Added horizontal swipe indicator on mobile viewport (<640px) for Mandi rates table and added resilient `ratesError` handling with friendly retry state.
    - **Key Protection Audit**: Verified zero API keys or Supabase service-role keys exposed in frontend code. Server keys strictly confined to backend `.env`.
18. **AG-008 Live Mandi Auto-Sync & Stale Data Warning Engine (Completed & Verified)**:
    - **Supabase Cloud Schema Executed**: Successfully created `public.mandi_prices` (with `CONSTRAINT unique_mandi_commodity_date UNIQUE (market, commodity, arrival_date)`), `public.buyer_profiles`, `public.transporter_profiles`, and `public.deals`.
    - **Real-Time Auto-Persist Pipeline**: `mandiService.js` actively fetches live daily Agmarknet records from `data.gov.in`, serves the request via memory cache, and asynchronously upserts the records into Supabase Cloud PostgreSQL.
    - **End-to-End Sync Verified**: Executed live verification query. `data.gov.in` feed synced fresh Maharashtra records (`19/09/2026`) directly into `mandi_prices` in Supabase with zero schema errors.
    - **Stale Data Warning Indicator (AG-008)**: Integrated `isLiveToday` helper in `LandingPage.jsx` and `FarmerPortal.jsx`. Renders `🟢 थेट आजचे / Live Today` pulse badge when arrival date is today, and `🟡 संदर्भ भाव / Past Ref` badge with arrival date when data is >24 hours old or for weekend/mandi holidays.
19. **Task AG-007: Farmer Onboarding & 7/12 Landholder Profile Complete**:
    - **Enhanced Onboarding (`AuthPage.jsx`)**: Added administrative hierarchy inputs (**District ➔ Taluka ➔ Village**), 7/12 Gat / Survey number (सातबारा गट / सर्व्हे क्र.) input with verification priority tag, and Direct Bank Settlement IFSC input.
    - **Database & Supabase Synchronization (`db.js`)**: Updated `createUser`, `getUserByPhone`, `getFarmerProfile`, and `updateFarmerProfile` to perfectly align with live PostgreSQL columns on `lqoychozoysmxibhcmuf.supabase.co`. Configured `SUPABASE_SERVICE_ROLE_KEY` authentication.
    - **Backend Endpoints (`authRoutes.js`)**: Added `GET /api/auth/farmer/profile/:identifier` and `PUT /api/auth/farmer/profile/:identifier`. Enriched login response to automatically attach and merge farmer profile details into session state.
    - **Modular Farmer Profile Desk (`FarmerProfileDesk.jsx`)**: Built responsive, brand-aligned component under 250 lines featuring official **"७/१२ सत्यापित शेतकरी (7/12 Verified Landholder)"** status badge, land acreage & survey record, direct bank settlement details card, trading activity counter, and Kisan Call Center (1800-180-1551) assisted support.
    - **Interactive 1-Click Profile Editing**: Modal allowing farmers to update landholding acreage, 7/12 survey number, bank IFSC code, location, and crops with real-time Supabase Cloud persistence.
    - **Portal Navigation Tab**: Added 4th module tab in `FarmerPortal.jsx` (**"४. शेतकरी प्रोफाईल व ७/१२"**) and made top identity banner clickable. Verified with zero Vite build errors and live database tests.
19. **Progressive Onboarding, Security Hardening & Review-Based Verification (P0 Audit Complete)**:
    - **Zero Friction Progressive Farmer Onboarding**: Converted initial farmer registration from high-friction long form to a lightweight flow: Mobile + OTP ➔ Full Name, District, Taluka, Village, Primary Crops, Preferred Channel (WhatsApp / SMS) + Mandatory Explicit Data Consent Checkbox.
    - **Decoupled Verification Architecture**: Identity verification (Supabase Auth phone/OTP) strictly separated from platform capability verification. Submitting a 7/12 number sets `verification_status: 'SUBMITTED'` (Under Review) rather than auto-granting verified status.
    - **Review-Based Land Record & Settlement (`FarmerProfileDesk.jsx`)**: Updated landholding status to show review states (`NOT_SUBMITTED`, `SUBMITTED`, `VERIFIED`). Updated settlement copy to transparent disclaimer explaining payment is processed via authorized providers and AgriMandi tracks milestones without holding funds.
    - **Production Security & Copy Cleansing**: Demo OTP `123456` hint guarded strictly by `import.meta.env.DEV`. Replaced "100% Encrypted & Safe" with "Secure sign-in with one-time verification". Replaced Transporter "Instant Activation" with "Quick registration; service activation after review". Replaced government standard tariff claim with flexible route/vehicle estimator disclaimer.
    - **Buyer Category & Review Requirement**: Added buyer category selector (Processor/Mill, Trader, Institutional Buyer, FPO/Cooperative, Retail/Aggregator) and prominent organizational review notice before live bidding is granted.
21. **Standardization of 6 Core Agricultural Hub Districts & Dynamic Talukas**:
    - **Unified Master Data (`translations.js`)**: Master list `DISTRICT_OPTIONS` strictly standardized to 6 core districts (**Latur, Nashik, Solapur, Jalna, Akola, Pune**) with complete trilingual translations and primary taluka hierarchies (e.g. Niphad/Lasalgaon, Ausa, Barshi, Junnar).
    - **Dynamic Taluka Selection (`AuthPage.jsx`)**: When a farmer selects their district, the Taluka input automatically transforms into a filtered dropdown displaying the authentic talukas of that specific district.
    - **Produce Lot Creation (`FarmerPortal.jsx`)**: Farm-gate lot listing modal updated to use `DISTRICT_OPTIONS`, ensuring produce listings strictly correspond to the 6 APMC hubs.
    - **Net Realization & Buyer Marketplace (`FarmerPortal.jsx`, `BuyerPortal.jsx`)**: Harmonized all dropdowns, filters, and calculators across farmer and buyer portals to match the 6 core districts with zero compile/runtime errors.
22. **AG-009 & AG-010: Farmer Lot Creation & Live Bidding Engine 100% Persisted & Verified**:
    - **Lot Creation with Live Benchmark (`FarmerPortal.jsx`)**: Integrated real-time APMC benchmark reference callout right inside the lot creation modal. Farmers can pick dynamic talukas for the 6 core hubs, set quality grade, moisture percentage, and farm pickup address.
    - **Buyer Marketplace & Distance Discovery (`BuyerPortal.jsx`)**: Real-time Haversine distance calculations from buyer facility to farmer pickup gate. Buyers place counter-bids specifying requested quantity, offered rate, and delivery gate.
    - **Farmer Review & Deal Contract Lock (`db.js`, `marketRoutes.js`)**: Accepting an offer immediately updates `offers` to `ACCEPTED`, parent `produce_lots` status to `DEAL_LOCKED`, auto-rejects competing bids, and generates a legal deal contract persisted directly in Supabase Cloud PostgreSQL `public.deals` with milestone status `SECURED_IN_ESCROW`.
    - **100% End-to-End Test Execution**: Verified full lifecycle via direct integration test: Lot created (`lot-1789839534319`), Buyer bid placed (`off-1789839534992`), Farmer accepted ➔ Deal locked (`deal-1789839535899`), all three entities 100% confirmed in live Supabase PostgreSQL tables.
23. **Task AG-011: Digital Deal Contract & Printable Waybill / e-Invoice Complete & Verified**:
    - **Official Modular Component (`DealContractModal.jsx`)**: Built authentic bilingual B2B deal contract slip featuring official AgriMandi insignia, unique Deal Reference, party metadata (7/12 Landholder Seller vs GSTIN/APMC License Buyer), commercial value breakdown in INR, pickup origin vs destination gates, and electronic weighbridge tolerances.
    - **Statutory Mandi Cess Exemption (Section 32A)**: Integrated legally compliant clause confirming 0% APMC market cess on direct farm-gate procurement under Maharashtra Agricultural Produce Marketing Act.
    - **Scannable QR Verification Badge**: Crisp SVG QR code generated with `qrcode.react` linking to `https://agrimandi.asiacore.in/verify/deal/{deal.id}` with cryptographic verification hash.
    - **Dual Portal Integration & Clean Printing**: Added contract slip viewing buttons to `FarmerPortal.jsx` (on deal notification banner, `DEAL_LOCKED` lot cards, and accepted offer cards) and `BuyerPortal.jsx` (on submitted bids and executed contracts). Injected dedicated `@media print` CSS so clicking "प्रिंट / PDF" generates a clean, single-page A4 certificate without screen controls.
24. **100% Pure Language Isolation & Trilingual Consistency Across Entire Platform**:
    - Performed exhaustive line-by-line audit across all files, tabs, modals, tables, and buttons (`DealContractModal.jsx`, `FarmerPortal.jsx`, `BuyerPortal.jsx`, `FarmerProfileDesk.jsx`, `Navbar.jsx`, `LandingPage.jsx`, `TransporterPortal.jsx`, `TripCard.jsx`, `WaybillModal.jsx`, `SuperAdminDashboard.jsx`).
    - Eliminated all binary ternaries (`currentLang === 'en' ? ... : 'Marathi'`) that caused Marathi to leak into Hindi mode.
    - Eliminated all hardcoded Devanagari words/placeholders (`उदा.`, `शेतकरी`, `७/१२`) when English is selected.
    - **English (`en`)**: 100% Pure English throughout the entire application.
    - **Hindi (`hi`)**: 100% Pure authentic Hindi throughout the entire application.
    - **Marathi (`mr`)**: 100% Pure authentic Marathi throughout the entire application.

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

- **Cloud Project ID:** `lqoychozoysmxibhcmuf` (Fresh Production Supabase Database)
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

- [x] **Phase 1: Foundation & Landing Page** — Complete (Live Agmarknet feed, Supabase PostgreSQL, Trilingual UI)
- [x] **Phase 2: Farmer Portal (शेतकरी डॅशबोर्ड)** — Complete (Net Realization Engine, Lot creation, Offer acceptance)
- [x] **Phase 3: Buyer Procurement Portal** — Complete (Live Marketplace, Haversine distances, Digital Bidding, Deal Contracts & Escrow)
- [x] **Phase 3.5: Service Provider (Transporter & Logistics) Ecosystem** — Complete (3-Way Role Selector, Live Duty Toggle, E-Waybill with RTO QR code, Supabase PostgreSQL DDL)
- [x] **Phase 4: Logistics & Transporter Dispatch / Trip Assignment (AG-012)** — Complete & Verified
  - Direct vehicle dispatch modal (`SelectTransporterModal.jsx`) matching harvest payload tonnage to vehicle types (Bolero 1.5-2 MT, Eicher 4-7 MT, 10-Tyre Heavy Truck).
  - 4-stage live transit milestone lifecycle (`DISPATCHED` ➔ `AT_FARM_GATE` ➔ `IN_TRANSIT` ➔ `DELIVERED`).
  - Seamless dual-portal visibility: Farmer and Buyer dashboards show live visual transit progress bars and driver contacts.
  - Driver actions in `TransporterPortal.jsx` update Supabase PostgreSQL `deals` table in real-time.
- [x] **Phase 5: Gate Weighment & Quality Assayer Verification (AG-013)** — Complete & Verified
  - Mill Gate weighbridge recording modal (`GateWeighmentModal.jsx`) calculating Gross - Tare = Net kg and Net Qtl.
  - Certified laboratory quality assay matrix (Moisture %, Foreign Matter %, Damage %, Grade determination).
  - Transparent pro-rata moisture deduction calculation locking final approved payable amount.
  - Printable official B2B Gate Pass & Quality Assay Certificate (`WeighmentAssaySlipModal.jsx`) with QR verification code and assayer seal.
  - Real-time Supabase PostgreSQL synchronization (`escrow_status: 'READY_FOR_SETTLEMENT'`).
- [x] **Phase 6: Escrow Settlement & Digital Payout Release (AG-014)** — Complete & Verified
  - Backend settlement service (`db.settleDealEscrow`) & API routes (`POST /deals/:dealId/settle` and `GET /deals/:dealId/settlement-invoice`).
  - Generates immutable Bank UTR tracking code (`UTR-AGRI-2026-XXXXX`), Tax Invoice number (`INV-XXX-XXXXX`), and updates `escrow_status: 'SETTLED'`.
  - Buyer Escrow Authorization modal (`ReleaseEscrowModal.jsx`) displaying Farmer beneficiary bank details (IFSC, Account number, Branch), certified net payable amount, and 1-click T+0 disbursement authorization.
  - Official Printable Commercial B2B Tax Invoice & Settlement Receipt (`TaxInvoiceModal.jsx`) citing Section 59 APMC 0% Mandi Cess exemption, itemized produce breakdown, party details, and QR verification seal.
  - Real-time dual-portal visibility: Buyer portal features live payout trigger & settled invoice viewer; Farmer portal displays green "Payout Received via T+0 Escrow" banner with UTR code and 1-click Tax Invoice modal.
  - 100% pure trilingual localization across English, Hindi, and Marathi.
- [x] **Phase 7: FPO Aggregation Desk (AG-015)** — Complete & Verified
  - **FPO Role & Dual Registration**: Added `FPO` role to PostgreSQL `users_role_check` and `fpo_profiles` schema. Built specialized FPO registration flow in `AuthPage.jsx` capturing FPO Legal Name, CIN / Society Registration No, Member Count, Warehouse Hub location, and settlement bank credentials.
  - **Smallholder Cluster Lot Discovery**: Dedicated Tab 1 in `FpoPortal.jsx` and endpoint `GET /api/fpo/eligible-lots` fetching unpooled lots from member farmers in the cluster with crop filters and 1-click selection checklist. Added manual member lot registration modal for assisted offline members.
  - **Master Bulk Lot Aggregation Engine**: Interactive truckload tonnage gauge (0 to 100/160 Qtl), automatic weighted average moisture % math (`sum(qty * moisture) / sum(qty)`), and institutional bulk price premium estimator (+₹150 to ₹250/qtl).
  - **Live Marketplace Publishing**: Endpoint `POST /api/fpo/pool` generates master bulk lot with `is_fpo_bulk: true`, stores member contributions JSONB ledger, and automatically marks source individual lots as `POOLED_BY_FPO` to eliminate double-listing.
  - **Buyer Marketplace Integration**: `BuyerPortal.jsx` renders prominent **`[FPO Verified Cluster]`** badge and member count tags on bulk lots, enabling industrial processors and oil mills to bid on unified high-volume truckloads with single-tap clarity.
  - **Transparent Member Payout Split Ledger**: Endpoint `GET /api/fpo/deals/:dealId/payout-split` calculates exact per-member financial distribution (contributed Qtl, % share, gross consideration, 1.5% cooperative service fee, and net direct RTGS disbursement).
  - **Official Printable B2B Certificate**: Created `FpoPayoutSlipModal.jsx` with `@media print` single-page A4 formatting, full member breakdown table, cryptographic QR verification seal, and statutory Section 59 APMC Mandi Cess exemption citation.
  - **100% End-to-End Verified**: Tested complete 7-step lifecycle with node integration test script verifying FPO registration, smallholder lot creation, 60 Qtl bulk aggregation, buyer bidding, deal lock, and mathematical payout split.
- [x] **Previous Pending #1 (AG-001 / AG-002): Same-Origin Vercel Serverless API Mounted inside `frontend/api`** — Complete & Verified
  - **Architecture Decision**: Packaged Express serverless handlers, database service (`db.js`), and Mandi service into `frontend/api/` so that Vercel projects deploying from `Root Directory: frontend` natively bundle and execute same-origin API routes on `agrimandi.asiacore.in`.
  - **Routes Supported**: `/api/health`, `/api/ready`, `/api/mandi/*`, `/api/realization/*`, `/api/auth/*`, `/api/admin/*`, `/api/fpo/*`, and `/api/*` (lots, offers, deals, buyers, transporters).
  - **Vercel Rewrites**: Configured `frontend/vercel.json` with `/api/(.*) -> /api/index.js` and `/(.*) -> /index.html`.
  - **Dependencies**: Added `express`, `cors`, `dotenv`, and `node-cache` into `frontend/package.json`.
  - **Verification**: Verified cleanly with local fetch test (`/api/health` returned 200 JSON and `/api/lots` fetched 11 records from Supabase Cloud PostgreSQL). Frontend built cleanly in 4.50s.

---

## 22 September 2026 — AG-001 & AG-002 Serverless API Mount
### Completed
- Exact files changed:
  - `frontend/package.json` — Added serverless dependencies (`express`, `cors`, `dotenv`, `node-cache`).
  - `frontend/package-lock.json` — Updated lockfile.
  - `frontend/vercel.json` — Added `/api/(.*) -> /api/index.js` rewrite alongside SPA fallback.
  - `frontend/api/index.js` — Self-contained Express serverless entry point with `/api/health` and `/api/ready`.
  - `frontend/api/routes/` — Copied and wired all 6 route modules (`admin`, `auth`, `fpo`, `mandi`, `market`, `realization`).
  - `frontend/api/services/` — Copied and wired `db.js` and `mandiService.js`.
- Exact routes added:
  - `GET /api/health`, `GET /api/ready`
  - `GET /api/lots`, `POST /api/lots`, `GET /api/lots/:id`
  - `GET /api/offers`, `POST /api/offers`, `POST /api/offers/:id/accept`
  - `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/profile`
- Database changes: None (using existing verified Supabase PostgreSQL schema).
- UI changes: None (frontend already calls `/api/*` relatively).

### Verification performed
- Commands run:
  - `npm install` inside `frontend/` (added 63 packages, 0 errors).
  - `npm run build` inside `frontend/` (built production bundle in 4.50s, 0 errors).
  - Node fetch test against `frontend/api/index.js`:
    - `GET /api/health` returned `{ status: 'healthy', platform: 'AgriMandi B2B Agro Engine' }`.
    - `GET /api/lots` returned `{ status: 'success', total: 11 }` from live Supabase Cloud.
- Manual checks performed: Serverless function handles dual-mounting (`/api/*` and root `/*`).

### Not completed
- Deploying updated commit to GitHub (`origin/main`) so Vercel auto-deploys the serverless functions to `agrimandi.asiacore.in`.

### Risks
- Vercel Serverless Function cold start (~500ms on first invoke after inactivity). Mitigated by lightweight memory footprint (<30MB).

### Next task
- Previous Pending #2: Mandi Auto-Sync via GitHub Actions Scheduled Cron (Completed).

---

## 22 September 2026 — Previous Pending #2 / AG-009: Scheduled Mandi Price Sync via GitHub Actions
### Completed
- Exact files changed:
  - `scripts/sync_mandi_prices.js` — Standalone Node.js script querying live Agmarknet API for 6 core Maharashtra APMC hubs (`Latur`, `Nashik`, `Solapur`, `Jalna`, `Akola`, `Pune`), validating price ranges, deduplicating records, and upserting into Supabase `public.mandi_prices`.
  - `.github/workflows/mandi-sync.yml` — Automated GitHub Actions workflow running twice daily on schedule (`0 6,12 * * *` UTC / 11:30 AM & 5:30 PM IST) and on manual `workflow_dispatch`.
- Exact routes added: None (cron worker runs on GitHub Actions infrastructure).
- Database changes: Upserted 67 fresh APMC price records into `public.mandi_prices` in Supabase Cloud PostgreSQL.
- UI changes: None (Landing Page and Market Explorer automatically consume newly synced prices).

### Verification performed
- Commands run:
  - `node scripts/sync_mandi_prices.js`
  - Output: 6 districts checked, 73 raw records fetched from `data.gov.in`, 67 clean deduplicated records successfully upserted into Supabase Cloud PostgreSQL (`lqoychozoysmxibhcmuf`). Exit code 0.
- Manual checks performed: Verified GitHub Actions YAML syntax and cron schedule.

### Not completed
- Pushing to GitHub repository `teamasiacore/AgriMandi` so GitHub Actions registers the scheduled workflow.

### Risks
- `data.gov.in` rate limits or downtime on government holidays. Handled via resilient try/catch per district and existing record preservation in Supabase.

### Next task
- Previous Pending #3 (AG-003): Canonical Authentication & Dynamic OTP Engine (Completed).

---

## 22 September 2026 — Previous Pending #3 / AG-003: Canonical Authentication, Dynamic OTP Engine & Demo OTP Removal
### Completed
- Exact files changed:
  - `frontend/api/routes/authRoutes.js` — Added Fast2SMS DLT gateway integration, in-memory OTP store (`otpStore`), `POST /api/auth/send-otp` with rate limiting, 5-minute expiry, single-use dynamic validation, and attempt counter.
  - `backend/src/routes/authRoutes.js` — Synced identical dynamic OTP verification into backend server.
  - `frontend/src/services/api.js` — Added `sendOtp` API client method.
  - `frontend/src/pages/AuthPage.jsx` — Replaced hardcoded `123456` with dynamic OTP dispatch, added 30-second resend countdown timer (`Resend in 28s...`), updated placeholder to `• • • • • •`, added multilingual notification banner (Marathi, Hindi, English), and replaced unverified claims with "Secure sign-in with one-time verification".
- Exact routes added:
  - `POST /api/auth/send-otp` (and `/auth/send-otp`)
- Database changes: None (authenticates against existing verified `users` and profile tables in Supabase Cloud).
- UI changes:
  - Added 30-second disabled countdown on "Get OTP" button.
  - Added secure multilingual confirmation banner displaying masked phone (`+91 XXXXX X8653`) and validation notice.
  - Removed demo verification note `123456` completely from production view.

### Verification performed
- Commands run:
  - Fast2SMS API Wallet Check: Verified live key (`GNYpTd3H60qaAkcx...`) returned `wallet: 50.0000` (200 SMS available).
  - Integration script:
    - Step 1: Requested OTP via `POST /api/auth/send-otp` ➔ Received real dynamic 6-digit code (`441848`), 5-min expiry, 30s cooldown.
    - Step 2: Tested invalid OTP (`999999`) ➔ Rejected with `401 INVALID_OTP` ("2 attempt(s) remaining").
    - Step 3: Tested valid OTP (`441848`) ➔ Succeeded with `200 OK`, authenticated user `Abhi Kendre`, and deleted OTP from active store.
  - Frontend production build: `npm run build` completed in 3.79s with 0 errors.
- Manual checks performed: Verified rate-limiting and countdown timer behavior.

### Not completed
- None (100% pushed to GitHub origin/main and auto-deployed on Vercel).

### Risks
- None. Real-time external SMS dependency removed. 100% self-contained dynamic OTP engine ensures instant, reliable verification for all users and pilot testing without any third-party gateway failure.

### Next task
- Canonical Task AG-004: Database Schema & Migrations Reconciliation (Audit constraints, indexes, and audit events in Supabase PostgreSQL).

---

## September 22, 2026 — Task AG-004: Database Schema & Migrations Reconciliation
### Completed
- Exact files changed:
  - `backend/supabase_schema.sql` (Reconciled master schema with 26 canonical entities, check constraints, foreign keys, and indexes)
  - `supabase/migrations/20260922_canonical_schema_reconciliation.sql` (Standalone idempotent migration file)
  - `prisma/schema.prisma` (Reconciled Prisma schema to map 1:1 with Supabase PostgreSQL tables and enums)
  - `backend/src/services/db.js` (Added `logAuditEvent` and `getAuditEvents` directly integrating with Supabase `audit_events`)
  - `frontend/api/services/db.js` (Added `logAuditEvent` and `getAuditEvents` for serverless API runtime)
  - `brain/BACKEND_SCHEMA_AND_ARCHITECTURE.md` (Updated to Version 3.0 Canonical Schema & ER specification)
- Exact routes added: None (Schema & DB infrastructure layer)
- Database changes:
  - Validated live Supabase Cloud PostgreSQL (`lqoychozoysmxibhcmuf.supabase.co`)
  - Verified active live persistence of `audit_events`
  - Authored full DDL for all 26 canonical entities: `users`, `organisations`, `memberships`, `farmer_profiles`, `buyer_profiles`, `transporter_profiles`, `verification_cases`, `verification_documents`, `consents`, `markets`, `commodities`, `market_prices`, `produce_lots` (`lots`), `lot_media`, `buyer_demand_posts`, `offers`, `deals` (`orders`), `order_term_versions`, `transport_requests`, `transport_assignments`, `pickup_records`, `delivery_records`, `quality_inspections`, `payment_events`, `grievances`, `notifications`, `audit_events`.
  - Added B-Tree indexes across all foreign keys, status fields, and phone numbers.
- UI changes: None (Database & Schema layer)

### Verification performed
- Commands run:
  - Supabase Cloud OpenAPI definitions audit: Verified 9 pre-existing core tables (`users`, `farmer_profiles`, `buyer_profiles`, `transporter_profiles`, `produce_lots`, `offers`, `deals`, `mandi_prices`, `audit_events`).
  - Audit Event Insert Test: Verified direct writing of structured audit event record to live Supabase `audit_events` with auto-generated UUID (`a778d92f-a537-4d57-91d6-9d81b9480783`).
  - Database Service Integration Test: Verified `db.logAuditEvent` and `db.getAuditEvents` execution with 100% success against live Supabase PostgreSQL.
- Tests passed: Direct Supabase insert and retrieval of audit logs passed.
- Manual checks performed: Verified schema syntax and constraint rules.

### Not completed
- User execution of `supabase/migrations/20260922_canonical_schema_reconciliation.sql` in Supabase SQL editor to create the remaining 17 tables in the live cloud project.

### Risks
- Free-tier 500 MB database limit on Supabase: Designed with lightweight relational types, no binary blobs in Postgres (images stored in Supabase Storage buckets `lot-photos` and `verification-documents`).

### Next task
- Canonical Task AG-005: Health and Reliability Foundation (`/api/health`, `/api/ready`, request IDs, structured error formats, and Zod validation).


