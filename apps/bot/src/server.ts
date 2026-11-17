import type { Bot } from 'grammy';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';

import type { CmsBotClient, OperatorStatus } from './cms/client.js';
import type { LeadDetail } from './cms/leads.js';
import type { BotEnv } from './env.js';
import { isInternalSecretAuthorized, readJsonBody } from './internal/auth.js';
import { sendAuthDecisionNotify } from './internal/authNotify.js';
import { fanOutLeadNotify } from './internal/leadsNotify.js';

export type HttpServerDeps = {
  bot: Bot;
  cms: CmsBotClient;
};

function json(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function pathname(url: string | undefined): string {
  if (!url) return '/';
  try {
    return new URL(url, 'http://localhost').pathname.replace(/\/$/, '') || '/';
  } catch {
    return '/';
  }
}

const AUTH_STATUSES: readonly OperatorStatus[] = [
  'pending',
  'approved',
  'declined',
  'blocked',
];

function isOperatorStatus(value: unknown): value is OperatorStatus {
  return typeof value === 'string' && (AUTH_STATUSES as readonly string[]).includes(value);
}

export function startHttpServer(env: BotEnv, deps: HttpServerDeps): Server {
  const server = createServer((req, res) => {
    void handleRequest(req, res, env, deps);
  });

  server.listen(env.port, env.host, () => {
    console.info(
      `[bot] HTTP listening on http://${env.host}:${env.port} (/health, /internal/*)`,
    );
  });

  return server;
}

async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  env: BotEnv,
  deps: HttpServerDeps,
): Promise<void> {
  const path = pathname(req.url);
  const method = req.method ?? 'GET';

  try {
    if (method === 'GET' && path === '/health') {
      json(res, 200, { ok: true, service: 'autosearch-bot' });
      return;
    }

    if (method === 'POST' && path === '/internal/leads') {
      await handleInternalLeads(req, res, env, deps);
      return;
    }

    if (method === 'POST' && path === '/internal/auth') {
      await handleInternalAuth(req, res, env, deps);
      return;
    }

    json(res, 404, { ok: false, error: 'not_found' });
  } catch (err) {
    console.error('[bot] HTTP handler error', err);
    json(res, 500, { ok: false, error: 'internal_error' });
  }
}

async function handleInternalLeads(
  req: IncomingMessage,
  res: ServerResponse,
  env: BotEnv,
  deps: HttpServerDeps,
): Promise<void> {
  if (!isInternalSecretAuthorized(req, env)) {
    json(res, 401, { ok: false, error: 'unauthorized' });
    return;
  }

  let body: { lead?: LeadDetail };
  try {
    body = await readJsonBody(req);
  } catch {
    json(res, 400, { ok: false, error: 'invalid_json' });
    return;
  }

  const lead = body.lead;
  if (!lead?.id) {
    json(res, 400, { ok: false, error: 'lead_required' });
    return;
  }

  try {
    const result = await fanOutLeadNotify(deps.bot, deps.cms, lead);
    json(res, 200, { ok: true, ...result });
  } catch (err) {
    console.error('[bot] /internal/leads failed', err);
    json(res, 500, { ok: false, error: 'notify_failed' });
  }
}

async function handleInternalAuth(
  req: IncomingMessage,
  res: ServerResponse,
  env: BotEnv,
  deps: HttpServerDeps,
): Promise<void> {
  if (!isInternalSecretAuthorized(req, env)) {
    json(res, 401, { ok: false, error: 'unauthorized' });
    return;
  }

  let body: { telegramId?: string; status?: string };
  try {
    body = await readJsonBody(req);
  } catch {
    json(res, 400, { ok: false, error: 'invalid_json' });
    return;
  }

  const telegramId = body.telegramId?.trim();
  if (!telegramId || !isOperatorStatus(body.status)) {
    json(res, 400, { ok: false, error: 'invalid_payload' });
    return;
  }

  try {
    await sendAuthDecisionNotify(deps.bot, telegramId, body.status);
    json(res, 200, { ok: true });
  } catch (err) {
    console.error('[bot] /internal/auth failed', err);
    json(res, 500, { ok: false, error: 'notify_failed' });
  }
}
