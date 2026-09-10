# AgriMandi (कृषीसेतू) — Master Architecture & Code Atlas

> **SIH 2026 Problem Statement ID:** 26132  
> **Repository:** AgriMandi  
> **Document Purpose:** The definitive "Brain" of the codebase. Maps every single folder, file, user action, component pipeline, and design rationale so that any file can be located and explained to SIH judges in under 10 seconds.

---

## 1. The Core Rule: Zero-Khichdi Modular Architecture

1. **No Giant Files:** No single file will exceed 200–300 lines of clean, readable code.
2. **Dedicated Component for Every Click:** Every distinct page, action, modal, and flow lives in its own dedicated file.
3. **Traceability:** Every frontend action links directly to a named backend controller and database query via a documented pipeline.

---

## 2. Complete Folder & File Directory Blueprint

```
d:\AgriMandi\
│
├── brain/                                 ◄── [PROJECT KNOWLEDGE BASE & ATLAS]
│   ├── PROJECT_ARCHITECTURE_ATLAS.md      ◄── This master reference guide
│   ├── TECH_STACK_RATIONALE.md            ◄── Why each technology was chosen & judge Q&A
│   ├── PIPELINE_NAVIGATION_MAP.md         ◄── Click-by-click file & route connection guide
│   └── ALGORITHMS_REFERENCE.md            ◄── Math & code logic (Net Realization, XGBoost, etc.)
│
├── docs/                                  ◄── [SIH PRESENTATION & FLOW MANUALS]
│   ├── AGRIMANDI_COMPLETE_FLOW.md         ◄── Complete user flow & 1st trade story
│   └── SIH_PRESENTATION_SCRIPT.md         ◄── 5-minute judge pitch script
│
├── frontend/                              ◄── [REACT + VITE + TAILWIND PWA]
│   ├── public/                            ◄── Static assets, PWA manifest, logos
│   ├── src/
│   │   ├── main.jsx                       ◄── React entry point & root renderer
│   │   ├── App.jsx                        ◄── Top-level wrapper & theme provider
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx              ◄── The Central Pipeline (links all clicks to files)
│   │   │
│   │   ├── shared/                        ◄── Reusable global UI components
│   │   │   ├── components/
│   │   │   │   ├── Navbar.jsx             ◄── Top navigation bar with language toggle
│   │   │   │   ├── Footer.jsx             ◄── Standard government-style footer
│   │   │   │   ├── TrustBadge.jsx         ◄── Rating & verification status badge
│   │   │   │   ├── PriceCard.jsx          ◄── Mandi price card with range & trend
│   │   │   │   └── StatusTimeline.jsx     ◄── 6-step trade milestone tracker
│   │   │   ├── hooks/                     ◄── Custom hooks (useAuth, useMandiPrices)
│   │   │   ├── context/                   ◄── Global state (AuthContext, LanguageContext)
│   │   │   └── services/                  ◄── Axios/Fetch API client wrappers
│   │   │
│   │   ├── modules/                       ◄── [FEATURE-BASED INDEPENDENT MODULES]
│   │   │   │
│   │   │   ├── landing/                   ◄── 🌐 LANDING PAGE MODULE
│   │   │   │   ├── LandingPage.jsx        ◄── Hero section & value proposition
│   │   │   │   ├── LivePriceTicker.jsx    ◄── Real-time scrolling mandi ticker
│   │   │   │   ├── FeatureShowcase.jsx    ◄── e-NAM comparison & feature highlights
│   │   │   │   └── HowItWorksSection.jsx  ◄── 4-step interactive trade graphic
│   │   │   │
│   │   │   ├── auth/                      ◄── 🔐 AUTHENTICATION MODULE
│   │   │   │   ├── LoginPage.jsx          ◄── Unified mobile OTP / Password login
│   │   │   │   ├── FarmerRegisterPage.jsx ◄── 60-second fast farmer signup
│   │   │   │   ├── BuyerRegisterPage.jsx  ◄── GSTIN/PAN business onboarding
│   │   │   │   ├── TransporterRegisterPage.jsx ◄── Vehicle & license registration
│   │   │   │   └── ForgotPasswordPage.jsx ◄── OTP reset modal
│   │   │   │
│   │   │   ├── farmer/                    ◄── 👨‍🌾 FARMER PORTAL MODULE
│   │   │   │   ├── FarmerDashboardPage.jsx◄── Summary: Today's prices, active lots, alerts
│   │   │   │   ├── MandiPriceExplorerPage.jsx ◄── District-wise mandi price search & history
│   │   │   │   ├── NetRealizationComparePage.jsx ◄── Gross vs Net In-Hand calculator
│   │   │   │   ├── AiSellAdvisorPage.jsx  ◄── XGBoost Sell / Hold / Monitor guidance card
│   │   │   │   ├── CreateLotPage.jsx      ◄── Produce listing form with quality specs
│   │   │   │   ├── MyLotsPage.jsx         ◄── Active & sold produce lots table
│   │   │   │   ├── LotDetailsPage.jsx     ◄── Single lot status & received offers
│   │   │   │   ├── DealProgressPage.jsx   ◄── Live tracking of accepted deals
│   │   │   │   ├── SelectTransporterModal.jsx ◄── Hyperlocal vehicle selector for farmer
│   │   │   │   └── FarmerFeedbackModal.jsx◄── Post-deal review & rating for buyer
│   │   │   │
│   │   │   ├── buyer/                     ◄── 🏭 BUYER PORTAL MODULE
│   │   │   │   ├── BuyerDashboardPage.jsx ◄── Sourcing overview, active bids, inventory
│   │   │   │   ├── BrowseLotsPage.jsx     ◄── Filterable directory of verified farm lots
│   │   │   │   ├── PostRequirementPage.jsx◄── Bulk procurement requirement creator
│   │   │   │   ├── MakeOfferModal.jsx     ◄── Submit digital offer on a lot
│   │   │   │   ├── BuyerDealsPage.jsx     ◄── Active contracts, transit status, delivery
│   │   │   │   ├── GateQualityCheckModal.jsx ◄── Inward moisture/foreign matter verification
│   │   │   │   └── BuyerFeedbackModal.jsx ◄── Post-deal review & rating for farmer
│   │   │   │
│   │   │   ├── fpo/                       ◄── 🤝 FPO AGGREGATOR MODULE
│   │   │   │   ├── FpoDashboardPage.jsx   ◄── Member farmers list & aggregated stock
│   │   │   │   ├── AggregateLotsPage.jsx  ◄── Pool 5 small farmer lots into 1 bulk lot
│   │   │   │   └── PayoutLedgerPage.jsx   ◄── Member-wise pro-rata payment distribution
│   │   │   │
│   │   │   ├── transporter/               ◄── 🚚 SERVICE PROVIDER PORTAL
│   │   │   │   ├── TransporterDashboardPage.jsx ◄── Vehicle status & nearby pickup jobs
│   │   │   │   └── ActivePickupJobPage.jsx◄── Farm-gate pickup confirmation & transit OTP
│   │   │   │
│   │   │   └── admin/                     ◄── 🛡️ SUPER ADMIN MODULE
│   │   │       ├── AdminDashboardPage.jsx ◄── System health, trade volume, active users
│   │   │       ├── BuyerVerificationDeskPage.jsx ◄── GSTIN/PAN review & approval queue
│   │   │       ├── AnomalyMonitoringPage.jsx ◄── Isolation Forest price typo flags
│   │   │       └── DisputeResolutionPage.jsx ◄── Adjudicate weight & moisture complaints
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                               ◄── [NODE.JS + EXPRESS + PRISMA]
│   ├── src/
│   │   ├── server.js                      ◄── HTTP server initialization & port binding
│   │   ├── app.js                         ◄── Express middlewares & main router mount
│   │   │
│   │   ├── routes/                        ◄── Endpoint definitions mapped to controllers
│   │   │   ├── auth.routes.js             ◄── /api/v1/auth/*
│   │   │   ├── mandi.routes.js            ◄── /api/v1/mandi/*
│   │   │   ├── realization.routes.js      ◄── /api/v1/realization/*
│   │   │   ├── lots.routes.js             ◄── /api/v1/lots/*
│   │   │   ├── offers.routes.js           ◄── /api/v1/offers/*
│   │   │   ├── deals.routes.js            ◄── /api/v1/deals/*
│   │   │   ├── logistics.routes.js        ◄── /api/v1/logistics/*
│   │   │   ├── reviews.routes.js          ◄── /api/v1/reviews/*
│   │   │   └── admin.routes.js            ◄── /api/v1/admin/*
│   │   │
│   │   ├── controllers/                   ◄── Request parsing & HTTP response handlers
│   │   │   ├── auth.controller.js
│   │   │   ├── mandi.controller.js
│   │   │   ├── realization.controller.js
│   │   │   ├── lots.controller.js
│   │   │   ├── offers.controller.js
│   │   │   ├── deals.controller.js
│   │   │   ├── logistics.controller.js
│   │   │   ├── reviews.controller.js
│   │   │   └── admin.controller.js
│   │   │
│   │   ├── services/                      ◄── Core business logic & algorithms
│   │   │   ├── realization.service.js     ◄── Net Realization formula & distance math
│   │   │   ├── matching.service.js        ◄── Cosine similarity lot-buyer matching
│   │   │   ├── aggregation.service.js     ◄── FPO parent-child lot pooling logic
│   │   │   ├── priceCache.service.js      ◄── In-memory / Redis mandi caching
│   │   │   └── notification.service.js    ◄── SMS / Alert dispatcher
│   │   │
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js         ◄── JWT verification & role guards
│   │   │   ├── validate.middleware.js     ◄── Zod schema validator middleware
│   │   │   └── error.middleware.js        ◄── Global error handler & Sentry logger
│   │   │
│   │   ├── validations/                   ◄── Zod input validation schemas
│   │   │   ├── auth.schema.js
│   │   │   ├── lot.schema.js
│   │   │   ├── offer.schema.js
│   │   │   └── review.schema.js
│   │   │
│   │   └── prisma/
│   │       ├── schema.prisma              ◄── Single source of truth database model
│   │       ├── migrations/                ◄── Versioned SQL database migrations
│   │       └── seed.js                    ◄── Seeds Maharashtra mandis & demo users
│   │
│   ├── package.json
│   └── .env.example
│
└── ml_engine/                             ◄── [PYTHON + FASTAPI + XGBOOST]
    ├── app.py                             ◄── FastAPI REST microservice entry
    ├── requirements.txt                   ◄── pandas, numpy, scikit-learn, xgboost, fastapi
    ├── data/
    │   ├── raw/                           ◄── Historical Maharashtra APMC CSVs (CEDA/Agmarknet)
    │   └── processed/                     ◄── Cleaned & featurized training matrices
    ├── scripts/
    │   ├── ingest_gov_data.py             ◄── Fetches data.gov.in daily mandi feed
    │   ├── feature_engineering.py         ◄── Lags, 30-day SMA, momentum, arrival shock
    │   ├── train_models.py                ◄── Trains Baseline, Random Forest, and XGBoost
    │   └── evaluate_models.py             ◄── Computes RMSE, MAE, R², Confusion Matrix
    ├── models/
    │   ├── xgboost_price_model.joblib     ◄── Serialized 2.5MB price band forecaster
    │   └── isolation_forest.joblib        ◄── Serialized 0.8MB anomaly detector
    └── api/
        ├── predict.py                     ◄── 7-day price band prediction endpoint
        ├── advisor.py                     ◄── Sell / Hold / Monitor decision logic
        └── anomaly.py                     ◄── Real-time price entry validator
```

---

## 3. The Click-to-File Pipeline Map (Where Every Click Leads)

| User Action / Click | Component Triggered | Route Path | Backend Route & Controller | Database Table Involved |
| :--- | :--- | :--- | :--- | :--- |
| **Click "Login" on Landing** | `LoginPage.jsx` | `/login` | `POST /api/v1/auth/login` | `User` |
| **Click "Register as Farmer"** | `FarmerRegisterPage.jsx` | `/register/farmer` | `POST /api/v1/auth/register` | `User`, `FarmerProfile` |
| **Click "Register as Buyer"** | `BuyerRegisterPage.jsx` | `/register/buyer` | `POST /api/v1/auth/register` | `User`, `BuyerProfile` |
| **Farmer: "Check Today's Prices"** | `MandiPriceExplorerPage.jsx` | `/farmer/prices` | `GET /api/v1/mandi/prices` | `MandiPrice` (Cached) |
| **Farmer: "Compare Net Realization"**| `NetRealizationComparePage.jsx`| `/farmer/compare` | `POST /api/v1/realization/compare` | `MandiPrice`, `StorageFacility` |
| **Farmer: "Ask AI: Sell or Hold?"** | `AiSellAdvisorPage.jsx` | `/farmer/advisor` | `POST /api/v1/mandi/advisor` $\rightarrow$ ML Service | `MandiPrice`, ML Model |
| **Farmer: "Create Produce Lot"** | `CreateLotPage.jsx` | `/farmer/lots/new` | `POST /api/v1/lots` | `ProduceLot` |
| **FPO: "Pool 5 Lots into 1"** | `AggregateLotsPage.jsx` | `/fpo/aggregate` | `POST /api/v1/lots/aggregate` | `ProduceLot`, `LotAggregationItem` |
| **Buyer: "Browse Verified Lots"** | `BrowseLotsPage.jsx` | `/buyer/lots` | `GET /api/v1/lots` | `ProduceLot`, `User` |
| **Buyer: "Submit Digital Offer"** | `MakeOfferModal.jsx` | Modal popup | `POST /api/v1/offers` | `Offer` |
| **Farmer: "Accept Offer"** | `LotDetailsPage.jsx` | `/farmer/lots/:id` | `PATCH /api/v1/offers/:id/accept` | `Offer`, `Deal`, `ProduceLot` |
| **Farmer: "Select Local Transporter"**| `SelectTransporterModal.jsx` | Modal popup | `POST /api/v1/logistics/book` | `LogisticsBooking`, `Deal` |
| **Buyer: "Confirm Delivery & Gate Test"**| `GateQualityCheckModal.jsx` | Modal popup | `PATCH /api/v1/deals/:id/verify` | `Deal`, `PaymentRecord` |
| **Both: "Rate & Review Trade"** | `FarmerFeedbackModal.jsx` | Modal popup | `POST /api/v1/reviews` | `TradeReview`, `User` |
| **Super Admin: "Verify Buyer GST"** | `BuyerVerificationDeskPage.jsx`| `/admin/buyers` | `PATCH /api/v1/admin/buyers/:id` | `BuyerProfile`, `User` |

---

## 4. Technology Decisions & Rationale (For Judge Q&A)

### Q1: Why React + Vite instead of Next.js?
* **Reason:** AgriMandi is a single-page progressive web app (PWA) designed to work offline/low-bandwidth for farmers. Next.js server-side rendering introduces unnecessary server compute overhead on free tiers, while Vite builds ultra-compact static bundles cached directly on the farmer's mobile browser.

### Q2: Why Node.js / Express for the main backend?
* **Reason:** Non-blocking asynchronous I/O is ideal for real-time order state machines, WebSocket/SSE notifications, and REST routing. Keeps the codebase accessible to 2nd-year engineers without enterprise boilerplate.

### Q3: Why Python / FastAPI for the ML Engine?
* **Reason:** The machine learning ecosystem (Pandas, Scikit-learn, XGBoost) is Python-native. FastAPI provides asynchronous execution, auto-generated OpenAPI documentation, and loads serialized `.joblib` model weights with sub-10 millisecond inference latency.

### Q4: Why Supabase (PostgreSQL) instead of MongoDB?
* **Reason:** Agricultural trade involves monetary settlements, lot ownership transfers, and parent-child lot aggregations. These require **strict ACID compliance, relational foreign key constraints, and row-level locking** to prevent double-selling of lots.

### Q5: Why XGBoost over LSTM / Deep Learning?
* **Reason:** Agricultural commodity prices are tabular and subject to exogenous shocks (arrivals, weather, mandi closures). Classical gradient boosting with explicit feature engineering outperforms deep neural networks on small tabular datasets ($<200,000$ rows) while providing **exact feature importance for explainability**.
