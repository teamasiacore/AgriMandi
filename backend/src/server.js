import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { requestIdMiddleware, structuredLogger, errorHandler } from './middleware/reliability.js';
import { db } from './services/db.js';
import mandiRoutes from './routes/mandiRoutes.js';
import realizationRoutes from './routes/realizationRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import fpoRoutes from './routes/fpoRoutes.js';
import { mandiService } from './services/mandiService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Strict Origin Allowlist (SIH P0 Security)
const ALLOWED_ORIGINS = [
  'https://agrimandi.asiacore.in',
  'https://www.agrimandi.asiacore.in',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.asiacore.in')) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy: Access from origin ' + origin + ' is restricted.'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id', 'request-id']
}));
app.use(express.json());

// Foundation: Unique Request IDs & Structured Safe Logging (AG-005)
app.use(requestIdMiddleware);
app.use(structuredLogger);

// Liveness Health Check (AG-005)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'agrimandi-api',
    platform: 'AgriMandi B2B Agro Engine (Express Local Server)',
    version: '2.1.0',
    uptime_seconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    requestId: req.id
  });
});

// Readiness Check with Live Database Dependency Test (AG-005)
app.get('/api/ready', async (req, res) => {
  const dbStatus = db.getSupabaseStatus();
  const dbStartTime = Date.now();
  let dbHealthy = false;
  let dbLatencyMs = 0;
  let dbError = null;

  try {
    const users = await db.getAllUsers();
    dbLatencyMs = Date.now() - dbStartTime;
    dbHealthy = Array.isArray(users);
  } catch (err) {
    dbLatencyMs = Date.now() - dbStartTime;
    dbError = err.message;
  }

  const isReady = dbHealthy;
  const statusCode = isReady ? 200 : 503;

  res.status(statusCode).json({
    status: isReady ? 'ready' : 'degraded',
    service: 'agrimandi-api',
    checks: {
      database: {
        status: dbHealthy ? 'UP' : 'DOWN',
        latency_ms: dbLatencyMs,
        provider: 'Supabase PostgreSQL 15 Cloud',
        error: dbError || undefined
      },
      storage_type: dbStatus.storageType,
      environment: {
        status: 'UP',
        env: process.env.NODE_ENV || 'development'
      }
    },
    timestamp: new Date().toISOString(),
    requestId: req.id
  });
});

// Route Mounts
app.use('/api/mandi', mandiRoutes);
app.use('/api/realization', realizationRoutes);
app.use('/api', marketRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/fpo', fpoRoutes);

// Canonical Global Error Handler (Section 9 & 11)
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(` AgriMandi REST API Server is LIVE`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(` Health: http://localhost:${PORT}/api/health`);
  console.log(` Readiness: http://localhost:${PORT}/api/ready`);
  console.log(` Live Rates: http://localhost:${PORT}/api/mandi/live`);
  console.log(` Produce Lots: http://localhost:${PORT}/api/lots`);
  console.log(` Verified Buyers: http://localhost:${PORT}/api/buyers`);


  // Start 24x7 Mandi APMC background sync worker
  mandiService.initBackgroundSyncWorker();
});
