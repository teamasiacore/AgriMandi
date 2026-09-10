# AgriMandi (कृषीसेतू) — SIH 2026 Idea Submission PPT Blueprint
### Problem Statement ID: 26132 | Government of Maharashtra
**Theme:** Agriculture, FoodTech & Rural Development  
**Document Purpose:** Exact slide-by-slide layout, visual content, tables, flowcharts, and diagrams for the SIH Idea Screening Round. Designed for high visual impact (zero bulky paragraphs).

---

# SLIDE 1: TITLE SLIDE (Cover)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO: AgriMandi Logo.png]                                      [SIH 2026 OFFICIAL LOGO]│
│                                                                                        │
│                                      AgriMandi                                         │
│                                     ( कृषीसेतू )                                       │
│          "भाव अचूक, बाजार थेट — शेतकरी समृद्धीचा नवा सेतू!"                            │
│                                                                                        │
│   Strengthening Market Linkages & Price Discovery for Farmers (PS ID: 26132)          │
│   Organization: Government of Maharashtra (Dept of Skills, Employment & Innovation)   │
│                                                                                        │
│   Team Name: [Your Team Name]               College: [Your College Name]               │
│   Live Prototype: https://agrimandi.vercel.app                                         │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

# SLIDE 2: IDEA TITLE & PROPOSED SOLUTION

### 📌 Top Tagline:
> **"We don't just show farmers mandi prices — we tell them WHERE to sell, WHEN to sell, and WHOM to sell to with maximum net in-hand profit."**

---

### 2-Column Visual Layout:

```
┌──────────────────────────────────────────────────┬──────────────────────────────────────────────────┐
│ 🔴 THE PROBLEM (Market Failure)                  │ 🟢 PROPOSED SOLUTION (AgriMandi)                 │
├──────────────────────────────────────────────────┼──────────────────────────────────────────────────┤
│ • Distress Selling: Farmers dump crop at harvest │ • Farm-Gate Decision: Intelligence delivered     │
│   due to zero visibility into buyer demand.      │   BEFORE loading the tractor, not at mandi gate. │
│ • Misleading Sticker Prices: Distant mandi looks │ • Net Realization Engine: Realized ₹ = Sticker   │
│   high, but freight & cess eat up farmer profit. │   Price - Dynamic Freight - Mandi Cuts - Storage.│
│ • Volume Mismatch: Smallholders (5-10 qtl) are   │ • FPO Bulk Aggregator: Pools 5 small lots into   │
│   ignored by large corporate processors.         │   100 qtl commercial lots for bulk contracts.    │
│ • Counterparty Risk: Fear of delayed payments    │ • Two-Way Trust & Verified Matching: GSTIN-vetted│
│   and arbitrary weight deductions at delivery.   │   buyers + Milestone Escrow Ledger + Ratings.    │
└──────────────────────────────────────────────────┴──────────────────────────────────────────────────┘
```

---

### 🚀 4 Core Differentiators (Innovation & Uniqueness):

```
┌──────────────────────────┬──────────────────────────┬──────────────────────────┬──────────────────────────┐
│ 1. Net Realization Engine│ 2. Explainable AI Advisor│ 3. Hyperlocal Logistics  │ 4. Two-Way Trust Rating  │
├──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ Ranks selling options by │ 30-day momentum & arrival│ Auto-matches available   │ Verified deal-only review│
│ actual pocket money      │ velocity gives explain-  │ village tempos/tractors  │ system; boosts top buyers│
│ (Freight Range + Cess).  │ able SELL / HOLD advice. │ near farm gate.          │ and flags fraud players. │
└──────────────────────────┴──────────────────────────┴──────────────────────────┴──────────────────────────┘
```

---

# SLIDE 2B: COMPETITIVE BENCHMARKING (Master Comparison Table)

### 📌 Top Tagline:
> **"Why AgriMandi beats e-NAM: e-NAM operates inside the physical mandi gates; AgriMandi operates upstream at the farm gate."**

```
┌──────────────────────────────────────┬──────────────────┬─────────────────┬─────────────────┬────────────────────────────┐
│ FEATURE / MARKET CAPABILITY          │ TRADITIONAL APMC │ GOVT e-NAM      │ GENERIC APPS    │ 🏆 AGRIMANDI (OUR SYSTEM)   │
├──────────────────────────────────────┼──────────────────┼─────────────────┼─────────────────┼────────────────────────────┤
│ 1. Selling Decision Point            │ Inside Mandi     │ Inside Mandi    │ Passive Screen  │ 🟢 Farm-Gate (Pre-Harvest) │
│ 2. Net Realization (Freight Deduct)  │ ❌ No            │ ❌ No           │ ❌ No (Gross)   │ 🟢 Yes (Dynamic Range)     │
│ 3. Explainable AI Sell/Hold Advice   │ ❌ No            │ ❌ No           │ ❌ No           │ 🟢 Yes (XGBoost Momentum)  │
│ 4. FPO Bulk Lot Aggregation          │ ❌ No            │ ⚠️ Limited      │ ❌ No           │ 🟢 Yes (Multi-Farmer Pool) │
│ 5. Hyperlocal Village Logistics      │ ❌ Ad-hoc Cuts   │ ❌ No           │ ❌ No           │ 🟢 Yes (Taluka Radius)     │
│ 6. Two-Way Verified Trust Ratings    │ ❌ Informal      │ ❌ No           │ ❌ No           │ 🟢 Yes (Post-Deal Reviews) │
│ 7. Regional Marathi Voice Copilot    │ ❌ No            │ ❌ No           │ ❌ No           │ 🟢 Yes (Bhashini AI)       │
│ 8. Double-Sell Locking Mechanism     │ ❌ Manual/Paper  │ ❌ Gate Register│ ❌ None         │ 🟢 Yes (Postgres Row Locks)│
│ 9. Farmer Commission & Cuts          │ ❌ 6%–12% Cut    │ ❌ Mandi Cuts   │ ❌ N/A          │ 🟢 0% Farmer Commission 🏆 │
└──────────────────────────────────────┴──────────────────┴─────────────────┴─────────────────┴────────────────────────────┘
```

> **The Judge Defense:**  
> *"Sir, e-NAM requires farmers to physically transport their harvest to an APMC yard first, paying upfront transport before price discovery happens. AgriMandi gives price intelligence and buyer linkages at the farm gate before the truck is loaded."*

---

# SLIDE 3: TECHNICAL APPROACH & ARCHITECTURE

### Layout: Technology Stack (Left) + Process Flow / Architecture (Right)
*(Reference: Match Image 2 & Image 3)*

```
┌─────────────────────────────────────────────────┬─────────────────────────────────────────────────┐
│              TECHNOLOGY STACK                   │               PROCESS FLOW                      │
├─────────────────────────────────────────────────┼─────────────────────────────────────────────────┤
│ 🌐 CLIENT LAYER                                 │                                                 │
│ • React 18 + Vite + Tailwind CSS (Mobile PWA)   │   [Farmer selects Crop & Farm Location]         │
│ • Recharts (Visual 30-Day Trend Lines)          │                    │                            │
│                                                 │                    ▼                            │
│ ⚙️ CORE BACKEND                                 │   [Net Realization Engine ranks Buyers/Mandis]  │
│ • Node.js + Express.js REST API                 │                    │                            │
│ • Zod Schema Validation (End-to-End Safety)     │                    ▼                            │
│ • Prisma 7 ORM (TypeScript / WASM Engine)       │   [XGBoost AI Advisor: Sell / Hold Guidance]    │
│                                                 │                    │                            │
│ 🤖 MACHINE LEARNING & ANALYTICS                 │                    ▼                            │
│ • Python + FastAPI Microservice (HF Spaces)     │   [Create Standard Lot / FPO Bulk Pooling]      │
│ • XGBoost Regressor (7-Day Price Band Forecast) │                    │                            │
│ • Isolation Forest (Ingestion Anomaly Detector) │                    ▼                            │
│                                                 │   [Cosine Matchmaking: 96% Match with Buyer]    │
│ 🗄️ PERSISTENCE & CACHE                          │                    │                            │
│ • Supabase (PostgreSQL 15) - ACID & Row-Locking │                    ▼                            │
│ • In-Memory Cache (node-cache) - Sub-5ms latency│   [Digital Offer Accepted -> Lot Locked]        │
│                                                 │                    │                            │
│ 📡 DATA & SPEECH INTEGRATION                    │                    ▼                            │
│ • data.gov.in (Official AGMARKNET Live API)     │   [Hyperlocal Transporter Assigned & Transit]   │
│ • Ashoka University CEDA Mandi Dataset          │                    │                            │
│ • Bhashini / Gemini 2.0 Flash (Marathi NLU/STT) │                    ▼                            │
│ • UptimeRobot (24/7 Zero Cold-Start Guard)      │   [Delivery Verified -> Payment Released]       │
└─────────────────────────────────────────────────┴─────────────────────────────────────────────────┘
```

---

# SLIDE 4: FEASIBILITY AND VIABILITY
*(Reference: Structured 3-Column Grid matching Image 5)*

```
┌─────────────────────────────┬─────────────────────────────────────┬─────────────────────────────────────┐
│ FEASIBILITY ANALYSIS        │ POTENTIAL CHALLENGES & RISKS        │ STRATEGIES FOR OVERCOMING (FIXES)   │
├─────────────────────────────┼─────────────────────────────────────┼─────────────────────────────────────┤
│ 1. Technical Feasibility    │ • Risk 1: Govt Mandi API Downtime   │ • Resilient Fallback Cache: Database│
│ • Standard REST Monolith    │   or delayed price uploads.         │   serves latest verified snapshot   │
│ • Lightweight ML (<3MB)     │                                     │   with exact "As of [Date]" badge.  │
│ • Zero heavy infrastructure │ • Risk 2: Bad Data / Typo Entries   │ • Isolation Forest Anomaly Filter:  │
│                             │   (e.g., ₹5,000 typed as ₹50,000).  │   Auto-detects and flags outliers.  │
├─────────────────────────────┼─────────────────────────────────────┼─────────────────────────────────────┤
│ 2. Operational Feasibility  │ • Risk 3: Transport Rate Volatility │ • Dynamic Freight Range Engine:     │
│ • Simple 60-sec farmer OTP  │   (Fuel & road conditions vary).    │   Shows Min–Max range with vehicle  │
│ • Works on 2G/3G mobile     │                                     │   selection and manual quote bids.  │
│ • Zero training required    │ • Risk 4: Private Buyer Default /   │ • Tiered KYC & Milestone Ledger:    │
│                             │   Fake high offers to cheat farmers.│   Mandatory GSTIN check + advance   │
│                             │                                     │   commitment + 2-way rating badges. │
├─────────────────────────────┼─────────────────────────────────────┼─────────────────────────────────────┤
│ 3. Financial Feasibility    │ • Risk 5: Cloud Server Sleep        │ • UptimeRobot 5-min Keep-Alive:     │
│ • 100% Free Hosting Stack   │   (Free tier cold start of 50s).    │   Monitors /health 24/7; zero lag.  │
│ • Vercel + Render + HF      │ • Risk 6: High Transaction Fees     │ • Freemium / FPO SaaS Model: 100%   │
│ • Sustainable scaling       │   burdening small farmers.          │   free for smallholders; micro fee  │
│                             │                                     │   on bulk corporate transactions.   │
└─────────────────────────────┴─────────────────────────────────────┴─────────────────────────────────────┘
```

---

# SLIDE 5: IMPACT AND BENEFITS

### 📊 Quantified Impact Metric Card:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        MEASURABLE ECONOMIC IMPACT (50 Qtl Soybean Deal)                │
├────────────────────────────────┬──────────────────────────────┬────────────────────────┤
│ METRIC                         │ TRADITIONAL TRADING (MANDI)  │ AGRIMANDI PLATFORM     │
├────────────────────────────────┼──────────────────────────────┼────────────────────────┤
│ Headline Price Quoted          │ ₹4,950 / qtl                 │ ₹4,880 / qtl (Direct)  │
│ Transport / Freight Cost       │ -₹180 / qtl (Farmer pays)    │ ₹0 (Farm-gate pickup)  │
│ Loading, Weighing & Mandi Cess │ -₹45 / qtl                   │ ₹0 (Direct trade)      │
│ Commission Agent Cut (Adhat)   │ -₹50 / qtl                   │ ₹0 (Zero middleman)    │
├────────────────────────────────┼──────────────────────────────┼────────────────────────┤
│ NET REALIZED IN-HAND CASH      │ ₹4,675 / qtl (₹2,33,750)     │ ₹4,880 / qtl (₹2,44,000)│
│ NET FARMER PROFIT GAIN         │ BASELINE                     │ 🟢 +₹10,250 (+4.38%)   │
└────────────────────────────────┴──────────────────────────────┴────────────────────────┘
```

---

### 🌟 Multi-Dimensional Benefits:

```
┌─────────────────────────┬─────────────────────────┬─────────────────────────┬─────────────────────────┐
│ 💰 ECONOMIC BENEFIT     │ 🤝 SOCIAL BENEFIT       │ 🌿 ENVIRONMENTAL BENEFIT│ 🏛️ GOVERNANCE BENEFIT   │
├─────────────────────────┼─────────────────────────┼─────────────────────────┼─────────────────────────┤
│ • 8% to 15% higher net  │ • Empowers marginal     │ • Reduces post-harvest  │ • 100% transparent trade│
│   farmer realization.   │   farmers via FPO bulk  │   crop spoilage by 25%  │   records & price audit │
│ • Sourcing cycle drops  │   collective bargaining.│   via direct farm-gate  │   trail for state agri  │
│   from 7 days to 24 hrs │ • Eliminates predatory  │   delivery.             │   authorities.          │
│   for bulk buyers.      │   village money-lenders.│ • Cuts empty truck trips│ • Structured grievance  │
│                         │ • Regional Marathi NLU. │   via shared logistics. │   redressal in 48 hours.│
└─────────────────────────┴─────────────────────────┴─────────────────────────┴─────────────────────────┘
```

---

# SLIDE 6: RESEARCH AND REFERENCES

### 📚 Official Government Data & Research Citations:

1. **Ministry of Agriculture & Farmers Welfare, Govt of India:**
   * *AGMARKNET & Open Government Data (OGD) Portal:* Variety-wise Daily Market Prices & Arrivals API (`Resource ID: 9ef84268-d588-465a-a308-a864a43d0070`).
   * *URL:* [data.gov.in](https://data.gov.in) | [agmarknet.gov.in](https://agmarknet.gov.in)

2. **CEDA (Centre for Economic Data and Analysis), Ashoka University:**
   * *Cleaned Historical Agmarknet Daily Price Time-Series (2018–2025):* Census 2011 district mapping and commodity grade normalizations.
   * *URL:* [agmarknet.ceda.ashoka.edu.in](https://agmarknet.ceda.ashoka.edu.in)

3. **NITI Aayog & Dalwai Committee Report:**
   * *Report on Doubling Farmers' Income (Volume IV):* Post-Production Agricultural Interventions, Market Linkages & Net Realization Analysis.

4. **Maharashtra State Agricultural Marketing Board (MSAMB):**
   * *FPC/FPO Direct Linkage Policy & Daily Market Intelligence Reports:* [msamb.com](https://msamb.com) | [fpc.msamb.com](https://fpc.msamb.com).

5. **Bhashini — National Language Translation Mission (MeitY):**
   * *Govt of India's Open Indic Speech & Translation APIs (Marathi ASR/TTS Engine):* [bhashini.gov.in](https://bhashini.gov.in).

6. **Technical & Machine Learning Grounding:**
   * *Chen & Guestrin (2016):* "XGBoost: A Scalable Tree Boosting System" (ACM KDD).
   * *Liu, Ting, Zhou (2008):* "Isolation Forest" (IEEE ICDM) — Outlier Detection in Mandi Records.
