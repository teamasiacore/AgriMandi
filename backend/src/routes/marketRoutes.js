import express from 'express';
import { db } from '../services/db.js';

const router = express.Router();

// Get Produce Lots
router.get('/lots', async (req, res) => {
  try {
    const { crop, district, status } = req.query;
    const lots = await db.getLots({ crop, district, status });
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
    const { lot_id, buyer_id } = req.query;
    let offers = [];
    if (lot_id) {
      offers = await db.getOffersByLotId(lot_id);
    } else if (buyer_id) {
      offers = await db.getOffersByBuyerId(buyer_id);
    } else {
      offers = await db.getAllOffers();
    }
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
    const deals = await db.getDeals();
    res.json({ status: 'success', count: deals.length, deals });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

export default router;
