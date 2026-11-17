import { timingSafeEqual } from 'node:crypto';
import type { IncomingMessage } from 'node:http';

import type { BotEnv } from '../env.js';

export function isInternalSecretAuthorized(
  req: IncomingMessage,
  env: BotEnv,
): boolean {
  const expected = env.botInternalSecret;
  const headerSecret = headerValue(req, 'x-bot-secret');
  if (headerSecret && safeEqual(headerSecret, expected)) return true;

  const auth = headerValue(req, 'authorization');
  if (auth?.toLowerCase().startsWith('bearer ')) {
    const token = auth.slice(7).trim();
    if (token && safeEqual(token, expected)) return true;
  }

  return false;
}

export async function readJsonBody<T>(
  req: IncomingMessage,
  maxBytes = 1_000_000,
): Promise<T> {
  const chunks: Buffer[] = [];
  let size = 0;

  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buf.length;
    if (size > maxBytes) {
      throw new Error('body_too_large');
    }
    chunks.push(buf);
  }

  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) {
    throw new Error('empty_body');
  }

  return JSON.parse(raw) as T;
}

function headerValue(req: IncomingMessage, name: string): string | undefined {
  const raw = req.headers[name];
  if (Array.isArray(raw)) return raw[0]?.trim();
  return raw?.trim();
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
