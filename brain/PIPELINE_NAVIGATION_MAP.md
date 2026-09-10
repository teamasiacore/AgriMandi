# AgriMandi — Pipeline Navigation Map (End-to-End Connection Guide)

> **Location in Project:** `d:\AgriMandi\brain\PIPELINE_NAVIGATION_MAP.md`  
> **Purpose:** Detailed click-to-code trace. Shows exactly which frontend button calls which route, which backend controller handles it, and which database table is queried. Keep this open during SIH judge code evaluation!

---

## 1. Pipeline 1: User Authentication & Role Redirect

```
[User Clicks "Login" on Navbar.jsx]
         │
         ▼ (Navigates to URL: /login)
[frontend/src/modules/auth/LoginPage.jsx]
         │
         ▼ (Submits POST: /api/v1/auth/login with phone & password)
[backend/src/routes/auth.routes.js]  ──► Dispatches to: authController.login()
         │
         ▼
[backend/src/controllers/auth.controller.js]
         │
         ├──► Validates body using: backend/src/validations/auth.schema.js
         ├──► Queries database: prisma.user.findUnique({ where: { phone } })
         ├──► Verifies password: bcrypt.compare(password, user.passwordHash)
         └──► Signs JWT: jwt.sign({ id, role }, process.env.JWT_SECRET)
         │
         ▼
[Frontend AuthContext (frontend/src/shared/context/AuthContext.jsx)]
         │
         ├── If role == "FARMER"  ──► Navigates to /farmer/dashboard
         ├── If role == "BUYER"   ──► Navigates to /buyer/dashboard
         ├── If role == "ADMIN"   ──► Navigates to /admin/dashboard
         └── If role == "TRANSPORTER" ──► Navigates to /transporter/dashboard
```

---

## 2. Pipeline 2: Market Intelligence & Net Realization Compare

```
[Farmer Clicks "Compare Net Realization" in FarmerDashboard.jsx]
         │
         ▼ (Navigates to URL: /farmer/compare)
[frontend/src/modules/farmer/NetRealizationComparePage.jsx]
         │
         ▼ (Calls API: POST /api/v1/realization/compare)
         │ Payload: { crop: "SOYBEAN", quantity: 50, farmLat: 18.40, farmLng: 76.58 }
         │
[backend/src/routes/realization.routes.js] ──► Dispatches to: realizationController.compare()
         │
         ▼
[backend/src/controllers/realization.controller.js]
         │
         ▼ (Invokes: backend/src/services/realization.service.js)
         │
         ├── 1. Fetches mandis prices within 150km: prisma.mandiPrice.findMany(...)
         ├── 2. Calculates road distance using Haversine formula (km)
         ├── 3. Computes dynamic freight range:
         │      - Min Freight = Base + (dist * 4.0 * qtl)
         │      - Max Freight = Base + (dist * 5.5 * qtl)
         │      - Avg Freight = Base + (dist * 4.75 * qtl)
         ├── 4. Calculates Net Realized ₹/qtl = Modal Price - Avg Freight - Mandi Cess
         └── 5. Sorts results from HIGHEST Net Realization to LOWEST
         │
         ▼
[Frontend NetRealizationComparePage.jsx]
         └── Renders high-contrast table ranking options with disclaimer badges
```

---

## 3. Pipeline 3: AI Sell / Hold Advisor (ML Inference Pipeline)

```
[Farmer Clicks "AI Sell/Hold Advisor" in FarmerDashboard.jsx]
         │
         ▼ (Navigates to URL: /farmer/advisor)
[frontend/src/modules/farmer/AiSellAdvisorPage.jsx]
         │
         ▼ (Calls API: POST /api/v1/mandi/advisor)
         │ Payload: { commodityCode: "SOYBEAN", district: "Latur" }
         │
[backend/src/routes/mandi.routes.js] ──► Dispatches to: mandiController.getAdvisorRecommendation()
         │
         ▼
[backend/src/controllers/mandi.controller.js]
         │
         ├── 1. Reads last 30 days of prices from Supabase: prisma.mandiPrice.findMany(...)
         ├── 2. Computes 7-day momentum, 30-day SMA, and arrival shock
         ├── 3. Forwards feature vector to Python ML Service (Hugging Face Spaces):
         │      HTTP POST https://username-ml-engine.hf.space/predict/sell-advice
         │
[ml_engine/app.py & ml_engine/api/advisor.py]
         │
         ├── Loads serialized model: ml_engine/models/xgboost_price_model.joblib
         ├── Runs inference: model.predict(feature_array)
         ├── Evaluates carrying cost rule engine (Storage rent vs predicted price gain)
         └── Returns JSON:
             {
               "recommendation": "HOLD",
               "confidence": 0.89,
               "forecast_7d_min": 4980,
               "forecast_7d_max": 5050,
               "reasons": [
                 "Price momentum is +2.7% over 7 days",
                 "Mandi arrivals dropped 14% this week",
                 "Holding 50 qtl for 7 days costs ₹140 vs expected ₹6,000 gain"
               ]
             }
         │
         ▼
[frontend/src/modules/farmer/AiSellAdvisorPage.jsx]
         └── Renders "HOLD" advisory badge with interactive factor breakdown
```

---

## 4. Pipeline 4: Produce Lot Creation & Double-Selling Protection

```
[Farmer Clicks "Create New Lot" in MyLotsPage.jsx]
         │
         ▼ (Navigates to URL: /farmer/lots/new)
[frontend/src/modules/farmer/CreateLotPage.jsx]
         │
         ▼ (Submits POST: /api/v1/lots)
         │ Payload: { crop, variety, quantityQuintals, moisture, expectedPrice, district, taluka }
         │
[backend/src/routes/lots.routes.js] ──► Dispatches to: lotsController.createLot()
         │
         ▼
[backend/src/controllers/lots.controller.js]
         │
         ├── 1. Validates input schema: backend/src/validations/lot.schema.js
         └── 2. Creates database record:
                prisma.produceLot.create({
                  data: {
                    ownerId: req.user.id,
                    status: "AVAILABLE", // Ready for matching
                    ...validatedData
                  }
                })
         │
         ▼
[Database ProduceLot Table]
         └── Saved with Status = "AVAILABLE"
```

---

## 5. Pipeline 5: Deal Locking & Two-Way Feedback Flow

```
[Buyer submits Offer] ──► Offer Status = PENDING
         │
[Farmer clicks "Accept Offer" in LotDetailsPage.jsx]
         │
         ▼ (PATCH /api/v1/offers/:id/accept)
[backend/src/controllers/offers.controller.js]
         │
         ├── 1. Database Transaction (Strict ACID):
         │      prisma.$transaction([
         │        prisma.offer.update({ where: { id }, data: { status: "ACCEPTED" } }),
         │        prisma.produceLot.update({ where: { id: lotId }, data: { status: "DEAL_LOCKED" } }),
         │        prisma.deal.create({ data: { lotId, buyerId, sellerId, status: "CONFIRMED" } })
         │      ])
         └── 2. Other pending offers on this lot are automatically marked CANCELLED
         │
         ▼
[Goods in Transit & Gate Inspection Verified]
         │
         ▼ (Deal Status updated to: "COMPLETED")
[Triggered on Both Apps: Review Modal]
         │
         ├── Farmer rates Buyer  ──► POST /api/v1/reviews (Fair weight, fast payment)
         └── Buyer rates Farmer   ──► POST /api/v1/reviews (Quality as declared, prompt loading)
         │
         ▼
[backend/src/controllers/reviews.controller.js]
         └── Saved into prisma.tradeReview table with unique constraint [dealId, reviewerId]
```
