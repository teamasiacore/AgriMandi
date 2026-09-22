// ==============================================================================
// AgriMandi (कृषीसेतू) — Zod Request Validation Middleware & Common Schemas
// Task: AG-005
// Standard: Canonical Implementation Instruction (Section 9 & 11)
// ==============================================================================

import { z } from 'zod';

/**
 * Validates request body with a Zod schema
 */
export const validateBody = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Validates request query parameters with a Zod schema
 */
export const validateQuery = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.query);
    req.query = parsed;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Validates route parameters with a Zod schema
 */
export const validateParams = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.params);
    req.params = parsed;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Canonical Domain Schemas for Safe Validation
 */
export const commonSchemas = {
  // Mobile numbers: 10 digit Indian cellular
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number'),

  // 6-digit numeric OTP code
  otp: z.string().regex(/^\d{6}$/, 'OTP must be a 6-digit numeric verification code'),

  // OTP Request payload
  sendOtpBody: z.object({
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number'),
    role: z.enum(['FARMER', 'BUYER', 'TRANSPORTER', 'FPO', 'ADMIN']).optional()
  }),

  // Lot creation payload (Section 7.1)
  produceLotBody: z.object({
    farmer_name: z.string().min(2, 'Farmer name is required'),
    farmer_phone: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit contact number required'),
    crop: z.string().min(2, 'Crop name is required'),
    variety: z.string().optional().default('FAQ Standard'),
    quantity_qtl: z.coerce.number().positive('Quantity must be greater than 0 quintals'),
    expected_price_per_qtl: z.coerce.number().positive('Expected price must be greater than 0'),
    moisture_percentage: z.coerce.number().min(0).max(100).optional().default(10.0),
    quality_grade: z.string().optional().default('FAQ (Grade A)'),
    district: z.string().min(2, 'District is required'),
    taluka: z.string().optional(),
    village: z.string().optional(),
    farm_address: z.string().min(3, 'Farm pickup location is required')
  }),

  // Buyer offer bid payload
  offerBody: z.object({
    lot_id: z.string().min(1, 'Target Lot ID is required'),
    offered_price_per_qtl: z.coerce.number().positive('Offered price must be greater than 0'),
    quantity_requested_qtl: z.coerce.number().positive('Requested quantity must be greater than 0'),
    delivery_destination: z.string().min(3, 'Delivery destination facility is required'),
    buyer_name: z.string().optional(),
    buyer_phone: z.string().optional()
  })
};
