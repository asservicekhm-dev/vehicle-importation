import type { LeadStatus } from '../cms/leads.js';

export type LeadCallback =
  | { kind: 'lead'; id: string }
  | { kind: 'page'; page: number }
  | { kind: 'status'; id: string; status: LeadStatus };

const STATUSES: readonly LeadStatus[] = ['new', 'in-progress', 'won', 'lost'];

function isLeadStatus(value: string): value is LeadStatus {
  return (STATUSES as readonly string[]).includes(value);
}

/** Short callback_data codes (Telegram max 64 bytes). */
export function encodeLead(id: string): string {
  return `l:${id}`;
}

export function encodePage(page: number): string {
  return `p:${page}`;
}

export function encodeStatus(id: string, status: LeadStatus): string {
  return `s:${status}:${id}`;
}

export function parseCallback(data: string): LeadCallback | null {
  if (data.startsWith('l:')) {
    const id = data.slice(2).trim();
    return id ? { kind: 'lead', id } : null;
  }

  if (data.startsWith('p:')) {
    const page = Number(data.slice(2));
    if (!Number.isInteger(page) || page < 1) return null;
    return { kind: 'page', page };
  }

  if (data.startsWith('s:')) {
    const rest = data.slice(2);
    const sep = rest.indexOf(':');
    if (sep <= 0) return null;
    const status = rest.slice(0, sep);
    const id = rest.slice(sep + 1).trim();
    if (!id || !isLeadStatus(status)) return null;
    return { kind: 'status', id, status };
  }

  return null;
}
