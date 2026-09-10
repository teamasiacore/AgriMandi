# AgriMandi (कृषीसेतू) — Technical Requirements Document (TRD)

> **Document Version:** 2.0 (Engineering Architecture)  
> **Status:** Active Technical Blueprint  
> **Repository Root:** `d:\AgriMandi`  
> **System Classification:** Distributed Progressive Web Application (PWA) with Real-Time Government Data Ingestion, PostgreSQL Persistence, and Python ML Microservice.

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             AGRIMANDI HIGH-LEVEL ARCHITECTURE               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   [CLIENT TIER]                                                             │
│   React 18 + Vite + Tailwind CSS + Lucide Icons + i18next (PWA)             │
│   ├── Landing Page (Multilingual: mr, hi, en)                               │
│   ├── Farmer Portal (Mandi Explorer, Net Realization, Lot Creator)          │
│   ├── Buyer Portal (Lot Discovery, Bid Engine, Gate Invoicing)              │
│   └── Admin Desk (GST Verification, APMC Compliance, Escrow)                │
│                                                                             │
│                                      │ (Axios HTTPS REST API)                │
│                                      ▼                                       │
│   [APPLICATION TIER]                                                        │
│   Node.js (v24+) + Express.js REST API Server (:5000)                       │
│   ├── In-Memory Node-Cache (TTL: 15 mins for external APIs)                │
│   ├── Haversine Distance & Freight Calculation Engine                       │
│   ├── Authentication Middleware (JWT + Role Claims)                         │
│   └── Prisma ORM / Supabase Client                                          │
│                                                                             │
│            │                              │                                 │
│            │ (Ingests Daily Feed)         │ (Queries History & Stores Rows) │
│            ▼                              ▼                                 │
│   [EXTERNAL DATA SOURCE]          [PERSISTENCE TIER]                        │
│   data.gov.in Official API        Supabase (PostgreSQL 15 Cloud)            │
│   Resource: 9ef84268-...          ├── Table: mandi_prices (210+ rows)       │
│   Maharashtra APMC Daily Feed     ├── Table: users & profiles               │
│   (Latur, Nashik, Jalgaon, etc.)  └── Table: lots, deals, escrow            │
│                                                   ▲                         │
│                                                   │ (Reads 30d History)     │
│   [MACHINE LEARNING ENGINE]                       │                         │
│   Python 3.13 + FastAPI (:8000) ──────────────────┘                         │
│   ├── XGBoost Regressor (7-Day Price Band Forecast)                         │
│   ├── Feature Engineering (Lags, SMA30, Momentum %, Arrival Shock)          │
│   ├── Isolation Forest (Ingestion Anomaly & Typo Detection)                 │
│   └── Carrying Cost Rule Engine (Sell vs Hold Advisory)                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack & Component Rationale

| Layer | Technology | Version | Key Responsibility in AgriMandi | Technical Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | 18.3.1 | Single-Page Application (SPA) UI | Virtual DOM enables instantaneous price card updates without full page reloads. |
| **Build Tool** | Vite | 8.2.2 | Fast Bundler & Dev Server | Sub-second Hot Module Replacement (HMR); generates compact static bundles for rural 3G mobile browsers. |
| **Styling** | Tailwind CSS | 3.4.17 | Utility-First Responsive Styling | Zero runtime CSS overhead; high-contrast warm natural palette (`#FAF7F2`, `#1B4332`) designed for outdoor sunlight legibility. |
| **Icons** | Lucide React | 1.16.0 | Semantic Agricultural Icons | Tree-shakeable lightweight SVG icons; loads only icons rendered on page. |
| **Localization** | i18next + react-i18next | 24.2.2 | Trilingual Dynamic Translation | Clean JSON dictionary mapping (`mr.json`, `hi.json`, `en.json`) separating UI copy from JSX logic. |
| **Backend Framework**| Node.js / Express | 4.21.2 | REST API & State Machine | Asynchronous non-blocking I/O ideal for real-time market queries and deal order states. |
| **Cache Layer** | node-cache | 5.1.2 | In-Memory Government API Cache | Sub-5ms response for repetitive mandi queries; prevents rate-limiting on `data.gov.in`. |
| **Cloud Database** | Supabase (PostgreSQL) | 15.x | Relational ACID Data Store | Row-level consistency for monetary deals; relational integrity for farmer-lot-buyer state machines. |
| **ORM Client** | Prisma ORM | 7.x / @supabase-js | Type-Safe Database Client | Schema-driven migrations; compile-time query safety preventing SQL injections. |
| **ML Runtime** | Python / FastAPI | 3.13 / 0.110+ | Machine Learning Microservice | Asynchronous Python framework; sub-10ms inference latency for serialized `.joblib` models. |
| **ML Algorithms** | XGBoost & Scikit-learn | 2.0+ / 1.4+ | Tabular Price Forecasting | Handles non-linear market seasonality and arrival shocks significantly better than LSTM on small tabular data. |

---

## 3. Data Ingestion Architecture & Government API Pipeline

### 3.1 Official Government Feed Configuration
- **Portal:** [data.gov.in](https://data.gov.in) (National Data Sharing and Accessibility Portal - NDSAP)
- **Resource ID:** `9ef84268-d588-465a-a308-a864a43d0070`
- **Active Production API Key:** `579b464db66ec23bdd000001d4d3eb54d4134d624b3aecd686e285a1`
- **Request Format:**
  ```http
  GET https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd000001d4d3eb54d4134d624b3aecd686e285a1&format=json&limit=50&filters[state]=Maharashtra&filters[commodity]=Soyabean
  ```

### 3.2 Ingestion & Caching Lifecycle
1. **Client Request:** Client calls `GET /api/mandi/live?commodity=Soyabean`.
2. **Cache Check:** Backend checks in-memory `node-cache` key `mandi_Soyabean_all_50`.
   - If present and valid ($<15$ minutes old), returns cached JSON in $<5\text{ ms}$.
3. **Government Fetch:** If cache miss, calls `data.gov.in` API with 12-second timeout.
4. **Data Normalization:** Converts raw government fields (`arrival_date`, `min_price`, `max_price`, `modal_price`) to typed numerical formats.
5. **Supabase Auto-Upsert:** Asynchronously invokes `supabase.from('mandi_prices').upsert(records, { onConflict: 'market,commodity,arrival_date' })`.
6. **Fallback Protection:** In case of government server downtime or DNS failure, seamlessly serves the verified Agmarknet Maharashtra archive without returning 500 errors to the user.

---

## 4. Mathematical Logic & Algorithmic Specifications

### 4.1 Algorithm 1: Farm-Gate Net Realization Engine
Replaces deceptive sticker mandi prices with actual in-hand farmer earnings after accounting for dynamic freight and handling.

$$\text{Net Realization (₹/qtl)} = P_{\text{market}} - C_{\text{freight/qtl}} - C_{\text{mandi\_cess/qtl}} - (C_{\text{storage/qtl/day}} \times D_{\text{days}})$$

Where:
* $P_{\text{market}}$ = Current modal price reported by APMC or offered by buyer (₹/quintal).
* $C_{\text{mandi\_cess/qtl}}$ = Mandatory APMC market cess + loading fee ($\approx ₹45/\text{qtl}$; ₹0 for direct farm-gate buyer).
* $C_{\text{storage/qtl/day}}$ = Local warehouse rent (default ₹0.50/qtl/day or ₹15/qtl/month).

#### Dynamic Freight Calculation:
$$\text{Base Freight (₹/qtl)} = \frac{\text{Base Booking Fee (₹500)}}{Q_{\text{quintals}}} + (D_{\text{km}} \times \text{Tariff Rate})$$

* **FTL Highway Rate:** $₹3.80 / \text{qtl-km}$
* **Standard Rural Mixed Terrain:** $₹4.20 / \text{qtl-km}$
* **Small Bolero / Kachha Road:** $₹5.20 / \text{qtl-km}$

---

### 4.2 Algorithm 2: Haversine Great-Circle Distance
Calculates the shortest distance between farmer GPS coordinates $(\phi_1, \lambda_1)$ and buyer/mandi coordinates $(\phi_2, \lambda_2)$:

$$a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1) \cdot \cos(\phi_2) \cdot \sin^2\left(\frac{\Delta \lambda}{2}\right)$$
$$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1-a}\right)$$
$$D_{\text{km}} = 6371 \times c$$

---

### 4.3 Algorithm 3: XGBoost Price Momentum & Feature Engineering
Transforms historical date-price records stored in Supabase into predictive signals:

1. **Lagged Features:** $P_{t-1}, P_{t-3}, P_{t-7}, P_{t-14}, P_{t-30}$
2. **30-Day Simple Moving Average (SMA):**
   $$\text{SMA}_{30} = \frac{1}{30} \sum_{i=0}^{29} P_{t-i}$$
3. **7-Day Price Momentum (%):**
   $$\text{Momentum}_{7} = \left( \frac{P_t - P_{t-7}}{P_{t-7}} \right) \times 100$$
4. **Carrying Cost Decision Rule:**
   $$\text{Expected Net Gain} = (\hat{P}_{t+7} - P_t) \times Q - (C_{\text{storage}} \times 7 \times Q)$$
   * If $\text{Expected Net Gain} > 0$ and $\text{Momentum}_7 > +1.5\% \rightarrow$ **HOLD (रुकें / थांबा)**.
   * If $\text{Expected Net Gain} \le 0$ or $\text{Momentum}_7 < -1.0\% \rightarrow$ **SELL (तातडीने विक्री करा)**.

---

### 4.4 Algorithm 4: Isolation Forest Ingestion Anomaly Detection
Detects and quarantines government data-entry typos (e.g., ₹5,000 entered as ₹50,000 or ₹500):
* **Principle:** Anomalous price spikes require significantly fewer random partition cuts in a decision tree.
* **Decision Rule:** Anomaly score $s(x, n) > 0.65 \rightarrow$ Marked as `ANOMALY_SUSPECT` and excluded from rolling averages until verified.

---

## 5. API Endpoints & Contract Specifications

### 5.1 Mandi Rates & Discovery API
- **`GET /api/mandi/live`**
  - **Query Params:** `commodity` (string), `district` (string, optional), `limit` (number).
  - **Response:** `{ status: 'success', source: string, totalRecords: number, records: Array<MandiRecord> }`.
- **`GET /api/mandi/history`**
  - **Query Params:** `commodity` (string), `market` (string, optional).
  - **Response:** `{ status: 'success', todayPrice: number, yesterdayPrice: number, deltaAmount: number, deltaPercentage: number, sma30: number, momentum7: number, history: Array<DailyRecord> }`.
- **`POST /api/realization/discover`**
  - **Body:** `{ crop: string, quantityQtl: number, qualityGrade: string, location: string }`.
  - **Response:** `{ status: 'success', result: { bestMarket: object, calculationBreakdown: object, matchingBuyers: Array<Buyer> } }`.

### 5.2 Buyers & Ticker API
- **`GET /api/buyers`**
  - **Query Params:** `filter` ('all' | 'farmer' | 'buyer'), `crop` (string, optional).
  - **Response:** `{ status: 'success', total: number, buyers: Array<VerifiedBuyer> }`.
- **`GET /api/mandi/ticker`**
  - **Response:** `{ status: 'success', trades: Array<{ text: string, textHi: string, textEn: string, time: string, price: number }> }`.
