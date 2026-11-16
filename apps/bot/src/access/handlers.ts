import type { Context } from 'grammy';

import type { CmsBotClient, OperatorStatus } from '../cms/client.js';
import { ua } from '../i18n/ua.js';
import { clearKeyboard, requestAccessKeyboard } from './keyboards.js';

function profileFromCtx(ctx: Context) {
  const from = ctx.from;
  if (!from) return null;
  return {
    telegramId: String(from.id),
    username: from.username,
    firstName: from.first_name,
    lastName: from.last_name,
    languageCode: from.language_code,
  };
}

export async function replyForStatus(
  ctx: Context,
  status: OperatorStatus | null,
): Promise<void> {
  switch (status) {
    case 'approved':
      await ctx.reply(ua.approved, { reply_markup: clearKeyboard() });
      return;
    case 'pending':
      await ctx.reply(ua.pending, { reply_markup: clearKeyboard() });
      return;
    case 'blocked':
      await ctx.reply(ua.blocked, { reply_markup: clearKeyboard() });
      return;
    case 'declined':
      await ctx.reply(ua.declined, { reply_markup: requestAccessKeyboard() });
      return;
    default:
      await ctx.reply(ua.welcomeUnknown, { reply_markup: requestAccessKeyboard() });
  }
}

export async function handleStart(ctx: Context, cms: CmsBotClient): Promise<void> {
  const profile = profileFromCtx(ctx);
  if (!profile) return;

  try {
    const operator = await cms.getOperator(profile.telegramId);
    await replyForStatus(ctx, operator.status);
  } catch (err) {
    console.error('[bot] getOperator failed', err);
    await ctx.reply(ua.cmsError);
  }
}

export async function handleHelp(ctx: Context, cms: CmsBotClient): Promise<void> {
  const profile = profileFromCtx(ctx);
  if (!profile) return;

  try {
    const operator = await cms.getOperator(profile.telegramId);
    if (operator.status === 'approved') {
      await ctx.reply(ua.helpApproved, { reply_markup: clearKeyboard() });
      return;
    }
    await ctx.reply(ua.helpUnauthorized, {
      reply_markup:
        operator.status === 'blocked' ? clearKeyboard() : requestAccessKeyboard(),
    });
  } catch (err) {
    console.error('[bot] getOperator failed', err);
    await ctx.reply(ua.cmsError);
  }
}

export async function handleRequestAccess(ctx: Context, cms: CmsBotClient): Promise<void> {
  const profile = profileFromCtx(ctx);
  if (!profile) return;

  try {
    const result = await cms.requestAccess(profile);
    if (!result.ok) {
      if (result.status === 'blocked' || result.error === 'blocked') {
        await ctx.reply(ua.blocked, { reply_markup: clearKeyboard() });
        return;
      }
      await ctx.reply(ua.cmsError);
      return;
    }

    if (result.status === 'approved') {
      await ctx.reply(ua.approved, { reply_markup: clearKeyboard() });
      return;
    }

    await ctx.reply(ua.requestSent, { reply_markup: clearKeyboard() });
  } catch (err) {
    console.error('[bot] requestAccess failed', err);
    await ctx.reply(ua.cmsError);
  }
}

/** Non-command private text: request button or status gate. */
export async function handleTextMessage(ctx: Context, cms: CmsBotClient): Promise<void> {
  const profile = profileFromCtx(ctx);
  if (!profile) return;

  const text = ctx.message?.text?.trim();
  if (text === ua.requestAccess) {
    await handleRequestAccess(ctx, cms);
    return;
  }

  try {
    const operator = await cms.getOperator(profile.telegramId);
    if (operator.status === 'approved') {
      await ctx.reply(ua.helpApproved, { reply_markup: clearKeyboard() });
      return;
    }
    await replyForStatus(ctx, operator.status);
  } catch (err) {
    console.error('[bot] getOperator failed', err);
    await ctx.reply(ua.cmsError);
  }
}
