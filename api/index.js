import express from 'express';
import cors from 'cors';
import mandiRoutes from '../backend/src/routes/mandiRoutes.js';
import realizationRoutes from '../backend/src/routes/realizationRoutes.js';
import marketRoutes from '../backend/src/routes/marketRoutes.js';
import authRoutes from '../backend/src/routes/authRoutes.js';
import adminRoutes from '../backend/src/routes/adminRoutes.js';

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());
app.use(express.json());

// 24x7 Cloud Health Check
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

// Mount Routes under both /api/* and root /* for seamless Vercel Serverless rewrite compatibility
app.use('/api/mandi', mandiRoutes);
app.use('/mandi', mandiRoutes);

app.use('/api/realization', realizationRoutes);
app.use('/realization', realizationRoutes);

app.use('/api', marketRoutes);
app.use('/', marketRoutes);

app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ status: 'error', message: err.message || 'Internal Server Error' });
});

export default app;
