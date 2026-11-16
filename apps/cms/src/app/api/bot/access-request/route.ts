import { NextResponse } from 'next/server';
import { getPayload } from 'payload';

import { getBotInternalSecret, isBotSecretAuthorized } from '@/lib/botAuth';
import config from '@payload-config';

export const dynamic = 'force-dynamic';

type AccessRequestBody = {
  telegramId?: unknown;
  username?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  languageCode?: unknown;
};

function asOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

export async function POST(request: Request) {
  if (!getBotInternalSecret()) {
    return NextResponse.json(
      { ok: false, error: 'bot_secret_not_configured' },
      { status: 503 },
    );
  }

  if (!isBotSecretAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  let body: AccessRequestBody;
  try {
    body = (await request.json()) as AccessRequestBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const telegramId = asOptionalString(body.telegramId);
  if (!telegramId) {
    return NextResponse.json({ ok: false, error: 'telegram_id_required' }, { status: 400 });
  }

  const profile = {
    username: asOptionalString(body.username),
    firstName: asOptionalString(body.firstName),
    lastName: asOptionalString(body.lastName),
    languageCode: asOptionalString(body.languageCode),
  };

  const payload = await getPayload({ config });
  const existing = await payload.find({
    collection: 'bot-users',
    where: { telegramId: { equals: telegramId } },
    limit: 1,
    overrideAccess: true,
  });

  const doc = existing.docs[0];
  const now = new Date().toISOString();

  if (doc?.status === 'blocked') {
    return NextResponse.json(
      {
        ok: false,
        error: 'blocked',
        status: 'blocked',
        telegramId,
      },
      { status: 403 },
    );
  }

  if (doc?.status === 'approved') {
    return NextResponse.json({
      ok: true,
      status: 'approved',
      telegramId,
      id: doc.id,
    });
  }

  if (doc) {
    const updated = await payload.update({
      collection: 'bot-users',
      id: doc.id,
      data: {
        ...profile,
        status: 'pending',
        requestedAt: now,
      },
      overrideAccess: true,
    });

    return NextResponse.json({
      ok: true,
      status: updated.status,
      telegramId,
      id: updated.id,
    });
  }

  const created = await payload.create({
    collection: 'bot-users',
    data: {
      telegramId,
      ...profile,
      status: 'pending',
      requestedAt: now,
    },
    overrideAccess: true,
  });

  return NextResponse.json({
    ok: true,
    status: created.status,
    telegramId,
    id: created.id,
  });
}
