import type { LeadStatus } from './cms/leads.js';

export type SessionMode = 'menu' | 'list';

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
  status?: LeadStatus;
  type?: string;
  origin?: string;
  carBrand?: string;
  datePreset: string;
  /** Last list page meta for reply-keyboard prev/next guards. */
  listMeta: ListMeta | null;
  /** Message ids for the last rendered leads list (header + cards). */
  listMessageIds: number[];
};

const sessions = new Map<number, ChatSession>();

export function getSession(chatId: number): ChatSession {
  let session = sessions.get(chatId);
  if (!session) {
    session = {
      mode: 'menu',
      page: 1,
      datePreset: 'all',
      listMeta: null,
      listMessageIds: [],
    };
    sessions.set(chatId, session);
  }
  if (!session.mode) session.mode = 'menu';
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

export function setListMessageIds(chatId: number, ids: number[]): void {
  getSession(chatId).listMessageIds = ids;
}

export function takeListMessageIds(chatId: number): number[] {
  const session = getSession(chatId);
  const ids = session.listMessageIds ?? [];
  session.listMessageIds = [];
  return ids;
}
