# 01 — Architecture

Starter-spec for **AS Autosearch** (car dealership landing), distilled from the AS Service monorepo at `wayon/landing`. Same stack; clean naming; no legacy Wayon/GoGym surface.

## Verdict summary

| Area | Decision |
| --- | --- |
| Workspace | **Keep** pnpm + Turborepo apps under `apps/` (cms + web + bot) |
| Scope name | **Adapt** `@wayon-landing/*` → `@autosearch/{cms,web}`; **Add** `@autosearch/bot` |
| Shared packages | **Adapt** — add `packages/{config,tsconfig,eslint-config}` (optional but recommended) |
| Type sharing | **Keep** workspace `import type` from CMS `payload-types`; **Adapt** add package `exports` |
| Styling | **Keep** SCSS Modules only; **Drop** Tailwind / `prettier-plugin-tailwindcss` |
| Theme | **Adapt** — single semantic token set with light/dark switch (see [04-design-tokens.md](./04-design-tokens.md)) |

## Stack (pin these versions as a baseline)

| Area | Version |
| --- | --- |
| Package manager | `pnpm@10.11.0` |
| Orchestrator | `turbo ^2.3.3` |
| Node | 20 (CI + Docker `node:20-alpine` / bookworm-slim for sharp) |
| TypeScript | `5.7.x` (align root + apps to one pin) |
| Next.js | `15.4.11` (both apps) |
| React / React DOM | `19.2.1` |
| Payload | `3.83.0` (pin **all** `@payloadcms/*` to the same version) |
| i18n | `next-intl 4.0.2` — **Ukrainian (default) + English** (`ua` / `en`) |
| Payload client | `@payload-enchants/sdk 1.2.2` |
| Forms | `react-hook-form ^7.54.0` |
| Animation | `framer-motion`, `lenis`, `swiper` |
| DB / storage | MongoDB 7, S3 / MinIO |

## Workspace layout (current → target)

**Current:** `pnpm-workspace.yaml` is only `apps/*`. No `packages/`. Web depends on CMS via `"@wayon-landing/cms": "workspace:*"` and imports `@wayon-landing/cms/src/payload-types`.

**Target tree:**

```
autosearch/
├─ apps/
│  ├─ cms/                    # @autosearch/cms  — Payload 3 + Next, :3001
│  ├─ web/                    # @autosearch/web  — Next 15 + next-intl, :3000
│  └─ bot/                    # @autosearch/bot  — grammY staff Telegram bot, :3002
├─ packages/                  # recommended
│  ├─ config/                 # defaultLocale=ua, locales=[ua,en] (shared runtime)
│  ├─ tsconfig/
│  └─ eslint-config/
├─ .deploy/                   # compose, Traefik, seed, env examples
├─ .github/workflows/
├─ Dockerfile.cms
├─ Dockerfile.web
├─ Dockerfile.bot
├─ package.json
├─ pnpm-workspace.yaml        # apps/*, packages/*
├─ turbo.json
├─ AGENTS.md
└─ docs/
```

Staff Telegram bot contract: [12-telegram-bot.md](./12-telegram-bot.md).

## Type sharing

- Generate `apps/cms/src/payload-types.ts` with `pnpm generate:types`.
- Web imports: `import type { Page, Media, Config } from '@autosearch/cms/payload-types'`.
- Add CMS `package.json` exports: `"./payload-types": "./src/payload-types.ts"`.
- Keep imports **type-only**. Do not create a runtime CMS→web coupling except for a shared `packages/config` locales module.
- Typed REST client: lazy `Proxy` around `PayloadApiClient<Config>` hitting `${getCmsBaseUrl()}/api` (see [03-frontend-patterns.md](./03-frontend-patterns.md)).

## Scripts to carry over

| Script | Purpose |
| --- | --- |
| `dev` / `dev:cms` / `dev:web` / `dev:bot` | Turbo filtered dev |
| `build:cms` / `build:web` / `build:bot` | Production builds |
| `lint` / `format` / `typecheck` | Quality gates |
| `generate:types` | Payload types (CMS) |
| `new` | Scaffold component/view (and later `block`) |
| `seed:*` / `seed:backup` / `seed:restore` | Content + Mongo/MinIO snapshots |

## Turbo

Current `turbo.json` only defines `dev` and `build`, with a short `globalEnv` list. Docker builds already bypass `turbo run build` because Turbo 2 strict env stripping can drop `CMS_BASE_PATH` / `NEXT_PUBLIC_*`.

**Adapt:**

- Add tasks: `generate:types`, `lint`, `typecheck`.
- Expand `globalEnv` / per-task `env` for all build-time vars.
- Keep the Docker “bypass Turbo for the actual build” comment and pattern.

## Env vars (architecture-level)

Declared today in `turbo.json` `globalEnv`:

- `CMS_BASE_PATH`, `NEXT_BASE_PATH`
- `NEXT_PUBLIC_CMS_URL`, `NEXT_PUBLIC_URL`
- `NEXT_PUBLIC_GTM_ID`
- `NEXT_PUBLIC_S3_PUBLIC_URL`, `NEXT_PUBLIC_S3_BROWSER_BASE`

Also required at runtime (full matrix in [06-infra-devex.md](./06-infra-devex.md)): `PAYLOAD_SECRET`, `DATABASE_URI`, `CMS_INTERNAL_URL`, S3/MinIO set, SMTP optional. Bot/CMS notify: `TELEGRAM_BOT_TOKEN`, `BOT_INTERNAL_SECRET`, `BOT_INTERNAL_URL` (optional empty = skip), webhook vars in prod — see [12-telegram-bot.md](./12-telegram-bot.md).

**Adapt:** ship `apps/cms/.env.example`, `apps/web/.env.local.example`, and `apps/bot/.env.example`. Fail fast on missing required vars.

## Keep / Adapt / Drop

### Keep

- App monorepo (cms + web + bot), SCSS Modules (web), Payload block architecture, typed SDK client, next-intl with **Ukrainian default + English**, `localePrefix: 'as-needed'`, Docker turbo-prune multi-stage images, CI quality job (format/lint/typecheck).

### Adapt

- Rename scope, containers, buckets, networks to `autosearch-*`.
- Single theme token system + dark/light switch.
- Shared `packages/config` for locales: `defaultLocale = 'ua'`, `locales = ['ua', 'en']` (eliminate duplicate `cms/src/config.ts` vs `web/src/utils/config.ts`).
- ESLint flat config without dead `--ext`; drop unused perfectionist/padding noise.
- Derive `images.remotePatterns` from env, not hardcoded hosts.

### Drop

- `@wayon-landing` naming, GoGym / Smarty Landing hosts and defaults.
- `prettier-plugin-tailwindcss`, npm `path` shim, unused `slate`, CMS `.yarnrc` / `.npmrc`.
- Explore system, gamification blocks, subscriptions viewType (details in [02-cms-model.md](./02-cms-model.md)).
- Duplicate root `settings.json` / `launch.json` / `extensions.json` outside `.vscode/`.

## Ports and base path

| App | Dev port | Prod URL shape |
| --- | --- | --- |
| Web | 3000 (Docker host 3200) | `https://<site>/` |
| CMS | 3001 (Docker host 3201) | `https://<site>/cms` via `CMS_BASE_PATH=/cms` |
| Bot | 3002 | `https://<site>/telegram` webhook (Traefik `PathPrefix(/telegram)`); internal CMS↔bot on Docker network |

Do not create a Pages slug `cms` or `telegram` (collides with prod path prefixes). Media uses `/api/media-redirect?k=…` (presigned S3 GET).
