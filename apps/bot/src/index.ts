import { createBot, startBot } from './bot.js';
import { loadEnv } from './env.js';
import { startHealthServer } from './server.js';

async function main(): Promise<void> {
  const env = loadEnv();
  const healthServer = startHealthServer(env);
  const bot = createBot(env);

  const shutdown = async (signal: string) => {
    console.info(`[bot] ${signal} received, shutting down…`);
    try {
      await bot.stop();
    } catch (err) {
      console.error('[bot] stop error', err);
    }
    await new Promise<void>((resolve) => {
      healthServer.close(() => resolve());
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
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
