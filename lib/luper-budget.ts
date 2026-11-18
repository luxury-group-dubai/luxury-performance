import { createHmac } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { LUPER_LAUNCH_CENTS } from './luper';

type Decision = 'allowed' | 'rate_limited' | 'budget_exhausted';
type Ledger = { reservedCents: number; visitors: Record<string, { start: number; count: number }> };
const WINDOW_MS = 60_000;
const RATE_LIMIT = 8;

export function reserveInLedger(ledger: Ledger, visitor: string, now: number): Decision {
  if (!Number.isSafeInteger(ledger.reservedCents) || ledger.reservedCents < 0 || !ledger.visitors || typeof ledger.visitors !== 'object') throw new Error('Invalid Luper ledger');
  for (const [key, value] of Object.entries(ledger.visitors)) {
    if (now - value.start >= WINDOW_MS) delete ledger.visitors[key];
  }
  const current = ledger.visitors[visitor] ?? { start: now, count: 0 };
  if (current.count >= RATE_LIMIT) return 'rate_limited';
  if (ledger.reservedCents >= LUPER_LAUNCH_CENTS) return 'budget_exhausted';
  current.count += 1;
  ledger.visitors[visitor] = current;
  ledger.reservedCents += 1;
  return 'allowed';
}

const reserveScript = `
local spent = tonumber(redis.call('GET', KEYS[1]) or '0')
local requests = tonumber(redis.call('GET', KEYS[2]) or '0')
if requests >= 8 then return 'rate_limited' end
if spent >= 1000 then return 'budget_exhausted' end
redis.call('INCR', KEYS[1])
redis.call('INCR', KEYS[2])
if requests == 0 then redis.call('PEXPIRE', KEYS[2], 60000) end
return 'allowed'
`;

export async function reserveLuperRequest(request: Request): Promise<Decision> {
  // Only trust a deployment platform's overwritten client IP header. Unknown
  // hosts share a bucket rather than accepting spoofable browser headers.
  const address = process.env.VERCEL === '1'
    ? request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || 'shared'
    : 'shared';
  const visitor = createHmac('sha256', process.env.OPENAI_API_KEY!).update(address).digest('hex');
  const url = process.env.LUPER_REDIS_REST_URL;
  const token = process.env.LUPER_REDIS_REST_TOKEN;
  if (url && token) {
    if (new URL(url).protocol !== 'https:') throw new Error('Luper ledger requires HTTPS');
    const response = await fetch(url, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['EVAL', reserveScript, '2', 'luper:launch:v1:reserved-cents', `luper:launch:v1:rate:${visitor}`]),
      cache: 'no-store', signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error('Luper ledger unavailable');
    const data = await response.json();
    if (!['allowed', 'rate_limited', 'budget_exhausted'].includes(data.result)) throw new Error('Invalid Luper ledger reply');
    return data.result as Decision;
  }
  // A local ledger is only appropriate for development, never serverless hosting.
  if (process.env.NODE_ENV !== 'development') throw new Error('Shared Luper ledger required');
  const directory = join(process.cwd(), '.luper-data');
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const lock = join(directory, 'lock');
  await mkdir(lock); // Atomic across processes; a stale lock fails closed.
  try {
    const path = join(directory, 'launch-v1.json');
    let ledger: Ledger;
    try { ledger = JSON.parse(await readFile(path, 'utf8')); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      ledger = { reservedCents: 0, visitors: {} };
    }
    const decision = reserveInLedger(ledger, visitor, Date.now());
    await writeFile(`${path}.tmp`, JSON.stringify(ledger), { mode: 0o600 });
    await rename(`${path}.tmp`, path);
    return decision;
  } finally { await rm(lock, { recursive: true }); }
}
