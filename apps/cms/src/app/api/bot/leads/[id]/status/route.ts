import { NextResponse } from 'next/server';

import {
  BOT_LEADS_READ_CONTEXT,
  isLeadStatus,
  requireApprovedOperator,
  requireBotPayload,
  serializeLeadDetail,
} from '@/lib/botApi';
import type { Lead } from '@/payload-types';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ id: string }>;
};

type Body = {
  telegramId?: unknown;
  status?: unknown;
};

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireBotPayload(request);
  if (!auth.ok) return auth.response;

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const telegramId =
    typeof body.telegramId === 'string'
      ? body.telegramId
      : new URL(request.url).searchParams.get('telegramId');

  const operator = await requireApprovedOperator(auth.payload, telegramId);
  if (!operator.ok) return operator.response;

  if (!isLeadStatus(body.status)) {
    return NextResponse.json({ ok: false, error: 'invalid_status' }, { status: 400 });
  }
  const nextStatus = body.status;

  const { id: rawId } = await context.params;
  const id = decodeURIComponent(rawId ?? '').trim();
  if (!id) {
    return NextResponse.json({ ok: false, error: 'lead_id_required' }, { status: 400 });
  }

  let existing: Lead;
  try {
    existing = (await auth.payload.findByID({
      collection: 'leads',
      id,
      depth: 0,
      overrideAccess: true,
      context: BOT_LEADS_READ_CONTEXT,
    })) as Lead;
  } catch {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  }

  const data: { status: typeof nextStatus; readAt?: string } = { status: nextStatus };
  if (existing.status === 'new' && nextStatus !== 'new' && !existing.readAt) {
    data.readAt = new Date().toISOString();
  }

  const updated = (await auth.payload.update({
    collection: 'leads',
    id,
    data,
    depth: 0,
    overrideAccess: true,
    context: BOT_LEADS_READ_CONTEXT,
  })) as Lead;

  return NextResponse.json({
    ok: true,
    doc: serializeLeadDetail(updated),
  });
}
