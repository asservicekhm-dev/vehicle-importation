import { config as loadDotenv } from 'dotenv';

loadDotenv();

export type TelegramMode = 'polling' | 'webhook';

export type BotEnv = {
  telegramBotToken: string;
  telegramMode: TelegramMode;
  telegramWebhookUrl: string | undefined;
  telegramWebhookSecret: string | undefined;
  botInternalSecret: string;
  cmsInternalUrl: string;
  port: number;
  host: string;
};

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `[bot] Missing required env ${name}. Copy apps/bot/.env.example → apps/bot/.env and fill values.`,
    );
  }
  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function loadEnv(): BotEnv {
  const telegramModeRaw = (optional('TELEGRAM_MODE') ?? 'polling').toLowerCase();
  const telegramMode: TelegramMode =
    telegramModeRaw === 'webhook' ? 'webhook' : 'polling';

  const telegramWebhookUrl = optional('TELEGRAM_WEBHOOK_URL');
  if (telegramMode === 'webhook' && !telegramWebhookUrl) {
    throw new Error(
      '[bot] TELEGRAM_MODE=webhook requires TELEGRAM_WEBHOOK_URL (e.g. https://site/telegram/webhook).',
    );
  }

  const portRaw = optional('PORT') ?? '3002';
  const port = Number(portRaw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`[bot] Invalid PORT: ${portRaw}`);
  }

  return {
    telegramBotToken: required('TELEGRAM_BOT_TOKEN'),
    telegramMode,
    telegramWebhookUrl,
    telegramWebhookSecret: optional('TELEGRAM_WEBHOOK_SECRET'),
    botInternalSecret: required('BOT_INTERNAL_SECRET'),
    cmsInternalUrl: (optional('CMS_INTERNAL_URL') ?? 'http://127.0.0.1:3001').replace(
      /\/$/,
      '',
    ),
    port,
    host: optional('HOST') ?? '0.0.0.0',
  };
}
