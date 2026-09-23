import express from 'express';
import { db } from '../services/db.js';

const router = express.Router();

// Get Produce Lots
router.get('/lots', async (req, res) => {
  try {
    const { crop, district, status, farmer_phone, farmer_id } = req.query;
    const lots = await db.getLots({ crop, district, status, farmer_phone, farmer_id });
    res.json({ status: 'success', count: lots.length, lots });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Get Single Lot with its Offers
router.get('/lots/:id', async (req, res) => {
  try {
    const lot = await db.getLotById(req.params.id);
    if (!lot) {
      return res.status(404).json({ status: 'error', message: 'Lot not found' });
    }
    const offers = await db.getOffersByLotId(req.params.id);
    res.json({ status: 'success', lot, offers });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Create New Produce Lot (Farmer)
router.post('/lots', async (req, res) => {
  try {
    const {
      farmer_id = 'usr-farmer-1',
      farmer_name = 'Kisan Mitra',
      farmer_phone = '9822012345',
      crop,
      variety = 'FAQ Standard',
      quantity_qtl,
      expected_price_per_qtl,
      moisture_percentage = 10.0,
      quality_grade = 'FAQ (Grade A)',
      farm_address = 'Farm Gate, Maharashtra',
      district = 'Latur',
      farm_lat = 18.4088,
      farm_lng = 76.5604
    } = req.body;

    if (!crop || !quantity_qtl || !expected_price_per_qtl) {
      return res.status(400).json({
        status: 'error',
        message: 'Crop, quantity (quintals), and expected price are mandatory.'
      });
    }

    const newLot = await db.createLot({
      farmer_id,
      farmer_name,
      farmer_phone,
      crop,
      variety,
      quantity_qtl: Number(quantity_qtl),
      expected_price_per_qtl: Number(expected_price_per_qtl),
      moisture_percentage: Number(moisture_percentage),
      quality_grade,
      farm_address,
      district,
      farm_lat: Number(farm_lat),
      farm_lng: Number(farm_lng),
      status: req.body.status || 'LISTED'
    });

    res.status(201).json({ status: 'success', message: 'Produce Lot created successfully', lot: newLot });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Update / Edit Lot (Farmer)
router.put('/lots/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const lot = await db.getLotById(id);
    if (!lot) {
      return res.status(404).json({ status: 'error', message: 'Lot not found' });
    }
    if (lot.status === 'DEAL_LOCKED') {
      return res.status(400).json({ status: 'error', message: 'Cannot edit lot after deal is locked in contract.' });
    }
    const updated = await db.updateLot(id, req.body);
    res.json({ status: 'success', message: 'Lot updated successfully', lot: updated });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Publish Draft Lot to Marketplace (Farmer)
router.post('/lots/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const lot = await db.getLotById(id);
    if (!lot) {
      return res.status(404).json({ status: 'error', message: 'Lot not found' });
    }
    const published = await db.publishLot(id);
    res.json({ status: 'success', message: 'Lot published to marketplace successfully', lot: published });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Cancel Active Lot (Farmer)
router.post('/lots/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Cancelled by farmer' } = req.body;
    const lot = await db.getLotById(id);
    if (!lot) {
      return res.status(404).json({ status: 'error', message: 'Lot not found' });
    }
    if (lot.status === 'DEAL_LOCKED') {
      return res.status(400).json({ status: 'error', message: 'Cannot cancel lot with locked escrow contract.' });
    }
    const cancelled = await db.cancelLot(id, reason);
    res.json({ status: 'success', message: 'Lot cancelled successfully', lot: cancelled });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Delete Draft Lot (Farmer)
router.delete('/lots/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const lot = await db.getLotById(id);
    if (!lot) {
      return res.status(404).json({ status: 'error', message: 'Lot not found' });
    }
    if (lot.status === 'DEAL_LOCKED') {
      return res.status(400).json({ status: 'error', message: 'Cannot delete lot with active contract.' });
    }
    await db.deleteLot(id);
    res.json({ status: 'success', message: 'Lot deleted successfully', id });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Get Offers
router.get('/offers', async (req, res) => {
  try {
    const { lot_id, buyer_id, buyer_phone, status } = req.query;
    const offers = await db.getOffers({ lot_id, buyer_id, buyer_phone, status });
    res.json({ status: 'success', count: offers.length, offers });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Place Digital Offer / Bid (Buyer)
router.post('/offers', async (req, res) => {
  try {
    const {
      lot_id,
      buyer_id = 'usr-buyer-1',
      buyer_name = 'Verified Buyer',
      buyer_phone = '+91 98220 54321',
      offered_price_per_qtl,
      quantity_requested_qtl,
      delivery_destination = 'Buyer Processing Facility',
      valid_hours = 24
    } = req.body;

    if (!lot_id || !offered_price_per_qtl || !quantity_requested_qtl) {
      return res.status(400).json({
        status: 'error',
        message: 'Lot ID, offered price, and requested quantity are required.'
      });
    }

    const lot = await db.getLotById(lot_id);
    if (!lot) {
      return res.status(404).json({ status: 'error', message: 'Target Produce Lot not found.' });
    }

    if (lot.status === 'DEAL_LOCKED') {
      return res.status(400).json({ status: 'error', message: 'This lot is already locked into a deal.' });
    }

    // AG-007 Verification Guard: Check buyer verification status before placing binding offer
    const buyerProfile = await db.getBuyerProfile(buyer_id) || await db.getBuyerProfile(buyer_phone);
    if (buyerProfile && !buyerProfile.is_verified && buyerProfile.status !== 'VERIFIED') {
      return res.status(403).json({
        status: 'error',
        code: 'BUYER_NOT_VERIFIED',
        message: 'Your commercial buyer account is under review. Live counter-bidding unlocks once your GSTIN and APMC license are verified by ASIACore Administration.'
      });
    }

    const newOffer = await db.createOffer({
      lot_id,
      buyer_id,
      buyer_name,
      buyer_phone,
      offered_price_per_qtl: Number(offered_price_per_qtl),
      quantity_requested_qtl: Number(quantity_requested_qtl),
      delivery_destination,
      valid_hours: Number(valid_hours)
    });

    res.status(201).json({ status: 'success', message: 'Digital offer submitted successfully', offer: newOffer });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Accept Offer (Farmer locks deal)
router.post('/offers/:id/accept', async (req, res) => {
  try {
    const result = await db.acceptOffer(req.params.id);
    if (!result) {
      return res.status(404).json({ status: 'error', message: 'Offer not found or already closed.' });
    }
    res.json({
      status: 'success',
      message: '🎉 Deal locked successfully! Escrow contract generated.',
      deal: result.deal,
      lot: result.lot,
      offer: result.offer
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Counter-Offer (Farmer proposes counter price)
router.post('/offers/:id/counter', async (req, res) => {
  try {
    const { id } = req.params;
    const { counter_price_per_qtl, counter_notes, actor_id } = req.body;
    if (!counter_price_per_qtl || Number(counter_price_per_qtl) <= 0) {
      return res.status(400).json({ status: 'error', message: 'Valid counter price per quintal is required.' });
    }
    const updated = await db.counterOffer(id, { counter_price_per_qtl, counter_notes, actor_id });
    res.json({
      status: 'success',
      message: 'Counter offer proposed to buyer successfully',
      offer: updated
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Accept Counter-Offer (Buyer agrees to farmer's counter rate)
router.post('/offers/:id/accept-counter', async (req, res) => {
  try {
    const { id } = req.params;
    const { actor_id } = req.body;
    const result = await db.acceptCounterOffer(id, { actor_id });
    res.json({
      status: 'success',
      message: '🎉 Counter offer accepted! Deal locked and contract generated.',
      deal: result.deal,
      lot: result.lot,
      offer: result.offer
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Reject Offer (Farmer declines offer)
router.post('/offers/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, actor_id } = req.body;
    const updated = await db.rejectOffer(id, { reason, actor_id });
    res.json({
      status: 'success',
      message: 'Offer rejected',
      offer: updated
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Withdraw Offer (Buyer cancels pending bid)
router.post('/offers/:id/withdraw', async (req, res) => {
  try {
    const { id } = req.params;
    const { actor_id } = req.body;
    const updated = await db.withdrawOffer(id, { actor_id });
    res.json({
      status: 'success',
      message: 'Offer withdrawn successfully',
      offer: updated
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Get Verified Buyers
router.get('/buyers', async (req, res) => {
  try {
    const buyers = await db.getBuyers();
    res.json({ status: 'success', count: buyers.length, buyers });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Get Executed Deals
router.get('/deals', async (req, res) => {
  try {
    const { buyer_id, farmer_phone, lot_id } = req.query;
    const deals = await db.getDeals({ buyer_id, farmer_phone, lot_id });
    res.json({ status: 'success', count: deals.length, deals });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Get Single Deal Details
router.get('/deals/:id', async (req, res) => {
  try {
    const deal = await db.getDealById(req.params.id);
    if (!deal) {
      return res.status(404).json({ status: 'error', message: 'Deal not found' });
    }
    res.json({ status: 'success', deal });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// AG-012: Generate / Retrieve Digital Farm-Gate Trade Contract & Waybill
router.get('/deals/:id/contract', async (req, res) => {
  try {
    const contract = await db.getDealContract(req.params.id);
    res.json({
      status: 'success',
      contract
    });
  } catch (err) {
    res.status(err.message === 'Deal not found' ? 404 : 500).json({
      status: 'error',
      message: err.message
    });
  }
});

// AG-012: Lock Escrow Funds for Deal Contract
router.post('/deals/:id/escrow/lock', async (req, res) => {
  try {
    const { buyer_id, escrow_amount, payment_method, actor_id } = req.body;
    const result = await db.lockEscrowFunds(req.params.id, {
      buyer_id,
      escrow_amount,
      payment_method,
      actor_id
    });
    res.json({
      status: 'success',
      message: '100% Deal funds securely locked in AgriMandi Escrow Vault',
      escrow: result
    });
  } catch (err) {
    res.status(err.message === 'Deal not found' ? 404 : 500).json({
      status: 'error',
      message: err.message
    });
  }
});

// AG-012: Get Live Escrow Status
router.get('/deals/:id/escrow', async (req, res) => {
  try {
    const escrow = await db.getEscrowStatus(req.params.id);
    res.json({
      status: 'success',
      escrow
    });
  } catch (err) {
    res.status(err.message === 'Deal not found' ? 404 : 500).json({
      status: 'error',
      message: err.message
    });
  }
});

// ===================== TRANSPORTERS (LOGISTICS) =====================

// Get Registered Transporters
router.get('/transporters', async (req, res) => {
  try {
    const { district, available } = req.query;
    const transporters = await db.getTransporters({ district, available });
    res.json({ status: 'success', count: transporters.length, transporters });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Get Available Farm-Gate Trip Requests (Deals awaiting transit)
router.get('/transporters/available-trips', async (req, res) => {
  try {
    const { district } = req.query;
    const allDeals = await db.getDeals();
    // Filter deals that are either PENDING_PICKUP or don't have a transporter assigned yet
    let availableTrips = allDeals.filter(d => 
      !d.transporter_id || d.delivery_status === 'PENDING_PICKUP'
    );
    if (district && district !== 'all') {
      availableTrips = availableTrips.filter(d => 
        (d.district && d.district.toLowerCase() === district.toLowerCase()) ||
        (d.farm_address && d.farm_address.toLowerCase().includes(district.toLowerCase()))
      );
    }
    res.json({ status: 'success', count: availableTrips.length, trips: availableTrips });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Get Single Transporter Profile
router.get('/transporters/:id', async (req, res) => {
  try {
    const transporter = await db.getTransporterById(req.params.id);
    if (!transporter) {
      return res.status(404).json({ status: 'error', message: 'Transporter profile not found.' });
    }
    const trips = await db.getTransporterTrips(transporter.id);
    res.json({ status: 'success', transporter, trips });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Update Duty Availability (🟢 On-Duty vs 🔴 Off-Duty)
router.patch('/transporters/:id/status', async (req, res) => {
  try {
    const { is_available } = req.body;
    const updated = await db.updateTransporterStatus(req.params.id, Boolean(is_available));
    res.json({ 
      status: 'success', 
      message: `Duty status updated to ${is_available ? 'Available (On-Duty)' : 'Offline (Off-Duty)'}.`,
      transporter: updated 
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Transporter Accepts Farm-Gate Trip
router.post('/transporters/accept-trip', async (req, res) => {
  try {
    const { deal_id, transporter_id, driver_name, driver_phone, vehicle_number, agreed_freight, vehicle_type } = req.body;
    if (!deal_id || !transporter_id) {
      return res.status(400).json({ status: 'error', message: 'Deal ID and Transporter ID are required.' });
    }

    // AG-008 Transporter Verification Guard
    const tpProfile = await db.getTransporterById(transporter_id) || (driver_phone ? await db.getTransporterByPhone(driver_phone) : null);
    if (tpProfile && !tpProfile.is_verified && tpProfile.status !== 'ACTIVE_FOR_BOOKINGS') {
      return res.status(403).json({
        status: 'error',
        code: 'TRANSPORTER_NOT_VERIFIED',
        message: 'Your vehicle profile is under administrative review. Farm-gate trip acceptance activates once RTO vehicle permit is verified by ASIACore Administration.'
      });
    }

    const updatedDeal = await db.acceptTrip({
      deal_id,
      transporter_id,
      driver_name: driver_name || 'Verified Driver',
      driver_phone: driver_phone || '',
      vehicle_number: vehicle_number || 'MH-24-VEHICLE',
      vehicle_type: vehicle_type || 'Bolero Maxi Truck (1.5 MT)',
      agreed_freight: Number(agreed_freight) || 0
    });

    res.json({
      status: 'success',
      message: '🚚 Trip accepted! Vehicle DISPATCHED for farm-gate pickup. Digital E-Waybill generated.',
      deal: updatedDeal
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Buyer or Farmer Dispatches / Assigns a Transporter to a Locked Deal
router.post('/transporters/dispatch-deal', async (req, res) => {
  try {
    const { deal_id, transporter_id, driver_name, driver_phone, vehicle_number, freight_amount, vehicle_type } = req.body;
    if (!deal_id || !transporter_id) {
      return res.status(400).json({ status: 'error', message: 'Deal ID and Transporter ID are required.' });
    }

    const updatedDeal = await db.assignTransporterToDeal({
      deal_id,
      transporter_id,
      driver_name: driver_name || 'Verified Driver',
      driver_phone: driver_phone || '',
      vehicle_number: vehicle_number || 'MH-24-VEHICLE',
      vehicle_type: vehicle_type || 'Bolero Maxi Truck (1.5 MT)',
      freight_amount: Number(freight_amount) || 0
    });

    res.json({
      status: 'success',
      message: `🚚 Transporter ${driver_name || vehicle_number} dispatched successfully!`,
      deal: updatedDeal
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Alias /dispatch-deal for backward compatibility
router.post('/dispatch-deal', async (req, res, next) => {
  try {
    const { deal_id, transporter_id, driver_name, driver_phone, vehicle_number, freight_amount, vehicle_type } = req.body;
    if (!deal_id || !transporter_id) {
      return res.status(400).json({ status: 'error', message: 'Deal ID and Transporter ID are required.' });
    }

    const updatedDeal = await db.assignTransporterToDeal({
      deal_id,
      transporter_id,
      driver_name: driver_name || 'Verified Driver',
      driver_phone: driver_phone || '',
      vehicle_number: vehicle_number || 'MH-24-VEHICLE',
      vehicle_type: vehicle_type || 'Bolero Maxi Truck (1.5 MT)',
      freight_amount: Number(freight_amount) || 0
    });

    res.json({
      status: 'success',
      message: `🚚 Transporter ${driver_name || vehicle_number} dispatched successfully!`,
      deal: updatedDeal
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ===================== HAVERSINE FREIGHT QUOTATION ENGINE (AG-016) =====================
const LOGISTICS_DISTRICT_COORDS = {
  'Latur': { lat: 18.4088, lng: 76.5604 },
  'Solapur': { lat: 17.6599, lng: 75.9064 },
  'Jalna': { lat: 19.8410, lng: 75.8863 },
  'Nashik': { lat: 20.0059, lng: 73.7898 },
  'Akola': { lat: 20.7002, lng: 77.0082 },
  'Pune': { lat: 18.5204, lng: 73.8567 },
  'Nanded': { lat: 19.1383, lng: 77.3210 },
  'Nagpur': { lat: 21.1458, lng: 79.0882 },
  'Ahmednagar': { lat: 19.0952, lng: 74.7496 },
  'Yavatmal': { lat: 20.3888, lng: 78.1204 },
  'Amravati': { lat: 20.9374, lng: 77.7796 },
  'Kolhapur': { lat: 16.7050, lng: 74.2433 },
  'Chhatrapati Sambhajinagar': { lat: 19.8762, lng: 75.3433 },
  'Aurangabad': { lat: 19.8762, lng: 75.3433 },
  'Beed': { lat: 18.9894, lng: 75.7601 },
  'Parbhani': { lat: 19.2686, lng: 76.7708 },
  'Hingoli': { lat: 19.7196, lng: 77.1478 },
  'Washim': { lat: 20.1110, lng: 77.1352 },
  'Buldhana': { lat: 20.5312, lng: 76.1843 },
  'Wardha': { lat: 20.7453, lng: 78.6022 }
};

const LOGISTICS_VEHICLE_SPECS = {
  'Bolero Maxi Truck (1.5 MT)': { capacity_mt: 2.0, per_km_rate: 16.00, base_fee: 500, max_qtl: 20 },
  'Eicher Pro Medium (5 MT)': { capacity_mt: 5.0, per_km_rate: 24.00, base_fee: 800, max_qtl: 55 },
  '10-Tyre Heavy Truck (16 MT)': { capacity_mt: 16.0, per_km_rate: 36.00, base_fee: 1200, max_qtl: 160 },
  'Multi-Axle Trailer (25 MT)': { capacity_mt: 25.0, per_km_rate: 48.00, base_fee: 1500, max_qtl: 260 }
};

function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
}

/**
 * POST /api/transporters/calculate-freight
 * AG-016: Grounded Dynamic Haversine Freight Engine
 */
router.post('/transporters/calculate-freight', async (req, res) => {
  try {
    const {
      origin_district = 'Latur',
      destination_district = 'Latur',
      origin_lat,
      origin_lng,
      destination_lat,
      destination_lng,
      quantity_qtl = 50,
      vehicle_type
    } = req.body;

    const origCoord = LOGISTICS_DISTRICT_COORDS[origin_district] || LOGISTICS_DISTRICT_COORDS['Latur'];
    const destCoord = LOGISTICS_DISTRICT_COORDS[destination_district] || origCoord;

    const lat1 = Number(origin_lat) || origCoord.lat;
    const lon1 = Number(origin_lng) || origCoord.lng;
    const lat2 = Number(destination_lat) || destCoord.lat;
    const lon2 = Number(destination_lng) || destCoord.lng;

    const straightDist = calculateHaversineDistanceKm(lat1, lon1, lat2, lon2);
    // 1.25x road winding factor; minimum local district haul is 25 km
    const roadDistKm = Math.max(25, Math.round((straightDist || 20) * 1.25));
    const qty = Math.max(1, Number(quantity_qtl) || 50);

    const vehicleQuotes = Object.entries(LOGISTICS_VEHICLE_SPECS).map(([vName, spec]) => {
      const distanceCharge = Math.round(roadDistKm * spec.per_km_rate);
      const totalFreight = spec.base_fee + distanceCharge;
      const perQtl = Number((totalFreight / qty).toFixed(1));
      const isCapacityFit = qty <= spec.max_qtl;

      return {
        vehicle_type: vName,
        capacity_mt: spec.capacity_mt,
        max_qtl: spec.max_qtl,
        per_km_rate: spec.per_km_rate,
        base_fee: spec.base_fee,
        distance_km: roadDistKm,
        distance_charge: distanceCharge,
        total_freight: totalFreight,
        per_qtl_freight: perQtl,
        is_capacity_fit: isCapacityFit
      };
    });

    const recommended = vehicleQuotes.find(v => v.is_capacity_fit) || vehicleQuotes[vehicleQuotes.length - 1];
    const selectedQuote = vehicle_type 
      ? (vehicleQuotes.find(v => v.vehicle_type.toLowerCase() === vehicle_type.toLowerCase()) || recommended)
      : recommended;

    res.json({
      status: 'success',
      origin_district,
      destination_district,
      straight_distance_km: straightDist,
      road_distance_km: roadDistKm,
      road_winding_factor: 1.25,
      quantity_qtl: qty,
      recommended_vehicle: recommended.vehicle_type,
      selected_quote: selectedQuote,
      vehicle_quotes: vehicleQuotes
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Advance Trip Milestone (DISPATCHED ➔ AT_FARM_GATE ➔ IN_TRANSIT ➔ DELIVERED)
router.patch('/transporters/trips/:dealId/milestone', async (req, res) => {
  try {
    const { milestone, notes, weighment_data } = req.body;
    const validMilestones = ['PENDING_PICKUP', 'DISPATCHED', 'AT_FARM_GATE', 'IN_TRANSIT', 'DELIVERED'];
    if (!milestone || !validMilestones.includes(milestone)) {
      return res.status(400).json({ 
        status: 'error', 
        message: `Invalid milestone. Must be one of: ${validMilestones.join(', ')}` 
      });
    }

    const updatedDeal = await db.updateTripMilestone({
      deal_id: req.params.dealId,
      milestone,
      notes,
      weighment_data
    });

    res.json({
      status: 'success',
      message: `Trip milestone updated to ${milestone}.`,
      deal: updatedDeal
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Get Trips Assigned to a Specific Transporter
router.get('/transporters/:id/trips', async (req, res) => {
  try {
    const trips = await db.getTransporterTrips(req.params.id);
    res.json({ status: 'success', count: trips.length, trips });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Record Mill Gate Weighment & Certified Quality Assay
router.post('/deals/:dealId/weighment-assay', async (req, res) => {
  try {
    const { dealId } = req.params;
    const {
      operator_name,
      gross_kg,
      tare_kg,
      moisture_tested,
      foreign_matter,
      damage_percentage,
      quality_grade,
      notes
    } = req.body;

    if (!gross_kg || !tare_kg) {
      return res.status(400).json({
        status: 'error',
        message: 'Gross weight and Tare weight are required.'
      });
    }

    if (Number(gross_kg) <= Number(tare_kg)) {
      return res.status(400).json({
        status: 'error',
        message: 'Gross weight must be strictly greater than Tare weight.'
      });
    }

    const result = await db.recordGateWeighmentAndAssay({
      deal_id: dealId,
      operator_name,
      gross_kg,
      tare_kg,
      moisture_tested,
      foreign_matter,
      damage_percentage,
      quality_grade,
      notes
    });

    res.json({
      status: 'success',
      message: `⚖️ Gate weighment and quality assay certified successfully! Slip: ${result.weighment.slip_no}`,
      deal: result.deal,
      weighment: result.weighment
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Get Certified Weighment & Assay Slip for a Deal
router.get('/deals/:dealId/weighment-assay', async (req, res) => {
  try {
    const weighment = await db.getWeighmentAssay(req.params.dealId);
    if (!weighment) {
      return res.status(404).json({ status: 'error', message: 'Weighment slip not found for this deal.' });
    }
    res.json({ status: 'success', weighment });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Settle Deal Escrow and Release Payout to Farmer
router.post('/deals/:dealId/settle', async (req, res) => {
  try {
    const { dealId } = req.params;
    const { authorized_by, payment_mode } = req.body;

    const result = await db.settleDealEscrow({
      deal_id: dealId,
      authorized_by,
      payment_mode
    });

    res.json({
      status: 'success',
      message: `💸 Escrow payout of ₹${Number(result.deal.total_deal_value).toLocaleString('en-IN')} released to ${result.deal.farmer_name || 'Farmer'} successfully! Bank UTR: ${result.settlement.settlement_utr}`,
      deal: result.deal,
      settlement: result.settlement
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Get Printable B2B Tax Invoice & Settlement Receipt for a Deal
router.get('/deals/:dealId/settlement-invoice', async (req, res) => {
  try {
    const invoice = await db.getSettlementInvoice(req.params.dealId);
    if (!invoice) {
      return res.status(404).json({ status: 'error', message: 'Settlement tax invoice not found for this deal.' });
    }
    res.json({ status: 'success', invoice });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

export default router;
