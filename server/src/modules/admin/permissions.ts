import type { AdminRole } from '../../db/schema.js';

export type AdminPermission =
  | 'dashboard:read'
  | 'orders:read'
  | 'orders:write'
  | 'menu:read'
  | 'menu:write'
  | 'settings:read'
  | 'settings:write';
const permissions: Record<AdminRole, AdminPermission[]> = {
  owner: [
    'dashboard:read',
    'orders:read',
    'orders:write',
    'menu:read',
    'menu:write',
    'settings:read',
    'settings:write',
  ],
  manager: [
    'dashboard:read',
    'orders:read',
    'orders:write',
    'menu:read',
    'menu:write',
    'settings:read',
    'settings:write',
  ],
  staff: ['dashboard:read', 'orders:read', 'orders:write', 'menu:read'],
};
export const hasPermission = (role: AdminRole, permission: AdminPermission) =>
  permissions[role].includes(permission);
