import { NextResponse } from 'next/server';

import {
  BOT_LEADS_READ_CONTEXT,
  requireApprovedOperator,
  requireBotPayload,
  serializeLeadDetail,
} from '@/lib/botApi';
import type { Lead } from '@/payload-types';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireBotPayload(request);
  if (!auth.ok) return auth.response;

  const telegramId = new URL(request.url).searchParams.get('telegramId');
  const operator = await requireApprovedOperator(auth.payload, telegramId);
  if (!operator.ok) return operator.response;

  const { id: rawId } = await context.params;
  const id = decodeURIComponent(rawId ?? '').trim();
  if (!id) {
    return NextResponse.json({ ok: false, error: 'lead_id_required' }, { status: 400 });
  }

  try {
    const doc = (await auth.payload.findByID({
      collection: 'leads',
      id,
      depth: 0,
      overrideAccess: true,
      context: BOT_LEADS_READ_CONTEXT,
    })) as Lead;

    return NextResponse.json({
      ok: true,
      doc: serializeLeadDetail(doc),
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  }
}
