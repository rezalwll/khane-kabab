export type ApiErrorBody = {
  error: { code: string; message: string; requestId?: string };
};
export class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number,
    public requestId?: string,
  ) {
    super(message);
  }
}
const baseUrl = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
).replace(/\/$/, '');
export async function apiRequest<T>(
  path: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), init.timeoutMs ?? 10000);
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body && !headers.has('Content-Type'))
    headers.set('Content-Type', 'application/json');
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      signal: controller.signal,
      headers,
    });
    const body = (await response.json().catch(() => null)) as
      | T
      | ApiErrorBody
      | null;
    if (!response.ok) {
      const error =
        body && typeof body === 'object' && 'error' in body ? body.error : null;
      throw new ApiClientError(
        error?.code ?? 'API_ERROR',
        error?.message ?? 'درخواست ناموفق بود.',
        response.status,
        error?.requestId,
      );
    }
    return body as T;
  } catch (error) {
    if (error instanceof ApiClientError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError')
      throw new ApiClientError('TIMEOUT', 'زمان پاسخ‌گویی سرور به پایان رسید.');
    throw new ApiClientError('NETWORK_ERROR', 'ارتباط با سرور برقرار نشد.');
  } finally {
    clearTimeout(timeout);
  }
}
