import { NextResponse } from 'next/server';

import {
  BOT_LEADS_READ_CONTEXT,
  buildLeadsWhere,
  parseLeadListQuery,
  requireApprovedOperator,
  requireBotPayload,
  serializeLeadSummary,
} from '@/lib/botApi';
import type { Lead } from '@/payload-types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = await requireBotPayload(request);
  if (!auth.ok) return auth.response;

  const parsed = parseLeadListQuery(new URL(request.url));
  if ('error' in parsed) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  const operator = await requireApprovedOperator(auth.payload, parsed.telegramId);
  if (!operator.ok) return operator.response;

  const where = buildLeadsWhere(parsed);
  const result = await auth.payload.find({
    collection: 'leads',
    where,
    page: parsed.page,
    limit: parsed.limit,
    sort: '-createdAt',
    depth: 0,
    overrideAccess: true,
    context: BOT_LEADS_READ_CONTEXT,
  });

  const docs = result.docs as Lead[];

  return NextResponse.json({
    ok: true,
    page: result.page ?? parsed.page,
    limit: result.limit ?? parsed.limit,
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
    docs: docs.map(serializeLeadSummary),
  });
}
