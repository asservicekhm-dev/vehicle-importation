import { NextResponse } from 'next/server';
import { getPayload } from 'payload';

import { getBotInternalSecret, isBotSecretAuthorized } from '@/lib/botAuth';
import config from '@payload-config';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ telegramId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  if (!getBotInternalSecret()) {
    return NextResponse.json(
      { ok: false, error: 'bot_secret_not_configured' },
      { status: 503 },
    );
  }

  if (!isBotSecretAuthorized(_request)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const { telegramId: rawId } = await context.params;
  const telegramId = decodeURIComponent(rawId ?? '').trim();
  if (!telegramId) {
    return NextResponse.json({ ok: false, error: 'telegram_id_required' }, { status: 400 });
  }

  const payload = await getPayload({ config });
  const existing = await payload.find({
    collection: 'bot-users',
    where: { telegramId: { equals: telegramId } },
    limit: 1,
    overrideAccess: true,
  });

  const doc = existing.docs[0];
  if (!doc) {
    return NextResponse.json({
      ok: true,
      telegramId,
      status: null,
    });
  }

  return NextResponse.json({
    ok: true,
    telegramId: doc.telegramId,
    status: doc.status,
    id: doc.id,
    username: doc.username ?? null,
    firstName: doc.firstName ?? null,
    lastName: doc.lastName ?? null,
  });
}
