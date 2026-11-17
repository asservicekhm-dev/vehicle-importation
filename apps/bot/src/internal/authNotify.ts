import type { Bot } from 'grammy';

import {
  clearKeyboard,
  mainMenuKeyboard,
  requestAccessKeyboard,
} from '../access/keyboards.js';
import type { OperatorStatus } from '../cms/client.js';
import { ua } from '../i18n/ua.js';

export async function sendAuthDecisionNotify(
  bot: Bot,
  telegramId: string,
  status: OperatorStatus,
): Promise<void> {
  const chatId = Number(telegramId);
  if (!Number.isFinite(chatId)) {
    throw new Error(`invalid_telegram_id:${telegramId}`);
  }

  switch (status) {
    case 'approved':
      await bot.api.sendMessage(chatId, ua.authNotifyApproved, {
        reply_markup: mainMenuKeyboard(),
      });
      return;
    case 'declined':
      await bot.api.sendMessage(chatId, ua.authNotifyDeclined, {
        reply_markup: requestAccessKeyboard(),
      });
      return;
    case 'blocked':
      await bot.api.sendMessage(chatId, ua.authNotifyBlocked, {
        reply_markup: clearKeyboard(),
      });
      return;
    case 'pending':
      await bot.api.sendMessage(chatId, ua.authNotifyPending, {
        reply_markup: clearKeyboard(),
      });
      return;
    default:
      throw new Error(`unknown_status:${status}`);
  }
}
