# CI/CD Deployment Guide

Autosearch deploys via **GitHub Actions + SSH + Docker Compose** (`.github/workflows/deploy.yml`). On push to `dev` or `main`, the workflow SSHes into the target server, resets to the branch tip, and rebuilds only the affected service(s).

## Overview

| Branch | Environment | GitHub Environment |
| --- | --- | --- |
| `dev` | Staging | `staging` |
| `main` | Production | `production` |

Prod stack (`.deploy/docker-compose.prod.yml`):

- `cms` — Payload CMS (`Dockerfile.cms`, basePath `/cms`)
- `web` — Next.js site (`Dockerfile.web`)
- `bot` — Staff Telegram bot (`Dockerfile.bot`, webhook under `/telegram`)
- `mongo` — MongoDB 7
- `minio` — MinIO (`autosearch-media`)
- `traefik` — optional Compose profile `bundled` (v3.6+). Default `up` does not start it. Public services join external network `edge` for the host Traefik; `mongo` stays on `autosearch-network` only.

## CI (pull requests)

`.github/workflows/ci.yml`: frozen install → format → lint → typecheck. Path filters include apps, packages, Dockerfiles (`cms` / `web` / `bot`), `.deploy/`, and turbo/eslint config.

## Required GitHub secrets

Per Environment (`staging` / `production`):

| Secret | Description |
| --- | --- |
| `{STAGING,PROD}_SSH_HOST` | Server host |
| `{STAGING,PROD}_SSH_USERNAME` | SSH user |
| `{STAGING,PROD}_SSH_PRIVATE_KEY` | Private key |
| `{STAGING,PROD}_SSH_PORT` | Optional (default 22) |
| `{STAGING,PROD}_DEPLOY_PATH` | Absolute path to repo checkout |
| `{STAGING,PROD}_HEALTH_WEB_URL` | Optional health URL (e.g. `https://example.com/`) |
| `{STAGING,PROD}_HEALTH_CMS_URL` | Optional health URL (e.g. `https://example.com/cms/api/health`) |
| `{STAGING,PROD}_HEALTH_BOT_URL` | Optional public health URL (prefer in-container `/health`; bot health is not Traefik-exposed by default) |

SSH uses `StrictHostKeyChecking=yes` after `ssh-keyscan` populates `known_hosts`.

Server `env.web.prod` must also set `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, and `BOT_INTERNAL_SECRET` (shared CMS↔bot).

## How a deploy works

1. Path filter detects web, cms, and/or bot changes (web also rebuilds when `payload-types` change).
2. On the server: `git fetch` + `reset --hard origin/$BRANCH`.
3. `docker compose … build <web|cms|bot>` then `up -d`.
4. Optional health curls (10 attempts) when health URL secrets are set; bot falls back to in-container `wget /health`.
5. Image prune. Production deploys are not cancelled mid-run (`cancel-in-progress: false` on `main`).

## Manual deployment

```bash
cd /path/to/autosearch-landing
git pull origin main
cd .deploy
bash setup.sh   # first time only
docker compose -f docker-compose.prod.yml \
  --env-file env.traefik.prod --env-file env.web.prod \
  up -d --build
```

See [.deploy/README.md](./.deploy/README.md) and [SERVER_SETUP.md](./SERVER_SETUP.md).

## Rollback

```bash
cd /path/to/autosearch-landing
git log --oneline -n 20
git reset --hard <good-sha>
cd .deploy
docker compose -f docker-compose.prod.yml \
  --env-file env.traefik.prod --env-file env.web.prod \
  up -d --build web cms bot
```

## Troubleshooting

- **CMS 404 at `/cms`:** image must bake `CMS_BASE_PATH=/cms` (asserted in `Dockerfile.cms`).
- **Traefik Docker API error:** bundled profile uses Traefik **v3.6+**.
- **Routers missing:** host Traefik must be on network `edge` with entrypoint `websecure` and cert resolver `letsencrypt`. Stop `autosearch-traefik` if it still holds ports 80 and 443. Standalone host: `docker compose --profile bundled up -d`.
- **MinIO auth:** `MINIO_ROOT_*` in `env.web.prod` must match `S3_ACCESS_*` when using the root account; do not override with compose defaults.
- **Bot webhook:** public URL is `https://$WEB_DOMAIN/telegram/webhook`; confirm Traefik priority 50 and `TELEGRAM_BOT_TOKEN` / `TELEGRAM_WEBHOOK_SECRET` in `env.web.prod`.
- **CMS notify silent:** set `BOT_INTERNAL_SECRET` on both cms and bot; compose sets `BOT_INTERNAL_URL=http://bot:3002`.
