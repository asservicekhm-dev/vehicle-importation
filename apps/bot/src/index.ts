import { createBot, startBot } from './bot.js';
import { CmsBotClient } from './cms/client.js';
import { loadEnv } from './env.js';
import { startHttpServer } from './server.js';

async function main(): Promise<void> {
  const env = loadEnv();
  const cms = new CmsBotClient(env);
  const bot = createBot(env);
  const httpServer = startHttpServer(env, { bot, cms });

  const shutdown = async (signal: string) => {
    console.info(`[bot] ${signal} received, shutting down…`);
    try {
      await bot.stop();
    } catch (err) {
      console.error('[bot] stop error', err);
    }
    await new Promise<void>((resolve) => {
      httpServer.close(() => resolve());
    });
    process.exit(0);
  };

  process.once('SIGINT', () => {
    void shutdown('SIGINT');
  });
  process.once('SIGTERM', () => {
    void shutdown('SIGTERM');
  });

  await startBot(bot, env);

  // Webhook mode: setWebhook returns; keep the process on the HTTP server.
  if (env.telegramMode === 'webhook') {
    await new Promise<void>(() => {
      /* never resolves */
    });
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
