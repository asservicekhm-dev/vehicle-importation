import { Bot } from 'grammy';

import { handleHelp, handleStart, handleTextMessage } from './access/handlers.js';
import { CmsBotClient } from './cms/client.js';
import type { BotEnv } from './env.js';
import { ua } from './i18n/ua.js';
import { handleLeadCallback } from './leads/handlers.js';

export function createBot(env: BotEnv): Bot {
  const bot = new Bot(env.telegramBotToken);
  const cms = new CmsBotClient(env);

  bot.use(async (ctx, next) => {
    if (ctx.chat && ctx.chat.type !== 'private') {
      if (ctx.message) {
        await ctx.reply(ua.privateOnly);
      }
      return;
    }
    await next();
  });

  bot.command('start', async (ctx) => {
    await handleStart(ctx, cms);
  });

  bot.command('help', async (ctx) => {
    await handleHelp(ctx, cms);
  });

  bot.on('callback_query:data', async (ctx) => {
    await handleLeadCallback(ctx, cms);
  });

  bot.on('message:text', async (ctx, next) => {
    if (ctx.message.text.startsWith('/')) {
      await next();
      return;
    }
    await handleTextMessage(ctx, cms);
  });

  bot.catch((err) => {
    console.error('[bot] grammY error', err);
  });

  return bot;
}

/**
 * Polling (dev) or setWebhook (prod). In webhook mode this resolves after
 * registering the webhook; the HTTP server keeps the process alive.
 */
export async function startBot(bot: Bot, env: BotEnv): Promise<void> {
  if (env.telegramMode === 'webhook') {
    const url = env.telegramWebhookUrl;
    if (!url) {
      throw new Error(
        '[bot] TELEGRAM_MODE=webhook requires TELEGRAM_WEBHOOK_URL (e.g. https://site/telegram/webhook).',
      );
    }

    try {
      await bot.init();
      await bot.api.setWebhook(url, {
        secret_token: env.telegramWebhookSecret,
        drop_pending_updates: false,
      });
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      throw new Error(
        `[bot] Cannot set Telegram webhook (check TELEGRAM_BOT_TOKEN / URL). ${detail}`,
      );
    }

    console.info(
      `[bot] @${bot.botInfo.username} ready (webhook → ${url})`,
    );
    return;
  }

  try {
    await bot.api.deleteWebhook({ drop_pending_updates: false });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(
      `[bot] Cannot reach Telegram API (check TELEGRAM_BOT_TOKEN). ${detail}`,
    );
  }

  console.info('[bot] Starting long polling…');
  await bot.start({
    onStart: (info) => {
      console.info(`[bot] @${info.username} ready (polling)`);
    },
  });
}
