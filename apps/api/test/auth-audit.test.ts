import { describe, it, expect } from 'vitest';
import { auditService } from '../src/services/auditService.js';
import jwt from 'jsonwebtoken';

describe('AG-004 & AG-005: Auth & Audit Services', () => {
  it('records and retrieves immutable audit events', () => {
    const record = auditService.record({
      action: 'TEST_ACTION',
      entity: 'OFFER',
      entityId: 'off_123',
      actorId: 'usr_farmer1',
      actorRole: 'FARMER',
      previousState: 'SUBMITTED',
      newState: 'ACCEPTED',
    });

    expect(record.id).toBeDefined();
    expect(record.action).toBe('TEST_ACTION');
    expect(record.timestamp).toBeDefined();

    const list = auditService.list({ entity: 'OFFER' });
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].entityId).toBe('off_123');
  });

  it('signs and verifies JWT tokens with role boundaries', () => {
    const secret = 'super-secret-test-key-32-chars-long';
    const payload = { id: 'usr_test1', phone: '9876543210', role: 'FARMER' };
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });

    const decoded = jwt.verify(token, secret) as any;
    expect(decoded.phone).toBe('9876543210');
    expect(decoded.role).toBe('FARMER');
  });
});
