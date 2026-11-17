import type { Context } from 'grammy';

import { mainMenuKeyboard } from '../access/keyboards.js';
import type { CmsBotClient } from '../cms/client.js';
import { ua } from '../i18n/ua.js';
import {
  clearFiltersAndSearch,
  getSession,
  resetListPaging,
  setAwaitingSearch,
  setFilterCarBrands,
  setFilterDatePreset,
  setFilterOrigins,
  setFilterStatuses,
  setFilterTypes,
  setListMessageIds,
  setListMeta,
  setSearchQuery,
  setSessionMode,
  setSessionPage,
  takeListMessageIds,
  toggleListValue,
} from '../session.js';
import type { FilterAction } from './callbacks.js';
import { parseCallback } from './callbacks.js';
import {
  escapeHtml,
  formatFiltersPanelHtml,
  formatLeadDetailHtml,
  formatLeadListCardHtml,
  formatListHeaderHtml,
} from './format.js';
import {
  filtersKeyboard,
  isListPositionButton,
  leadItemKeyboard,
  leadsListReplyKeyboard,
  leadStatusKeyboard,
} from './keyboards.js';

const HTML = { parse_mode: 'HTML' as const };

function telegramIdFromCtx(ctx: Context): string | null {
  return ctx.from ? String(ctx.from.id) : null;
}

async function requireApproved(
  ctx: Context,
  cms: CmsBotClient,
): Promise<string | null> {
  const telegramId = telegramIdFromCtx(ctx);
  if (!telegramId) return null;

  try {
    const operator = await cms.getOperator(telegramId);
    if (operator.status !== 'approved') {
      await ctx.reply(ua.forbidden);
      return null;
    }
    return telegramId;
  } catch (err) {
    console.error('[bot] getOperator failed', err);
    await ctx.reply(ua.cmsError);
    return null;
  }
}

async function clearPreviousList(ctx: Context, chatId: number): Promise<void> {
  const ids = takeListMessageIds(chatId);
  for (const messageId of ids) {
    try {
      await ctx.api.deleteMessage(chatId, messageId);
    } catch {
      // Message may already be gone — ignore.
    }
  }
}

/**
 * One Telegram message per lead (card + its own open button).
 * Prev / next / position / menu live on the reply keyboard (list mode).
 */
export async function showLeadsList(ctx: Context, cms: CmsBotClient): Promise<void> {
  const telegramId = await requireApproved(ctx, cms);
  if (!telegramId) return;

  const chatId = ctx.chat?.id;
  if (chatId == null) return;

  const session = getSession(chatId);
  session.awaitingSearch = false;
  setSessionMode(chatId, 'list');

  try {
    const result = await cms.listLeads({
      telegramId,
      page: session.page,
      limit: 5,
      q: session.q,
      statuses: session.statuses,
      types: session.types,
      origins: session.origins,
      carBrands: session.carBrands,
      datePreset: session.datePreset,
    });

    if (result.totalPages > 0 && session.page > result.totalPages) {
      setSessionPage(chatId, result.totalPages);
      await showLeadsList(ctx, cms);
      return;
    }

    setListMeta(chatId, {
      page: result.page,
      totalPages: result.totalPages,
      totalDocs: result.totalDocs,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    });

    await clearPreviousList(ctx, chatId);

    const messageIds: number[] = [];
    const listKeyboard = leadsListReplyKeyboard(result);

    const header = await ctx.reply(formatListHeaderHtml(result, session), {
      ...HTML,
      reply_markup: listKeyboard,
    });
    messageIds.push(header.message_id);

    if (result.totalDocs === 0) {
      setListMessageIds(chatId, messageIds);
      return;
    }

    for (let i = 0; i < result.docs.length; i++) {
      const doc = result.docs[i]!;
      const card = await ctx.reply(formatLeadListCardHtml(doc, i), {
        ...HTML,
        reply_markup: leadItemKeyboard(doc),
      });
      messageIds.push(card.message_id);
    }

    setListMessageIds(chatId, messageIds);
  } catch (err) {
    console.error('[bot] listLeads failed', err);
    if (ctx.callbackQuery) {
      await ctx.answerCallbackQuery({ text: ua.listFailed, show_alert: true });
    } else {
      await ctx.reply(ua.listFailed);
    }
  }
}

export async function handleMenuLeads(ctx: Context, cms: CmsBotClient): Promise<void> {
  const chatId = ctx.chat?.id;
  if (chatId != null) {
    setAwaitingSearch(chatId, false);
    resetListPaging(chatId);
  }
  await showLeadsList(ctx, cms);
}

export async function handleListPrev(ctx: Context, cms: CmsBotClient): Promise<void> {
  const chatId = ctx.chat?.id;
  if (chatId == null) return;

  const session = getSession(chatId);
  if (session.mode !== 'list') {
    await handleMenuLeads(ctx, cms);
    return;
  }

  if (!session.listMeta?.hasPrevPage) {
    await ctx.reply(ua.alreadyFirstPage);
    return;
  }

  setSessionPage(chatId, session.page - 1);
  await showLeadsList(ctx, cms);
}

export async function handleListNext(ctx: Context, cms: CmsBotClient): Promise<void> {
  const chatId = ctx.chat?.id;
  if (chatId == null) return;

  const session = getSession(chatId);
  if (session.mode !== 'list') {
    await handleMenuLeads(ctx, cms);
    return;
  }

  if (!session.listMeta?.hasNextPage) {
    await ctx.reply(ua.alreadyLastPage);
    return;
  }

  setSessionPage(chatId, session.page + 1);
  await showLeadsList(ctx, cms);
}

export async function handleListRefresh(ctx: Context, cms: CmsBotClient): Promise<void> {
  await showLeadsList(ctx, cms);
}

export async function handleMenuHome(ctx: Context): Promise<void> {
  const chatId = ctx.chat?.id;
  if (chatId != null) {
    await clearPreviousList(ctx, chatId);
    setAwaitingSearch(chatId, false);
    setSessionMode(chatId, 'menu');
  }
  await ctx.reply(ua.backToMenu, { reply_markup: mainMenuKeyboard() });
}

export async function handleMenuSearch(ctx: Context, cms: CmsBotClient): Promise<void> {
  const telegramId = await requireApproved(ctx, cms);
  if (!telegramId) return;

  const chatId = ctx.chat?.id;
  if (chatId != null) {
    setSessionMode(chatId, 'menu');
    setAwaitingSearch(chatId, true);
  }

  await ctx.reply(ua.searchPrompt, { reply_markup: mainMenuKeyboard() });
}

export async function handleSearchQuery(
  ctx: Context,
  cms: CmsBotClient,
  query: string,
): Promise<void> {
  const chatId = ctx.chat?.id;
  if (chatId == null) return;

  setSearchQuery(chatId, query);
  await showLeadsList(ctx, cms);
}

export async function handleMenuFilters(ctx: Context, cms: CmsBotClient): Promise<void> {
  const telegramId = await requireApproved(ctx, cms);
  if (!telegramId) return;

  const chatId = ctx.chat?.id;
  if (chatId == null) return;

  setAwaitingSearch(chatId, false);
  setSessionMode(chatId, 'menu');
  const session = getSession(chatId);

  await ctx.reply(formatFiltersPanelHtml(session), {
    ...HTML,
    reply_markup: filtersKeyboard(session),
  });
}

function applyFilterAction(chatId: number, action: FilterAction): void {
  const session = getSession(chatId);
  switch (action.op) {
    case 'status':
      setFilterStatuses(
        chatId,
        toggleListValue(session.statuses, action.value),
      );
      return;
    case 'type':
      setFilterTypes(chatId, toggleListValue(session.types, action.value));
      return;
    case 'origin':
      setFilterOrigins(chatId, toggleListValue(session.origins, action.value));
      return;
    case 'brand':
      setFilterCarBrands(
        chatId,
        toggleListValue(session.carBrands, action.value),
      );
      return;
    case 'date':
      setFilterDatePreset(chatId, action.value);
      return;
    case 'reset':
      clearFiltersAndSearch(chatId);
      return;
    case 'apply':
      return;
  }
}

async function refreshFiltersPanel(ctx: Context, chatId: number): Promise<void> {
  const session = getSession(chatId);
  const text = formatFiltersPanelHtml(session);
  const reply_markup = filtersKeyboard(session);
  try {
    await ctx.editMessageText(text, { ...HTML, reply_markup });
  } catch {
    // Message unchanged or gone — ignore.
  }
}

export async function showLeadDetail(
  ctx: Context,
  cms: CmsBotClient,
  leadId: string,
  opts?: { edit?: boolean; notice?: string },
): Promise<void> {
  const telegramId = await requireApproved(ctx, cms);
  if (!telegramId) return;

  try {
    const doc = await cms.getLead(telegramId, leadId);
    const body = formatLeadDetailHtml(doc);
    const text = opts?.notice ? `${escapeHtml(opts.notice)}\n\n${body}` : body;
    const reply_markup = leadStatusKeyboard(doc);

    if (opts?.edit && ctx.callbackQuery?.message) {
      await ctx.editMessageText(text, { ...HTML, reply_markup });
      return;
    }

    await ctx.reply(text, { ...HTML, reply_markup });
  } catch (err) {
    console.error('[bot] getLead failed', err);
    if (ctx.callbackQuery) {
      await ctx.answerCallbackQuery({ text: ua.openFailed, show_alert: true });
    } else {
      await ctx.reply(ua.openFailed);
    }
  }
}

export async function handleLeadCallback(ctx: Context, cms: CmsBotClient): Promise<void> {
  const data = ctx.callbackQuery?.data;
  if (!data) return;

  const parsed = parseCallback(data);
  if (!parsed) {
    await ctx.answerCallbackQuery();
    return;
  }

  if (parsed.kind === 'page') {
    const chatId = ctx.chat?.id;
    if (chatId != null) setSessionPage(chatId, parsed.page);
    await ctx.answerCallbackQuery();
    await showLeadsList(ctx, cms);
    return;
  }

  if (parsed.kind === 'lead') {
    await ctx.answerCallbackQuery();
    await showLeadDetail(ctx, cms, parsed.id);
    return;
  }

  if (parsed.kind === 'filter') {
    const telegramId = await requireApproved(ctx, cms);
    if (!telegramId) {
      await ctx.answerCallbackQuery({ text: ua.forbidden, show_alert: true });
      return;
    }

    const chatId = ctx.chat?.id;
    if (chatId == null) {
      await ctx.answerCallbackQuery();
      return;
    }

    const action = parsed.action;
    applyFilterAction(chatId, action);

    if (action.op === 'apply') {
      await ctx.answerCallbackQuery();
      await showLeadsList(ctx, cms);
      return;
    }

    if (action.op === 'reset') {
      await ctx.answerCallbackQuery({ text: ua.filtersResetDone });
      await refreshFiltersPanel(ctx, chatId);
      return;
    }

    await ctx.answerCallbackQuery();
    await refreshFiltersPanel(ctx, chatId);
    return;
  }

  const telegramId = await requireApproved(ctx, cms);
  if (!telegramId) {
    await ctx.answerCallbackQuery({ text: ua.forbidden, show_alert: true });
    return;
  }

  try {
    const doc = await cms.patchLeadStatus(telegramId, parsed.id, parsed.status);
    await ctx.answerCallbackQuery({ text: ua.statusUpdated });
    const text = `${escapeHtml(ua.statusUpdated)}\n\n${formatLeadDetailHtml(doc)}`;
    await ctx.editMessageText(text, {
      ...HTML,
      reply_markup: leadStatusKeyboard(doc),
    });
  } catch (err) {
    console.error('[bot] patchLeadStatus failed', err);
    await ctx.answerCallbackQuery({ text: ua.statusFailed, show_alert: true });
  }
}

export { isListPositionButton };
