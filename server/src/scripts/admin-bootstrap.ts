import { eq } from 'drizzle-orm';
import { loadEnv } from '../config/env.js';
import { createDatabase } from '../db/client.js';
import { adminUsers } from '../db/schema.js';
import { hashPassword } from '../modules/admin/security.js';

const env = loadEnv();
const username = env.ADMIN_BOOTSTRAP_USERNAME?.trim().toLowerCase();
const password = env.ADMIN_BOOTSTRAP_PASSWORD;
const displayName = env.ADMIN_BOOTSTRAP_DISPLAY_NAME.trim();
if (!username || username.length > 64)
  throw new Error(
    'ADMIN_BOOTSTRAP_USERNAME is required and must be at most 64 characters',
  );
if (!password || password.length < 12)
  throw new Error(
    'ADMIN_BOOTSTRAP_PASSWORD is required and must be at least 12 characters',
  );
if (!displayName || displayName.length > 120)
  throw new Error(
    'ADMIN_BOOTSTRAP_DISPLAY_NAME is required and must be at most 120 characters',
  );
const { db, pool } = createDatabase(env);
try {
  const [existing] = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.username, username))
    .limit(1);
  if (existing)
    throw new Error(
      'Admin username already exists; bootstrap never overwrites users',
    );
  await db.insert(adminUsers).values({
    username,
    displayName,
    passwordHash: await hashPassword(password),
    role: 'owner',
  });
  console.log(
    JSON.stringify({ level: 'info', message: 'Owner admin created', username }),
  );
} finally {
  await pool.end();
}
