import express from 'express';
import { mandiService } from '../services/mandiService.js';

const router = express.Router();

// 1. Live Mandi Rates with MSP Benchmarks
router.get('/live', async (req, res) => {
  try {
    const { commodity, district, limit } = req.query;
    const data = await mandiService.getLiveRates({
      commodity: commodity || 'all',
      district: district || 'all',
      limit: limit ? Number(limit) : 50
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 2. Canonical Market Reference Prices (AG-009)
router.get('/reference-prices', async (req, res) => {
  try {
    const { commodity, district, limit } = req.query;
    const data = await mandiService.getLiveRates({
      commodity: commodity || 'all',
      district: district || 'all',
      limit: limit ? Number(limit) : 50
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 3. Official Commodity Master with Govt MSP Benchmarks (AG-009)
router.get('/commodities', (req, res) => {
  try {
    const data = mandiService.getCommodities();
    res.json(data);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 4. Official APMC Mandi Master for Maharashtra Core Agricultural Hubs (AG-009)
router.get('/markets', (req, res) => {
  try {
    const data = mandiService.getMarkets();
    res.json(data);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

router.get('/history', async (req, res) => {
  try {
    const { commodity, market, district } = req.query;
    const data = await mandiService.getHistory(commodity || 'Soyabean', market || 'Latur', district || 'all');
    res.json(data);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 5. AG-013: AI Price Forecasting & Mandi Advisory Model (Sell/Hold)
router.get('/advisor', async (req, res) => {
  try {
    const { commodity, market, district } = req.query;
    const data = await mandiService.getAdvisorRecommendation(commodity || 'Soyabean', market || 'Latur', district || 'all');
    res.json(data);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

router.get('/ticker', (req, res) => {
  try {
    const trades = mandiService.getTicker();
    res.json({ status: 'success', trades });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const crops = ['Soyabean', 'Cotton', 'Onion', 'Arhar (Tur/Red Gram)'];
    const summary = [];
    for (const crop of crops) {
      const data = await mandiService.getLiveRates({ commodity: crop, limit: 1 });
      const record = data.records && data.records[0] ? data.records[0] : null;
      if (record) {
        summary.push(record);
      }
    }
    res.json({ status: 'success', summary });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

export default router;
