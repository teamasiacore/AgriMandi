import { randomUUID } from 'crypto';

export interface AuditRecord {
  id: string;
  actorId?: string;
  actorRole?: string;
  organisationId?: string;
  action: string;
  entity: string;
  entityId: string;
  previousState?: string;
  newState?: string;
  requestId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// In-memory ring buffer for audit logs (syncs to Supabase / PostgreSQL in Phase 1)
const MAX_LOG_SIZE = 1000;
const auditLogStore: AuditRecord[] = [];

export const auditService = {
  record: (entry: Omit<AuditRecord, 'id' | 'timestamp'>): AuditRecord => {
    const record: AuditRecord = {
      ...entry,
      id: randomUUID(),
      timestamp: new Date().toISOString(),
    };

    auditLogStore.unshift(record);
    if (auditLogStore.length > MAX_LOG_SIZE) {
      auditLogStore.pop();
    }

    console.log(`[Audit] Action: ${record.action} | Entity: ${record.entity}:${record.entityId} | Actor: ${record.actorId || 'SYSTEM'}`);
    return record;
  },

  list: (filter?: { entity?: string; actorId?: string; limit?: number }): AuditRecord[] => {
    let results = [...auditLogStore];
    if (filter?.entity) {
      results = results.filter((r) => r.entity === filter.entity);
    }
    if (filter?.actorId) {
      results = results.filter((r) => r.actorId === filter.actorId);
    }
    const limit = filter?.limit || 50;
    return results.slice(0, limit);
  },
};
