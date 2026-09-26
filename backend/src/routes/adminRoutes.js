import express from 'express';
import { db } from '../services/db.js';
import { signToken, requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// SuperAdmin Credentials from environment with fallback
const SUPERADMIN_USERNAME = process.env.ADMIN_USERNAME || 'ASIACore';
const SUPERADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Satya123';

// 1. SuperAdmin Login
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Username and Password are required.'
      });
    }

    if (username.trim() === SUPERADMIN_USERNAME && password === SUPERADMIN_PASSWORD) {
      const adminUser = {
        id: 'superadmin-01',
        username: SUPERADMIN_USERNAME,
        role: 'SUPERADMIN',
        full_name: 'ASIACore Central Administrator',
        department: 'AgriMandi Verification & Governance Desk'
      };

      const token = signToken({
        id: adminUser.id,
        username: adminUser.username,
        role: adminUser.role,
        name: adminUser.full_name
      });

      return res.json({
        status: 'success',
        message: 'SuperAdmin authentication granted.',
        user: adminUser,
        token
      });
    }

    return res.status(401).json({
      status: 'error',
      message: 'Invalid SuperAdmin credentials. Access denied.'
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Enforce SuperAdmin authentication and role authorization for all remaining admin routes
router.use(requireAuth, requireRole('SUPERADMIN'));

// 2. Platform Statistics & Supabase Status
router.get('/stats', async (req, res) => {
  try {
    const stats = await db.getAdminStats();
    res.json({
      status: 'success',
      stats
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 3. Get All Buyers (including Pending, Verified, and Rejected)
router.get('/buyers', async (req, res) => {
  try {
    const buyers = await db.getAllBuyers();
    res.json({
      status: 'success',
      count: buyers.length,
      buyers
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 4. Verify / Approve Buyer (1-Click SuperAdmin Verification)
router.post('/buyers/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_notes } = req.body;

    const buyer = await db.verifyBuyer(id, true, admin_notes || 'Approved by SuperAdmin ASIACore after GSTIN and APMC License verification.');

    if (!buyer) {
      return res.status(404).json({ status: 'error', message: 'Buyer not found' });
    }

    res.json({
      status: 'success',
      message: `Buyer "${buyer.company_name}" has been successfully VERIFIED!`,
      buyer
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 5. Reject Buyer Application
router.post('/buyers/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const buyer = await db.rejectBuyer(id, reason || 'Documentation mismatch or invalid APMC license number.');

    if (!buyer) {
      return res.status(404).json({ status: 'error', message: 'Buyer not found' });
    }

    res.json({
      status: 'success',
      message: `Buyer "${buyer.company_name}" application has been REJECTED.`,
      buyer
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 5.1 Get All Transporters (Fleet Review)
router.get('/transporters', async (req, res) => {
  try {
    const transporters = await db.getAllTransporters();
    res.json({
      status: 'success',
      count: transporters.length,
      transporters
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 5.2 Verify / Activate Transporter (1-Click SuperAdmin Verification)
router.post('/transporters/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_notes } = req.body;

    const transporter = await db.verifyTransporter(id, true, admin_notes || 'Approved by SuperAdmin ASIACore after vehicle RTO & permit inspection.');

    if (!transporter) {
      return res.status(404).json({ status: 'error', message: 'Transporter not found' });
    }

    res.json({
      status: 'success',
      message: `Transporter vehicle "${transporter.vehicle_number}" has been successfully ACTIVATED for farm-gate bookings!`,
      transporter
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 5.3 Reject Transporter Application
router.post('/transporters/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const transporter = await db.rejectTransporter(id, reason || 'Vehicle documentation or permit mismatch.');

    if (!transporter) {
      return res.status(404).json({ status: 'error', message: 'Transporter not found' });
    }

    res.json({
      status: 'success',
      message: `Transporter "${transporter.vehicle_number}" application has been REJECTED.`,
      transporter
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 6. Get All Farmers with 7/12 Land Records
router.get('/farmers', async (req, res) => {
  try {
    const farmers = await db.getFarmers();
    res.json({
      status: 'success',
      count: farmers.length,
      farmers
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 7. Verify Farmer 7/12 Land Record
router.post('/farmers/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const { verified = true } = req.body;

    const farmer = await db.verifyFarmer(id, verified);

    if (!farmer) {
      return res.status(404).json({ status: 'error', message: 'Farmer not found' });
    }

    res.json({
      status: 'success',
      message: `Farmer "${farmer.name || farmer.full_name}" 7/12 Land Record verification updated.`,
      farmer
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 7.1 Delete Farmer Record (Admin action)
router.delete('/farmers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteUser(id);
    res.json({
      status: 'success',
      message: 'Farmer account deleted successfully.'
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 7.2 Delete Buyer Record (Admin action)
router.delete('/buyers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteUser(id);
    res.json({
      status: 'success',
      message: 'Buyer account deleted successfully.'
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 8. Inspect All Produce Lots
router.get('/lots', async (req, res) => {
  try {
    const lots = await db.getLots();
    res.json({
      status: 'success',
      count: lots.length,
      lots
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 9. Inspect All Executed Deals
router.get('/deals', async (req, res) => {
  try {
    const deals = await db.getDeals();
    res.json({
      status: 'success',
      count: deals.length,
      deals
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 10. Supabase Connectivity & Persistence Status
router.get('/supabase-status', (req, res) => {
  try {
    const status = db.getSupabaseStatus();
    res.json({
      status: 'success',
      supabase: status
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

export default router;
