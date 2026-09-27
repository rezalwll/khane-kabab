import { eq, sql } from 'drizzle-orm';
import type { AppDb } from '../../db/client.js';
import type { Env } from '../../config/env.js';
import { notificationOutbox, serviceHeartbeats } from '../../db/schema.js';
import { getSmsProvider } from './service.js';
import { renderSmsTemplate, type TemplateKey } from './templates.js';
const MAX_ATTEMPTS = 5;
export async function workNotifications(db: AppDb, env: Env, batchSize = 20) {
  await db
    .insert(serviceHeartbeats)
    .values({
      serviceName: 'notification-worker',
      lastSeenAt: new Date(),
      metadata: { mode: env.SMS_PROVIDER },
    })
    .onConflictDoUpdate({
      target: serviceHeartbeats.serviceName,
      set: { lastSeenAt: new Date(), metadata: { mode: env.SMS_PROVIDER } },
    });
  const provider = getSmsProvider(env);
  if (!provider.isConfigured())
    return { claimed: 0, sent: 0, failed: 0, disabled: true };
  const claimed = await db.transaction(async (tx) => {
    const result = await tx.execute(
      sql`with picked as (select id from notification_outbox where status in ('pending','failed') and attempts < ${MAX_ATTEMPTS} and (next_attempt_at is null or next_attempt_at <= now()) order by created_at for update skip locked limit ${batchSize}) update notification_outbox n set status='processing', updated_at=now() from picked where n.id=picked.id returning n.*`,
    );
    return result.rows as unknown as Array<{
      id: string;
      recipient: string;
      template_key: TemplateKey;
      payload: Record<string, string>;
      attempts: number;
    }>;
  });
  let sent = 0,
    failed = 0;
  for (const row of claimed) {
    try {
      const result = await provider.send({
        mobile: row.recipient,
        message: renderSmsTemplate(row.template_key, {
          publicNumber: row.payload.publicNumber ?? '',
        }),
        idempotencyKey: row.id,
      });
      await db
        .update(notificationOutbox)
        .set({
          status: 'sent',
          providerMessageId: result.providerMessageId,
          attempts: row.attempts + 1,
          sentAt: new Date(),
          updatedAt: new Date(),
          lastErrorCode: null,
        })
        .where(eq(notificationOutbox.id, row.id));
      sent++;
    } catch (error) {
      const attempts = row.attempts + 1;
      await db
        .update(notificationOutbox)
        .set({
          status: 'failed',
          attempts,
          nextAttemptAt:
            attempts >= MAX_ATTEMPTS
              ? null
              : new Date(Date.now() + Math.min(60, 2 ** attempts) * 60_000),
          lastErrorCode: error instanceof Error ? error.name : 'SEND_FAILED',
          updatedAt: new Date(),
        })
        .where(eq(notificationOutbox.id, row.id));
      failed++;
    }
  }
  return { claimed: claimed.length, sent, failed, disabled: false };
}
