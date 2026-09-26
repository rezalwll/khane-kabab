import type { AdminRole } from '../../db/schema.js';

export type AdminIdentity = {
  id: string;
  username: string;
  displayName: string;
  role: AdminRole;
  sessionId: string;
};
export type AdminVariables = { admin: AdminIdentity };
