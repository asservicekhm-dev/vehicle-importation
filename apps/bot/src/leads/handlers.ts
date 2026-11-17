import type { Context } from 'grammy';

import { mainMenuKeyboard } from '../access/keyboards.js';
import type { CmsBotClient } from '../cms/client.js';
import { ua } from '../i18n/ua.js';
import {
  getSession,
  resetListPaging,
  setListMessageIds,
  setListMeta,
  setSessionMode,
  setSessionPage,
  takeListMessageIds,
} from '../session.js';
import { parseCallback } from './callbacks.js';
import {
  escapeHtml,
  formatLeadDetailHtml,
  formatLeadListCardHtml,
  formatListHeaderHtml,
} from './format.js';
import {
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
 * Inline keyboards can't sit mid-text, so this is how each item "owns" its button.
 * Prev / next / position / menu live on the reply keyboard (list mode).
 */
export async function showLeadsList(ctx: Context, cms: CmsBotClient): Promise<void> {
  const telegramId = await requireApproved(ctx, cms);
  if (!telegramId) return;

  const chatId = ctx.chat?.id;
  if (chatId == null) return;

  const session = getSession(chatId);
  setSessionMode(chatId, 'list');

  try {
    const result = await cms.listLeads({
      telegramId,
      page: session.page,
      limit: 5,
      q: session.q,
      status: session.status,
      type: session.type,
      origin: session.origin,
      carBrand: session.carBrand,
      datePreset: session.datePreset,
    });

    // Clamp if filters shrunk the result set.
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

    const header = await ctx.reply(formatListHeaderHtml(result), {
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
  if (chatId != null) resetListPaging(chatId);
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
    setSessionMode(chatId, 'menu');
  }
  await ctx.reply(ua.backToMenu, { reply_markup: mainMenuKeyboard() });
}

export async function handleMenuSearch(ctx: Context): Promise<void> {
  await ctx.reply(ua.searchStub);
}

export async function handleMenuFilters(ctx: Context): Promise<void> {
  await ctx.reply(ua.filtersStub);
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

  // Legacy inline page callbacks (if any old messages remain).
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
