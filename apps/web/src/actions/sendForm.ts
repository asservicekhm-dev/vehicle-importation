'use server';

import { headers } from 'next/headers';

import { getCmsBaseUrl } from '@/lib/cmsBaseUrl';
import { FORM_HONEYPOT_FIELD, honeypotFilled } from '@/lib/formSpam';

export type SendFormResult =
  { doc: unknown; ok: true } | { message: string; ok: false; title: string };

type SubmissionRow = { field: string; value?: string | null };

type CmsErrorShape = { data?: { title?: string | null } | null; message?: string | null };
type CmsFormSubmissionResponse = {
  doc?: unknown;
  errors?: CmsErrorShape[] | null;
  message?: string | null;
};

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5;
const rateBuckets = new Map<string, number[]>();

function clientIp(headerList: Headers): string {
  const forwarded = headerList.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return headerList.get('x-real-ip')?.trim() || 'unknown';
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const prev = rateBuckets.get(ip) ?? [];
  const recent = prev.filter((ts) => now - ts < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    rateBuckets.set(ip, recent);
    return true;
  }
  recent.push(now);
  rateBuckets.set(ip, recent);
  return false;
}

function safeJsonParse<T>(raw: string): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function normalizeCmsError(
  data: CmsFormSubmissionResponse | null,
  fallbackTitle: string,
  fallbackMessage: string,
): { title: string; message: string } {
  const first = data?.errors?.[0];
  const title = first?.data?.title || first?.message || fallbackTitle;
  const message = first?.message || data?.message || fallbackMessage;
  return { message, title };
}

export async function sendForm({
  form,
  submissionData,
}: {
  form: string | number;
  submissionData: SubmissionRow[];
}): Promise<SendFormResult> {
  // Honeypot filled → pretend success so bots do not retry loudly.
  if (honeypotFilled(submissionData)) {
    return { doc: null, ok: true };
  }

  const headerList = await headers();
  if (rateLimited(clientIp(headerList))) {
    return {
      ok: false,
      title: 'Too many requests',
      message: 'Please wait a minute and try again.',
    };
  }

  let cmsBase: string;
  try {
    cmsBase = getCmsBaseUrl();
  } catch {
    return {
      message:
        'Set NEXT_PUBLIC_CMS_URL in the web app environment (Payload origin, e.g. http://localhost:3001).',
      ok: false,
      title: 'Configuration error',
    };
  }

  const formId = String(form);
  const sanitized = submissionData
    .filter((row) => row.field !== FORM_HONEYPOT_FIELD)
    .map((row) => ({
      field: row.field,
      value: row.value == null ? '' : String(row.value),
    }));

  const res = await fetch(`${cmsBase}/api/form-submissions`, {
    body: JSON.stringify({
      form: formId,
      submissionData: sanitized,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  const rawText = await res.text();
  const data = safeJsonParse<CmsFormSubmissionResponse>(rawText);

  if (!res.ok) {
    const fallbackMessage = data?.message || rawText.slice(0, 280) || `HTTP ${res.status}`;
    const err = normalizeCmsError(data, 'Error', fallbackMessage);
    return { ...err, ok: false };
  }

  return { doc: data?.doc, ok: true };
}
