import express from 'express';
import cors from 'cors';
import { requestIdMiddleware, structuredLogger, errorHandler } from './middleware/reliability.js';
import { db } from './services/db.js';
import mandiRoutes from './routes/mandiRoutes.js';
import realizationRoutes from './routes/realizationRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import fpoRoutes from './routes/fpoRoutes.js';

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id', 'request-id']
}));
app.options('*', cors());
app.use(express.json());

// Foundation: Unique Request IDs & Structured Safe Logging (AG-005)
app.use(requestIdMiddleware);
app.use(structuredLogger);

// Liveness Health Check (AG-005)
const handleHealth = (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'agrimandi-api',
    platform: 'AgriMandi B2B Agro Engine (24/7 Vercel Cloud Serverless)',
    version: '2.1.0',
    uptime_seconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    requestId: req.id
  });
};

app.get('/api/health', handleHealth);
app.get('/health', handleHealth);

// Readiness Check with Live Database Dependency Test (AG-005)
const handleReady = async (req, res) => {
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
    service: 'agrimandi-serverless-api',
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
        env: process.env.NODE_ENV || 'production'
      }
    },
    timestamp: new Date().toISOString(),
    requestId: req.id
  });
};

app.get('/api/ready', handleReady);
app.get('/ready', handleReady);

// Mount Routes under both /api/* and root /* for seamless Vercel Serverless rewrite compatibility
app.use('/api/mandi', mandiRoutes);
app.use('/mandi', mandiRoutes);

app.use('/api/realization', realizationRoutes);
app.use('/realization', realizationRoutes);

app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.use('/api/fpo', fpoRoutes);
app.use('/fpo', fpoRoutes);

app.use('/api', marketRoutes);
app.use('/', marketRoutes);

// Canonical Global Error Handler (Section 9 & 11)
app.use(errorHandler);

export default app;
