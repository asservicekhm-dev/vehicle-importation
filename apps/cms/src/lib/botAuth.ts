import { timingSafeEqual } from 'node:crypto';

import { optionalEnv } from '@/lib/env';

export function getBotInternalSecret(): string | undefined {
  return optionalEnv('BOT_INTERNAL_SECRET');
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/** Accept `Authorization: Bearer …` or `X-Bot-Secret`. */
export function isBotSecretAuthorized(request: Request): boolean {
  const expected = getBotInternalSecret();
  if (!expected) return false;

  const headerSecret = request.headers.get('x-bot-secret')?.trim();
  if (headerSecret && safeEqual(headerSecret, expected)) return true;

  const auth = request.headers.get('authorization')?.trim();
  if (auth?.toLowerCase().startsWith('bearer ')) {
    const token = auth.slice(7).trim();
    if (token && safeEqual(token, expected)) return true;
  }

  return false;
}
