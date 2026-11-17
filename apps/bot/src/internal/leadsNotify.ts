import type { Bot } from 'grammy';
import { InlineKeyboard } from 'grammy';

import type { CmsBotClient } from '../cms/client.js';
import type { LeadDetail } from '../cms/leads.js';
import { ua } from '../i18n/ua.js';
import { encodeLead } from '../leads/callbacks.js';
import { formatLeadNotifyHtml } from '../leads/format.js';
import { shouldSkipLeadNotify } from './dedupe.js';

export async function fanOutLeadNotify(
  bot: Bot,
  cms: CmsBotClient,
  lead: LeadDetail,
): Promise<{ notified: number; skipped: boolean }> {
  if (shouldSkipLeadNotify(lead.id)) {
    return { notified: 0, skipped: true };
  }

  const operators = await cms.listApprovedOperators();
  const text = formatLeadNotifyHtml(lead);
  const reply_markup = new InlineKeyboard().text(ua.openLead, encodeLead(lead.id));

  let notified = 0;
  for (const op of operators) {
    const chatId = Number(op.telegramId);
    if (!Number.isFinite(chatId)) {
      console.error(`[bot] invalid telegramId for notify: ${op.telegramId}`);
      continue;
    }

    try {
      await bot.api.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        reply_markup,
      });
      notified += 1;
    } catch (err) {
      console.error(`[bot] notify failed for ${op.telegramId}`, err);
    }
  }

  return { notified, skipped: false };
}
