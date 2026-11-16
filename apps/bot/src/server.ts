import { createServer, type Server } from 'node:http';

import type { BotEnv } from './env.js';

export function startHealthServer(env: BotEnv): Server {
  const server = createServer((req, res) => {
    if (req.method === 'GET' && (req.url === '/health' || req.url === '/health/')) {
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: true, service: 'autosearch-bot' }));
      return;
    }

    res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, error: 'not_found' }));
  });

  server.listen(env.port, env.host, () => {
    console.info(`[bot] Health listening on http://${env.host}:${env.port}/health`);
  });

  return server;
}
