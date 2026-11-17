import type { LeadStatus } from '../cms/leads.js';
import type { DatePreset } from '../session.js';

export type LeadCallback =
  | { kind: 'lead'; id: string }
  | { kind: 'page'; page: number }
  | { kind: 'status'; id: string; status: LeadStatus }
  | { kind: 'filter'; action: FilterAction };

export type FilterAction =
  | { op: 'status'; value: LeadStatus | undefined }
  | { op: 'type'; value: string | undefined }
  | { op: 'origin'; value: string | undefined }
  | { op: 'brand'; value: string | undefined }
  | { op: 'date'; value: DatePreset }
  | { op: 'reset' }
  | { op: 'apply' };

const STATUSES: readonly LeadStatus[] = ['new', 'in-progress', 'won', 'lost'];
const DATE_PRESETS: readonly DatePreset[] = ['today', '7d', '30d', 'all'];

function isLeadStatus(value: string): value is LeadStatus {
  return (STATUSES as readonly string[]).includes(value);
}

function isDatePreset(value: string): value is DatePreset {
  return (DATE_PRESETS as readonly string[]).includes(value);
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

/** `f:st:new` / `f:st:` (any) / `f:ty:turnkey` / `f:or:usa` / `f:br:toyota` / `f:dt:7d` / `f:x` / `f:go` */
export function encodeFilterStatus(value: LeadStatus | undefined): string {
  return value ? `f:st:${value}` : 'f:st:';
}

export function encodeFilterType(value: string | undefined): string {
  return value ? `f:ty:${value}` : 'f:ty:';
}

export function encodeFilterOrigin(value: string | undefined): string {
  return value ? `f:or:${value}` : 'f:or:';
}

export function encodeFilterBrand(value: string | undefined): string {
  return value ? `f:br:${value}` : 'f:br:';
}

export function encodeFilterDate(value: DatePreset): string {
  return `f:dt:${value}`;
}

export function encodeFilterReset(): string {
  return 'f:x';
}

export function encodeFilterApply(): string {
  return 'f:go';
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

  if (data.startsWith('f:')) {
    const action = parseFilterAction(data);
    return action ? { kind: 'filter', action } : null;
  }

  return null;
}

function parseFilterAction(data: string): FilterAction | null {
  if (data === 'f:x') return { op: 'reset' };
  if (data === 'f:go') return { op: 'apply' };

  if (data.startsWith('f:st:')) {
    const value = data.slice(5);
    if (!value) return { op: 'status', value: undefined };
    if (!isLeadStatus(value)) return null;
    return { op: 'status', value };
  }

  if (data.startsWith('f:ty:')) {
    const value = data.slice(5);
    return { op: 'type', value: value || undefined };
  }

  if (data.startsWith('f:or:')) {
    const value = data.slice(5);
    return { op: 'origin', value: value || undefined };
  }

  if (data.startsWith('f:br:')) {
    const value = data.slice(5);
    return { op: 'brand', value: value || undefined };
  }

  if (data.startsWith('f:dt:')) {
    const value = data.slice(5);
    if (!isDatePreset(value)) return null;
    return { op: 'date', value };
  }

  return null;
}
