# AgriMandi — Algorithms & Mathematical Logic Reference

> **Location in Project:** `d:\AgriMandi\brain\ALGORITHMS_REFERENCE.md`  
> **Purpose:** Detailed mathematical formulas, pseudocode, and engineering rationale for every algorithm in AgriMandi. When judges ask: *"Show me the math behind your engine"*, point directly to this guide.

---

## 1. Algorithm 1: Net Realization Calculation Formula

### Objective:
Replace deceptive sticker mandi prices with actual in-hand farmer earnings after accounting for dynamic freight and handling.

### Formula:
$$\text{Net Realization (₹/qtl)} = P_{\text{market}} - C_{\text{freight/qtl}} - C_{\text{mandi\_cess/qtl}} - (C_{\text{storage/qtl/day}} \times D_{\text{days}})$$

Where:
* $P_{\text{market}}$ = Current modal price reported by APMC or offered by buyer (₹/quintal).
* $C_{\text{mandi\_cess/qtl}}$ = Mandatory APMC market cess + loading fee ($\approx ₹45/\text{qtl}$; ₹0 for direct farm-gate buyer).
* $C_{\text{storage/qtl/day}}$ = Local warehouse rent (default ₹0.50/qtl/day or ₹15/qtl/month).

### Dynamic Freight Estimation Model:
$$\text{Distance } (D_{\text{km}}) = \text{Haversine}(\text{lat}_1, \text{lon}_1, \text{lat}_2, \text{lon}_2)$$
$$\text{Base Freight (₹/qtl)} = \frac{\text{Base Booking Fee (₹500)}}{Q_{\text{quintals}}} + (D_{\text{km}} \times \text{Tariff Rate})$$

* **Min Range Rate:** $₹3.80 / \text{qtl-km}$ (Highway, Full Truckload Eicher).
* **Average Benchmark Rate:** $₹4.75 / \text{qtl-km}$ (Standard mixed terrain).
* **Max Range Rate:** $₹5.80 / \text{qtl-km}$ (Kachha rural road or small Bolero load).

---

## 2. Algorithm 2: Haversine Distance Formula

### Objective:
Calculates the shortest great-circle distance between farmer's farm GPS and buyer/mandi coordinates over the earth's curvature.

### Formula:
$$a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1) \cdot \cos(\phi_2) \cdot \sin^2\left(\frac{\Delta \lambda}{2}\right)$$
$$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1-a}\right)$$
$$D = R \cdot c \quad (R = 6371 \text{ km})$$

Where $\phi$ is latitude in radians and $\lambda$ is longitude in radians.

---

## 3. Algorithm 3: ML Feature Engineering & XGBoost Price Momentum

### Objective:
Transform raw APMC date-price records into predictive signals for the 7-day price band and Sell/Hold decision.

### Engineered Features:
1. **Lagged Prices:** $P_{t-1}, P_{t-3}, P_{t-7}, P_{t-14}, P_{t-30}$
2. **30-Day Simple Moving Average (SMA):**
   $$\text{SMA}_{30} = \frac{1}{30} \sum_{i=0}^{29} P_{t-i}$$
3. **7-Day Price Momentum (%):**
   $$\text{Momentum}_{7} = \left( \frac{P_t - P_{t-7}}{P_{t-7}} \right) \times 100$$
4. **Arrival Volume Shock Ratio:**
   $$\text{Shock}_{\text{arrival}} = \frac{\text{Arrival}_t}{\text{Rolling 14-day Mean Arrival}}$$
   * If $\text{Shock}_{\text{arrival}} > 1.4 \rightarrow$ Heavy arrival glut (Price likely to fall).
   * If $\text{Shock}_{\text{arrival}} < 0.8 \rightarrow$ Supply tightening (Price likely to hold/rise).

---

## 4. Algorithm 4: Isolation Forest Anomaly Detection

### Objective:
Catches government data entry typos (e.g. ₹5,000 typed as ₹50,000) or corrupt entries at ingestion before they reach the database or user UI.

### Principle:
Isolation Forest isolates anomalies by randomly selecting a feature and randomly splitting value between min and max. Anomalies require significantly fewer splits to isolate than normal market points.

* **Anomaly Score Calculation:**
  $$s(x, n) = 2^{-\frac{E(h(x))}{c(n)}}$$
  Where $h(x)$ is path length of point $x$, $E(h(x))$ is expected path length over a forest of 100 trees, and $c(n)$ is average path length of unsuccessful search in a Binary Search Tree.
* **Decision Rule:** If $s(x, n) > 0.65 \rightarrow$ Flagged as `ANOMALY_PRICE_SUSPICIOUS`.

---

## 5. Algorithm 5: Cosine Similarity Matchmaking Engine

### Objective:
Ranks buyers for a farmer's lot (and vice versa) using multi-factor vector representations.

### Feature Vectors:
$$\vec{A} = [\text{CommodityMatch}, \text{QuantityScore}, \text{QualityMoistureScore}, \text{ProximityScore}, \text{PriceScore}]$$
$$\text{Cosine Similarity} = \frac{\vec{A} \cdot \vec{B}}{\|\vec{A}\| \|\vec{B}\|} = \frac{\sum A_i B_i}{\sqrt{\sum A_i^2} \sqrt{\sum B_i^2}}$$

### Bonus Multipliers:
* GST-Verified Buyer Badge: $+10\%$ Match Boost
* Platform Rating $\ge 4.5$ Stars: $+5\%$ Match Boost
* Final Match Score normalized to: **$0\% \text{ to } 100\%$**.
