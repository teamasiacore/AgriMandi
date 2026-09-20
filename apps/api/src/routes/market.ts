import { Router, Request, Response } from 'express';
import { marketDataService } from '../services/marketDataService.js';
import { netRealisationSchema } from '@agrimandi/validation';
import { ApiResponse, MarketObservationDTO } from '@agrimandi/shared-types';

export const marketRouter: Router = Router();

marketRouter.get('/commodities', (_req: Request, res: Response<ApiResponse<any>>) => {
  const commodities = marketDataService.getCommodities();
  res.status(200).json({
    success: true,
    data: commodities,
    meta: { total: commodities.length },
  });
});

marketRouter.get('/markets', (req: Request, res: Response<ApiResponse<any>>) => {
  const district = req.query.district as string | undefined;
  const markets = marketDataService.getMarkets(district);
  res.status(200).json({
    success: true,
    data: markets,
    meta: { total: markets.length },
  });
});

marketRouter.get('/market-observations', async (req: Request, res: Response<ApiResponse<MarketObservationDTO[]>>) => {
  const { commodity, district, market } = req.query;

  const result = await marketDataService.getMarketObservations({
    commodity: commodity as string,
    district: district as string,
    market: market as string,
  });

  res.status(200).json({
    success: true,
    data: result.observations,
    meta: {
      total: result.observations.length,
      source: result.source,
      lastUpdated: new Date().toISOString(),
    },
  });
});

marketRouter.post('/net-realisation', (req: Request, res: Response<ApiResponse<any>>) => {
  const parseResult = netRealisationSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid net realization parameters.',
        fieldErrors: parseResult.error.flatten().fieldErrors,
        requestId: (req as any).id,
      },
    } as any);
  }

  const calculation = marketDataService.calculateNetRealisation(parseResult.data);
  return res.status(200).json({
    success: true,
    data: calculation,
  });
});
