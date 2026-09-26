# AgriMandi Runtime, API, Backend, Pipeline, and Performance Audit

**Date:** 2026-09-25  
**Platform:** AgriMandi (कृषीसेतू)  
**Repository:** teamasiacore/AgriMandi  
**Target Rule:** *"Jya API calls chi garaj aahe tech use vhavav. Jo paryant apan tyala click karnar nahi to tyacha call hou naye. Sglya goshti niyamat rahav."*  
**Audit Boundary:** Evidence-based inspection only. `CODE_CHANGED = NO`, `DATABASE_CHANGED = NO`, `PRODUCTION_DATA_CHANGED = NO`.

---

## 1. Executive Summary

AgriMandi is a direct-from-farm B2B agricultural trading platform targeting smallholder farmers, verified institutional buyers, agricultural logistics providers (transporters), and FPOs across Maharashtra.

This audit conducted an end-to-end trace of all 72 API calls, Express server routes, Vercel serverless entry points, database models, background pipelines, and network request lifecycles.

### Key Takeaways:
1. **Core Features Work:** User registration, OTP authentication, Produce Lot publishing, Offer creation, Counter-offers, Deal locking, and Haversine net realization math are implemented and connected to Supabase PostgreSQL (`lqoychozoysmxibhcmuf.supabase.co`).
2. **Marathi Team Rule Violation (Excessive & Eager Loading):** The application routinely violates the *"Jya API calls chi garaj aahe tech use vhavav"* principle. On initial mount, `FarmerPortal` fires **9 simultaneous API calls** (including entire-system offers and deals), `SuperAdminDashboard` fires **7 parallel calls** via `Promise.all`, and `LandingPage` fires `/api/mandi/live` twice due to redundant `useEffect` triggers.
3. **P0 Security Vulnerability (Missing Server-Side Session Verification):** The backend issues an opaque token upon login (`token-${user.id}-${Date.now()}`), but downstream routes in `marketRoutes.js` and `adminRoutes.js` **never verify the Authorization header**. Endpoints rely purely on client-supplied body or query parameters (`farmer_phone`, `buyer_id`, etc.), allowing arbitrary access to administrative and trade data if parameters are manipulated.
4. **Documentation vs Reality Discrepancy:** The architecture documents claim an "XGBoost ML microservice on port 8000" and "Isolation Forest anomaly detection." In reality, the backend has **zero network calls to port 8000**; price advisories are calculated using an in-process JavaScript heuristic (linear trend + sinusoidal curve + 30-day moving average).

---

## 2. What Was Actually Verified

The following components and artifacts were verified via direct code inspection, terminal scripts, and runtime logs:
- **Frontend SPA:** `frontend/src/` (React 18.3.1 + Vite 6.0.3 + TailwindCSS). Production bundle compiles cleanly in 4.19s without errors.
- **Backend API:** `backend/src/server.js` (Node.js 20 + Express 4.21.2) listening on port 5000.
- **Serverless API:** `frontend/api/index.js` and `frontend/vercel.json` rewriting `/api/(.*)` to Express serverless handlers.
- **Database:** Supabase PostgreSQL 15 instance at `https://lqoychozoysmxibhcmuf.supabase.co`. Connection verified via `api/ready` live query test.
- **Mandi Sync Pipeline:** GitHub Actions workflow `.github/workflows/mandi-sync.yml` scheduled at `0 6,12 * * *` executing `scripts/sync_mandi_prices.js`.
- **Zod Validation Middleware:** `backend/src/middleware/validator.js` and `backend/src/middleware/reliability.js`.
- **Environment Variables:** Checked names across `.env`, `backend/.env`, and `frontend/.env` (no secret values exposed).

---

## 3. Current Architecture in Simple Language

Imagine AgriMandi as a digital mandi bazaar:
1. **The Gate (Landing Page & Login):** A visitor opens the website. They see live mandi rates and can test an in-hand realization calculator. When they enter their mobile number, AgriMandi sends a 6-digit dynamic OTP (valid for 5 minutes).
2. **The Roles (Farmer, Buyer, Transporter, FPO, Admin):** Once logged in, the user enters their specialized desk.
   - **Farmer:** Lists crops (lots) from their farm, receives price offers from buyers, negotiates with counter-offers, and accepts deals.
   - **Buyer:** Views listed produce lots within their preferred district/radius, places price offers, and locks escrow funds upon acceptance.
   - **Transporter:** Views deals that need pickup, accepts trips, and updates delivery checkpoints (Milestones) as they drive to the mill.
   - **FPO:** Pools small lots from multiple local farmers into one large 50-ton truckload to get bulk prices from large institutional buyers.
   - **Admin:** Verifies buyer GSTIN documents and arbitrates disputes.
3. **The Problem Right Now:** When anyone enters their desk, the app asks the kitchen for *every dish on the menu at once*, even if the user only wanted to look at their profile. This creates unnecessary network traffic and slows down mobile users.

---

## 4. Current Architecture in Technical Language

```
Client Browser (React 18 SPA)
  │
  ├── Vite Proxy (/api -> http://localhost:5000 in Dev)
  └── Vercel Serverless Rewrite (/api/(.*) -> frontend/api/index.js in Prod)
        │
        ▼
Express Routing & Middleware Stack
  ├── cors({ origin: '*' })
  ├── express.json()
  ├── requestIdMiddleware (Assigns or propagates x-request-id)
  ├── structuredLogger (Logs [timestamp] [requestId] METHOD PATH STATUS DURATION)
  ├── Route Handlers:
  │     ├── /api/mandi       -> mandiRoutes.js (Agmarknet cache & advisory)
  │     ├── /api/realization -> realizationRoutes.js (Haversine freight math)
  │     ├── /api/auth        -> authRoutes.js (Dynamic OTP & user profiles)
  │     ├── /api/admin       -> adminRoutes.js (Verification & governance)
  │     ├── /api/fpo         -> fpoRoutes.js (Aggregation & payout splits)
  │     └── /api/*           -> marketRoutes.js (Lots, Offers, Deals, Logistics)
  │
  ▼
Persistence Layer
  ├── Primary: Supabase PostgreSQL 15 Cloud (via @supabase/supabase-js)
  └── In-Memory Buffer: memoryCache fallback in db.js (avoids disk I/O)
```

**Architecture Anomaly (Dual Structure):**
The repository contains both the active deployed app (`frontend/` + `backend/`) and a dormant PNPM monorepo (`apps/api`, `apps/web`, `apps/ml-service`, `packages/`). Production build configurations exclusively target `frontend/` and `backend/`.

---

## 5. Frontend Call Map

The frontend makes 72 distinct API calls defined in `frontend/src/services/api.js`. These are mapped across components:
- **`LandingPage.jsx`:**
  - `api.getTicker()` on mount (`COMPONENT_MOUNT`)
  - `api.getLiveRates(...)` on mount (fired TWICE due to dual useEffects)
  - `api.calculateRealization(...)` on mount
- **`LoginModal.jsx` / `RegisterModal.jsx`:**
  - `api.sendOtp(...)` on button click
  - `api.login(...)` on form submit
  - `api.register(...)` on form submit
- **`FarmerPortal.jsx`:**
  - `api.getFarmerProfile(...)` on mount
  - `api.getLiveRates(...)` on mount (duplicate)
  - `api.getMandiAdvisor(...)` on mount (premature)
  - `api.getLots(...)` on mount
  - `api.getOffers()` on mount (unfiltered, all system offers)
  - `api.getDeals()` on mount (unfiltered, all system deals)
  - `api.calculateRealization(...)` on mount
  - `api.compareMultiMandiRealization(...)` on mount
  - Mutations: `createLot`, `updateLot`, `publishLot`, `cancelLot`, `deleteLot`, `acceptOffer`, `rejectOffer`, `counterOffer`
- **`BuyerPortal.jsx`:**
  - `api.getLots()` on mount (unpaginated)
  - `api.getBuyers()` on mount (unnecessary competitor list)
  - `api.getOffers(...)` on mount (premature before Offers tab)
  - `api.getDeals(...)` on mount (premature before Deals tab)
  - Mutations: `createOffer`, `lockEscrowFunds`, `acceptCounterOffer`
- **`TransporterPortal.jsx`:**
  - `api.getTransporterById(...)` on mount
  - `api.getAvailableTrips(...)` on mount
  - `api.getTransporterTrips(...)` on mount
  - Mutations: `updateTransporterStatus`, `acceptTrip`, `updateTripMilestone`
- **`SuperAdminDashboard.jsx`:**
  - `Promise.all` on mount with 7 endpoints: `stats`, `buyers`, `transporters`, `farmers`, `lots`, `deals`, `supabaseStatus`
  - Mutations: `verifyBuyer`, `rejectBuyer`, `verifyFarmer`, `deleteFarmer`, `deleteBuyer`, `verifyTransporter`, `rejectTransporter`
- **`DisputeResolutionDesk.jsx`:**
  - `api.getDisputes()` on tab active
  - `api.resolveDispute(...)` on submit

---

## 6. Backend Route Map

The backend exposes routes organized into 6 route files:

| Method | Path | Auth Required | Validation | Service / DB Dependency | Status |
|---|---|---|---|---|---|
| `GET` | `/api/health` | None | None | Node.js process uptime | Verified |
| `GET` | `/api/ready` | None | None | Live query on Supabase `users` | Verified |
| `GET` | `/api/mandi/live` | None | Query params | Supabase `mandi_prices` + NodeCache | Verified |
| `GET` | `/api/mandi/advisor` | None | Query params | In-process heuristic + Supabase | Verified |
| `POST` | `/api/realization/discover` | None | Body | Haversine calculation + `buyers` | Verified |
| `POST` | `/api/realization/compare` | None | Body | Haversine calculation across APMCs | Verified |
| `POST` | `/api/auth/send-otp` | None | Phone regex | `otpStore` + `verification_cases` | Verified |
| `POST` | `/api/auth/login` | None | Phone + OTP | `users`, `farmer_profiles`, etc. | Verified |
| `POST` | `/api/auth/register` | None | Role-specific | `users` + role profile tables | Verified |
| `GET` | `/api/auth/farmer/profile/:id` | None (Public) | Path param | `farmer_profiles`, `users` | Verified (Auth missing) |
| `GET` | `/api/lots` | None | Query filters | `produce_lots` | Verified |
| `POST` | `/api/lots` | None (Client param) | Basic checks | `produce_lots`, `audit_logs` | Verified (Auth missing) |
| `PUT` | `/api/lots/:id` | None | Path param | `produce_lots` | Verified (Auth missing) |
| `POST` | `/api/lots/:id/publish` | None | Path param | `produce_lots` | Verified |
| `POST` | `/api/lots/:id/cancel` | None | Path param | `produce_lots` | Verified |
| `GET` | `/api/offers` | None | Query filters | `offers` | Verified (Leaks all if no params) |
| `POST` | `/api/offers` | None | Body | `offers`, `audit_logs` | Verified |
| `POST` | `/api/offers/:id/accept` | None | Path param | `offers`, `deals`, `produce_lots` | Verified |
| `POST` | `/api/offers/:id/counter` | None | Path param | `offers` | Verified |
| `GET` | `/api/deals` | None | Query filters | `deals` | Verified (Leaks all if no params) |
| `GET` | `/api/deals/:id/contract` | None | Path param | `deals`, `produce_lots`, `users` | Verified |
| `POST` | `/api/deals/:id/escrow/lock` | None | Body | `deals`, `audit_logs` | Verified |
| `GET` | `/api/transporters/available-trips` | None | Query params | `deals`, `produce_lots` | Verified |
| `POST` | `/api/transporters/accept-trip` | None | Body | `deals`, `transporters` | Verified |
| `PATCH` | `/api/transporters/trips/:dealId/milestone`| None | Body | `deals`, `audit_logs` | Verified |
| `POST` | `/api/admin/login` | None | Static checks | In-memory admin credentials | Verified |
| `GET` | `/api/admin/stats` | None | None | `users`, `produce_lots`, `deals` | Verified (Auth missing) |
| `GET` | `/api/admin/buyers` | None | None | `buyer_profiles`, `users` | Verified (Auth missing) |
| `POST` | `/api/admin/buyers/:id/verify` | None | Path param | `buyer_profiles` | Verified (Auth missing) |
| `POST` | `/api/admin/farmers/:id/verify`| None | Path param | `users`, `farmer_profiles` | Verified (Auth missing) |
| `DELETE`| `/api/admin/farmers/:id` | None | Path param | `users`, `farmer_profiles` | Verified (Auth missing) |
| `GET` | `/api/fpo/eligible-lots` | None | Query params | `produce_lots` | Verified |
| `POST` | `/api/fpo/pool` | None | Body | `produce_lots`, `audit_logs` | Verified |
| `GET` | `/api/disputes` | None | Query params | `disputes` | Verified |
| `POST` | `/api/disputes/:id/resolve` | None | Body | `disputes`, `deals`, `audit_logs` | Verified (Auth missing) |

---

## 7. Authentication and Role Isolation

- **Client-Side Auth Storage:** The frontend stores `agri_token` and `agri_user` in browser `localStorage`.
- **Token Format:** The backend emits `token-${user.id}-${Date.now()}`. This is **not a cryptographically signed JWT**.
- **Server-Side Enforcement Defect (P0):**
  - There is no `authMiddleware` inspecting the `Authorization` header on any protected route.
  - Endpoints accept `farmer_id`, `farmer_phone`, or `buyer_id` passed directly from the browser in the query string or JSON payload.
  - If a user modifies their local user object or sends a raw cURL request with another farmer's phone number, the backend processes the request on behalf of that other user.
- **Admin Isolation Defect (P0):**
  - `/api/admin/login` validates static credentials (`ASIACore` / `Satya123`) and returns a token.
  - However, all subsequent `/api/admin/*` endpoints do not verify this token. An unauthenticated attacker can query `/api/admin/farmers` or invoke `/api/admin/farmers/:id/verify` directly.

---

## 8. API Call-by-Call Findings

A full breakdown of all 72 API calls is saved in [API_INVENTORY_2026-09-25.csv](file:///d:/AgriMandi/brain/API_INVENTORY_2026-09-25.csv). Key findings:
- **Required Calls:** 32 calls (User login, OTP send, lot creation, offer placement, contract opening, trip acceptance).
- **Conditionally Required Calls:** 16 calls (Trips list, weighment assay, disputes desk).
- **Premature / Eager Calls:** 14 calls (Market rates, advisor forecast, calculator discovery, and admin tables fetched before respective tabs are clicked).
- **Duplicate Calls:** 2 calls (`GET /api/mandi/live` fired twice on both Landing Page and Farmer Portal mounts).
- **Unnecessary Calls:** 2 calls (`GET /api/buyers` inside `BuyerPortal`; unfiltered `GET /api/offers` inside `FarmerPortal`).
- **Dead Code:** 6 calls in `frontend/src/services/api.js` (`getReferencePrices`, `getCommodities`, `getMandiHistory`, `getSummary`, `getEscrowStatus`) are defined in code but never referenced in active UI pages.

---

## 9. Network Runtime Findings

Refer to [NETWORK_CALL_AUDIT_2026-09-25.md](file:///d:/AgriMandi/brain/NETWORK_CALL_AUDIT_2026-09-25.md) for full scenario trace.
- **Initial Landing Page:** 4 requests fired. 1 request is a duplicate.
- **Initial Farmer Portal:** 9 requests fired simultaneously. 6 are premature/eager, and 1 is a duplicate.
- **Initial SuperAdmin Dashboard:** 7 heavy database requests fired in parallel via `Promise.all`.
- **Request Cancellation:** 0 of 72 calls support `AbortController`.
- **Form Submission Guards:** Submit buttons in `FarmerPortal` and `BuyerPortal` lack submission locking, creating a risk of duplicate lot/offer creation upon rapid double-clicking.

---

## 10. Database and Supabase Connections

- **Supabase Cloud URL:** `https://lqoychozoysmxibhcmuf.supabase.co`
- **Active Tables Inspected:**
  - `users` (Core identities, phone numbers, roles)
  - `farmer_profiles` (Saat-Bara 7/12 land records, acreage, crop list)
  - `buyer_profiles` (GSTIN, company name, verification status)
  - `produce_lots` (Listed, Draft, Deal-locked agricultural lots)
  - `offers` (Bids and counter-offers)
  - `deals` (Contracts, escrow references, transport status)
  - `transporters` (Vehicles, MT capacity, base districts)
  - `fpos` (Cooperative profile, member count)
  - `disputes` (APMC arbitral claims)
  - `verification_cases` (Dynamic OTP cache and document audits)
  - `audit_logs` (System activity ledger)
  - `mandi_prices` (Agmarknet daily arrival and modal rates)
- **Direct Frontend Queries:** Checked `frontend/src/` — **0 direct `supabase.from()` calls exist in the UI**. All requests route through the Express/Vercel API layer.
- **In-Memory Fallback:** `backend/src/services/db.js` maintains an in-memory fallback buffer (`memoryCache`) if Supabase connection drops, preventing server crashes during transient cloud outages.

---

## 11. Pipeline-by-Pipeline Findings

Refer to [PIPELINE_AUDIT_2026-09-25.md](file:///d:/AgriMandi/brain/PIPELINE_AUDIT_2026-09-25.md) for full pipeline flowcharts.
- **Pipeline A (Auth/OTP):** Working with 5-minute dynamic OTP expiry and 30-second cooldown.
- **Pipeline B (Mandi Sync):** Working with GitHub Actions cron and in-process background worker.
- **Pipeline C (Farmer Lots):** Working with lot status state machine (`LISTED` -> `DEAL_LOCKED` -> `SETTLED`).
- **Pipeline D (Offer/Deal):** Working with atomic lot locking and automatic rejection of competing offers.
- **Pipeline E (Transport):** Working with Haversine distance math and milestone tracking.
- **Pipeline F (Quality/Settlement):** Partially implemented. Math exists; payment gateway uses mock references.
- **Pipeline G (FPO Aggregation):** Working with weighted average moisture and proportional member payout splits.
- **Pipeline H (Notifications):** Not implemented on backend; uses client-side ephemeral toasts.

---

## 12. Unnecessary API Calls and Excessive Load

1. **Farmer Dashboard Kitchen Sink:** 9 API calls load when a farmer simply checks their dashboard.
2. **Buyer Competitor Download:** `BuyerPortal.jsx:226` calls `api.getBuyers()`, downloading all other buyers on the platform without reason.
3. **SuperAdmin Firehose:** `SuperAdminDashboard.jsx:57-65` executes `Promise.all` across 7 entities instead of fetching data as tabs are clicked.
4. **Landing Page Double Fetch:** `LandingPage.jsx:35` and `56` call `/api/mandi/live` twice in the first 50ms.

---

## 13. Hallucination / Fake-Data Risks

1. **Advisory Machine Learning Claims:** TRD documents claim an XGBoost ML model runs on port 8000. In reality, `backend/src/services/mandiService.js` calculates price trends using a sinusoidal curve (`Math.sin(...)`) and linear velocity heuristics in pure JavaScript.
2. **Realization Benchmark Prices:** `realizationRoutes.js` uses a static benchmark dictionary (`CROP_BENCHMARKS`) if live Agmarknet prices for a specific crop are missing.
3. **Direct Buyer Offer Simulation:** In `realizationRoutes.js:131`, direct buyer offers are simulated as `benchmarkPrice - 30` rather than pulling real binding buyer contract bids.

---

## 14. Security Risks

- **P0-1: No Backend Session Authorization:** Endpoints rely on unauthenticated request parameters. Any client can access or modify records of another farmer by altering `farmer_phone`.
- **P0-2: Unauthenticated Admin Endpoints:** All `/api/admin/*` endpoints lack auth middleware, allowing arbitrary verification and deletion of users.
- **P0-3: Data Leak on Unfiltered Offers/Deals:** `GET /api/offers` and `GET /api/deals` return the complete database table if no filter is supplied.

---

## 15. Performance Risks

- **Database Connection Burst:** 20 concurrent users under the current eager pattern trigger up to 180 simultaneous queries at Supabase, risking connection timeouts.
- **Unpaginated Lists:** `/api/lots` returns all lots in the database; as the platform grows beyond 100 lots, mobile clients will experience frame drops.
- **Zero Request Abort:** Fast tab navigation creates dangling requests that waste bandwidth on 3G connections.

---

## 16. Missing or Unverified Features

- **XGBoost & Isolation Forest Engine:** Not connected to backend REST API.
- **Live Payment Gateway:** Razorpay / Cashfree escrow integration is not connected; mock references used.
- **External Weather API:** Not connected; weather data is unreferenced.
- **Mapbox / Google Maps API:** Distances are computed mathematically via the Haversine formula; no interactive map SDK is loaded.
- **Push / SMS Notifications:** No external SMS (CDAC/Twilio) gateway is connected; OTPs are printed to logs and previewed in response JSON.

---

## 17. What Is Working

- Dynamic OTP generation, delivery preview, 5-minute expiry, and single-use consumption.
- Farmer Produce Lot creation, editing, publishing, canceling, and deletion.
- Buyer digital offers, counter-offers, and atomic acceptance.
- Automatic transition of lot status to `DEAL_LOCKED` upon contract formation.
- Agmarknet daily price synchronization from `data.gov.in` into Supabase `mandi_prices`.
- Haversine freight calculation and net realization comparison engine.
- SuperAdmin verification of buyers and transporters.
- FPO lot pooling with weighted moisture math.
- Consistent Request ID correlation (`x-request-id`) and structured request logging.

---

## 18. What Is Partially Working

- **SuperAdmin Dashboard:** Functions correctly, but over-fetches 7 endpoints on mount.
- **Transporter Logistics:** Milestone engine functions, but trips are not filtered by geographic radius.
- **Assay & Settlement:** Math works, but escrow relies on simulated transactions.
- **Image Uploads:** Handled in local memory/state; direct Supabase Storage bucket uploads not fully wired.

---

## 19. What Is Not Working

- Server-side bearer token authentication on inner routes.
- On-demand data fetching (system is currently eager-loaded).
- Request cancellation via `AbortController`.
- Server-side pagination on produce lots and offers.
- Backend push notification delivery.

---

## 20. Priority Fixes

- **P0 (Immediate Security):**
  1. Add JWT/bearer token verification middleware to all `/api/*` routes.
  2. Protect `/api/admin/*` routes with strict SuperAdmin session validation.
  3. Enforce session ownership on `/api/offers` and `/api/deals` to eliminate data leakage.
- **P1 (Team Rule - On-Demand Enforcement):**
  1. Remove duplicate `/api/mandi/live` call on Landing Page.
  2. Strip eager fetches from `FarmerPortal` mount (load only profile + own lots).
  3. Remove competitor fetch (`/api/buyers`) from `BuyerPortal`.
  4. Convert `SuperAdminDashboard` to tab-level lazy loading.
- **P2 (Performance & Resilience):**
  1. Integrate `AbortController` in `frontend/src/services/api.js`.
  2. Add server-side pagination (`limit=20`) to `/api/lots`.
  3. Add `isSubmitting` disabled state to all action buttons.

---

## 21. Recommended Target Architecture

```
User Action / Tab Click
  ↓
On-Demand Feature Hook (with AbortSignal)
  ↓
Axios API Client (Authorization: Bearer <token>)
  ↓
Express / Vercel Serverless Gateway
  ├── Request ID & Structured Logger
  ├── Bearer Auth Verification (Decodes session & attaches req.user)
  ├── Role & Capability Check (Rejects unauthorized access)
  ├── Zod Schema Validation
  └── Controller / Service
        ↓
  Supabase PostgreSQL 15 (Scoped with user_id)
        ↓
  Canonical Response: { success: true, data: {}, meta: { requestId } }
```

---

## 22. No-Code-Change Action Plan

1. Review and approve this Evidence Pack (`RUNTIME_AUDIT_2026-09-25.md`, `API_INVENTORY_2026-09-25.csv`, `NETWORK_CALL_AUDIT_2026-09-25.md`, `PIPELINE_AUDIT_2026-09-25.md`, `PERFORMANCE_ACTION_PLAN_2026-09-25.md`).
2. Verify that findings accurately represent runtime behavior before committing changes.
3. Keep production deployment on Vercel stable while review is in progress.

---

## 23. Code-Change Plan After Approval

Upon receiving explicit user approval:
1. **Phase 1 (Security - P0):** Implement `backend/src/middleware/auth.js` and wrap `/api/admin/*`, `/api/offers`, `/api/deals`, and `/api/lots`.
2. **Phase 2 (On-Demand Loading - P1):** Refactor `FarmerPortal.jsx`, `LandingPage.jsx`, `BuyerPortal.jsx`, and `SuperAdminDashboard.jsx` to load data strictly upon tab clicks.
3. **Phase 3 (Optimization - P2):** Add `AbortController` and server-side pagination to `marketRoutes.js`.
4. **Phase 4 (Validation):** Re-test all 24 runtime network scenarios and verify that requests per login drop from 9 to 2.

---

## 24. Commands and Evidence

- **Lint & Production Build Test:**
  ```bash
  cd d:\AgriMandi\frontend && npm run build
  # Result: Built in 4.19s, 0 errors, output in dist/
  ```
- **Readiness & DB Check:**
  ```bash
  GET http://localhost:5000/api/ready
  # Result: {"status":"ready","checks":{"database":{"status":"UP","provider":"Supabase PostgreSQL 15 Cloud"}}}
  ```
- **Mandi Sync Ingestion Script:**
  ```bash
  node scripts/sync_mandi_prices.js
  # Result: Ingests 6 target districts into Supabase table mandi_prices
  ```

---

## 25. Known Limitations

1. **Local / Preview Testing:** The audit was conducted in the verified local development environment against the live cloud Supabase database.
2. **SMS Gateway:** Live telecom SMS delivery requires commercial DLT registration in India; OTPs are currently logged and previewed in response payloads for pilot testing.
3. **Python ML Engine:** The ML service codebase exists in `apps/ml-service` but is completely uncoupled from the active Node.js REST API.

