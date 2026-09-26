# AgriMandi (कृषीसेतू) — SIH-Winning Execution Task List

> **Source Document:** Runtime Audit Review & SIH-Winning Roadmap (`Review of RUNTIME_AUDIT_2026-09-25.md`)  
> **Target Standard:** Hackathon-Winning Enterprise B2B Marketplace with Zero Mocking, 100% Truthful Claims, Robust Security, and Ultra-Clean Network Footprint.

---

## 🛡️ Priority 0: Security, Authentication & Truthfulness (P0 — Critical) [COMPLETED]
*Goal: Fix security vulnerabilities and eliminate unverified claims before touching UI visuals.*

- [x] **Task 0.1: Server-Side Authentication & Session Verification Middleware**
  - Implemented `signToken`, `verifyToken`, `requireAuth`, `optionalAuth`, `requireRole` in `backend/src/middleware/auth.js` and `frontend/api/middleware/auth.js`.
  - Generates RFC 7519 compliant HMAC-SHA256 JWTs with 7-day expiry and backward-compatible legacy token support.
  - Added Axios Bearer token request interceptor in `frontend/src/services/api.js`.
  - Added protected `/api/auth/me` endpoint.

- [x] **Task 0.2: Object-Level Authorization & Query Scoping (IDOR Prevention)**
  - Private lot mutations (`POST /lots`, `PUT /lots/:id`, `POST /lots/:id/publish`, `POST /lots/:id/cancel`, `DELETE /lots/:id`) enforce authenticated identity and block unauthorized cross-account mutations.
  - Offers creation (`POST /offers`) binds buyer identity to authenticated user token.
  - Acceptance and counter-offers (`/offers/:id/accept`, `/offers/:id/counter`) strictly verify lot ownership.
  - Buyer counter-acceptance (`/offers/:id/accept-counter`) strictly verifies offer ownership.

- [x] **Task 0.3: Secure SuperAdmin Authentication & Secret Rotation**
  - Updated `adminRoutes.js` to read credentials from environment variables (`ADMIN_USERNAME`, `ADMIN_PASSWORD`) with secure fallbacks.
  - Login issues cryptographic JWT with `SUPERADMIN` role claim.
  - Enforced `router.use(requireAuth, requireRole('SUPERADMIN'))` across all admin routes. Blocks non-admin tokens with 403 Forbidden and unauthenticated requests with 401 Unauthorized.

- [x] **Task 0.4: Production CORS Allowlist Restriction**
  - Replaced wildcard `cors({ origin: '*' })` in `backend/src/server.js` and `frontend/api/index.js` with strict allowlist (`agrimandi.asiacore.in`, `localhost:5173`, `localhost:5000`, `127.0.0.1:5173`, `teamasiacore.vercel.app`).

- [x] **Task 0.5: In-Memory Fallback Guardrail & Truthful Labeling**
  - Truthful storage type reporting in `db.getSupabaseStatus()`: dynamically displays whether Supabase Cloud PostgreSQL is live or offline.
  - Ensured dual parity between `backend/src/` and `frontend/api/` (Vercel Serverless).

- [ ] **Task 0.6: Truthful UI Labeling & Copy Sanitization**
  - Remove unsupported terms in UI: *"RBI UTR"*, *"100% Escrow Bank Guaranteed"*, *"Govt Verified Price"*.
  - Use legally honest, authoritative commercial terms: *"Milestone Payment Tracking via Authorised Banking Partners"*, *"Source: data.gov.in Agmarknet Daily Feed"*.

- [x] **Task 0.7: Production OTP & Log Protection**
  - Dynamic 6-digit cryptographic OTP generation with 5-minute expiry and 30-second cooldown.
  - Verification cases recorded in Supabase for serverless cross-instance resilience with single-use consumption.

---

## ⚡ Priority 1: Efficient On-Demand Runtime & Clean DevTools Trace (P1)
*Goal: Reduce initial dashboard calls from 9 to 2–3. Open DevTools in front of judges to show zero wasted calls.*

- [ ] **Task 1.1: Farmer Dashboard On-Demand Loading**
  - **Initial Mount (Tab 1):** Fetch ONLY current farmer profile (`/api/me/profile`) and own listed lots summary (`/api/me/lots?page=1&limit=5`).
  - **Tab 2 (Mandi Price Comparison & Advisory):** Fetch live Agmarknet benchmark ONLY when farmer clicks on the Mandi tab.
  - **Tab 3 (My Listed Lots & Bids):** Fetch offers ONLY when farmer clicks on this tab.
  - **Tab 4 (Profile & 7/12):** Fetch 7/12 land records only when this tab is selected.
  - Eliminate uncalled background loads for all buyers, all transporters, and historical charts on startup.

- [ ] **Task 1.2: Buyer Dashboard On-Demand Loading**
  - **Initial Mount:** Fetch ONLY buyer profile and verification status.
  - **Marketplace Tab:** Fetch farm-gate produce lots ONLY when Marketplace tab is active.
  - **Placed Bids & Deals Tab:** Fetch buyer bids and deal contracts ONLY when this tab is opened.
  - Remove competitor buyer list and redundant market price calls.

- [ ] **Task 1.3: SuperAdmin Dashboard Tab-Level Splitting**
  - Break up `Promise.all([getFarmers, getBuyers, getLots, getTransporters, getDeals, getDisputes])`.
  - Load only stats overview on initial dashboard view.
  - Load Buyer Approvals on Buyer tab click, Transporter Fleet on Transporter tab click, Farmer 7/12 on Farmer tab click.

- [ ] **Task 1.4: Network Resilience & Query Lifecycle**
  - Implement `AbortController` in `frontend/src/services/api.js` to cancel in-flight requests when switching tabs or navigating away.
  - Add submission locks (disabled button state + spinner) on all forms to prevent duplicate double-click submissions.
  - Add debouncing (300ms) on search and filter inputs.
  - Add pagination (`page`, `limit`) to all list endpoints (`/lots`, `/offers`, `/deals`, `/transporters`).

- [ ] **Task 1.5: Relative Evidence Links & Redacted HAR Pack**
  - Update `RUNTIME_AUDIT_2026-09-25.md` to replace all Windows `file:///d:/...` paths with clean relative Markdown links (`[API Inventory](./API_INVENTORY_2026-09-25.csv)`).
  - Generate reproducible network trace summary table in the audit document.

---

## 🔄 Priority 2: Complete the Real Trade State Machine (P2)
*Goal: Turn the platform into an authentic commercial lifecycle with clear accountability at every milestone.*

- [ ] **Task 2.1: Granular Order & Lot State Machine**
  - Expand produce lot & deal statuses beyond `LISTED -> DEAL_LOCKED`:
    ```
    DRAFT ➔ LISTED ➔ OFFER_RECEIVED ➔ OFFER_ACCEPTED ➔ 
    TRANSPORT_ASSIGNED ➔ PICKED_UP ➔ IN_TRANSIT ➔ 
    DELIVERED ➔ INSPECTION_PASSED ➔ SETTLED (or DISPUTED)
    ```
  - Prevent race conditions: Atomic locking in PostgreSQL using `UPDATE produce_lots SET status = 'DEAL_LOCKED' WHERE id = $1 AND status = 'LISTED'`.

- [ ] **Task 2.2: Transporter Request & Assignment Flow**
  - When deal is locked, generate logistics trip request.
  - Transporter portal displays trip assignment with pickup village, mill destination, freight tariff, and cargo tonnage.
  - Transporter records pickup milestone (e.g. gross weighment snapshot) and delivery milestone.

- [ ] **Task 2.3: Quality Inspection & Partial Acceptance**
  - Buyer records gate weighment and moisture check upon delivery.
  - Support full acceptance or partial deduction flow with photographic evidence before final contract settlement.

- [ ] **Task 2.4: Real In-App Notification System**
  - Create Supabase table `notifications` (`id`, `recipient_user_id`, `type`, `title`, `message`, `entity_id`, `read_at`, `created_at`).
  - Trigger in-app notifications on: Offer Received, Counter-Offer Proposed, Deal Locked, Vehicle Dispatched, and Verification Approved.
  - Render persistent notification bell icon with unread count in header.

---

## 🏆 Priority 3: SIH Differentiation & Judge Demo Sequence (P3)
*Goal: Wow the judges with transparent engineering, live source labels, and an interactive "System Evidence" panel.*

- [ ] **Task 3.1: Live "System Evidence" & Audit HUD Panel**
  - Add subtle toggle in footer/header for SIH Demo: **"System Evidence & Telemetry"**.
  - Displays: Current Role, Active API Calls Count, Database Engine (`Supabase PostgreSQL ap-south-1`), Benchmark Source (`data.gov.in Agmarknet`), and Audit Event ID.
  - Proves to judges that the system is 100% authentic with zero mock formulas.

- [ ] **Task 3.2: Indicative Logistics Route Map**
  - Display visual route card showing Farmer Taluka ➔ Mill Gate with Haversine distance, estimated transit time, and freight math breakdown.
  - Clearly label: *"Indicative direct route; road distance calculated at dispatch"*.

- [ ] **Task 3.3: Scripted Judge Demo Sequence Execution**
  - Rehearse the 8-step flawless judge demo:
    1. Farmer login (DevTools shows clean 2 calls).
    2. Real-time net realization comparison (APMC vs Direct Mill).
    3. Lot creation with benchmark price.
    4. Buyer discovery & counter-bidding.
    5. Deal locking with Section 32A Mandi Cess Exemption e-waybill.
    6. Transporter dispatch milestone.
    7. SuperAdmin audit trail inspection.
