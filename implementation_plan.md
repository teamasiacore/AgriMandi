# Implementation Plan: AgriMandi Ready-to-Launch Full-Stack MVP

Ek clean, robust aur authentic commercial B2B platform build karna hai jisme:
- Koi unnecessary micro-component fragmentation nahi hoga (jaise 5-5 lines ke alag header/footer/subcards nahi).
- Har primary role aur workflow ke liye focused, comprehensive module file hogi:
  - **Landing Module** (`LandingPage.jsx`)
  - **Farmer Module** (`FarmerPortal.jsx`)
  - **Buyer Module** (`BuyerPortal.jsx`)
  - **Auth Module** (`AuthPage.jsx` - Login & Sign Up)
- Backend ekdum solid, modular aur production-grade hoga (Real Agmarknet live feed, Haversine freight math, Supabase/persistent data storage, and trade offer state machine).
- Brand theme 100% cohesive aur commercial hogi (`#FAF7F2`, `#1B4332`, `#C86432`, Outfit font, official logo).

---

## User Review Required

> [!IMPORTANT]
> - **Architecture Structure:** Frontend me micro-fragmentation hatakar 4 core cohesive modules banaye jayenge (`LandingPage.jsx`, `FarmerPortal.jsx`, `BuyerPortal.jsx`, `AuthPage.jsx`) sath me ek shared `Navbar.jsx`.
> - **Real Data Feed:** `data.gov.in` official Agmarknet API key (`579b464db66ec23bdd000001d4d3eb54d4134d624b3aecd686e285a1`) ke sath real-time market rates aayenge, with 15-minute caching to prevent government rate-limiting.
> - **Persistent State:** Farmers produce lots list kar sakenge, Buyers unhe dekh kar bids/offers de sakenge, aur Farmers bids accept karke deals lock kar sakenge.

---

## Proposed Changes & File Architecture

```
d:\AgriMandi\
├── backend\
│   ├── package.json
│   ├── .env
│   └── src\
│       ├── server.js               # Main Express app, CORS, error handling
│       ├── routes\
│       │   ├── mandiRoutes.js      # Real data.gov.in live feed, history, ticker
│       │   ├── realizationRoutes.js# Haversine distance + dynamic freight + net realization
│       │   ├── marketRoutes.js     # Lots CRUD, bids/offers, deal locking, verified buyers
│       │   └── authRoutes.js       # Register, login, role session handling
│       └── services\
│           ├── mandiService.js     # data.gov.in Agmarknet fetcher with 15-min node-cache
│           └── db.js               # Supabase PostgreSQL client with persistent fallback
│
└── frontend\
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    ├── public\
    │   └── images\                 # Official AgriMandi Logos
    └── src\
        ├── main.jsx
        ├── index.css               # Warm earth palette, typography, custom scrollbars
        ├── App.jsx                 # Central router (/, /farmer, /buyer, /login, /register)
        ├── components\
        │   └── Navbar.jsx          # Unified header with official logo, role switcher, lang toggle
        ├── pages\
        │   ├── LandingPage.jsx     # Commercial landing: Hero, APMC Ticker, Live Rates Explorer, Calculator preview, How it works
        │   ├── FarmerPortal.jsx    # Complete Farmer Desk: Live Mandi Rates, AI Sell/Hold Advisory, Net Realization Calc, List Produce Lot, My Lots & Offers
        │   ├── BuyerPortal.jsx     # Complete Buyer Desk: Farm-gate Lot Marketplace, Filter by crop/district/moisture, Place Bids, Active Orders & Deals
        │   └── AuthPage.jsx        # Complete Auth: Unified Login & Register for Farmers & Buyers (Phone, OTP, Role selection, Profile fields)
        └── services\
            └── api.js              # Central Axios client communicating with Backend (:5000)
```

---

## Detailed Component Specifications

### 1. Backend Layer (`backend/`)
- **`mandiService.js`:**
  - Calls `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070`.
  - Filters by Maharashtra mandis (Lasalgaon, Pune, Latur, Nashik, Jalna, Solapur, Akola).
  - Implements 15-minute `node-cache` TTL for lightning-fast (<5ms) responses.
  - Built-in Agmarknet archive fallback if government server ever drops or experiences DNS delay.
- **`realizationRoutes.js`:**
  - Authentic Haversine formula calculation between farmer location and mandi/buyer destination.
  - Freight deduction (`₹3.80 - ₹5.20 / qtl-km`), APMC cess deduction (`₹45/qtl` for mandi, `₹0` for direct buyer), storage cost evaluation.
- **`marketRoutes.js`:**
  - `GET /api/lots` — List available farm-gate lots with status (`LISTED`, `DEAL_LOCKED`).
  - `POST /api/lots` — Farmer lists crop, quantity, expected price, moisture %, and location.
  - `POST /api/offers` — Buyer places offer price and valid until date.
  - `POST /api/offers/:id/accept` — Farmer accepts offer; lot locks into `DEAL_LOCKED` contract state.
  - `GET /api/buyers` — Verified buyer registry with GSTIN, location, and rating.
- **`authRoutes.js`:**
  - Login / Register with phone number, role (`FARMER` / `BUYER`), full name, and district.

---

### 2. Frontend Layer (`frontend/`)
- **`LandingPage.jsx`:**
  - Premium commercial hero section with live stats counter.
  - Real-time live APMC rate ticker marquee.
  - Interactive Mandi Explorer (district & crop selector).
  - Visual Net Realization preview comparison (Mandi vs Farm-Gate direct sale).
  - Trilingual copy toggle (Marathi / Hindi / English) for the landing page.
- **`FarmerPortal.jsx`:**
  - Single, cohesive, powerful dashboard for farmers:
    1. **Live Mandi Rates:** Real Agmarknet prices, min/max/modal, trend badges.
    2. **AI Advisory & Price Trend:** 30-day price trend chart (Recharts) with Sell / Hold / Monitor momentum guidance.
    3. **Net Realization Calculator:** Enter quantity, crop, and location to calculate real in-hand earnings after freight and cess.
    4. **Produce Lot Listing:** Clean modal/form to list new produce with moisture %, grade, and price.
    5. **My Lots & Received Offers:** View incoming bids from verified buyers with single-click "Accept Offer" to lock the deal.
- **`BuyerPortal.jsx`:**
  - Production-ready procurement desk for oil mills, dal mills, and bulk purchasers:
    1. **Produce Lot Marketplace:** Filter farm-gate lots by crop, moisture %, distance, and price.
    2. **Direct Bid Placement:** Input offer price per quintal and submit digital offer.
    3. **My Active Bids & Locked Contracts:** Track offers, deal progress, and direct contact details.
    4. **APMC Benchmark Comparison:** See how the lot's price compares to the nearest APMC modal rate.
- **`AuthPage.jsx`:**
  - One clean, unified page handling both Sign In and Sign Up.
  - Toggle between **Farmer (शेतकरी)** and **Buyer (व्यापारी)** roles.
  - 10-digit mobile number, OTP verification simulation, and profile setup (district, business name / farm size).

---

## Verification Plan

### Automated Tests & Server Health
1. **Backend Server Verification:**
   - Start Node.js backend: `node src/server.js` on port `5000`.
   - Test endpoints:
     - `GET http://localhost:5000/api/health`
     - `GET http://localhost:5000/api/mandi/live?commodity=Soyabean`
     - `GET http://localhost:5000/api/lots`
     - `GET http://localhost:5000/api/buyers`
     - `POST http://localhost:5000/api/realization/discover`
2. **Frontend Build & Dev Server:**
   - Run `npm run build` in `frontend/` to ensure zero compilation errors.
   - Start Vite dev server: `npm run dev -- --host` on port `5173`.

### Manual End-to-End Trade Flow Verification (Browser Subagent)
1. Open Landing Page (`http://localhost:5173/`):
   - Check Brand Theme (`#FAF7F2`, `#1B4332`, `#C86432`, official logo).
   - Test Live Mandi explorer and rate ticker.
2. Sign Up / Login as Farmer:
   - Go to `/farmer`.
   - Test Net Realization Calculator.
   - Create a new Produce Lot (e.g. 50 Quintals Soybean at ₹4,800/qtl in Latur).
3. Switch to Buyer Portal (`/buyer`):
   - Check if newly listed lot appears in the procurement marketplace.
   - Place a bid (e.g. ₹4,750/qtl).
4. Return to Farmer Portal (`/farmer`):
   - Verify the bid appears under "Received Offers".
   - Click "Accept Offer" and verify the lot status transitions to `DEAL_LOCKED`.
