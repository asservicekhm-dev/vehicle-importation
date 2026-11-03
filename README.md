# AS Autosearch

Website for **AS Autosearch**, a car-search and import business (“Автопідбір”). Payload CMS 3 + Next.js 15 monorepo. Ukrainian is the default language; English is second.

**Current:** Milestone 5 (secondary IA) shipped. **Milestone 6** (infra harden) adds Docker, `.deploy`, CI/deploy, seed backup, and `pnpm new`.

## How to run

### Prerequisites

- Node.js 20+ (`.nvmrc`)
- pnpm 10 (pinned via `packageManager`; `corepack enable`)
- MongoDB 7 — Docker one-liner or full compose (below)

### Setup

```sh
pnpm install

cp apps/cms/.env.example apps/cms/.env
cp apps/web/.env.local.example apps/web/.env.local
```

`apps/cms/.env` requires `PAYLOAD_SECRET` and `DATABASE_URI`.

### Run (host)

```sh
# Mongo only
docker run -d --rm --name autosearch-mongo -p 27017:27017 mongo:7

pnpm dev          # web :3000, cms :3001
```

| App | URL |
| --- | --- |
| Web (UA) | http://localhost:3000 |
| Web (EN) | http://localhost:3000/en |
| CMS | http://localhost:3001/admin |

### Run (Docker Compose dev)

```sh
cd .deploy
docker compose -f docker-compose.dev.yml --env-file env.dev up -d --build
```

| Service | Host |
| --- | --- |
| Web | http://localhost:3200 |
| CMS | http://localhost:3201 |
| Mongo | localhost:27019 |
| MinIO | http://localhost:9200 (console :9201) |

See [.deploy/README.md](./.deploy/README.md).

### Seeds

```sh
pnpm seed:all
# or without S3/MinIO:
pnpm seed:all:local-media

# single area:
pnpm seed home --local-media
```

Order: globals → home → services → blog.

Mongo/MinIO snapshot backup (running containers):

```sh
pnpm seed:backup
pnpm seed:restore
```

### Other commands

| Command | What it does |
| --- | --- |
| `pnpm build` | Production build |
| `pnpm generate:types` | Regenerate Payload types |
| `pnpm new component\|view\|block …` | Scaffold UI / CMS block |
| `pnpm lint` / `typecheck` / `format` | Quality gates |

## Deploy

Production images: `Dockerfile.cms`, `Dockerfile.web`. Server + Traefik: [SERVER_SETUP.md](./SERVER_SETUP.md). CI/CD: [DEPLOYMENT.md](./DEPLOYMENT.md).

## Layout

```
autosearch/
├─ apps/cms          @autosearch/cms — Payload (:3001, /cms in prod)
├─ apps/web          @autosearch/web — public site (:3000)
├─ packages/         config, tsconfig, eslint-config
├─ .deploy/          compose, Traefik, MinIO, seed backup
├─ .github/workflows ci.yml, deploy.yml
├─ Dockerfile.cms / Dockerfile.web
└─ specs/            product / architecture
```

## Spec

Operational summary: [AGENTS.md](./AGENTS.md). Full product/architecture: [specs/](./specs/README.md).
