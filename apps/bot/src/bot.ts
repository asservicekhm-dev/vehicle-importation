import { Bot } from 'grammy';

import { handleHelp, handleStart, handleTextMessage } from './access/handlers.js';
import { CmsBotClient } from './cms/client.js';
import type { BotEnv } from './env.js';
import { ua } from './i18n/ua.js';

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

/** B0/B1: long polling. Webhook wiring lands in B6. */
export async function startBot(bot: Bot, env: BotEnv): Promise<void> {
  if (env.telegramMode === 'webhook') {
    throw new Error(
      '[bot] TELEGRAM_MODE=webhook is not implemented yet (milestone B6). Use TELEGRAM_MODE=polling.',
    );
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
