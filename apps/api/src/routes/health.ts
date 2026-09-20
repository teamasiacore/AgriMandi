import { Router, Request, Response } from 'express';
import { ApiResponse, HealthCheckResponse } from '@agrimandi/shared-types';

export const healthRouter: Router = Router();

const startTime = Date.now();

healthRouter.get('/health', (_req: Request, res: Response<ApiResponse<HealthCheckResponse>>) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    },
  });
});

healthRouter.get('/db-check', async (_req: Request, res: Response) => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || 'https://lqoychozoysmxibhcmuf.supabase.co';
    const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || '';

    const response = await fetch(`${supabaseUrl}/rest/v1/users?select=count`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    if (response.ok) {
      return res.status(200).json({
        success: true,
        message: '✅ Fresh Supabase project (lqoychozoysmxibhcmuf) connected and verified!',
        status: 'DATABASE_ONLINE',
        projectUrl: supabaseUrl,
      });
    } else {
      const errText = await response.text();
      return res.status(500).json({
        success: false,
        message: 'Supabase responded with an error',
        details: errText,
      });
    }
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to reach Supabase',
      error: err.message,
    });
  }
});
