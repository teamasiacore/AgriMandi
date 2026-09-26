# AgriMandi Performance & Architecture Action Plan
**Date:** 2026-09-25  
**Auditor:** Antigravity AI Engineering Suite  
**Principle:** *"Jya API calls chi garaj aahe tech use vhavav. Jo paryant apan tyala click karnar nahi to tyacha call hou naye. Sglya goshti niyamat rahav."*  
**Status:** PROPOSED PLAN (Zero code or database changes executed)

---

## 1. Executive Action Hierarchy

```
[ P0: CRITICAL SECURITY & ACCESS ISOLATION ]
  ├── 1. Implement Server-Side JWT / Bearer Auth Verification on all /api/* routes
  ├── 2. Protect /api/admin/* endpoints with canonical admin token check
  └── 3. Enforce User ID matching on /api/offers and /api/deals (Stop cross-user data leak)

[ P1: EXCESSIVE CALL ELIMINATION & ON-DEMAND ENFORCEMENT ]
  ├── 1. Remove duplicate /api/mandi/live mount call on LandingPage
  ├── 2. Eliminate eager kitchen-sink fetches on FarmerPortal (load only profile + own lots on mount)
  ├── 3. Eliminate competitor list fetch (/api/buyers) on BuyerPortal
  └── 4. Refactor SuperAdminDashboard from Promise.all (7 calls) to Tab-Active On-Demand calls

[ P2: LIFECYCLE, CANCELATION & PAGINATION OPTIMIZATION ]
  ├── 1. Add AbortController signals to frontend api.js client calls
  ├── 2. Add server-side pagination (limit + offset) to /api/lots and /api/transporters
  ├── 3. Add client-side in-flight request deduplication
  └── 4. Implement disabled state on form submission buttons (Prevent double-posting)

[ P3: ADVANCED / FUTURE HORIZON ]
  ├── 1. Real SMS / WhatsApp gateway integration for OTP
  ├── 2. Connect Python ML engine (port 8000) only if model out-performs JS heuristic
  └── 3. WebSocket / Supabase Realtime channel for live ticker and bids
```

---

## 2. Immediate Priority Fixes (P0 & P1)

### Priority P0-1: Secure Admin Endpoints from Public Internet Access
- **Problem:** Endpoints under `/api/admin/*` (`/buyers/:id/verify`, `/farmers/:id/verify`, `/stats`, `/transporters`) currently check no auth token or session in `backend/src/routes/adminRoutes.js`. Anyone on the internet can POST to `/api/admin/farmers/:id/verify` or DELETE `/api/admin/farmers/:id`.
- **Target Files:**
  - `backend/src/middleware/auth.js` (to be created for JWT verification)
  - `backend/src/routes/adminRoutes.js`
  - `frontend/api/routes/adminRoutes.js`
- **Solution:** Add `verifyAdmin` middleware to all admin routes checking `req.headers.authorization === Bearer <valid_admin_token>`.

### Priority P0-2: Prevent Cross-User Data Exposure in Offers & Deals
- **Problem:** `GET /api/offers` and `GET /api/deals` return all records in the database if query filters are omitted. `FarmerPortal.jsx` calls them with no query parameters, loading trade information of other farmers into the browser.
- **Target Files:**
  - `backend/src/routes/marketRoutes.js`
  - `frontend/src/pages/FarmerPortal.jsx`
- **Solution:**
  1. Backend: In `router.get('/offers')` and `router.get('/deals')`, if no `farmer_id`, `farmer_phone`, or `buyer_id` is passed, reject with 400 or enforce filter derived from the verified user session.
  2. Frontend: Only call `getOffers` and `getDeals` when the farmer actually opens the "Offers & Bids" or "Contract" tab, passing `{ farmer_phone: user.phone }`.

### Priority P1-1: Eliminate Landing Page Duplicate Mount Call
- **Problem:** `LandingPage.jsx` triggers two identical requests to `GET /api/mandi/live?commodity=all&district=all` within 10ms of opening the site.
- **Target File:** `frontend/src/pages/LandingPage.jsx`
- **Solution:** Remove line 35 `fetchRates()` inside `useEffect([], ...)`, allowing the second `useEffect([selectedCrop, selectedDistrict], ...)` to handle the initial fetch naturally.

### Priority P1-2: Eliminate Eager Kitchen-Sink Calls on FarmerPortal
- **Problem:** When a farmer logs in, the app immediately fires 9 calls before the farmer clicks anything:
  - `getFarmerProfile`, `getLiveRates` (×2), `getMandiAdvisor`, `getLots`, `getOffers`, `getDeals`, `calculateRealization`, `compareMultiMandiRealization`.
- **Target File:** `frontend/src/pages/FarmerPortal.jsx`
- **Solution:**
  - On Mount: Fetch ONLY `getFarmerProfile` and `getLots({ farmer_phone })`.
  - When Farmer clicks "Market Prices" tab: Fetch `getLiveRates`.
  - When Farmer clicks "Advisory / Forecast" tab: Fetch `getMandiAdvisor`.
  - When Farmer clicks "Bids & Offers" tab: Fetch `getOffers({ farmer_phone })`.
  - When Farmer clicks "Realization Calculator" tab: Fetch `calculateRealization`.

### Priority P1-3: Stop Fetching Competing Buyers in BuyerPortal
- **Problem:** `BuyerPortal.jsx` line 226 calls `api.getBuyers()` on mount, downloading details of all other registered buyers.
- **Target File:** `frontend/src/pages/BuyerPortal.jsx`
- **Solution:** Remove `api.getBuyers()` from `loadMarketData`. A buyer only needs to see their own profile, listed lots, and their own offers.

### Priority P1-4: On-Demand Lazy Loading in SuperAdminDashboard
- **Problem:** Admin login triggers `Promise.all` with 7 endpoints: `stats`, `buyers`, `transporters`, `farmers`, `lots`, `deals`, `supabaseStatus`.
- **Target File:** `frontend/src/pages/SuperAdminDashboard.jsx`
- **Solution:**
  - On Mount: Fetch ONLY `getAdminStats()`.
  - When Admin clicks "Buyers" tab: Fetch `getAdminBuyers()`.
  - When Admin clicks "Transporters" tab: Fetch `getAdminTransporters()`.
  - When Admin clicks "Farmers" tab: Fetch `getAdminFarmers()`.
  - When Admin clicks "Lots" tab: Fetch `getAdminLots()`.
  - When Admin clicks "Deals" tab: Fetch `getAdminDeals()`.

---

## 3. Mid-Term Optimization Plan (P2)

| Task | Files Affected | Expected Impact |
|---|---|---|
| **AbortController Integration** | `frontend/src/services/api.js`, all page components | Cancels in-flight network calls when user navigates away; saves mobile data & bandwidth |
| **Server-Side Pagination** | `backend/src/routes/marketRoutes.js`, `frontend/src/pages/BuyerPortal.jsx` | Adds `limit=20&page=1` to `/api/lots`, avoiding multi-megabyte payloads as lots scale |
| **Button Double-Click Protection** | `FarmerPortal.jsx`, `BuyerPortal.jsx`, `TransporterPortal.jsx` | Disables submit buttons during API execution (`disabled={isSubmitting}`); eliminates duplicate database records |
| **Short-Lived Memory Caching** | `frontend/src/services/api.js` | 30-second deduplication cache for read-only queries (e.g., MSP reference rates) |

---

## 4. Simple vs. Over-Engineered Architecture Assessment

```
CURRENT OVER-ENGINEERED / SPLIT ARCHITECTURE:
  ├── 1. Dual Backend: Express (port 5000) AND Vercel Serverless (frontend/api/index.js)
  ├── 2. Parallel Ghost Monorepo: apps/api, apps/web, apps/ml-service, packages/*
  ├── 3. Eager Promise.all firehoses choking Supabase connection pools
  └── 4. Python ML microservice claimed in docs but unused in backend code

TARGET STREAMLINED ARCHITECTURE (PILOT OPTIMAL):
  Browser (React + Vite)
    ↓ Feature-level route (Lazy Loaded)
    ↓ ONLY on-demand data hook (Fired on tab click / user action)
  One Canonical REST API Layer (Node.js / Express or Vercel Serverless)
    ↓ Unique Request ID + Structured Safe Logger
    ↓ Canonical Bearer Auth Verification (JWT / Session Token)
    ↓ Zod Request Validation
  Supabase PostgreSQL 15 Cloud
    ↓ RLS + Foreign Keys + Indexed Queries
  Response Shape: { success: true, data: {}, meta: { requestId } }
```

### Is the current architecture sufficient for 20 concurrent users?
- **YES, BUT WITH ONE CAVEAT:**
  If 20 users log in concurrently under the current eager-loading pattern, the application fires **140 to 180 requests simultaneously** at Supabase.
  Once P1 (on-demand loading) is applied, 20 concurrent users will generate only **20 to 40 lightweight requests total**, running smoothly with sub-400ms latency on free-tier infrastructure.

