# AgriMandi — Brand Assets, Logo Placement & Color System

> **Location in Project:** `d:\AgriMandi\brain\ASSETS_AND_BRANDING_GUIDE.md`  
> **Source Directory:** `d:\AgriMandi\Image\`

---

## 1. Logo Analysis & Visual Symbolism

The AgriMandi logo is a **masterclass in agricultural product branding for SIH 2026**:

| Visual Element | What it Represents | How to Explain to Judges |
| :--- | :--- | :--- |
| **Farmer with Smartphone & Wi-Fi** | Digital inclusion & Price discovery | Shows the smallholder accessing live market intelligence from the farm gate. |
| **Rising Growth Bar Chart & Arrow** | Net Price Realization | Symbolizes higher earnings and beating distress selling gluts. |
| **Mandi Shed & Gunny Bags** | Physical Market Linkage & Aggregation | Highlights storage, warehouse connectivity, and bulk FPO aggregation. |
| **Green Furrow Fields & Leaf Border**| Sustainable agriculture & Rural roots | Grounds the tech platform in the reality of rural Maharashtra. |
| **Rising Golden Sun** | Prosperity & New dawn | Represents farmer economic empowerment and transparent trade. |

---

## 2. Where to Use Which Logo (Exact Mapping)

### A. `AgriMandi Logo without background.png` (Transparent PNG)
Use wherever the background is dynamic, colored, or dark:

1. **Website Navigation Bar (`Navbar.jsx`):**
   * Placed at top-left (`h-10 w-auto`). Seamlessly blends with white, light-green, or blurred glassmorphism navbar backgrounds.
2. **PWA Mobile App Icon & Favicon (`public/favicon.ico`, `manifest.json`):**
   * Looks crisp on mobile home screens (Android & iOS) without ugly white box borders.
3. **Modal Headers & Deal Confirmation Cards:**
   * Used on `MakeOfferModal.jsx`, `GateQualityCheckModal.jsx`, and `DealProgressPage.jsx`.
4. **Mobile Bottom Sheet / Side Drawer:**
   * High-contrast branding inside the mobile menu drawer.

---

### B. `AgriMandi Logo.png` (Solid Background PNG)
Use wherever standard white card framing or external platforms require solid bounding:

1. **SIH Presentation PPT (Slide #1 Title & Final Slide):**
   * Standard slide canvas requires clean, opaque framing for projectors and judge screens.
2. **Social Media & WhatsApp Preview (`og:image` meta tag):**
   * *Critical Bug Prevention:* When you share the live Vercel link (`agrimandi.vercel.app`) on WhatsApp or LinkedIn, transparent PNGs turn black/ugly. Using the solid background image ensures a crisp, professional link preview card!
3. **GitHub Repository Header (`README.md`):**
   * Centered hero image banner at the top of the GitHub repository.
4. **Printable Invoices & Weighbridge Gate Passes (`Receipt.pdf`):**
   * Standard white A4 printable receipts for farmer payment settlements.

---

## 3. AgriMandi Official Brand Color Palette

Extracted directly from the logo to guarantee a 100% harmonious Tailwind theme:

```css
/* Tailwind CSS Palette Extension (tailwind.config.js) */
module.exports = {
  theme: {
    extend: {
      colors: {
        agri: {
          dark: '#0A4A28',     /* Deep Forest Green (Text & Headers) */
          primary: '#13753E',  /* Vibrant Crop Green (Buttons & Primary Actions) */
          light: '#E8F5E9',   /* Soft Mint Green (Card Backgrounds & Accents) */
          gold: '#E5A00D',    /* Harvest Amber/Gold (Secondary Actions, Stars) */
          goldLight: '#FEF9E7'/* Warm Sunlight Cream (Highlight Alerts) */
        }
      }
    }
  }
}
```
