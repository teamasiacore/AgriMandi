# AgriMandi (कृषीसेतू) — Master System Rules & AI Operating Manual

> **Document Purpose:** Absolute ground truth and operational guide for any AI assistant or developer working on the AgriMandi repository.  
> **Rule of Engagement:** Any AI joining this conversation in a new chat session MUST read this document, the PRD, the TRD, and the Backend Schema before generating code. Never deviate from these established architectural laws.

---

## 1. The 5 Inviolable System Rules (Never Break These!)

### 🚫 Rule 1: Zero Simulation & Zero Mock Math
- **Strict Prohibition:** Never write fake random calculations (e.g. `* 260 extra profit`), mock simulators, or fabricated price tickers.
- **Mandatory Practice:** All commodity prices, mandi arrivals, and historical trajectories MUST be queried directly from:
  1. **Official Government API:** `data.gov.in` (Agmarknet Live Feed).
  2. **Live Cloud Database:** Supabase PostgreSQL (`eizzzlnlcdfuylnojijn.supabase.co`) table `mandi_prices`.
  3. **Real Mathematical Formulas:** Haversine Great-Circle Distance ($D_{\text{km}}$) and dynamic per-quintal freight tariff rates.

### 🚫 Rule 2: Zero Hackathon / Academic Clutter on UI
- **Strict Prohibition:** Never put "SIH 2026", "Problem Statement ID", "Govt of Maharashtra", "MSInS", "College Prototype", or "Judge Defense" text on the public user interface.
- **Mandatory Practice:** The UI must look like a high-end, 100% commercial venture-backed enterprise agri-fintech platform (like DeHaat, Ninjacart, or BhaavDrishti).

### 🌐 Rule 3: Trilingual Localization (Marathi, Hindi, English)
- **Strict Prohibition:** Never hardcode dual-language slash text in JSX (e.g., `<p>शेतकरी / Farmer</p>`).
- **Mandatory Practice:** Always use the `useTranslation()` hook from `react-i18next`:
  - Marathi dictionary: `frontend/src/locales/mr.json` (Default Language).
  - Hindi dictionary: `frontend/src/locales/hi.json`.
  - English dictionary: `frontend/src/locales/en.json`.

### 🧩 Rule 4: Zero-Khichdi Modular Component Architecture
- **Strict Prohibition:** Never write 500-line monolithic files.
- **Mandatory Practice:** Keep every component modular and focused under 150–200 lines:
  - Landing components: `frontend/src/modules/landing/components/`
  - Farmer components: `frontend/src/modules/farmer/components/`
  - Buyer components: `frontend/src/modules/buyer/components/`
  - Shared UI components: `frontend/src/shared/components/`

### ⏸️ Rule 5: Step-by-Step Alignment with User
- **Strict Prohibition:** Never build multiple full-blown portals simultaneously without asking the user.
- **Mandatory Practice:** Build one single page at a time. Present the implementation plan, get user approval, build and verify, and ask before moving to the next page.

### 🧑‍🏫 Rule 6: Mentoring & Teaching Mode (Friendly Hinglish)
- **Strict Requirement:** The user is building this to master modern full-stack development and ML architecture.
- **Mandatory Practice:** Always speak in natural, friendly Hinglish. Never dump code blindly. Explain the real-world concept (Why), file structure (What), and implementation walkthrough (How) before and while coding. Keep `brain/CURRENT_STATE_AND_PROGRESS.md` continuously updated so context is never lost across chat sessions.

---

## 2. Directory Structure & Key File Map

```
d:\AgriMandi\
├── AGENTS.md                                  ◄── AI Agent Root Entry Point
├── brain\                                     ◄── System Intelligence & Architecture Truth
│   ├── CURRENT_STATE_AND_PROGRESS.md          ◄── LIVE RUNTIME STATE, PORTS & STEP JOURNAL
│   ├── PRD_PRODUCT_REQUIREMENTS_DOCUMENT.md   ◄── Product Requirements & User Journeys
│   ├── TRD_TECHNICAL_REQUIREMENTS_DOCUMENT.md ◄── Technical Stack & Algorithmic Math
│   ├── BACKEND_SCHEMA_AND_ARCHITECTURE.md     ◄── Supabase PostgreSQL Schema & ER Diagram
│   ├── MASTER_SYSTEM_RULES_AND_ROADMAP.md     ◄── This File (Operating Manual)
│   ├── ALGORITHMS_REFERENCE.md                ◄── Algorithmic Formulas (Haversine, Realization)
│   └── TECH_STACK_RATIONALE.md                ◄── Technology Stack Defense
│
├── backend\                                   ◄── Node.js Express REST API (:5000)
│   ├── .env                                   ◄── Supabase credentials & data.gov.in API Key
│   ├── package.json
│   └── src\
│       ├── server.js                          ◄── Express server entry point
│       ├── routes\apiRoutes.js                ◄── API endpoints (/mandi/live, /mandi/history, etc.)
│       └── services\
│           ├── supabaseClient.js              ◄── Supabase connection instance
│           ├── mandiService.js                ◄── Live data.gov.in ingestion & cache
│           ├── buyerService.js                ◄── Real GSTIN verified buyer registry
│           └── realizationService.js          ◄── Haversine distance & freight math
│
├── frontend\                                  ◄── React 18 + Vite + Tailwind CSS (:5173)
│   ├── package.json
│   ├── src\
│   │   ├── i18n.js                            ◄── Localization configuration
│   │   ├── locales\                           ◄── mr.json, hi.json, en.json
│   │   ├── shared\components\                 ◄── Navbar.jsx, Footer.jsx
│   │   └── modules\
│   │       ├── landing\                       ◄── Landing Page Module (COMPLETE)
│   │       │   ├── LandingPage.jsx
│   │       │   └── components\
│   │       │       ├── LiveTradeTicker.jsx
│   │       │       ├── HeroBanner.jsx
│   │       │       ├── CropPriceFinderWidget.jsx
│   │       │       ├── ServiceFeaturePillars.jsx
│   │       │       ├── RoleSelectionSection.jsx
│   │       │       ├── MandiTrendsAndAiInsight.jsx
│   │       │       ├── VerifiedBuyersDirectory.jsx
│   │       │       ├── SupportAndTrustBanner.jsx
│   │       │       ├── MobileBottomNav.jsx
│   │       │       └── OtpLoginModal.jsx
│   │       ├── farmer\                        ◄── Farmer Portal (NEXT PHASE)
│   │       ├── buyer\                         ◄── Buyer Portal (UPCOMING)
│   │       └── admin\                         ◄── Super Admin Desk (UPCOMING)
```

---

## 3. Step-by-Step Implementation Roadmap

| Phase | Module | Status | Core Deliverables |
| :---: | :--- | :---: | :--- |
| **Phase 1** | **Landing Page & Real Ingestion** | ✅ **COMPLETE** | Trilingual responsive landing page (Desktop + Mobile), live data.gov.in Agmarknet feed, Supabase PostgreSQL persistence, OTP login modal, real 30-day price trend chart. |
| **Phase 2** | **Farmer Portal & Net Realization** | ⏳ **NEXT** | Farmer Dashboard, Mandi Price Explorer, Net Realization Comparative Calculator (Haversine freight vs mandi cess), AI Sell/Hold Advisor (XGBoost momentum), Produce Lot Creation wizard. |
| **Phase 3** | **Buyer Procurement Portal** | 📋 **PENDING** | Buyer Dashboard, Lot Discovery with moisture/variety filters, Digital Bidding Engine, Gate Delivery Quality Verification, GST input tax credit e-invoicing. |
| **Phase 4** | **Logistics & Quality Assayer** | 📋 **PENDING** | Transporter dispatch module, dynamic route waybill generation, certified assay test upload slip. |
| **Phase 5** | **Escrow Ledger & APMC Admin Desk**| 📋 **PENDING** | Buyer GST verification desk, live APMC anomaly monitor, RBI-compliant escrow milestone release. |

---

## 4. Communication Guidelines for Antigravity AI

1. **Language:** Communicate with the user in natural, crisp **Hinglish** (as requested).
2. **Clarity:** Never give vague promises. Reference specific file paths and line numbers.
3. **Execution:** Always test and verify with commands (`npm run build`, node scripts) before presenting completed work to the user.
4. **Discipline:** Never delete or alter existing architecture without user consent.
