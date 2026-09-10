# AgriMandi (कृषीसेतू) — Product Requirements Document (PRD)

> **Document Version:** 2.0 (Production Blueprint)  
> **Status:** Approved Architecture  
> **Target Audience:** Product Managers, Full-Stack Engineers, AI Assistants, Agricultural Economists  
> **Core Mission:** Eliminate intermediate cartelization, provide true farm-gate net realization price discovery, and enable direct B2B trade between farmers/FPOs and verified institutional buyers with guaranteed T+1 escrow settlement.

---

## 1. Executive Summary & Product Vision

### 1.1 The Market Problem
Traditional agricultural trading in India, particularly across Maharashtra's high-volume belts (Latur, Jalgaon, Nashik, Akola, Nanded), suffers from severe structural flaws:
1. **Deceptive Mandi Sticker Prices:** Physical APMCs publish daily "modal prices," but a farmer traveling 40–90 km incurs freight (₹180–₹350/qtl), unverified unloading labor fees, market cess (₹45/qtl), and mandatory middleman commission (2%–5%). The farmer's actual in-hand return is 15%–25% lower than expected.
2. **Moisture & Quality Exploitation:** Traditional commission agents perform subjective visual inspections ("Chauki") and arbitrarily deduct 3–7 kg per quintal claiming high moisture, with no standardized digital lab test.
3. **Delayed & Risky Payments:** Farmers often wait 7 to 30 days for payment receipts from private traders, with zero legal guarantee in case of trader default or bankruptcy.
4. **Buyer Inefficiency:** Large agro-processors (Soybean oil extraction mills in Latur, Cotton ginning units in Jalgaon, Dal mills in Akola) struggle to procure standardized, non-adulterated raw produce directly from farm-gate clusters, leading to unnecessary aggregation markups.

### 1.2 The AgriMandi Solution
AgriMandi connects farmers, FPOs, agro-processors, local transporters, and APMC desks onto a single unified platform:
- **True Farm-Gate Net Realization Engine:** Automatically calculates distance-adjusted freight (Haversine Formula) and shows exact in-hand net realization for every nearby market.
- **Real-Time Agmarknet Mandi Feed:** Direct integration with official `data.gov.in` live API, backed by Supabase PostgreSQL historical tracking.
- **AI-Powered 7-Day Price Forecast & Sell/Hold Advisory:** XGBoost regression model trained on 30-day moving averages and arrival shock ratios, advising farmers whether to sell immediately or store produce.
- **Direct B2B Market Linkage:** Verified GSTIN-registered institutional buyers submit binding digital offers directly on farmer/FPO produce lots.
- **RBI-Compliant Digital Escrow & Gate-Test Settlement:** Buyer deposits 100% purchase funds into escrow before produce leaves the farm; funds are disbursed directly to the farmer's bank account within 24 hours of gate weighment and quality confirmation.

---

## 2. User Personas & Ecosystem Stakeholders

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AGRIMANDI USER ECOSYSTEM                        │
├───────────────────┬───────────────────┬──────────────────┬─────────────┤
│ 1. FARMER / FPO   │ 2. BUYER          │ 3. SERVICE       │ 4. SUPER    │
│    (SELLER)       │    (PURCHASER)    │    PROVIDER      │    ADMIN    │
├───────────────────┼───────────────────┼──────────────────┼─────────────┤
│ • Smallholders    │ • Oil Millers     │ • Local Goods    │ • Platform  │
│ • Commercial      │ • Dal Millers     │   Transporters   │   Compliance│
│   Farmers         │ • Wholesalers     │ • Quality Labs   │ • APMC Mandi│
│ • FPO Leaders     │ • Food Retailers  │   / Assayers     │   Desk      │
│   (Aggregators)   │ • Exporters       │ • Warehouses     │ • Escrow    │
│                   │                   │   (WDRA)         │   Manager   │
└───────────────────┴───────────────────┴──────────────────┴─────────────┘
```

### 2.1 Persona 1: Farmer / FPO (Seller)
- **Profile:** Smallholder or commercial farmer in Maharashtra (1–25 acres). Primary crops: Soybean, Cotton, Tur (Pigeon Pea), Onion, Bengal Gram (Chana).
- **Core Jobs-to-be-Done (JTBD):**
  - View real-time daily mandi rates without visiting the physical yard.
  - Understand actual in-hand earnings after freight deduction.
  - Know if prices will rise in the next 3–7 days (Sell vs Hold decision).
  - List produce lots with moisture/quality details and receive bids from multiple verified buyers.
  - Aggregate individual smallholder lots under an FPO umbrella to unlock bulk truckload pricing.
  - Receive 100% payment directly in bank account within 24 hours.

### 2.2 Persona 2: Institutional Buyer (Agro-Processor / Trader)
- **Profile:** Soybean solvent extraction plant, dal mill, cotton ginning factory, or food processor with valid GSTIN and APMC trader license.
- **Core JTBD:**
  - Discover verified produce lots within 50–150 km of their factory.
  - Filter lots by crop, variety, and verified moisture percentage.
  - Place transparent binding digital bids/offers.
  - Ensure legal compliance with auto-generated e-invoices and GST input tax credit slips.

### 2.3 Persona 3: Transporter & Assayer (Logistics & Quality Partner)
- **Profile:** Local commercial vehicle owner (Tata Ace, Pickup, Bolero, 10-wheeler Eicher) or certified agricultural quality testing lab.
- **Core JTBD:**
  - Receive automated farm-gate dispatch bookings with guaranteed round-trip pricing.
  - Generate digital e-waybills and GPS transit tracking.
  - Upload digital moisture and foreign matter assay slips.

### 2.4 Persona 4: APMC & Platform Super Admin
- **Profile:** Market regulation desk, grievance redressal officer, and escrow manager.
- **Core JTBD:**
  - Verify new buyer GSTIN and APMC trade licenses within 2 hours.
  - Monitor live market arrival volumes and flag anomalous price spikes.
  - Arbitrate quality dispute reconciliations before escrow release.

---

## 3. Product Modules & Functional Specifications

### 3.1 Module 1: Multilingual Public Portal (Landing Page)
- **Trilingual Support:** Instant toggling across **मराठी (mr)**, **हिंदी (hi)**, and **English (en)** via `i18next` without page reloads.
- **Live Trade Ticker:** Infinite marquee displaying recent APMC auction transactions with pulsating live status indicator.
- **Farmer-Centric Hero Visual:** Authentic rural Indian agricultural visual with 3 core trust badges:
  - 100% Escrow Bank Guarantee (RBI Trustee Compliant)
  - APMC / e-NAM Approved Legal Slips
  - 15,000+ Active Farmers & Verified Traders
- **Crop Price Discovery Tool:**
  - Inputs: Crop, Quantity (Quintals/Tons), Quality Grade, Storage Availability, Selling Window, Location.
  - Output: Real APMC benchmark rate, Haversine freight deduction, and true Net In-Hand Realization.
- **5 Service Pillars:** Mandi Rates, Trusted Buyers, Transport Facility, FPO Support, AI Market Analysis.
- **4 Distinct Role Portals:** Dedicated cards with custom benefit tags for Farmer, Buyer, Transporter, and Admin.
- **2-Column Live Mandi Feed & AI Insights:** Real-time data from `data.gov.in`, 30-day historical trend graph from Supabase, 7-day momentum %, and AI Sell/Hold advice box.
- **Verified Buyer Directory:** Cards showcasing actual verified processors with procurement quotas, target price limits, distance, and ratings.
- **Toll-Free Support Card:** 1800-233-5544 direct telephone dialer with morning 7 AM to night 9 PM availability.
- **Mobile Sticky Navigation:** Fixed 3-item bottom bar on mobile screens (`[Role / भूमिका]`, `[Mandi / भाव]`, `[Help / मदत]`).
- **2-Step OTP Authentication Modal:** 10-digit mobile number input -> 4-digit SMS OTP verification.

---

### 3.2 Module 2: Farmer Portal & Live Mandi Explorer
- **Mandi Price Explorer (`/farmer/prices`):** Search any Maharashtra APMC or commodity; view min, max, and modal rates.
- **Net Realization Comparison (`/farmer/compare`):** Side-by-side comparison of 5 nearest mandis showing Gross Price vs Freight vs Mandi Cess vs Storage vs Net Profit.
- **AI Sell / Hold Advisor (`/farmer/advisor`):**
  - Ingests 30-day moving average and arrival shock ratio.
  - Evaluates daily warehouse carrying cost (₹0.50/qtl/day) against predicted price momentum.
  - Delivers actionable recommendation: **HOLD (किंमत वाढ संभवते)** or **SELL (तातडीने विक्री करा)**.
- **Lot Management (`/farmer/lots`):**
  - Create new produce lot: Crop, variety, quantity, moisture %, base expected price, farm GPS coordinates, farm photos.
  - View live buyer bids with countdown timer.
  - Accept bid with single tap -> triggers Escrow Lock.

---

### 3.3 Module 3: FPO Bulk Aggregation Hub
- **Lot Aggregation Engine (`/fpo/aggregate`):**
  - FPO Manager selects multiple smallholder lots (e.g., 5 farmers with 10–20 quintals each).
  - Merges lots into a single **Bulk FPO Truckload Lot (100–200 Quintals)**.
  - Unlocks institutional buyer bulk pricing (+₹150–₹250/qtl higher).
  - Transparent ledger tracking individual farmer contributions and proportional payout splits.

---

### 3.4 Module 4: Buyer Procurement Portal
- **Lot Discovery & Search (`/buyer/lots`):** Filter lots by commodity, distance (km radius), moisture grade, and FPO certified tag.
- **Digital Bidding Engine (`/buyer/bid`):**
  - Place binding per-quintal offer.
  - Specify procurement deadline and delivery location.
- **Escrow Funding:** Buyer deposits 100% lot value into RBI-compliant escrow account upon offer acceptance.
- **Gate Quality Check & Delivery Slip (`/buyer/verify`):** Digital entry of weighbridge ticket and assay results to authorize payment disbursement.

---

### 3.5 Module 5: Logistics & Farm-Gate Dispatch
- **Haversine Dispatch Booking:** Assigns verified local transporter based on vehicle payload capacity (Bolero Pickup for 15–30 qtl, Eicher for 50–120 qtl).
- **Digital E-Waybill & Transit Pass:** Generated with QR code for roadside police/RTO inspection.
- **Trip Settlement:** Guaranteed fixed per-km freight released automatically from escrow upon buyer gate receipt.

---

### 3.6 Module 6: RBI-Compliant Escrow Settlement
- **Escrow State Machine:**
  1. `OFFER_ACCEPTED`: Deal contract initialized.
  2. `ESCROW_LOCKED`: Buyer deposits total funds (Produce cost + Platform fee + Logistics fee).
  3. `IN_TRANSIT`: Transporter picks up lot from farm gate.
  4. `DELIVERED_AND_TESTED`: Produce weighed and moisture verified at buyer factory.
  5. `SETTLED`: 100% net realization transferred directly to farmer bank account (T+1 settlement).

---

## 4. Non-Functional & Operational Requirements

1. **Zero Simulation / Zero Mock Data Policy:** All rates, historical trends, and distance calculations MUST be grounded in real Agmarknet government API feeds, real Haversine geographical coordinates, and real Supabase database records.
2. **Zero Hackathon / Competition Clutter:** The UI must be an authentic, commercial-grade enterprise application. Never display hackathon names, problem statement IDs, jury instructions, or student prototype notices on public interfaces.
3. **Mobile-First Progressive Web App (PWA):** Must load in $<1.5$ seconds on 3G rural mobile networks; lightweight asset footprint with responsive layouts from 360px mobile width to 4K desktop screens.
4. **Data Security & Privacy:** Strict separation of farmer personal identity until a trade deal is locked; passwords and sensitive keys encrypted using 256-bit standards.
