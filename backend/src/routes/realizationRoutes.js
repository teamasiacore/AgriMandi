import express from 'express';
import { db } from '../services/db.js';

const router = express.Router();

// District Coordinates in Maharashtra
const DISTRICT_COORDS = {
  'Latur': { lat: 18.4088, lng: 76.5604 },
  'Solapur': { lat: 17.6599, lng: 75.9064 },
  'Jalna': { lat: 19.8410, lng: 75.8863 },
  'Nashik': { lat: 20.0059, lng: 73.7898 },
  'Akola': { lat: 20.7002, lng: 77.0082 },
  'Pune': { lat: 18.5204, lng: 73.8567 },
  'Nanded': { lat: 19.1383, lng: 77.3210 },
  'Nagpur': { lat: 21.1458, lng: 79.0882 },
  'Ahmednagar': { lat: 19.0952, lng: 74.7496 },
  'Yavatmal': { lat: 20.3888, lng: 78.1204 }
};

// Haversine Distance in Kilometers
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

router.post('/discover', (req, res) => {
  try {
    const {
      crop = 'Soybean',
      quantityQtl = 50,
      farmerDistrict = 'Latur',
      farmLat,
      farmLng,
      expectedPrice = 4800
    } = req.body;

    const fCoord = (farmLat && farmLng) ? { lat: Number(farmLat), lng: Number(farmLng) } :
      (DISTRICT_COORDS[farmerDistrict] || DISTRICT_COORDS['Latur']);

    const qty = Math.max(1, Number(quantityQtl));

    // Base benchmark market price
    const benchmarkPrice = crop.toLowerCase().includes('cotton') ? 7250 :
                           crop.toLowerCase().includes('onion') ? 2450 :
                           crop.toLowerCase().includes('tur') || crop.toLowerCase().includes('arhar') ? 10100 : 4850;

    // Physical APMC Route Breakdown:
    const nearestApmcDistance = 38; // Average physical distance to nearest APMC yard in km
    const apmcFreightPerQtl = Math.round((500 / qty) + (nearestApmcDistance * 4.20));
    const apmcMandiCessPerQtl = 45; // 1.05% APMC cess + market fee
    const apmcHandlingPerQtl = 25;  // Loading / unloading / weighing
    const apmcTotalDeductionPerQtl = apmcFreightPerQtl + apmcMandiCessPerQtl + apmcHandlingPerQtl;
    const apmcNetRealization = benchmarkPrice - apmcTotalDeductionPerQtl;
    const apmcTotalInHand = apmcNetRealization * qty;

    // Direct AgriMandi Buyer Match:
    const buyers = db.getBuyers();
    const matchingBuyers = buyers.map(b => {
      const distance = haversineDistance(fCoord.lat, fCoord.lng, b.lat, b.lng);
      // Farm-gate procurement: Buyer arranges pickup or farmer delivers locally
      const freightCost = Math.round(distance * 3.80);
      // Farm-gate buyer pays directly: ₹0 APMC cess, ₹0 middleman cut
      const buyerOfferPrice = benchmarkPrice - 30; // Competitive farm-gate direct offer
      const directNetRealization = buyerOfferPrice; // Buyer picks up directly at farm gate
      const directTotalInHand = directNetRealization * qty;
      const extraProfit = directTotalInHand - apmcTotalInHand;

      return {
        ...b,
        distanceKm: distance,
        offeredRate: buyerOfferPrice,
        directNetRealization,
        extraProfitVsApmc: extraProfit
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({
      status: 'success',
      crop,
      quantityQtl: qty,
      farmerDistrict,
      benchmarkMarketPrice: benchmarkPrice,
      apmcRoute: {
        marketName: `${farmerDistrict} APMC Yard`,
        stickerPrice: benchmarkPrice,
        freightPerQtl: apmcFreightPerQtl,
        mandiCessPerQtl: apmcMandiCessPerQtl,
        handlingPerQtl: apmcHandlingPerQtl,
        totalDeductionPerQtl: apmcTotalDeductionPerQtl,
        netInHandPerQtl: apmcNetRealization,
        totalPayout: apmcTotalInHand
      },
      directRoute: {
        recommendedBuyer: matchingBuyers[0] || null,
        netInHandPerQtl: matchingBuyers[0] ? matchingBuyers[0].directNetRealization : benchmarkPrice,
        totalPayout: matchingBuyers[0] ? matchingBuyers[0].directNetRealization * qty : benchmarkPrice * qty,
        netExtraEarning: matchingBuyers[0] ? matchingBuyers[0].extraProfitVsApmc : 0,
        matchingBuyers
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

export default router;
