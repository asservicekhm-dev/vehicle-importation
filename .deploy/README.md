# Autosearch deploy

Docker Compose for **dev** (bind-mount) and **prod** (host Traefik + Let's Encrypt + MinIO + Telegram bot).

`setup.sh` creates external network `autosearch-network` if it is missing. Network `proxy` must already exist; the host Traefik owns it. Public services join both. Mongo stays on `autosearch-network` only.

## Dev

```bash
cd .deploy
docker compose -f docker-compose.dev.yml --env-file env.dev up -d --build
```

Ports (host):

| Service | URL |
| --- | --- |
| Web | http://localhost:3200 |
| CMS | http://localhost:3201 |
| Bot health | http://localhost:3202/health |
| Mongo | localhost:27019 |
| MinIO API / console | http://localhost:9200 / http://localhost:9201 |

Bot uses **polling**. Set `TELEGRAM_BOT_TOKEN` in `env.dev` to run it; leave empty and the bot container sleeps (CMS/web still work). CMS notify uses `BOT_INTERNAL_URL=http://bot:3002`.

## Prod (first run on a server)

```bash
cd .deploy
bash setup.sh
# edit env.traefik.prod + env.web.prod
# set TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, BOT_INTERNAL_SECRET
docker compose -f docker-compose.prod.yml \
  --env-file env.traefik.prod \
  --env-file env.web.prod \
  up -d --build
```

That command does not start the bundled `traefik` service. The host Traefik must use entrypoint `websecure`, cert resolver `letsencrypt`, and `--providers.docker.network=proxy`. On a shared host, stop a previously running `autosearch-traefik` before the host proxy binds ports 80 and 443. A host with no external Traefik adds `--profile bundled`. `proxy` must still exist (`docker network create proxy` is enough when this stack is the only site).

- Bundled Traefik is **v3.6+** (older tags fail on modern Docker Engine API).
- Site at `/`, CMS at `/cms` (`CMS_BASE_PATH`), bot webhook at `/telegram/webhook`, MinIO on `WEB_MINIO_*` hosts.
- Leave `NEXT_PUBLIC_GTM_ID` empty to disable GTM.
- CMS → bot notify: `BOT_INTERNAL_URL=http://bot:3002` (internal network only; `/internal/*` is not Traefik-exposed).

## Seed backup / restore

See [seed/README.md](./seed/README.md) and root scripts `pnpm seed:backup` / `pnpm seed:restore`.
