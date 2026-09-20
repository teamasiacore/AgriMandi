import { z } from 'zod';

// Environment schema for Backend API
export const apiEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  WEB_URL: z.string().url().default('http://localhost:5173'),
  API_URL: z.string().url().default('http://localhost:4000'),
  DATABASE_URL: z.string().default('postgresql://postgres:password@localhost:5432/agrimandi?schema=public'),
  JWT_SECRET: z.string().default('agrimandi-super-secure-dev-jwt-secret-key-32-chars'),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_KEY: z.string().optional(),
  DATA_GOV_API_KEY: z.string().optional(),
  DATA_GOV_IN_API_KEY: z.string().optional(),
  DATA_GOV_RESOURCE_ID: z.string().default('9ef84268-d588-465a-a308-a864a43d0070'),
});

// Auth validation schemas
export const requestOtpSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number (must be 10 digits starting with 6-9)'),
  role: z.enum(['FARMER', 'FPO_MANAGER', 'BUYER', 'GRADER', 'LOGISTICS_PROVIDER', 'WAREHOUSE_OPERATOR']).default('FARMER'),
  language: z.enum(['mr', 'hi', 'en']).default('mr'),
});

export const verifyOtpSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
  otp: z.string().regex(/^\d{4,6}$/, 'OTP must be 4 to 6 digits'),
});

// Lot creation validation schema
export const createLotSchema = z.object({
  commodityId: z.string().min(1, 'Commodity is required'),
  variety: z.string().optional(),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unit: z.enum(['quintal', 'kg', 'metric_ton']).default('quintal'),
  district: z.string().min(1, 'District is required'),
  taluka: z.string().optional(),
  village: z.string().optional(),
  harvestDate: z.string().datetime().optional(),
  expectedPrice: z.number().positive().optional(),
});

// Net realisation calculator schema
export const netRealisationSchema = z.object({
  grossPricePerUnit: z.number().positive('Gross price must be positive'),
  quantity: z.number().positive('Quantity must be positive'),
  transportCost: z.number().nonnegative().default(0),
  loadingUnloadingCost: z.number().nonnegative().default(0),
  storageCost: z.number().nonnegative().default(0),
  packagingCost: z.number().nonnegative().default(0),
  weighmentCharges: z.number().nonnegative().default(0),
  marketFeeOrCess: z.number().nonnegative().default(0),
  estimatedWeightLossPercentage: z.number().min(0).max(100).default(0),
});
