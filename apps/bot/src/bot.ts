import { Bot } from 'grammy';

import type { BotEnv } from './env.js';
import { ua } from './i18n/ua.js';

export function createBot(env: BotEnv): Bot {
  const bot = new Bot(env.telegramBotToken);

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
    await ctx.reply(ua.startStub);
  });

  bot.command('help', async (ctx) => {
    await ctx.reply(ua.helpStub);
  });

  bot.catch((err) => {
    console.error('[bot] grammY error', err);
  });

  return bot;
}

/** B0: long polling. Webhook wiring lands in B6. */
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
