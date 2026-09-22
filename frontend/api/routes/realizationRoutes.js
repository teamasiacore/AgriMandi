import express from 'express';
import { db } from '../services/db.js';
import { mandiService } from '../services/mandiService.js';

const router = express.Router();

// District Coordinates in Maharashtra (Haversine Geography)
const DISTRICT_COORDS = {
  'Latur': { lat: 18.4088, lng: 76.5604, apmcDistKm: 18 },
  'Solapur': { lat: 17.6599, lng: 75.9064, apmcDistKm: 24 },
  'Jalna': { lat: 19.8410, lng: 75.8863, apmcDistKm: 22 },
  'Nashik': { lat: 20.0059, lng: 73.7898, apmcDistKm: 32 },
  'Akola': { lat: 20.7002, lng: 77.0082, apmcDistKm: 20 },
  'Pune': { lat: 18.5204, lng: 73.8567, apmcDistKm: 35 },
  'Nanded': { lat: 19.1383, lng: 77.3210, apmcDistKm: 26 },
  'Nagpur': { lat: 21.1458, lng: 79.0882, apmcDistKm: 28 },
  'Ahmednagar': { lat: 19.0952, lng: 74.7496, apmcDistKm: 30 },
  'Yavatmal': { lat: 20.3888, lng: 78.1204, apmcDistKm: 25 },
  'Amravati': { lat: 20.9374, lng: 77.7796, apmcDistKm: 22 },
  'Kolhapur': { lat: 16.7050, lng: 74.2433, apmcDistKm: 25 },
  'Chhatrapati Sambhajinagar': { lat: 19.8762, lng: 75.3433, apmcDistKm: 28 },
  'Aurangabad': { lat: 19.8762, lng: 75.3433, apmcDistKm: 28 },
  'Beed': { lat: 18.9894, lng: 75.7601, apmcDistKm: 20 },
  'Parbhani': { lat: 19.2686, lng: 76.7708, apmcDistKm: 22 },
  'Hingoli': { lat: 19.7196, lng: 77.1478, apmcDistKm: 24 },
  'Washim': { lat: 20.1110, lng: 77.1352, apmcDistKm: 22 },
  'Buldhana': { lat: 20.5312, lng: 76.1843, apmcDistKm: 26 },
  'Wardha': { lat: 20.7453, lng: 78.6022, apmcDistKm: 25 }
};

// Standard freight tariffs per quintal-km
const VEHICLE_TARIFFS = {
  'standard_truck': { name: 'Eicher / Medium Truck (Full Load)', ratePerKm: 4.20, baseFee: 500 },
  'pickup': { name: 'Bolero Maxi Truck / Tata Ace', ratePerKm: 4.80, baseFee: 400 },
  'tractor': { name: 'Tractor Trolley / Rural Road', ratePerKm: 5.20, baseFee: 350 }
};

// Agmarknet benchmark prices (Modal price ₹/Qtl)
const CROP_BENCHMARKS = {
  'soybean': 4850,
  'soyabean': 4850,
  'cotton': 7250,
  'kapas': 7250,
  'onion': 2450,
  'kanda': 2450,
  'tur': 10100,
  'arhar': 10100,
  'pigeon pea': 10100,
  'chana': 5950,
  'gram': 5950,
  'harbhara': 5950,
  'maize': 2250,
  'corn': 2250,
  'maka': 2250,
  'wheat': 2550,
  'gehun': 2550
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

// Handler for both /discover and /calculate
async function handleRealization(req, res) {
  try {
    const {
      crop = 'Soybean',
      quantityQtl = 50,
      farmerDistrict = 'Latur',
      farmLat,
      farmLng,
      vehicleType = 'standard_truck',
      storageDays = 0,
      expectedPrice
    } = req.body;

    const districtInfo = DISTRICT_COORDS[farmerDistrict] || DISTRICT_COORDS['Latur'];
    const fCoord = (farmLat && farmLng) ? { lat: Number(farmLat), lng: Number(farmLng) } : districtInfo;
    const qty = Math.max(1, Number(quantityQtl) || 50);

    // Normalize crop and lookup benchmark
    const cleanCrop = (crop || '').toLowerCase().trim();
    let benchmarkPrice = 4850;
    for (const [key, val] of Object.entries(CROP_BENCHMARKS)) {
      if (cleanCrop.includes(key)) {
        benchmarkPrice = val;
        break;
      }
    }
    if (expectedPrice && Number(expectedPrice) > 1000) {
      benchmarkPrice = Number(expectedPrice);
    }

    // Vehicle tariff selection
    const vehicle = VEHICLE_TARIFFS[vehicleType] || VEHICLE_TARIFFS['standard_truck'];
    const tariffRate = vehicle.ratePerKm;
    const baseFee = vehicle.baseFee;

    // APMC Route Breakdown (Traditional Mandi Yard)
    const nearestApmcDistance = districtInfo.apmcDistKm || 28;
    const apmcFreightPerQtl = Math.round((baseFee / qty) + (nearestApmcDistance * tariffRate));
    const apmcMandiCessPerQtl = Math.round(benchmarkPrice * 0.0105); // 1.05% APMC market cess + fee
    const apmcHandlingPerQtl = 25; // Loading, weighing (tolnar), hamali
    const holdDays = Math.max(0, Number(storageDays) || 0);
    const apmcStoragePerQtl = Math.round(holdDays * 0.50); // ₹0.50/day warehouse cost

    const apmcTotalDeductionPerQtl = apmcFreightPerQtl + apmcMandiCessPerQtl + apmcHandlingPerQtl + apmcStoragePerQtl;
    const apmcNetRealization = Math.max(0, benchmarkPrice - apmcTotalDeductionPerQtl);
    const apmcTotalInHand = apmcNetRealization * qty;

    // Direct AgriMandi Route Breakdown (Farm-Gate Direct Mill Procurement)
    // ONLY fetch REAL registered verified buyers from database (Zero fake / dummy mills)
    const rawBuyers = await db.getBuyers();
    const buyers = Array.isArray(rawBuyers) ? rawBuyers : [];

    const matchingBuyers = buyers.map(b => {
      const bCoord = (b.lat && b.lng) ? { lat: Number(b.lat), lng: Number(b.lng) } :
        (DISTRICT_COORDS[b.district] || DISTRICT_COORDS['Latur']);
      const distance = haversineDistance(fCoord.lat, fCoord.lng, bCoord.lat, bCoord.lng);
      
      // Farm-gate buyer pays directly: ₹0 APMC cess, ₹0 middleman cut
      const buyerOfferPrice = Math.round(benchmarkPrice - 30);
      const directNetRealization = buyerOfferPrice;
      const directTotalInHand = directNetRealization * qty;
      const extraProfit = directTotalInHand - apmcTotalInHand;

      return {
        id: b.id,
        company_name: b.company_name,
        district: b.district,
        city: b.city || b.district,
        gstin: b.gstin || '',
        rating: b.rating || 5.0,
        distanceKm: distance,
        offeredRate: buyerOfferPrice,
        directNetRealization,
        directTotalInHand,
        extraProfitVsApmc: Math.max(0, extraProfit)
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);

    const recommendedBuyer = matchingBuyers.length > 0 ? matchingBuyers[0] : null;
    const directNetRate = Math.round(benchmarkPrice - 30);
    const directTotalPayout = directNetRate * qty;
    const netExtraEarning = Math.max(0, directTotalPayout - apmcTotalInHand);
    const percentageProfitGain = apmcTotalInHand > 0 ? Number(((netExtraEarning / apmcTotalInHand) * 100).toFixed(1)) : 0;

    res.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      crop,
      quantityQtl: qty,
      farmerDistrict,
      benchmarkMarketPrice: benchmarkPrice,
      vehicleUsed: vehicle.name,
      storageDays: holdDays,
      apmcRoute: {
        marketName: `${farmerDistrict} APMC Yard`,
        distanceKm: nearestApmcDistance,
        stickerPrice: benchmarkPrice,
        freightPerQtl: apmcFreightPerQtl,
        mandiCessPerQtl: apmcMandiCessPerQtl,
        handlingPerQtl: apmcHandlingPerQtl,
        storagePerQtl: apmcStoragePerQtl,
        totalDeductionPerQtl: apmcTotalDeductionPerQtl,
        netInHandPerQtl: apmcNetRealization,
        totalPayout: apmcTotalInHand,
        paymentTimeline: '3 to 7 Days (Cheque/Commission Agent Settlement)'
      },
      directRoute: {
        routeType: 'Farm-Gate / Direct Mill Gate Delivery',
        recommendedBuyer,
        netInHandPerQtl: directNetRate,
        totalPayout: directTotalPayout,
        netExtraEarning,
        percentageProfitGain,
        freightCostPerQtl: 0,
        mandiCessPerQtl: 0,
        handlingCutPerQtl: 0,
        paymentTimeline: 'Instant T+0 Escrow / Direct Bank Transfer',
        matchingBuyers
      }
    });
  } catch (err) {
    console.error('Realization error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
}

// AG-014: Core APMC Market Hubs of Maharashtra
export const CORE_APMC_HUBS = [
  { id: 'apmc-latur', market: 'Latur APMC', district: 'Latur', lat: 18.4088, lng: 76.5604, division: 'Marathwada' },
  { id: 'apmc-lasalgaon', market: 'Lasalgaon APMC', district: 'Nashik', lat: 20.1472, lng: 74.2259, division: 'North Maharashtra' },
  { id: 'apmc-nashik', market: 'Nashik APMC', district: 'Nashik', lat: 19.9975, lng: 73.7898, division: 'North Maharashtra' },
  { id: 'apmc-solapur', market: 'Solapur APMC', district: 'Solapur', lat: 17.6599, lng: 75.9064, division: 'Western Maharashtra' },
  { id: 'apmc-jalna', market: 'Jalna APMC', district: 'Jalna', lat: 19.8410, lng: 75.8864, division: 'Marathwada' },
  { id: 'apmc-akola', market: 'Akola APMC', district: 'Akola', lat: 20.7002, lng: 77.0082, division: 'Vidarbha' },
  { id: 'apmc-pune', market: 'Gultekdi APMC (Pune)', district: 'Pune', lat: 18.5204, lng: 73.8567, division: 'Western Maharashtra' },
  { id: 'apmc-nanded', market: 'Nanded APMC', district: 'Nanded', lat: 19.1383, lng: 77.3210, division: 'Marathwada' },
  { id: 'apmc-ahmednagar', market: 'Ahmednagar APMC', district: 'Ahmednagar', lat: 19.0952, lng: 74.7496, division: 'North Maharashtra' }
];

// AG-014: Multi-Mandi Net Realization Comparison Handler
async function handleCompareMultiMandi(req, res) {
  try {
    const {
      crop = 'Soybean',
      quantityQtl = 50,
      farmerDistrict = 'Latur',
      farmLat,
      farmLng,
      vehicleType = 'standard_truck',
      storageDays = 0,
      expectedPrice
    } = req.body;

    const districtInfo = DISTRICT_COORDS[farmerDistrict] || DISTRICT_COORDS['Latur'];
    const fCoord = (farmLat && farmLng) ? { lat: Number(farmLat), lng: Number(farmLng) } : districtInfo;
    const qty = Math.max(1, Number(quantityQtl) || 50);
    const holdDays = Math.max(0, Number(storageDays) || 0);

    // Normalize crop and lookup benchmark
    const cleanCrop = (crop || '').toLowerCase().trim();
    let baseBenchmark = 4850;
    for (const [key, val] of Object.entries(CROP_BENCHMARKS)) {
      if (cleanCrop.includes(key)) {
        baseBenchmark = val;
        break;
      }
    }
    if (expectedPrice && Number(expectedPrice) > 1000) {
      baseBenchmark = Number(expectedPrice);
    }

    // Vehicle tariff
    const vehicle = VEHICLE_TARIFFS[vehicleType] || VEHICLE_TARIFFS['standard_truck'];
    const tariffRate = vehicle.ratePerKm;
    const baseFee = vehicle.baseFee;

    // Fetch real live prices from mandiService if available
    let liveRecords = [];
    try {
      const liveRes = await mandiService.getLiveRates({ commodity: crop, district: 'all', limit: 80 });
      if (liveRes && liveRes.records) {
        liveRecords = liveRes.records;
      }
    } catch (e) {
      console.warn('⚠️ Could not fetch live rates in compare:', e.message);
    }

    // Evaluate each APMC Hub
    const comparedMandis = CORE_APMC_HUBS.map(hub => {
      // Calculate Haversine great-circle distance + 1.25 road winding factor
      const aerialDist = haversineDistance(fCoord.lat, fCoord.lng, hub.lat, hub.lng);
      // If same district, minimum local distance is 18-25km
      const isSameDistrict = farmerDistrict.toLowerCase() === hub.district.toLowerCase();
      const roadDistKm = isSameDistrict
        ? (districtInfo.apmcDistKm || 20)
        : Math.max(15, Math.round(aerialDist * 1.25));

      // Check if real price exists for this hub
      const match = liveRecords.find(r => 
        (r.market && r.market.toLowerCase().includes(hub.market.toLowerCase().split(' ')[0])) ||
        (r.district && r.district.toLowerCase() === hub.district.toLowerCase())
      );

      // Sticker price from live record or geographic benchmark
      let stickerPrice = match ? Number(match.modal_price) : baseBenchmark;
      // Realistic regional market variance if fallback (e.g. Pune terminal mandi +₹75, Lasalgaon onion +₹90)
      if (!match) {
        if (hub.district === 'Pune') stickerPrice += 75;
        else if (hub.district === 'Nashik' && cleanCrop.includes('onion')) stickerPrice += 90;
        else if (hub.district === 'Latur' && (cleanCrop.includes('soya') || cleanCrop.includes('tur'))) stickerPrice += 40;
        else if (hub.district === 'Akola' && cleanCrop.includes('cotton')) stickerPrice += 60;
      }

      // Cost deductions
      const freightPerQtl = Math.round((baseFee / qty) + (roadDistKm * tariffRate));
      const mandiCessPerQtl = Math.round(stickerPrice * 0.0105); // 1.05% APMC cess
      const handlingPerQtl = 25; // Weighment, tolnar, hamali
      const storagePerQtl = Math.round(holdDays * 0.50); // ₹0.50/day

      const totalDeductionsPerQtl = freightPerQtl + mandiCessPerQtl + handlingPerQtl + storagePerQtl;
      const netInHandPerQtl = Math.max(0, stickerPrice - totalDeductionsPerQtl);
      const totalInHand = netInHandPerQtl * qty;

      return {
        id: hub.id,
        type: 'APMC_MANDI',
        marketName: hub.market,
        district: hub.district,
        division: hub.division,
        distanceKm: roadDistKm,
        stickerPrice,
        isLiveToday: match?.is_live_today || false,
        breakdown: {
          freightPerQtl,
          mandiCessPerQtl,
          handlingPerQtl,
          storagePerQtl,
          totalDeductionsPerQtl
        },
        netInHandPerQtl,
        totalInHand,
        paymentTerms: '3-7 Days (Arhatya Cheque / APMC Bill)'
      };
    });

    // Also include the Direct AgriMandi Farm-Gate Route
    const directPrice = Math.round(baseBenchmark - 30);
    const directTotalInHand = directPrice * qty;
    const directOption = {
      id: 'agrimandi-direct',
      type: 'DIRECT_MILL',
      marketName: 'AgriMandi Direct Farm-Gate Mill',
      district: farmerDistrict,
      division: 'Direct Procurement',
      distanceKm: 0,
      stickerPrice: directPrice,
      isLiveToday: true,
      breakdown: {
        freightPerQtl: 0,
        mandiCessPerQtl: 0,
        handlingPerQtl: 0,
        storagePerQtl: 0,
        totalDeductionsPerQtl: 0
      },
      netInHandPerQtl: directPrice,
      totalInHand: directTotalInHand,
      paymentTerms: 'Instant T+0 Escrow Direct Bank Transfer'
    };

    // Combine all options and sort descending by net in-hand return
    const allOptions = [...comparedMandis, directOption].sort((a, b) => b.netInHandPerQtl - a.netInHandPerQtl);

    // Assign ranking
    allOptions.forEach((opt, idx) => {
      opt.rank = idx + 1;
      opt.isOptimal = (idx === 0);
    });

    const optimalMarket = allOptions[0];

    // Detect "Sticker Price Trap":
    // A distant mandi with higher sticker price than optimalMarket, but giving lower net return!
    let stickerPriceTrap = null;
    const trappedCandidate = allOptions.find(opt => 
      opt.id !== optimalMarket.id && 
      opt.stickerPrice > optimalMarket.stickerPrice && 
      opt.netInHandPerQtl < optimalMarket.netInHandPerQtl
    );

    if (trappedCandidate) {
      const grossDifference = trappedCandidate.stickerPrice - optimalMarket.stickerPrice;
      const netLoss = optimalMarket.netInHandPerQtl - trappedCandidate.netInHandPerQtl;
      const totalLoss = netLoss * qty;

      stickerPriceTrap = {
        trappedMarketName: trappedCandidate.marketName,
        distanceKm: trappedCandidate.distanceKm,
        higherStickerPrice: trappedCandidate.stickerPrice,
        grossDifference,
        freightCostPerQtl: trappedCandidate.breakdown.freightPerQtl,
        netLossPerQtl: netLoss,
        totalLossCash: totalLoss,
        optimalMarketName: optimalMarket.marketName,
        optimalNetInHand: optimalMarket.netInHandPerQtl,
        explanationEn: `Don't be misled by ${trappedCandidate.marketName}'s sticker rate (+₹${grossDifference}/Qtl). After ₹${trappedCandidate.breakdown.freightPerQtl}/Qtl road freight (${trappedCandidate.distanceKm} km), you lose ₹${netLoss}/Qtl (-₹${totalLoss.toLocaleString('en-IN')} total in-hand) compared to ${optimalMarket.marketName}!`,
        explanationMr: `${trappedCandidate.marketName} चा दर्शनी भाव +₹${grossDifference}/क्विंटल जास्त दिसत असला तरी, ${trappedCandidate.distanceKm} किमी अंतराचा वाहतूक खर्च (₹${trappedCandidate.breakdown.freightPerQtl}/क्विंटल) वजा जाता ${optimalMarket.marketName} पेक्षा तुम्हाला ₹${netLoss}/क्विंटल (एकूण ₹${totalLoss.toLocaleString('en-IN')}) कमी मिळतील!`,
        explanationHi: `${trappedCandidate.marketName} का मॉडल भाव +₹${grossDifference}/क्विंटल अधिक दिख रहा है, लेकिन ${trappedCandidate.distanceKm} किमी भाड़ा (₹${trappedCandidate.breakdown.freightPerQtl}/क्विंटल) कटने के बाद ${optimalMarket.marketName} की तुलना में आपको ₹${netLoss}/क्विंटल (कुल ₹${totalLoss.toLocaleString('en-IN')}) का नुकसान होगा!`
      };
    }

    res.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      crop,
      quantityQtl: qty,
      farmerDistrict,
      vehicleUsed: vehicle.name,
      storageDays: holdDays,
      optimalMarket,
      stickerPriceTrap,
      totalMarketsCompared: allOptions.length,
      rankedMarkets: allOptions
    });
  } catch (err) {
    console.error('Multi-mandi compare error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
}

router.post('/discover', handleRealization);
router.post('/calculate', handleRealization);
router.post('/compare', handleCompareMultiMandi);

export default router;
