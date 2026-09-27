export {};

const baseUrl = (process.env.API_BASE_URL ?? '').replace(/\/$/, '');
const username = process.env.ADMIN_SMOKE_USERNAME;
const password = process.env.ADMIN_SMOKE_PASSWORD;
if (!baseUrl || !username || !password)
  throw new Error(
    'API_BASE_URL, ADMIN_SMOKE_USERNAME and ADMIN_SMOKE_PASSWORD are required',
  );

async function request<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers });
  const body = (await response.json().catch(() => null)) as
    | T
    | { error?: { message?: string } }
    | null;
  if (!response.ok)
    throw new Error(
      `${path} failed (${response.status}): ${body && typeof body === 'object' && 'error' in body ? (body.error?.message ?? 'API error') : 'API error'}`,
    );
  return { body: body as T, response };
}
const post = (value: unknown) => ({
  method: 'POST',
  body: JSON.stringify(value),
});
const log = (step: string, detail?: string) =>
  console.log(
    JSON.stringify({
      level: 'info',
      step,
      status: 'PASS',
      ...(detail ? { detail } : {}),
    }),
  );

await request('/health');
log('health');
await request('/ready');
log('readiness');
const login = await request<{ user: { displayName: string } }>(
  '/api/v1/admin/auth/login',
  post({ username, password }),
);
const cookie = (login.response.headers.getSetCookie?.() ?? [
  login.response.headers.get('set-cookie') ?? '',
])[0]?.split(';')[0];
if (!cookie) throw new Error('Admin login did not return a session cookie');
log('admin-login');
const menu = (
  await request<{
    categories: Array<{
      products: Array<{
        id: string;
        optionGroups: Array<{
          minSelect: number;
          isRequired: boolean;
          options: Array<{ id: string }>;
        }>;
      }>;
    }>;
  }>('/api/v1/menu')
).body;
const product = menu.categories.flatMap((category) => category.products)[0];
if (!product) throw new Error('Menu has no product');
log('menu');
const optionIds = product.optionGroups.flatMap((group) =>
  group.options
    .slice(0, Math.max(group.minSelect, group.isRequired ? 1 : 0))
    .map((option) => option.id),
);
const items = [{ productId: product.id, quantity: 1, optionIds }];
const quote = (
  await request<{ totalToman: number }>(
    '/api/v1/orders/quote',
    post({ fulfillmentType: 'delivery', items }),
  )
).body;
if (quote.totalToman < 0) throw new Error('Quote total is invalid');
log('quote');
const created = (
  await request<{
    publicNumber: string;
    trackingToken: string;
    status: string;
  }>(
    '/api/v1/orders',
    post({
      clientOrderId: crypto.randomUUID(),
      customer: { name: 'تست عملیات', mobile: '09120000000' },
      fulfillmentType: 'delivery',
      address: { address: 'آدرس تست عملیات — قابل حذف' },
      requestedTime: 'asap',
      paymentMethod: 'on_delivery',
      items,
    }),
  )
).body;
log('create-order', created.publicNumber);
await request(`/api/v1/orders/${encodeURIComponent(created.publicNumber)}`, {
  headers: { 'X-Order-Token': created.trackingToken },
});
log('guest-tracking');
const list = (
  await request<{
    orders: Array<{ id: string; publicNumber: string; status: 'submitted' }>;
  }>(`/api/v1/admin/orders?q=${encodeURIComponent(created.publicNumber)}`, {
    headers: { Cookie: cookie },
  })
).body;
const adminOrder = list.orders.find(
  (order) => order.publicNumber === created.publicNumber,
);
if (!adminOrder) throw new Error('Created order is missing from admin list');
await request(`/api/v1/admin/orders/${adminOrder.id}`, {
  headers: { Cookie: cookie },
});
log('admin-order-visible');
await request(`/api/v1/admin/orders/${adminOrder.id}/status`, {
  method: 'PATCH',
  headers: { Cookie: cookie },
  body: JSON.stringify({
    status: 'confirmed',
    expectedStatus: adminOrder.status,
  }),
});
log('admin-status-update');
const tracked = (
  await request<{ status: string }>(
    `/api/v1/orders/${encodeURIComponent(created.publicNumber)}`,
    { headers: { 'X-Order-Token': created.trackingToken } },
  )
).body;
if (tracked.status !== 'confirmed')
  throw new Error('Guest tracking did not observe confirmed status');
log('guest-status-update');
console.log(
  JSON.stringify({
    level: 'info',
    message: 'Production smoke completed',
    orderPublicNumber: created.publicNumber,
  }),
);
