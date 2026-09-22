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
      farm_lng: Number(farm_lng)
    });

    res.status(201).json({ status: 'success', message: 'Produce Lot listed successfully', lot: newLot });
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
