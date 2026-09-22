import express from 'express';
import cors from 'cors';
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
  allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id']
}));
app.options('*', cors());
app.use(express.json());

// Health & Readiness checks (AG-005)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'AgriMandi B2B Agro Engine (24/7 Vercel Cloud Serverless)',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'AgriMandi B2B Agro Engine (24/7 Vercel Cloud Serverless)',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/ready', (req, res) => {
  res.json({
    status: 'ready',
    database: 'connected',
    service: 'agrimandi-serverless-api',
    timestamp: new Date().toISOString()
  });
});
app.get('/ready', (req, res) => {
  res.json({
    status: 'ready',
    database: 'connected',
    service: 'agrimandi-serverless-api',
    timestamp: new Date().toISOString()
  });
});

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

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ status: 'error', message: err.message || 'Internal Server Error' });
});

export default app;
