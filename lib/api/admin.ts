import { apiRequest } from './client';
export type AdminRole = 'owner' | 'manager' | 'staff';
export type AdminProfile = {
  id: string;
  username: string;
  displayName: string;
  role: AdminRole;
};
export type OrderStatus =
  | 'submitted'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'dispatched'
  | 'delivered'
  | 'cancelled';
const request = <T>(path: string, init: RequestInit = {}) =>
  apiRequest<T>(`/api/v1/admin${path}`, { ...init, credentials: 'include' });
const json = (method: string, value: unknown): RequestInit => ({
  method,
  body: JSON.stringify(value),
});
export const adminApi = {
  login: (username: string, password: string) =>
    request<{ user: AdminProfile }>(
      '/auth/login',
      json('POST', { username, password }),
    ),
  logout: () => request<{ ok: true }>('/auth/logout', { method: 'POST' }),
  me: () => request<{ user: AdminProfile }>('/auth/me'),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ ok: true }>(
      '/auth/change-password',
      json('POST', { currentPassword, newPassword }),
    ),
  dashboard: <T = unknown>() => request<T>('/dashboard'),
  orders: <T = unknown>(params: Record<string, string | number | undefined>) =>
    request<T>(
      `/orders?${new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)]),
      ).toString()}`,
    ),
  order: <T = unknown>(id: string) => request<T>(`/orders/${id}`),
  updateOrderStatus: <T = unknown>(
    id: string,
    status: OrderStatus,
    expectedStatus: OrderStatus,
  ) =>
    request<T>(
      `/orders/${id}/status`,
      json('PATCH', { status, expectedStatus }),
    ),
  menu: <T = unknown>() => request<T>('/menu'),
  createCategory: <T = unknown>(value: unknown) =>
    request<T>('/categories', json('POST', value)),
  updateCategory: <T = unknown>(id: string, value: unknown) =>
    request<T>(`/categories/${id}`, json('PATCH', value)),
  createProduct: <T = unknown>(value: unknown) =>
    request<T>('/products', json('POST', value)),
  updateProduct: <T = unknown>(id: string, value: unknown) =>
    request<T>(`/products/${id}`, json('PATCH', value)),
  toggleAvailability: <T = unknown>(id: string, isAvailable: boolean) =>
    request<T>(`/products/${id}/availability`, json('PATCH', { isAvailable })),
  assignOptionGroups: <T = unknown>(
    id: string,
    optionGroupIds: { id: string; sortOrder: number }[],
  ) =>
    request<T>(
      `/products/${id}/option-groups`,
      json('PUT', { optionGroupIds }),
    ),
  createOptionGroup: <T = unknown>(value: unknown) =>
    request<T>('/option-groups', json('POST', value)),
  updateOptionGroup: <T = unknown>(id: string, value: unknown) =>
    request<T>(`/option-groups/${id}`, json('PATCH', value)),
  createOption: <T = unknown>(groupId: string, value: unknown) =>
    request<T>(`/option-groups/${groupId}/options`, json('POST', value)),
  updateOption: <T = unknown>(id: string, value: unknown) =>
    request<T>(`/options/${id}`, json('PATCH', value)),
  settings: <T = unknown>() => request<T>('/settings'),
  updateSettings: <T = unknown>(value: unknown) =>
    request<T>('/settings', json('PATCH', value)),
  openingHours: <T = unknown>() => request<T>('/opening-hours'),
  updateOpeningHours: <T = unknown>(openingHours: unknown[]) =>
    request<T>('/opening-hours', json('PUT', { openingHours })),
  integrations: <T = unknown>() => request<T>('/integrations'),
  updateIntegrations: <T = unknown>(value: unknown) =>
    request<T>('/integrations', json('PATCH', value)),
  notifications: <T = unknown>(
    params: Record<string, string | number | undefined>,
  ) =>
    request<T>(
      `/notifications?${new URLSearchParams(
        Object.entries(params)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => [key, String(value)]),
      ).toString()}`,
    ),
  retryNotification: (id: string) =>
    request<{ ok: true }>(`/notifications/${id}/retry`, { method: 'POST' }),
  system: <T = unknown>() => request<T>('/system'),
};
