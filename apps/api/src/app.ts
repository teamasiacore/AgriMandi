import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { randomUUID } from 'crypto';
import { env } from './config/env.js';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { auditRouter } from './routes/audit.js';
import { marketRouter } from './routes/market.js';
import { ApiErrorResponse } from '@agrimandi/shared-types';

export const createApp = (): Express => {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS configured strictly for authorized origins
  app.use(
    cors({
      origin: [
        env.WEB_URL,
        'https://agrimandi.asiacore.in',
        'https://www.agrimandi.asiacore.in',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    })
  );

  app.use(express.json({ limit: '1mb' }));

  // X-Request-ID middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const requestId = (req.headers['x-request-id'] as string) || randomUUID();
    res.setHeader('X-Request-ID', requestId);
    (req as any).id = requestId;
    next();
  });

  // Health and status routes
  app.use(healthRouter);

  // API v1 routes
  app.use('/api/v1', authRouter);
  app.use('/api/v1', auditRouter);
  app.use('/api/v1', marketRouter);
  app.use('/api', authRouter);
  app.use('/api', auditRouter);
  app.use('/api', marketRouter);

  // Root welcome route
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'AgriMandi API',
      version: '0.1.0',
      status: 'operational',
      docs: '/api/docs',
    });
  });

  // 404 handler
  app.use((req: Request, res: Response<ApiErrorResponse>) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Endpoint ${req.method} ${req.originalUrl} not found`,
        requestId: (req as any).id,
      },
    });
  });

  // Safe global error handler (no stack traces leaked)
  app.use((err: Error, req: Request, res: Response<ApiErrorResponse>, _next: NextFunction) => {
    const requestId = (req as any).id;
    console.error(`[Error] [Request ${requestId}]`, err.message);

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred. Please try again later.',
        requestId,
      },
    });
  });

  return app;
};
