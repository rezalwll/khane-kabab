import { and, eq, ne } from 'drizzle-orm';
import type { AppDb } from '../../db/client.js';
import { orders, paymentAttempts, paymentSettings } from '../../db/schema.js';
import type { Env } from '../../config/env.js';
import { ApiError, notFound } from '../../lib/errors.js';
import { verifyOrderToken } from '../../lib/order-token.js';
import { DisabledPaymentProvider } from './disabled-provider.js';
import type { PaymentCapability, PaymentProvider } from './provider.js';
export function getPaymentProvider(env: Env): PaymentProvider {
  if (env.PAYMENT_PROVIDER === 'test' && env.NODE_ENV !== 'test')
    throw new Error('The test payment provider is forbidden outside tests');
  return new DisabledPaymentProvider();
}
export async function getPaymentCapability(
  db: AppDb,
  env: Env,
): Promise<PaymentCapability> {
  const [settings] = await db.select().from(paymentSettings).limit(1);
  const provider = getPaymentProvider(env);
  const enabled = settings?.onlinePaymentEnabled ?? false;
  const configured = env.PAYMENT_PROVIDER_CONFIGURED && provider.isConfigured();
  return {
    provider: provider.name,
    configured,
    enabled,
    effectiveEnabled: enabled && configured,
  };
}
export async function startPayment(
  db: AppDb,
  env: Env,
  publicNumber: string,
  token: string | undefined,
) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.publicNumber, publicNumber))
    .limit(1);
  if (!order || !token || !verifyOrderToken(token, order.trackingTokenHash))
    throw notFound('سفارش پیدا نشد.');
  if (order.paymentStatus === 'paid')
    throw new ApiError(
      409,
      'PAYMENT_ALREADY_PAID',
      'این سفارش قبلاً پرداخت شده است.',
    );
  if (order.paymentMethod !== 'online')
    throw new ApiError(
      409,
      'PAYMENT_METHOD_NOT_ONLINE',
      'روش پرداخت این سفارش آنلاین نیست.',
    );
  const capability = await getPaymentCapability(db, env);
  if (!capability.effectiveEnabled)
    throw new ApiError(
      503,
      'PAYMENT_PROVIDER_NOT_CONFIGURED',
      'درگاه پرداخت هنوز متصل نیست.',
    );
  const provider = getPaymentProvider(env);
  const [attempt] = await db
    .insert(paymentAttempts)
    .values({
      orderId: order.id,
      provider: provider.name,
      amountToman: order.totalToman,
      status: 'created',
    })
    .returning();
  let result;
  try {
    result = await provider.createPayment({
      publicNumber,
      amountToman: order.totalToman,
      callbackUrl: `${env.PAYMENT_CALLBACK_BASE_URL}/api/v1/payments/callback/${provider.name}`,
    });
  } catch (error) {
    await db
      .update(paymentAttempts)
      .set({
        status: 'failed',
        failureCode: error instanceof Error ? error.name : 'PROVIDER_ERROR',
        updatedAt: new Date(),
      })
      .where(eq(paymentAttempts.id, attempt!.id));
    throw error;
  }
  await db
    .update(paymentAttempts)
    .set({
      status: 'redirect_ready',
      providerReference: result.providerReference,
      updatedAt: new Date(),
    })
    .where(eq(paymentAttempts.id, attempt!.id));
  return { redirectUrl: result.redirectUrl };
}
export async function markPaymentVerified(
  db: AppDb,
  input: {
    attemptId: string;
    amountToman: number;
    transactionReference: string;
  },
) {
  return db.transaction(async (tx) => {
    const [attempt] = await tx
      .select()
      .from(paymentAttempts)
      .where(eq(paymentAttempts.id, input.attemptId))
      .limit(1);
    if (!attempt) throw notFound('تراکنش پیدا نشد.');
    if (attempt.amountToman !== input.amountToman)
      throw new ApiError(
        409,
        'PAYMENT_AMOUNT_MISMATCH',
        'مبلغ تراکنش مطابقت ندارد.',
      );
    if (attempt.status === 'paid') return { alreadyPaid: true };
    const [updated] = await tx
      .update(paymentAttempts)
      .set({
        status: 'paid',
        transactionReference: input.transactionReference,
        verifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(paymentAttempts.id, attempt.id),
          ne(paymentAttempts.status, 'paid'),
        ),
      )
      .returning();
    if (updated)
      await tx
        .update(orders)
        .set({ paymentStatus: 'paid', updatedAt: new Date() })
        .where(
          and(eq(orders.id, attempt.orderId), ne(orders.paymentStatus, 'paid')),
        );
    return { alreadyPaid: !updated };
  });
}
