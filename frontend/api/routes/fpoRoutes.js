import express from 'express';
import { db } from '../services/db.js';

const router = express.Router();

/**
 * GET /api/fpo/profile/:identifier
 * Fetch FPO Profile by phone, user_id, or FPO id
 */
router.get('/profile/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const cleanId = identifier.replace(/\D/g, '') || identifier;
    const profile = await db.getFpoProfile(cleanId);
    if (!profile) {
      return res.status(404).json({ status: 'error', message: 'FPO organization profile not found.' });
    }

    // Get aggregated stats
    const bulkLots = await db.getFpoLots(profile.id || profile.user_id);
    const deals = await db.getFpoDeals(profile.id || profile.user_id);
    const totalPooledQtl = bulkLots.reduce((acc, l) => acc + (Number(l.quantity_qtl) || 0), 0);
    const totalDisbursed = deals
      .filter(d => d.escrow_status === 'SETTLED')
      .reduce((acc, d) => acc + (Number(d.total_deal_value) || 0), 0);

    res.json({
      status: 'success',
      profile: {
        ...profile,
        stats: {
          bulk_lots_count: bulkLots.length,
          active_lots_count: bulkLots.filter(l => l.status === 'LISTED').length,
          total_pooled_qtl: totalPooledQtl,
          deals_count: deals.length,
          total_disbursed: totalDisbursed
        }
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * GET /api/fpo/eligible-lots
 * Smallholder lots in cluster available for aggregation
 */
router.get('/eligible-lots', async (req, res) => {
  try {
    const { district = 'all', crop = 'all' } = req.query;
    const lots = await db.getEligibleSmallholderLots(district, crop);
    res.json({ status: 'success', lots, count: lots.length });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * POST /api/fpo/pool
 * Aggregate multiple member lots into a single high-tonnage institutional truckload lot
 */
router.post('/pool', async (req, res) => {
  try {
    const {
      fpo_id,
      fpo_name,
      fpo_phone,
      crop,
      variety = 'FAQ Standard',
      district = 'Latur',
      taluka = '',
      warehouse_location = '',
      selected_lot_ids = [],
      expected_price_per_qtl,
      bulk_premium_per_qtl = 200,
      member_contributions = []
    } = req.body;

    if (!fpo_id || !fpo_name) {
      return res.status(400).json({ status: 'error', message: 'FPO identification is mandatory.' });
    }

    if (!Array.isArray(selected_lot_ids) || selected_lot_ids.length === 0) {
      return res.status(400).json({ status: 'error', message: 'At least one member lot must be selected for aggregation.' });
    }

    // Fetch individual lots to compute exact totals and weighted averages
    let totalQuantity = 0;
    let weightedMoistureSum = 0;
    const pooledMembers = [];

    for (const lotId of selected_lot_ids) {
      const lot = await db.getLotById(lotId);
      if (lot) {
        const qty = Number(lot.quantity_qtl) || 0;
        const moisture = Number(lot.moisture_percentage) || 10.0;
        totalQuantity += qty;
        weightedMoistureSum += qty * moisture;

        pooledMembers.push({
          lot_id: lot.id,
          farmer_id: lot.farmer_id,
          farmer_name: lot.farmer_name,
          farmer_phone: lot.farmer_phone,
          district: lot.district,
          village: lot.village || lot.farm_address || '',
          quantity_qtl: qty,
          moisture_percentage: moisture,
          quality_grade: lot.quality_grade || 'FAQ (Grade A)'
        });
      }
    }

    // If client supplied extra manual member contributions (e.g. non-digital farmers registered by FPO)
    if (Array.isArray(member_contributions) && member_contributions.length > 0) {
      for (const m of member_contributions) {
        const qty = Number(m.quantity_qtl) || 0;
        const moisture = Number(m.moisture_percentage) || 10.0;
        totalQuantity += qty;
        weightedMoistureSum += qty * moisture;
        pooledMembers.push({
          lot_id: `mem-${Date.now()}-${Math.floor(Math.random()*1000)}`,
          farmer_id: m.farmer_id || `usr-fpo-mem-${Date.now()}`,
          farmer_name: m.farmer_name || 'Member Farmer',
          farmer_phone: m.farmer_phone || fpo_phone,
          saat_bara_number: m.saat_bara_number || '7/12 Member Record',
          district: district,
          village: m.village || taluka || district,
          quantity_qtl: qty,
          moisture_percentage: moisture,
          quality_grade: 'FAQ (Grade A)'
        });
      }
    }

    if (totalQuantity <= 0) {
      return res.status(400).json({ status: 'error', message: 'Total aggregated quantity must be greater than zero.' });
    }

    // Calculate proportional shares
    const finalMembers = pooledMembers.map(m => ({
      ...m,
      share_pct: Number(((m.quantity_qtl / totalQuantity) * 100).toFixed(2))
    }));

    const weightedAvgMoisture = Number((weightedMoistureSum / totalQuantity).toFixed(1));
    const finalPricePerQtl = Number(expected_price_per_qtl) || 4700;

    const bulkLot = await db.createFpoBulkLot({
      fpo_id,
      fpo_name,
      fpo_phone,
      crop: crop || 'Soybean',
      variety,
      quantity_qtl: totalQuantity,
      expected_price_per_qtl: finalPricePerQtl,
      bulk_premium_per_qtl: Number(bulk_premium_per_qtl),
      moisture_percentage: weightedAvgMoisture,
      quality_grade: 'FAQ (Grade A) - FPO Certified Cluster',
      district,
      taluka,
      warehouse_location: warehouse_location || `${taluka || district} FPO Aggregation Center`,
      pooled_members: finalMembers
    }, selected_lot_ids);

    res.status(201).json({
      status: 'success',
      message: `Bulk FPO Lot of ${totalQuantity} Quintals created successfully with ${finalMembers.length} member farmers!`,
      bulkLot
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * GET /api/fpo/bulk-lots
 * List all bulk lots created by this FPO
 */
router.get('/bulk-lots', async (req, res) => {
  try {
    const { fpo_id } = req.query;
    if (!fpo_id) {
      return res.status(400).json({ status: 'error', message: 'fpo_id query parameter is required.' });
    }
    const lots = await db.getFpoLots(fpo_id);
    res.json({ status: 'success', lots, count: lots.length });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * GET /api/fpo/deals
 * List all deals & bids for FPO lots
 */
router.get('/deals', async (req, res) => {
  try {
    const { fpo_id } = req.query;
    if (!fpo_id) {
      return res.status(400).json({ status: 'error', message: 'fpo_id query parameter is required.' });
    }
    const deals = await db.getFpoDeals(fpo_id);
    res.json({ status: 'success', deals, count: deals.length });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * GET /api/fpo/deals/:dealId/payout-split
 * Member farmer transparent contribution & payout breakdown
 */
router.get('/deals/:dealId/payout-split', async (req, res) => {
  try {
    const { dealId } = req.params;
    const payoutData = await db.calculateFpoMemberPayouts(dealId);
    if (!payoutData) {
      return res.status(404).json({ status: 'error', message: 'Deal or payout calculation record not found.' });
    }
    res.json({ status: 'success', payoutData });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

export default router;
