# AGENTS.md — Autosearch monorepo

Read this before making changes. The product spec lives in [`specs/`](./specs/README.md); this file is the operational summary. When this file and the spec disagree, the spec wins — then update this file.

Current state: **Milestone 7 engineering done** (soft launch code + checklist). Remaining: human/staging gates in [`specs/11-soft-launch-checklist.md`](./specs/11-soft-launch-checklist.md) (theme/palette/fonts sign-off, staging seed + revalidate smoke, a11y QA).

## 1. What this is

Website for **AS Autosearch**, a car-search and import business (“Автопідбір”). Cars from the USA, Europe and South Korea. Core services: pre-purchase inspection, turnkey car search (main), expert for a day, computer diagnostics, and travel to other cities. Ukrainian is the default language, English is the second one. Payload CMS 3 + Next.js 15 monorepo with the same architecture as the AS Service site (`wayon/landing`), minus its Wayon/GoGym legacy. Staff Telegram bot for lead notifications and inbox management (product [`specs/12-telegram-bot.md`](./specs/12-telegram-bot.md), build order [`specs/13-telegram-bot-roadmap.md`](./specs/13-telegram-bot-roadmap.md); **B0–B6** in `apps/bot` + CMS `bot-users` / `/api/bot/*`).

- `apps/cms` — `@autosearch/cms`, Payload admin + REST API (port 3001; `/cms` in prod). Source of truth for all content (Pages, Blog, Leads, `bot-users`, globals).
- `apps/web` — `@autosearch/web`, public Next.js site (port 3000). Renders CMS content; almost no hardcoded copy. Nested Pages via `[...slug]`; Blog at `/blog` + `/blog/[slug]`.
- `apps/bot` — `@autosearch/bot`, Node/TypeScript grammY staff Telegram bot (port 3002; `/telegram` webhook in prod). Ukrainian UI, button-driven leads inbox for approved operators.

## 2. Stack cheat sheet

Pinned baseline: [`specs/01-architecture.md`](./specs/01-architecture.md) § Stack.

| Area            | Version / choice                                                              |
| --------------- | ----------------------------------------------------------------------------- |
| Package manager | `pnpm@10.11.0` (`packageManager` field), Turborepo 2                          |
| Node            | 20 (`.nvmrc`)                                                                 |
| TypeScript      | `5.7.3` everywhere                                                            |
| Next.js / React | `15.4.11` / `19.2.1` in cms + web                                             |
| Payload         | `3.83.0` — pin **all** `@payloadcms/*` to the same version                    |
| Bot             | Node 20 + TypeScript + grammY (no Next.js); Ukrainian UI only                 |
| DB / storage    | MongoDB 7, S3 / MinIO (local disk when `S3_*` unset)                          |
| i18n            | `next-intl 4.0.2` — `ua` unprefixed, `en` under `/en`, middleware `as-needed` |
| Styling         | **SCSS Modules only** (web). No Tailwind, no `prettier-plugin-tailwindcss`    |
| Forms / UI      | `react-hook-form ^7.54`, Radix (accordion, checkbox, dialog, slot), `clsx`    |
| CMS client      | `@payload-enchants/sdk 1.2.2`; types via `@autosearch/cms/payload-types`      |
| Later (pinned)  | framer-motion, lenis, swiper                                                  |

## 3. Repo map

```
apps/
  cms/                 @autosearch/cms
    src/payload.config.ts
    src/collections/   Users, Media, Pages (marketing + service blocks), Blog, BlogCategories, BlogAuthors, Leads, BotUsers
    src/globals/       header, footer, contacts, site-settings, price-list
    src/plugins/       SEO, redirects, form-builder (Forms + FormSubmissions → Leads)
    src/scripts/       seed-globals, seed-home, seed-services, seed-blog
    src/app/(payload)/ Payload admin + API routes (generated files — don't hand-edit)
    src/app/api/media-redirect/  S3/local media redirect
    src/app/api/bot/   CMS↔bot internal routes (secret; lead list/detail/status, access)
    src/payload-types.ts  generated (CMS); web imports stripped `payload-types-export.ts` via `@autosearch/cms/payload-types`
  web/                 @autosearch/web
    src/app/[locale]/  App Router locale + [...slug] CMS pages + blog/[slug]
    src/app/api/revalidate/  CMS→web webhook
    src/api/           Payload SDK client
    src/components/    primitives, Header/Footer, ThemeToggle, LocaleSwitcher, CMS glue, RenderBlocks
    src/contexts/      GlobalsProvider
    src/views/Layout/  Header + main + Footer shell
    src/views/BlogList|BlogPost/  Blog index + post
    src/fonts/         Toxigenesis + Gilroy (localFont)
    src/lib/fonts.ts   next/font loaders
    src/lib/theme/     cookie + no-flash script + client apply
    src/lib/cms/       PAGE_DEPTH, getPageBySlug, getGlobals
    src/i18n/          routing, navigation, request config
    src/middleware.ts  next-intl + CMS redirects
    src/scss/          mixins.scss (auto-injected), globals.scss, tokens.scss
    translations/      ua.json + en.json
  bot/                 @autosearch/bot
    grammY staff Telegram bot; webhook (prod) / long polling (dev)
    Ukrainian button UI; session in-memory; talks to CMS /api/bot/* + receives /internal/*
packages/
  config/              @autosearch/config — locales + themePreferences (default system) + booking options
  tsconfig/            @autosearch/tsconfig — base.json, nextjs.json
  eslint-config/       @autosearch/eslint-config — flat config (`.` base, `./next`)
specs/                 product/architecture spec (read-only reference)
Dockerfile.cms, Dockerfile.web, Dockerfile.bot, .deploy/, .github/workflows/
```

Shared packages ship TypeScript source (no build step). Apps list them in `transpilePackages`.

## 4. Commands

Run from the repo root:

| Command                                                           | What it does                                             |
| ----------------------------------------------------------------- | -------------------------------------------------------- |
| `pnpm install`                                                    | Install workspace                                        |
| `pnpm dev` / `pnpm dev:cms` / `pnpm dev:web` / `pnpm dev:bot`     | Turbo dev (web :3000, cms :3001, bot :3002)              |
| `pnpm build` / `build:cms` / `build:web` / `build:bot`            | Production builds                                        |
| `pnpm generate:types`                                             | Regenerate `apps/cms/src/payload-types.ts`               |
| `pnpm seed:globals` / `seed:home` / `seed:services` / `seed:blog` | Idempotent dual-locale seeds (`*:local-media` blanks S3) |
| `pnpm seed:all` / `seed:all:local-media` / `pnpm seed <area>`     | Seed chain (globals→home→services→blog) or one area      |
| `pnpm seed:backup` / `seed:restore` (+ `:prod`)                   | Mongo + MinIO snapshot via `.deploy/seed/seed.mjs`       |
| `pnpm new component\|view\|block …`                               | Scaffold web UI or CMS block + web stub                  |
| `pnpm lint` / `pnpm lint:fix`                                     | ESLint in every package                                  |
| `pnpm typecheck`                                                  | `tsc --noEmit` in every package                          |
| `pnpm format` / `pnpm format:fix`                                 | Prettier check / write                                   |
| `pnpm --filter @autosearch/cms generate:importmap`                | Regenerate Payload admin import map                      |

## 5. Content model

Spec: [`specs/02-cms-model.md`](./specs/02-cms-model.md).

- **Now:** `users`, `media` (WebP `formatOptions` + `favicon`/`icon` sizes), `pages` (localized `layout` + `viewType`: `home | information | contacts | blog`), `blog` + `blog-categories` + `blog-authors`, `leads` inbox, `bot-users` (Telegram staff access — [`specs/12-telegram-bot.md`](./specs/12-telegram-bot.md); roadmap [`specs/13-telegram-bot-roadmap.md`](./specs/13-telegram-bot-roadmap.md)), globals `header` / `footer` (`logoLight`/`logoDark`/`logoText`) / `contacts` / `site-settings` (`favicon*` + `appleTouchIcon*` + optional `gtmId`) / `price-list`, plugins SEO / redirects / form-builder (Forms + FormSubmissions → leads when `submissionKind: lead`) / conditional S3. Localization: `ua` + `en`, `fallback: false`. Brand WebPs live in `apps/cms/src/seed-assets/brand/` and are upserted by `seed:globals`.
- Home marketing blocks (seed order): `auto-hero`, early `booking-form` (pitch), `about-intro`, `why-choose-us`, `directions`, `comparison`, `price-list` (reads global), `inspection-checklist`, `turnkey-route`, `ukraine-coverage`, `testimonials`, `service-faq`, bottom `booking-form` (callback); also registered `car-brands`, `page-breadcrumbs`. Service landings use `service-hero` / `service-info` / `service-feature-cards` / `service-benefits` / `related-services` + breadcrumbs + booking. Web `sendForm` is the only visitor write path (no GoGym). Spam: honeypot `companyWebsite` + CMS reject + `sendForm` IP rate limit.
- Booking UI: `ServiceBookingForm` modes `consultation` \| `turnkey` \| `inspection` \| `expert`; Directions primary «Замовити» → `?service=<mode>#callback`, secondary «Детальніше» → `/services/…`; option lists in `@autosearch/config`.
- Revalidate: CMS hooks POST `WEB_URL/api/revalidate` with `REVALIDATE_SECRET` (not CMS-local `revalidatePath`). Soft-launch gates: [`specs/11-soft-launch-checklist.md`](./specs/11-soft-launch-checklist.md).
- Telegram bot: CMS may POST `BOT_INTERNAL_URL/internal/leads` after lead create; bot talks to `/api/bot/*` with `BOT_INTERNAL_SECRET`. **Do not** load leads for the bot via public `/api/leads` — Admin `afterRead` auto-flips `new` → `in-progress`. Bot detail must leave status/`readAt` unchanged until the operator taps a status button. Spec: [`specs/12-telegram-bot.md`](./specs/12-telegram-bot.md). Build order: [`specs/13-telegram-bot-roadmap.md`](./specs/13-telegram-bot-roadmap.md).
- SEO: page `generateMetadata`, `robots.ts`, dynamic `sitemap.ts`. GTM via `NEXT_PUBLIC_GTM_ID` or SiteSettings `gtmId` (empty = off) + cookie consent banner.
- About (`#about`) and Contacts (`#contacts`) stay Home section anchors — no `/about` or `/contacts` routes in v1.
- Infra: `.deploy` compose (dev/prod), Traefik, MinIO, CI/deploy workflows, `pnpm new`, seed backup — see [`DEPLOYMENT.md`](./DEPLOYMENT.md) / [`SERVER_SETUP.md`](./SERVER_SETUP.md).
- Booking / leads: [`specs/09-booking-and-leads.md`](./specs/09-booking-and-leads.md).
- **Never add:** Inventory (`cars` / `brands` catalogs, `/cars` routes), Autosearch search wizard, Explore, `subscriptions` / `catalog` viewTypes, gamification blocks, GoGym/Smarty APIs.
- Do not create a Pages slug `cms` or `telegram` (collide with prod `/cms` and `/telegram` path prefixes).

## 6. Block recipe _(M3+)_

1. Schema in `apps/cms/src/collections/Pages/blocks/<area>/<Name>Block.ts`.
2. Register it in the shared blocks registry.
3. `pnpm generate:types`.
4. Map it in the single web mapper (`'slug': Component`, `satisfies BlockMapper<UnifiedBlock>`).
5. Build the component; return `null` when CMS fields are empty (graceful-null, [`specs/03-frontend-patterns.md`](./specs/03-frontend-patterns.md) § 10).
6. Rendered via `RenderBlocks` + registry; unknown `blockType` → `null`.

`pnpm new block <area>/<Name>` scaffolds CMS schema + registry registration + web component; still add the mapper entry and run `pnpm generate:types`.

## 7. Design source

No Autosearch Figma file yet. Design direction: [`specs/10-design-direction.md`](./specs/10-design-direction.md). Tokens: [`specs/04-design-tokens.md`](./specs/04-design-tokens.md). Components: [`specs/05-components.md`](./specs/05-components.md). Identity source is AS Service (fonts, blue, pills, hero radius); structure and dark theme are Autosearch.

## 8. Styling & tokens

- SCSS Modules co-located with components (`Name.module.scss`).
- Breakpoint mixins in `apps/web/src/scss/mixins.scss` are auto-injected (`sassOptions.additionalData`); do not `@use` them manually. Only `tablet` (≥768), `laptop` (≥1200), `desktop` (≥1750), `maxTablet` (≤767).
- Semantic tokens live in `apps/web/src/scss/tokens.scss` (`--color-*`, radius, space, fonts, type scale). Themes: `:root` / `[data-theme=light]` and `[data-theme=dark]`.
- Theme preference: cookie `theme` → SiteSettings `defaultTheme` → `@autosearch/config` `defaultThemePreference` (`system`) → OS. `enableThemeToggle` hides Header toggle when false.
- SSR sets `data-theme-pref` and, when preference is explicit light/dark, `data-theme`. An inline head script resolves `system` via `matchMedia` before paint. Client helper: `apps/web/src/lib/theme/`.
- `ThemeToggle` and `LocaleSwitcher` live in Header (desktop + mobile menu).
- Stylelint on `*.module.scss` (web `lint`): no hex/named/rgb(a)/hsl(a), no `--_p-*`, no `var(--token, fallback)`. `tokens.scss` / `globals.scss` are exempt.
- Hard rules (review blockers): no alias tokens (`--old: var(--new)`), no `--as-*` / legacy Wayon palette, modules never use `--_p-*` primitives, no hex/rgb literals in `*.module.scss`, no `var(--token, #fallback)`.

## 9. i18n

- Exactly two locales from `@autosearch/config`: `ua` (default, **no URL prefix**) and `en` (`/en/…`). Never redefine locale lists in an app.
- SEO / `<html lang>` map `ua` → `uk` via `localeToHreflang`; the app/CMS code stays `ua`.
- `next-intl` uses `localePrefix: 'as-needed'`, `localeDetection: false`, middleware, `createNavigation`, and `translations/{ua,en}.json`. Every new key must exist in **both** files. Locale switcher is in Header.
- Payload `fallback: false`: editors fill both locales; seeds write both.

## 10. Environment & infra

- `apps/cms/.env.example` → `apps/cms/.env`; `apps/web/.env.local.example` → `apps/web/.env.local`; `apps/bot/.env.example` → `apps/bot/.env`.
- CMS fails fast on missing `PAYLOAD_SECRET` / `DATABASE_URI` (`src/lib/env.ts`).
- Full env matrix: [`specs/06-infra-devex.md`](./specs/06-infra-devex.md) § Env matrix. Bot: `TELEGRAM_*`, `BOT_INTERNAL_SECRET`, `BOT_INTERNAL_URL` (empty = skip notify). No default GTM id, no GoGym vars.
- Turbo runs in strict env mode: build-time vars go in `turbo.json` `globalEnv`, runtime-only secrets in `globalPassThroughEnv`. Add new vars there or Turbo strips them.
- Local MongoDB: anything on `mongodb://127.0.0.1:27017/autosearch` (e.g. `docker run --rm -p 27017:27017 mongo:7`) until the dev compose lands _(M6)_.
- Naming: packages `@autosearch/*`; containers / network / bucket / DB `autosearch-*` / `autosearch-network` / `autosearch-media` / `autosearch`.

## 11. Seeding & local media _(M3+)_

Idempotent `payload run` scripts that upsert by slug/filename and write both locales; `--local-media` blanks S3 env to use local disk. No AS Service content or assets.

## 12. Deploy

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) and [`SERVER_SETUP.md`](./SERVER_SETUP.md). Pattern: `turbo prune` 3-stage images (`Dockerfile.cms` / `Dockerfile.web` / `Dockerfile.bot`) with `pnpm --filter … build` (not `turbo run build`), Next standalone for cms/web, bot `tsc` → `node dist`, CMS `basePath` assert + `/cms/api/health`, Traefik site `/` + CMS `/cms` + bot `/telegram`. Host Traefik uses external network `proxy` (bundled Traefik is Compose profile `bundled`). Private network `autosearch-network`.

## 13. Known quirks / do-not-copy from AS Service

| Source behaviour                                                | Autosearch rule                                         |
| --------------------------------------------------------------- | ------------------------------------------------------- |
| CMS `revalidatePath` can't reach the web app                    | Webhook `WEB_URL/api/revalidate` + shared secret _(M3)_ |
| `force-dynamic` + `depth: 8` + global fetch tag `tag`           | Named `PAGE_DEPTH` (~3–4), per-collection tags          |
| Contacts form toasts success after Payload failure; calls GoGym | Success only on `ok`; `sendForm` is the only write path |
| Header “light” mode hardcoded, dark CSS dead                    | Header reads semantic tokens only                       |
| Dual Wayon / `--as-*` palettes                                  | Single semantic set, no aliases                         |
| Duplicate locale config in cms + web                            | `@autosearch/config` only                               |
| `next lint` + dead `--ext`                                      | `eslint .` with flat config per package                 |
| Leads Admin `afterRead` auto-marks `new` as in-progress         | Bot must use `/api/bot/leads` (no side effects on read) |

Payload-generated files under `apps/cms/src/app/(payload)/` and `importMap.js`: regenerate, don't hand-edit.

## 14. Definition of done

- [ ] `pnpm generate:types` → `pnpm typecheck` → `pnpm lint` → `pnpm format` all green
- [ ] New UI strings added to **both** `translations/ua.json` and `translations/en.json`
- [ ] No hardcoded user-facing copy (CMS or translations)
- [ ] CMS-driven components render gracefully (or `null`) when fields are empty
- [ ] No hex/rgb in SCSS modules; tokens only

<!-- seoagent:skill -->

## SEOAgent

This repo uses SEOAgent — a persistent AI SEO agent. Its state lives in `.seoagent/`.

- At session start, read `.agents/skills/seoagent/SKILL.md` — the working contract for all SEO tasks.
- At the start of each session, run `seoagent sync`. If it lists pending inbox actions, work them unless the user asked for something else first: read `.seoagent/inbox/README.md`, do each one, then `seoagent ack <id>`.
