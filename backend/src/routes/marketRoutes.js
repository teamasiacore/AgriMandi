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
    const { deal_id, transporter_id, driver_name, driver_phone, vehicle_number, agreed_freight } = req.body;
    if (!deal_id || !transporter_id) {
      return res.status(400).json({ status: 'error', message: 'Deal ID and Transporter ID are required.' });
    }

    const updatedDeal = await db.acceptTrip({
      deal_id,
      transporter_id,
      driver_name: driver_name || 'Verified Driver',
      driver_phone: driver_phone || '',
      vehicle_number: vehicle_number || 'MH-24-VEHICLE',
      agreed_freight: Number(agreed_freight) || 0
    });

    res.json({
      status: 'success',
      message: '🚚 Trip accepted! Goods are now IN_TRANSIT. Digital E-Waybill generated.',
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

export default router;
