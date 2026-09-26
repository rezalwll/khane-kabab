import type { AppDb } from '../../db/client.js';
import { adminAuditLogs } from '../../db/schema.js';

export async function writeAudit(
  db: AppDb,
  data: {
    adminUserId?: string | null;
    action: string;
    entityType?: string;
    entityId?: string;
    requestId: string;
    metadata?: Record<string, unknown>;
  },
) {
  await db.insert(adminAuditLogs).values({
    adminUserId: data.adminUserId ?? null,
    action: data.action,
    entityType: data.entityType,
    entityId: data.entityId,
    requestId: data.requestId,
    metadata: data.metadata ?? {},
  });
}
