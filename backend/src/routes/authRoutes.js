import express from 'express';
import { db } from '../services/db.js';

const router = express.Router();

// Register New User (Farmer or Buyer)
router.post('/register', async (req, res) => {
  try {
    const { 
      phone, 
      role = 'FARMER', 
      name, 
      district = 'Latur', 
      village = '', 
      // Farmer specific fields
      land_size_acres = '',
      saat_bara_number = '',
      crops = ['Soybean'],
      bank_ifsc = '',
      // Buyer specific fields
      company_name = '',
      representative_name = '',
      gstin = '',
      pan = '',
      license_type = '',
      license_number = '',
      daily_capacity_mt = '',
      address = ''
    } = req.body;

    if (!phone || (!name && !company_name)) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Phone number and Name/Company Name are mandatory.' 
      });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({
        status: 'error',
        message: 'Please enter a valid 10-digit mobile number.'
      });
    }

    // Guard: Prevent duplicate registration
    const existingUser = await db.getUserByPhone(cleanPhone);
    if (existingUser) {
      const existingRole = existingUser.role === 'BUYER' ? 'Buyer' : 'Farmer';
      return res.status(409).json({
        status: 'error',
        code: 'ALREADY_REGISTERED',
        message: `Mobile number +91 ${cleanPhone} is already registered as a ${existingRole}. Please sign in directly.`
      });
    }

    const isFarmer = role.toUpperCase() === 'FARMER';

    let user;
    let buyerProfile = null;

    if (isFarmer) {
      const hasSaatBara = Boolean(saat_bara_number && saat_bara_number.trim().length > 0);
      user = await db.createUser({
        phone: cleanPhone,
        role: 'FARMER',
        name: name.trim(),
        district,
        village: village.trim(),
        land_size_acres: land_size_acres ? Number(land_size_acres) : null,
        saat_bara_number: saat_bara_number.trim(),
        crops: Array.isArray(crops) ? crops : [crops],
        bank_ifsc: bank_ifsc.trim(),
        is_verified: hasSaatBara, // Instant priority badge if 7/12 number supplied
        status: 'ACTIVE'
      });
    } else {
      // Buyer Registration
      if (!gstin || !company_name) {
        return res.status(400).json({
          status: 'error',
          message: 'Company Name and GSTIN are required for Institutional Buyer registration.'
        });
      }

      user = await db.createUser({
        phone: cleanPhone,
        role: 'BUYER',
        name: representative_name ? representative_name.trim() : (name || company_name).trim(),
        company_name: company_name.trim(),
        gstin: gstin.toUpperCase().trim(),
        pan: (pan || gstin.substring(2, 12)).toUpperCase().trim(),
        license_type: license_type.trim(),
        license_number: license_number.trim(),
        daily_capacity_mt: daily_capacity_mt ? Number(daily_capacity_mt) : 0,
        address: address.trim(),
        district,
        target_crops: Array.isArray(crops) ? crops : [crops],
        status: 'PENDING_VERIFICATION', // Strict SuperAdmin approval required
        is_verified: false
      });

      buyerProfile = await db.createBuyerProfile({
        user_id: user.id,
        company_name: company_name.trim(),
        legal_name: company_name.trim(),
        representative_name: user.name,
        phone: cleanPhone,
        gstin: gstin.toUpperCase().trim(),
        pan: user.pan,
        license_type: license_type.trim() || 'APMC Direct Purchase License',
        license_number: license_number.trim() || 'Pending Document Verification',
        daily_capacity_mt: user.daily_capacity_mt,
        address: address.trim(),
        district,
        city: `${district} Industrial Area`,
        target_crops: user.target_crops,
        status: 'PENDING_VERIFICATION',
        is_verified: false
      });
    }

    res.status(201).json({
      status: 'success',
      message: isFarmer
        ? 'Farmer account registered successfully!'
        : 'Buyer application submitted! Verification by SuperAdmin (ASIACore) is currently underway.',
      user,
      buyerProfile,
      token: `token-${user.id}-${Date.now()}`
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { phone, otp = '123456', role } = req.body;
    if (!phone) {
      return res.status(400).json({ status: 'error', message: 'Phone number is required.' });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    let user = await db.getUserByPhone(cleanPhone);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        code: 'NOT_REGISTERED',
        message: `Mobile number +91 ${cleanPhone} is not registered yet. Please click Register to create your account first.`
      });
    }

    // Role check: Ensure user is logging in under their registered role
    if (role && user.role && user.role.toUpperCase() !== role.toUpperCase()) {
      const registeredAs = user.role.toUpperCase() === 'BUYER' ? 'Buyer' : 'Farmer';
      const attemptedAs = role.toUpperCase() === 'BUYER' ? 'Buyer' : 'Farmer';
      return res.status(400).json({
        status: 'error',
        code: 'ROLE_MISMATCH',
        message: `This mobile number is registered as a ${registeredAs}, not as a ${attemptedAs}. Please select the "${registeredAs}" option to sign in.`
      });
    }

    // Demo OTP validation
    if (otp && otp.trim() !== '123456') {
      return res.status(401).json({
        status: 'error',
        code: 'INVALID_OTP',
        message: 'Invalid 6-digit OTP code. Please enter the verification code (123456).'
      });
    }

    // Attach buyer profile if buyer
    let buyerProfile = null;
    if (user.role === 'BUYER') {
      const allBuyers = await db.getAllBuyers();
      buyerProfile = allBuyers.find(b => b.phone === cleanPhone || b.user_id === user.id);
    }

    res.json({
      status: 'success',
      message: 'Login successful!',
      user,
      buyerProfile,
      token: `token-${user.id}-${Date.now()}`
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

export default router;

