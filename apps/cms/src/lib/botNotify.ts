import { serializeLeadDetail } from '@/lib/botApi';
import { optionalEnv } from '@/lib/env';
import type { Lead } from '@/payload-types';

const NOTIFY_TIMEOUT_MS = 3000;

export type BotAuthNotifyPayload = {
  telegramId: string;
  status: 'pending' | 'approved' | 'declined' | 'blocked';
  previousStatus?: string | null;
};

function getBotNotifyConfig(): { baseUrl: string; secret: string } | null {
  const baseUrl = optionalEnv('BOT_INTERNAL_URL')?.replace(/\/$/, '');
  const secret = optionalEnv('BOT_INTERNAL_SECRET');
  if (!baseUrl || !secret) return null;
  return { baseUrl, secret };
}

async function postInternal(
  path: string,
  body: unknown,
): Promise<{ ok: boolean; skipped?: boolean; status?: number; error?: string }> {
  const config = getBotNotifyConfig();
  if (!config) {
    return { ok: true, skipped: true };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), NOTIFY_TIMEOUT_MS);

  try {
    const res = await fetch(`${config.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${config.secret}`,
        'x-bot-secret': config.secret,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return {
        ok: false,
        status: res.status,
        error: text || res.statusText,
      };
    }

    return { ok: true, status: res.status };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  } finally {
    clearTimeout(timer);
  }
}

/** Fire-and-forget safe: never throws. Empty BOT_INTERNAL_URL → no-op. */
export async function notifyBotLeadCreate(doc: Lead): Promise<void> {
  const result = await postInternal('/internal/leads', {
    lead: serializeLeadDetail(doc),
  });

  if (result.skipped) return;
  if (!result.ok) {
    console.error(
      `[cms→bot] lead notify failed (id=${doc.id}):`,
      result.error ?? result.status,
    );
  }
}

/** Fire-and-forget safe: never throws. Empty BOT_INTERNAL_URL → no-op. */
export async function notifyBotAuthDecision(
  payload: BotAuthNotifyPayload,
): Promise<void> {
  const result = await postInternal('/internal/auth', payload);

  if (result.skipped) return;
  if (!result.ok) {
    console.error(
      `[cms→bot] auth notify failed (telegramId=${payload.telegramId}):`,
      result.error ?? result.status,
    );
  }
}
