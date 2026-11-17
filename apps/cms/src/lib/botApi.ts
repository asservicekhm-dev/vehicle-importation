import { NextResponse } from 'next/server';
import { getPayload, type Payload, type Where } from 'payload';

import { getBotInternalSecret, isBotSecretAuthorized } from '@/lib/botAuth';
import type { Lead } from '@/payload-types';
import config from '@payload-config';

export const LEAD_STATUSES = ['new', 'in-progress', 'won', 'lost'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_TYPES = [
  'consultation',
  'turnkey',
  'inspection',
  'expert',
  'callback',
  'test-drive',
  'trade-in',
  'finance',
  'general',
] as const;
export type LeadType = (typeof LEAD_TYPES)[number];

export const DATE_PRESETS = ['today', '7d', '30d', 'all'] as const;
export type DatePreset = (typeof DATE_PRESETS)[number];

/** Skip Admin mark-as-read if a user somehow appears on the Local API req. */
export const BOT_LEADS_READ_CONTEXT = { __leadsMarkRead: true } as const;

export function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === 'string' && (LEAD_STATUSES as readonly string[]).includes(value);
}

export function isLeadType(value: unknown): value is LeadType {
  return typeof value === 'string' && (LEAD_TYPES as readonly string[]).includes(value);
}

export function isDatePreset(value: unknown): value is DatePreset {
  return typeof value === 'string' && (DATE_PRESETS as readonly string[]).includes(value);
}

export async function requireBotPayload(
  request: Request,
): Promise<{ ok: true; payload: Payload } | { ok: false; response: NextResponse }> {
  if (!getBotInternalSecret()) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: 'bot_secret_not_configured' },
        { status: 503 },
      ),
    };
  }

  if (!isBotSecretAuthorized(request)) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 }),
    };
  }

  const payload = await getPayload({ config });
  return { ok: true, payload };
}

export async function requireApprovedOperator(
  payload: Payload,
  telegramIdRaw: string | null | undefined,
): Promise<
  { ok: true; telegramId: string } | { ok: false; response: NextResponse }
> {
  const telegramId = telegramIdRaw?.trim() ?? '';
  if (!telegramId) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: 'telegram_id_required' },
        { status: 400 },
      ),
    };
  }

  const existing = await payload.find({
    collection: 'bot-users',
    where: { telegramId: { equals: telegramId } },
    limit: 1,
    overrideAccess: true,
  });

  const doc = existing.docs[0];
  if (!doc || doc.status !== 'approved') {
    return {
      ok: false,
      response: NextResponse.json(
        {
          ok: false,
          error: 'forbidden',
          status: doc?.status ?? null,
        },
        { status: 403 },
      ),
    };
  }

  return { ok: true, telegramId };
}

export type BotLeadListQuery = {
  telegramId: string;
  page: number;
  limit: number;
  q?: string;
  /** Multi-select; omit / empty = any. */
  statuses?: LeadStatus[];
  types?: LeadType[];
  origins?: string[];
  carBrands?: string[];
  datePreset: DatePreset;
};

function parseCsvParam(raw: string | null): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

export function parseLeadListQuery(url: URL): BotLeadListQuery | { error: string } {
  const telegramId = url.searchParams.get('telegramId')?.trim() ?? '';
  if (!telegramId) return { error: 'telegram_id_required' };

  const pageRaw = Number(url.searchParams.get('page') ?? '1');
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const limitRaw = Number(url.searchParams.get('limit') ?? '5');
  const limit =
    Number.isInteger(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 20) : 5;

  const q = url.searchParams.get('q')?.trim() || undefined;

  const statusParts = parseCsvParam(url.searchParams.get('status'));
  if (statusParts.some((part) => !isLeadStatus(part))) {
    return { error: 'invalid_status' };
  }
  const statuses = statusParts.filter(isLeadStatus);

  const typeParts = parseCsvParam(url.searchParams.get('type'));
  if (typeParts.some((part) => !isLeadType(part))) {
    return { error: 'invalid_type' };
  }
  const types = typeParts.filter(isLeadType);

  const origins = parseCsvParam(url.searchParams.get('origin'));
  const carBrands = parseCsvParam(url.searchParams.get('carBrand'));

  const datePresetRaw = url.searchParams.get('datePreset')?.trim() ?? 'all';
  if (!isDatePreset(datePresetRaw)) return { error: 'invalid_date_preset' };

  return {
    telegramId,
    page,
    limit,
    q,
    statuses: statuses.length ? statuses : undefined,
    types: types.length ? types : undefined,
    origins: origins.length ? origins : undefined,
    carBrands: carBrands.length ? carBrands : undefined,
    datePreset: datePresetRaw,
  };
}

function kyivYmd(date: Date): { y: number; m: number; d: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Kyiv',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value);
  return { y: get('year'), m: get('month'), d: get('day') };
}

function kyivOffsetMs(date: Date): number {
  const name =
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Kyiv',
      timeZoneName: 'longOffset',
    })
      .formatToParts(date)
      .find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+00:00';
  const match = name.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);
  const sign = match?.[1] === '-' ? -1 : 1;
  const hours = Number(match?.[2] ?? 0);
  const minutes = Number(match?.[3] ?? 0);
  return sign * (hours * 60 + minutes) * 60 * 1000;
}

/** Start of calendar day in Europe/Kyiv (`daysAgo` days before today) as UTC ISO. */
function startOfKyivDayUtc(daysAgo = 0): string {
  const base = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  const { y, m, d } = kyivYmd(base);
  const noonUtc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const offset = kyivOffsetMs(noonUtc);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0) - offset).toISOString();
}

export function buildLeadsWhere(query: BotLeadListQuery): Where {
  const and: Where[] = [];

  if (query.statuses?.length === 1) {
    and.push({ status: { equals: query.statuses[0]! } });
  } else if (query.statuses && query.statuses.length > 1) {
    and.push({ status: { in: query.statuses } });
  }

  if (query.types?.length === 1) {
    and.push({ type: { equals: query.types[0]! } });
  } else if (query.types && query.types.length > 1) {
    and.push({ type: { in: query.types } });
  }

  if (query.origins?.length === 1) {
    and.push({ 'request.origin': { equals: query.origins[0]! } });
  } else if (query.origins && query.origins.length > 1) {
    and.push({ 'request.origin': { in: query.origins } });
  }

  if (query.carBrands?.length === 1) {
    and.push({ 'request.carBrand': { equals: query.carBrands[0]! } });
  } else if (query.carBrands && query.carBrands.length > 1) {
    and.push({ 'request.carBrand': { in: query.carBrands } });
  }

  if (query.datePreset === 'today') {
    and.push({ createdAt: { greater_than_equal: startOfKyivDayUtc(0) } });
  } else if (query.datePreset === '7d') {
    and.push({ createdAt: { greater_than_equal: startOfKyivDayUtc(6) } });
  } else if (query.datePreset === '30d') {
    and.push({ createdAt: { greater_than_equal: startOfKyivDayUtc(29) } });
  }

  if (query.q) {
    const q = query.q;
    const digits = q.replace(/\D/g, '');
    const or: Where[] = [{ name: { contains: q } }];
    if (digits) {
      or.push({ phone: { contains: digits } });
      if (digits !== q) {
        or.push({ phone: { contains: q } });
      }
    } else {
      or.push({ phone: { contains: q } });
    }
    and.push({ or });
  }

  if (and.length === 0) return {};
  if (and.length === 1) return and[0]!;
  return { and };
}

export function serializeLeadSummary(doc: Lead) {
  return {
    id: doc.id,
    status: doc.status,
    type: doc.type ?? null,
    name: doc.name ?? null,
    phone: doc.phone ?? null,
    createdAt: doc.createdAt,
  };
}

export function serializeLeadDetail(doc: Lead) {
  return {
    id: doc.id,
    status: doc.status,
    type: doc.type ?? null,
    name: doc.name ?? null,
    phone: doc.phone ?? null,
    email: doc.email ?? null,
    message: doc.message ?? null,
    request: doc.request ?? null,
    source: doc.source ?? null,
    consent: doc.consent ?? null,
    utm: doc.utm ?? null,
    readAt: doc.readAt ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
