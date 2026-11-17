import { NextResponse } from 'next/server';

import { requireBotPayload } from '@/lib/botApi';

export const dynamic = 'force-dynamic';

/** List bot operators (default: approved only). Used by notify fan-out. */
export async function GET(request: Request) {
  const auth = await requireBotPayload(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const status = url.searchParams.get('status')?.trim() || 'approved';

  const result = await auth.payload.find({
    collection: 'bot-users',
    where: { status: { equals: status } },
    limit: 200,
    depth: 0,
    overrideAccess: true,
  });

  return NextResponse.json({
    ok: true,
    docs: result.docs.map((doc) => ({
      id: doc.id,
      telegramId: doc.telegramId,
      status: doc.status,
      username: doc.username ?? null,
      firstName: doc.firstName ?? null,
      lastName: doc.lastName ?? null,
    })),
  });
}
