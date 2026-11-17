import type { LeadStatus } from './cms/leads.js';

export type SessionMode = 'menu' | 'list';

export type DatePreset = 'today' | '7d' | '30d' | 'all';

export type ListMeta = {
  page: number;
  totalPages: number;
  totalDocs: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type ChatSession = {
  mode: SessionMode;
  page: number;
  q?: string;
  /** Multi-select filters (empty / undefined = any). */
  statuses: LeadStatus[];
  types: string[];
  origins: string[];
  carBrands: string[];
  datePreset: DatePreset;
  /** Waiting for the next free-text message as a search query. */
  awaitingSearch: boolean;
  /** Last list page meta for reply-keyboard prev/next guards. */
  listMeta: ListMeta | null;
  /** Message ids for the last rendered leads list (header + cards). */
  listMessageIds: number[];
};

const sessions = new Map<number, ChatSession>();

function emptySession(): ChatSession {
  return {
    mode: 'menu',
    page: 1,
    statuses: [],
    types: [],
    origins: [],
    carBrands: [],
    datePreset: 'all',
    awaitingSearch: false,
    listMeta: null,
    listMessageIds: [],
  };
}

export function getSession(chatId: number): ChatSession {
  let session = sessions.get(chatId);
  if (!session) {
    session = emptySession();
    sessions.set(chatId, session);
  }
  // Migrate older single-value shape if a long-lived process still has it.
  const legacy = session as ChatSession & {
    status?: LeadStatus;
    type?: string;
    origin?: string;
    carBrand?: string;
  };
  if (!Array.isArray(session.statuses)) {
    session.statuses = legacy.status ? [legacy.status] : [];
  }
  if (!Array.isArray(session.types)) {
    session.types = legacy.type ? [legacy.type] : [];
  }
  if (!Array.isArray(session.origins)) {
    session.origins = legacy.origin ? [legacy.origin] : [];
  }
  if (!Array.isArray(session.carBrands)) {
    session.carBrands = legacy.carBrand ? [legacy.carBrand] : [];
  }
  if (!session.mode) session.mode = 'menu';
  if (!session.datePreset) session.datePreset = 'all';
  if (session.awaitingSearch === undefined) session.awaitingSearch = false;
  if (session.listMeta === undefined) session.listMeta = null;
  if (!session.listMessageIds) session.listMessageIds = [];
  return session;
}

export function setSessionMode(chatId: number, mode: SessionMode): ChatSession {
  const session = getSession(chatId);
  session.mode = mode;
  if (mode === 'menu') {
    session.listMeta = null;
  }
  return session;
}

export function setSessionPage(chatId: number, page: number): ChatSession {
  const session = getSession(chatId);
  session.page = Math.max(1, page);
  return session;
}

export function setListMeta(chatId: number, meta: ListMeta): void {
  getSession(chatId).listMeta = meta;
}

export function resetListPaging(chatId: number): ChatSession {
  const session = getSession(chatId);
  session.page = 1;
  return session;
}

export function setAwaitingSearch(chatId: number, value: boolean): void {
  getSession(chatId).awaitingSearch = value;
}

export function setSearchQuery(chatId: number, q: string | undefined): ChatSession {
  const session = getSession(chatId);
  session.q = q?.trim() || undefined;
  session.page = 1;
  session.awaitingSearch = false;
  return session;
}

/** Toggle a value in a multi-select list. `undefined` clears the dimension. */
export function toggleListValue<T extends string>(
  current: T[],
  value: T | undefined,
): T[] {
  if (value === undefined) return [];
  if (current.includes(value)) {
    return current.filter((item) => item !== value);
  }
  return [...current, value];
}

export function setFilterStatuses(chatId: number, statuses: LeadStatus[]): void {
  const session = getSession(chatId);
  session.statuses = statuses;
  session.page = 1;
}

export function setFilterTypes(chatId: number, types: string[]): void {
  const session = getSession(chatId);
  session.types = types;
  session.page = 1;
}

export function setFilterOrigins(chatId: number, origins: string[]): void {
  const session = getSession(chatId);
  session.origins = origins;
  session.page = 1;
}

export function setFilterCarBrands(chatId: number, carBrands: string[]): void {
  const session = getSession(chatId);
  session.carBrands = carBrands;
  session.page = 1;
}

export function setFilterDatePreset(chatId: number, datePreset: DatePreset): void {
  const session = getSession(chatId);
  session.datePreset = datePreset;
  session.page = 1;
}

/** Clears search + filters; keeps chat mode. */
export function clearFiltersAndSearch(chatId: number): ChatSession {
  const session = getSession(chatId);
  session.q = undefined;
  session.statuses = [];
  session.types = [];
  session.origins = [];
  session.carBrands = [];
  session.datePreset = 'all';
  session.page = 1;
  session.awaitingSearch = false;
  return session;
}

export function hasActiveFilters(session: ChatSession): boolean {
  return Boolean(
    session.q ||
      session.statuses.length ||
      session.types.length ||
      session.origins.length ||
      session.carBrands.length ||
      (session.datePreset && session.datePreset !== 'all'),
  );
}

export function setListMessageIds(chatId: number, ids: number[]): void {
  getSession(chatId).listMessageIds = ids;
}

export function takeListMessageIds(chatId: number): number[] {
  const session = getSession(chatId);
  const ids = session.listMessageIds ?? [];
  session.listMessageIds = [];
  return ids;
}
