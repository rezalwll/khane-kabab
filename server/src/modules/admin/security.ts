import {
  createHash,
  randomBytes,
  scrypt as nodeScrypt,
  timingSafeEqual,
} from 'node:crypto';
const PARAMS = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 } as const;
const derive = (
  password: string,
  salt: Buffer,
  length: number,
  params: { N: number; r: number; p: number; maxmem: number },
) =>
  new Promise<Buffer>((resolve, reject) =>
    nodeScrypt(password, salt, length, params, (error, key) =>
      error ? reject(error) : resolve(key),
    ),
  );

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derived = await derive(password.normalize('NFKC'), salt, 64, PARAMS);
  return `scrypt$${PARAMS.N}$${PARAMS.r}$${PARAMS.p}$${salt.toString('base64url')}$${derived.toString('base64url')}`;
}

export async function verifyPassword(password: string, encoded: string) {
  const [algorithm, n, r, p, saltValue, hashValue] = encoded.split('$');
  if (algorithm !== 'scrypt' || !n || !r || !p || !saltValue || !hashValue)
    return false;
  const expected = Buffer.from(hashValue, 'base64url');
  if (expected.length !== 64) return false;
  try {
    const actual = await derive(
      password.normalize('NFKC'),
      Buffer.from(saltValue, 'base64url'),
      expected.length,
      { N: Number(n), r: Number(r), p: Number(p), maxmem: 64 * 1024 * 1024 },
    );
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export const createSessionToken = () => randomBytes(32).toString('base64url');
export const hashSessionToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');
