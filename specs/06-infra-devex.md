# 06 — Infrastructure & developer experience

Source: root Dockerfiles, `.deploy/`, `.github/workflows/`, CMS seeds, `AGENTS.md`. Target naming: **`autosearch-*`**, scope `@autosearch/*`.

## Naming map

| Legacy | Autosearch |
| --- | --- |
| `@wayon-landing/{web,cms}` | `@autosearch/{web,cms,bot}` |
| compose `wayon-landing[-dev]` | `autosearch[-dev]` |
| containers / network / bucket / Mongo DB | `autosearch-*` / `autosearch-network` / `autosearch-media` / `autosearch` |
| `WEB_WAYON_LANDING_DOMAIN` | `WEB_DOMAIN` |
| `ci-wayon-landing.yml` | `ci.yml` |
| `Dockerfile` / `DockerfileWeb` | `Dockerfile.cms` / `Dockerfile.web` / `Dockerfile.bot` |

Rename once at project start — packages, compose, workflow, env, and server paths must stay in lockstep.

## Docker

### Pattern to Keep

1. `turbo prune --scope=@autosearch/<app> --docker`
2. Install from pruned `json` + lockfile (cache layer)
3. Copy full prune output; build with **`pnpm --filter … build`** (not `turbo run build` — Turbo 2 strict env strips undeclared vars)
4. Runner = Next `standalone` + static + public (cms/web); bot = compiled `dist` + `node`
5. CMS: assert `.next/routes-manifest.json` `basePath` === `CMS_BASE_PATH`
6. Web: bake `NEXT_PUBLIC_*` as `ARG` → `ENV` at build time
7. Bot: `Dockerfile.bot`, listen `:3002`, health on `/health` — [12-telegram-bot.md](./12-telegram-bot.md)

### Adapt / Drop

| Item | Verdict |
| --- | --- |
| Pin pnpm via `corepack prepare` + pin turbo | **Adapt** |
| HEALTHCHECK (CMS `/cms/api/health`) | **Adapt** |
| Root `Dockerfile.dev` (unused) | **Drop** |
| `Dockerfile.jobs` | **Drop** unless jobs queue needed |
| Debian bookworm-slim for sharp in **dev** image | **Keep** |
| Dev entrypoint: shared store + lock + reinstall on lock/tag change | **Keep** |
| Per-app `node_modules` named volumes | **Adapt** (avoid host/container symlink fights) |

## Compose

### Dev (`docker-compose.dev.yml`)

- Services: cms, web, bot, mongo:7, minio (pin tag).
- Bind-mount repo; `WATCHPACK_POLLING`; `NEXT_IMAGE_UNOPTIMIZED=true`.
- Ports example: web 3200, cms 3201, bot 3202 (optional), mongo 27019, minio 9200/9201.
- Bot: long polling when `TELEGRAM_WEBHOOK_URL` unset (`TELEGRAM_MODE=polling`). See [12-telegram-bot.md](./12-telegram-bot.md).
- **Adapt:** healthchecks + `depends_on: condition: service_healthy`; drop obsolete `version:`.

### Prod

- One Traefik per host, on external network `edge`. This stack does not start its own proxy unless Compose profile `bundled` is set (v3.6, Let's Encrypt). Public services (`web`, `cms`, `bot`, `minio`) join `edge` and `autosearch-network`. `mongo` stays on `autosearch-network` only.
- Routers use entrypoint `websecure` and cert resolver `letsencrypt`. Header and rate-limit policy is Docker labels `autosearch-security` and `autosearch-rate-limit` (same settings on each routed service). No `traefik.docker.network` label: the host proxy is pinned to `edge`, the bundled one to `autosearch-network`.
- Single domain: site `/`, CMS `/cms` (`CMS_BASE_PATH`), bot webhook `/telegram` (priority above web), MinIO on subdomains.
- Web runtime: `CMS_INTERNAL_URL=http://cms:3001/cms` for SSR fetches.
- Bot: `TELEGRAM_MODE=webhook`, public `TELEGRAM_WEBHOOK_URL=https://<site>/telegram/webhook`; CMS `BOT_INTERNAL_URL=http://bot:3002`. Internal bot notify paths stay off Traefik.
- **Drop** legacy `cms.<site>` redirect router unless needed.
- **Adapt:** log rotation; post-deploy health curl.

## Env matrix (essentials)

| Variable | Local Docker | Prod |
| --- | --- | --- |
| `PAYLOAD_SECRET` | weak ok | strong |
| `DATABASE_URI` | `mongodb://mongo:27017/autosearch` | same host `mongo` |
| `NEXT_PUBLIC_CMS_URL` | `http://localhost:3201` | `https://<site>/cms` |
| `CMS_INTERNAL_URL` | `http://cms:3001` | `http://cms:3001/cms` |
| `NEXT_PUBLIC_URL` | `http://localhost:3200` | `https://<site>` |
| `CMS_BASE_PATH` | unset | `/cms` |
| S3_* + MinIO roots | minioadmin defaults | real secrets; no compose defaults that override env_file |
| `NEXT_PUBLIC_GTM_ID` | unset | set; **no hardcoded default id** |
| SMTP | optional | optional |
| `TELEGRAM_BOT_TOKEN` | bot | bot |
| `TELEGRAM_MODE` | `polling` | `webhook` |
| `TELEGRAM_WEBHOOK_URL` | unset | `https://<site>/telegram/webhook` |
| `TELEGRAM_WEBHOOK_SECRET` | optional | required for webhook |
| `BOT_INTERNAL_SECRET` | cms + bot | cms + bot |
| `BOT_INTERNAL_URL` | `http://bot:3002` or empty to skip | `http://bot:3002` |
| GoGym API vars | — | **Drop** |

Ship `apps/*/.env*.example` (including `apps/bot/.env.example`) and `.deploy/setup.sh` that copies `*.example` → real files. Validate required vars at boot. Bot/CMS notify details: [12-telegram-bot.md](./12-telegram-bot.md).

## CI / Deploy

### CI (`ci.yml`)

- PR: `pnpm install --frozen-lockfile` → format → lint → typecheck.
- **Adapt:** widen path filters (Dockerfiles, eslint, turbo); add build or image build job; concurrency group.

### Deploy

- Branches: `dev` → staging, `main` → production; SSH + `docker compose build/up` per service; path filters for web vs cms vs bot.
- **Adapt:** Environment-scoped secrets (`SSH_*`); matrix job; server-side `deploy.sh`; `git fetch && reset --hard`; `StrictHostKeyChecking=yes` + known_hosts; `cancel-in-progress: false` on main; health gate after up; include Dockerfiles (`Dockerfile.cms` / `Dockerfile.web` / `Dockerfile.bot`) and `apps/bot/**` in path filters; consider web rebuild when `payload-types.ts` changes.

## Seeds

**Keep:** idempotent `payload run` scripts; upsert by slug/filename; per-locale writes; `:local-media` by blanking S3 env; assets next to scripts; README with block order.

**Adapt:** shared `scripts/lib/media.ts`; `pnpm seed <area> [--local-media]`; `seed-all` with dependency graph.

**Drop:** AS Service copy/assets; one-off patch scripts; committed 8MB production-like snapshot (or replace with minimal Autosearch demo + LFS).

**Mongo/MinIO snapshot CLI** (`.deploy/seed/seed.mjs`): Keep mongodump + `mc mirror` approach; Adapt container name defaults; harden prod restore confirmation.

## Scaffolder (`apps/web/src/scripts/new.ts`)

**Keep** `pnpm new component|view` file layout (tsx + module.scss + index).

**Adapt:** fix `--tag=` parsing and usage text; fix broken `new-icon` template; add `pnpm new block <area>/<Name>` that stubs CMS block + web component + mapper reminder.

## Proposed AGENTS.md outline

```md
# AGENTS.md — Autosearch monorepo

## 1. What this is
## 2. Stack cheat sheet
## 3. Repo map
## 4. Commands
## 5. Content model (Pages viewType, globals)
## 6. Block recipe (6 steps) + `pnpm new block`
## 7. Design source (Figma URL when available)
## 8. Styling & tokens (single set + theme switch)
## 9. i18n (Ukrainian default `ua` + English `en`; translations sync; Payload fallback:false)
## 10. Environment & infra pointers
## 11. Seeding & local-media
## 12. Deploy (pointer to DEPLOYMENT.md)
## 13. Known quirks / do-not-fix table
## 14. Definition of done
    - generate:types → typecheck → lint
    - i18n keys in both files
    - no hardcoded user-facing copy
    - graceful empty CMS fields
```

## Keep / Adapt / Drop (infra)

| Area | Keep | Adapt | Drop |
| --- | --- | --- | --- |
| Docker | prune 3-stage, bypass turbo build, basePath assert | pins, healthchecks, rename files, `Dockerfile.bot` | unused Dockerfiles |
| Compose | Traefik `/cms` routing, MinIO pin, env_file caveat | healthchecks, Traefik ownership, bot `/telegram` + polling in dev | legacy cms host, `version:` || Seed | idempotent payload scripts | unified runner, safer prod restore | AS content dump |
| CI/CD | quality job, SSH compose deploy | secrets model, health gate, filters | duplicated deploy jobs as-is |
| DX | new scaffolder, AGENTS structure | block generator, env examples | gogym / Smarty defaults |
