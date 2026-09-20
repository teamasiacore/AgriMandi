import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { requestOtpSchema, verifyOtpSchema } from '@agrimandi/validation';
import { env } from '../config/env.js';
import { auditService } from '../services/auditService.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { ApiResponse, ApiErrorResponse, UserRole } from '@agrimandi/shared-types';

export const authRouter: Router = Router();

// Mock OTP store for development/testing (Phase 1 uses 123456 as deterministic dev OTP)
const DEV_OTP = '123456';

authRouter.post('/auth/otp/request', (req, res: Response<ApiResponse<{ message: string; expiresInSeconds: number }>>) => {
  const parseResult = requestOtpSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid phone number or role selection.',
        fieldErrors: parseResult.error.flatten().fieldErrors,
        requestId: (req as any).id,
      },
    } as any);
  }

  const { phone, role } = parseResult.data;

  auditService.record({
    action: 'OTP_REQUESTED',
    entity: 'AUTH',
    entityId: phone,
    actorRole: role,
    requestId: (req as any).id,
  });

  return res.status(200).json({
    success: true,
    data: {
      message: `OTP sent successfully to +91 ${phone}. (Dev test OTP: ${DEV_OTP})`,
      expiresInSeconds: 300,
    },
  });
});

authRouter.post('/auth/otp/verify', (req, res: Response<ApiResponse<{ token: string; user: { id: string; phone: string; role: UserRole } }>>) => {
  const parseResult = verifyOtpSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid OTP verification payload.',
        fieldErrors: parseResult.error.flatten().fieldErrors,
        requestId: (req as any).id,
      },
    } as any);
  }

  const { phone, otp } = parseResult.data;

  // Verify OTP (allow dev OTP 123456)
  if (otp !== DEV_OTP) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_OTP',
        message: 'The OTP entered is incorrect or expired.',
        requestId: (req as any).id,
      },
    } as any);
  }

  const userId = `usr_${phone.slice(-6)}`;
  const role: UserRole = (req.body.role as UserRole) || 'FARMER';

  const token = jwt.sign(
    {
      id: userId,
      phone,
      role,
      language: req.body.language || 'mr',
    },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  auditService.record({
    action: 'LOGIN_SUCCESS',
    entity: 'USER',
    entityId: userId,
    actorId: userId,
    actorRole: role,
    requestId: (req as any).id,
  });

  return res.status(200).json({
    success: true,
    data: {
      token,
      user: {
        id: userId,
        phone,
        role,
      },
    },
  });
});

authRouter.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response<ApiResponse<any>>) => {
  return res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

authRouter.post('/auth/logout', authenticateToken, (req: AuthenticatedRequest, res: Response<ApiResponse<{ message: string }>>) => {
  auditService.record({
    action: 'LOGOUT',
    entity: 'USER',
    entityId: req.user?.id || 'UNKNOWN',
    actorId: req.user?.id,
    requestId: (req as any).id,
  });

  return res.status(200).json({
    success: true,
    data: {
      message: 'Logged out successfully.',
    },
  });
});
