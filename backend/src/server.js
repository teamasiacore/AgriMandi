import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mandiRoutes from './routes/mandiRoutes.js';
import realizationRoutes from './routes/realizationRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'AgriMandi B2B Agro Engine',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// Route Mounts
app.use('/api/mandi', mandiRoutes);
app.use('/api/realization', realizationRoutes);
app.use('/api', marketRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ status: 'error', message: err.message || 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`🌾 AgriMandi REST API Server is LIVE`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log(`🏛️ Live Rates: http://localhost:${PORT}/api/mandi/live`);
  console.log(`🚜 Produce Lots: http://localhost:${PORT}/api/lots`);
  console.log(`💼 Verified Buyers: http://localhost:${PORT}/api/buyers`);
  console.log(`=============================================`);
});
