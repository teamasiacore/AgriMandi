import express from 'express';
import { mandiService } from '../services/mandiService.js';

const router = express.Router();

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

router.get('/history', (req, res) => {
  try {
    const { commodity, market } = req.query;
    const data = mandiService.getHistory(commodity || 'Soyabean', market || 'Latur');
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
