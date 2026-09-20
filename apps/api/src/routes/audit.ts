import { Router, Response } from 'express';
import { authenticateToken, requireRoles, AuthenticatedRequest } from '../middleware/auth.js';
import { auditService, AuditRecord } from '../services/auditService.js';
import { ApiResponse } from '@agrimandi/shared-types';

export const auditRouter: Router = Router();

// Read-only audit trail endpoint for administrators
auditRouter.get(
  '/admin/audit-events',
  authenticateToken,
  requireRoles(['PLATFORM_ADMIN', 'GOVT_ADMIN']),
  (req: AuthenticatedRequest, res: Response<ApiResponse<AuditRecord[]>>) => {
    const { entity, actorId, limit } = req.query;

    const events = auditService.list({
      entity: entity as string,
      actorId: actorId as string,
      limit: limit ? Number(limit) : 50,
    });

    return res.status(200).json({
      success: true,
      data: events,
      meta: {
        total: events.length,
      },
    });
  }
);
