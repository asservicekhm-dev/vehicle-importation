# AGENTS.md — Autosearch monorepo

Read this before making changes. The product spec lives in [`specs/`](./specs/README.md); this file is the operational summary. When this file and the spec disagree, the spec wins — then update this file.

Current state: **Milestone 1 (tokens & theme)** of [`specs/08-bootstrap-roadmap.md`](./specs/08-bootstrap-roadmap.md). Items marked _(M<n>)_ are planned, not built yet.

## 1. What this is

Website for **AS Autosearch**, a car dealership / car-search (“Автопідбір”) business. Ukrainian is the default language, English is the second one. Payload CMS 3 + Next.js 15 monorepo with the same architecture as the AS Service site (`wayon/landing`), minus its Wayon/GoGym legacy.

- `apps/cms` — `@autosearch/cms`, Payload admin + REST API (port 3001; `/cms` in prod). Source of truth for all content.
- `apps/web` — `@autosearch/web`, public Next.js site (port 3000). Renders CMS content; almost no hardcoded copy.

## 2. Stack cheat sheet

Pinned baseline: [`specs/01-architecture.md`](./specs/01-architecture.md) § Stack.

| Area            | Version / choice                                                                     |
| --------------- | ------------------------------------------------------------------------------------ |
| Package manager | `pnpm@10.11.0` (`packageManager` field), Turborepo 2                                 |
| Node            | 20 (`.nvmrc`)                                                                        |
| TypeScript      | `5.7.3` everywhere                                                                   |
| Next.js / React | `15.4.11` / `19.2.1` in both apps                                                    |
| Payload         | `3.83.0` — pin **all** `@payloadcms/*` to the same version                           |
| DB / storage    | MongoDB 7, S3 / MinIO _(M3)_                                                         |
| i18n            | `next-intl 4.0.2` (translations + provider now; `[locale]` routing _(M2)_)           |
| Styling         | **SCSS Modules only.** No Tailwind, no `prettier-plugin-tailwindcss`                 |
| Later (pinned)  | `@payload-enchants/sdk 1.2.2`, `react-hook-form ^7.54`, framer-motion, lenis, swiper |

## 3. Repo map

```
apps/
  cms/                 @autosearch/cms
    src/payload.config.ts
    src/collections/   Users (M0); Media, Pages, … (M3)
    src/app/(payload)/ Payload admin + API routes (generated files — don't hand-edit)
    src/payload-types.ts  generated; web imports it type-only
  web/                 @autosearch/web
    src/app/           App Router (root layout now; [locale]/ in M2)
    src/components/    ThemeToggle (temp on home; Header in M2)
    src/fonts/         Toxigenesis + Gilroy (localFont)
    src/lib/fonts.ts   next/font loaders
    src/lib/theme/     cookie + no-flash script + client apply
    src/i18n/          next-intl request config (no locale routing yet)
    src/scss/          mixins.scss (auto-injected), globals.scss, tokens.scss
    translations/      ua.json + en.json
packages/
  config/              @autosearch/config — locales + themePreferences (default system)
  tsconfig/            @autosearch/tsconfig — base.json, nextjs.json
  eslint-config/       @autosearch/eslint-config — flat config (`.` base, `./next`)
specs/                 product/architecture spec (read-only reference)
Dockerfile.cms, Dockerfile.web, .deploy/   stubs until M7
```

Shared packages ship TypeScript source (no build step). Apps list them in `transpilePackages`.

## 4. Commands

Run from the repo root:

| Command                                            | What it does                               |
| -------------------------------------------------- | ------------------------------------------ |
| `pnpm install`                                     | Install workspace                          |
| `pnpm dev` / `pnpm dev:cms` / `pnpm dev:web`       | Turbo dev (web :3000, cms :3001)           |
| `pnpm build` / `build:cms` / `build:web`           | Production builds                          |
| `pnpm generate:types`                              | Regenerate `apps/cms/src/payload-types.ts` |
| `pnpm lint` / `pnpm lint:fix`                      | ESLint in every package                    |
| `pnpm typecheck`                                   | `tsc --noEmit` in every package            |
| `pnpm format` / `pnpm format:fix`                  | Prettier check / write                     |
| `pnpm --filter @autosearch/cms generate:importmap` | Regenerate Payload admin import map        |

Planned: `pnpm new component|view|block` _(M7)_, `pnpm seed <area> [--local-media]` _(M3+)_, `seed:backup` / `seed:restore` _(M7)_.

## 5. Content model

Spec: [`specs/02-cms-model.md`](./specs/02-cms-model.md).

- **Now:** `users` (auth) only. Localization is on: `ua` (default) + `en`, `fallback: false`.
- _(M3)_ `pages` with one localized `layout` blocks field + `viewType` (`home | information | contacts | catalog | blog`), `media`, globals `header`, `footer`, `contacts`, `site-settings` (incl. `defaultTheme`, `enableThemeToggle`), plugins SEO / redirects / form-builder / S3.
- _(M4)_ `forms` → `form-submissions` → `leads` inbox ([`specs/09-booking-and-leads.md`](./specs/09-booking-and-leads.md)).
- _(M5)_ `brands`, `cars` (+ taxonomies); `/cars`, `/cars/[slug]` routes.
- **Never add:** Explore, `subscriptions` viewType, gamification blocks, GoGym/Smarty APIs.
- Do not create a Pages slug `cms` (collides with the prod `/cms` base path).

## 6. Block recipe _(M3+)_

1. Schema in `apps/cms/src/collections/Pages/blocks/<area>/<Name>Block.ts`.
2. Register it in the shared blocks registry.
3. `pnpm generate:types`.
4. Map it in the single web mapper (`'slug': Component`, `satisfies BlockMapper<UnifiedBlock>`).
5. Build the component; return `null` when CMS fields are empty (graceful-null, [`specs/03-frontend-patterns.md`](./specs/03-frontend-patterns.md) § 10).
6. Rendered via `RenderBlocks` + registry; unknown `blockType` → `null`.

`pnpm new block <area>/<Name>` will scaffold steps 1, 4 and 5 _(M7)_.

## 7. Design source

No Autosearch Figma file yet. Until one is provided, the spec is code-derived: follow [`specs/04-design-tokens.md`](./specs/04-design-tokens.md) and [`specs/05-components.md`](./specs/05-components.md). Don't eyeball colors from AS Service screenshots.

## 8. Styling & tokens

- SCSS Modules co-located with components (`Name.module.scss`).
- Breakpoint mixins in `apps/web/src/scss/mixins.scss` are auto-injected (`sassOptions.additionalData`); do not `@use` them manually. Only `tablet` (≥768), `laptop` (≥1200), `desktop` (≥1750), `maxTablet` (≤767).
- Semantic tokens live in `apps/web/src/scss/tokens.scss` (`--color-*`, radius, space, fonts, type scale). Themes: `:root` / `[data-theme=light]` and `[data-theme=dark]`.
- Theme preference: cookie `theme` → `defaultThemePreference` from `@autosearch/config` (`system` today) → OS. SiteSettings `defaultTheme` / `enableThemeToggle` arrive in _(M3)_.
- SSR sets `data-theme-pref` and, when preference is explicit light/dark, `data-theme`. An inline head script resolves `system` via `matchMedia` before paint. Client helper: `apps/web/src/lib/theme/`.
- `ThemeToggle` is temporary on the home page; _(M2)_ moves it into Header (desktop + mobile).
- Stylelint on `*.module.scss` (web `lint`): no hex/named/rgb(a)/hsl(a), no `--_p-*`, no `var(--token, fallback)`. `tokens.scss` / `globals.scss` are exempt.
- Hard rules (review blockers): no alias tokens (`--old: var(--new)`), no `--as-*` / legacy Wayon palette, modules never use `--_p-*` primitives, no hex/rgb literals in `*.module.scss`, no `var(--token, #fallback)`.

## 9. i18n

- Exactly two locales from `@autosearch/config`: `ua` (default, **no URL prefix**) and `en` (`/en/…`). Never redefine locale lists in an app.
- SEO / `<html lang>` map `ua` → `uk` via `localeToHreflang`; the app/CMS code stays `ua`.
- `next-intl` is wired with a request config + `NextIntlClientProvider` and `translations/{ua,en}.json`. Every new key must exist in **both** files. Locale routing / middleware / Header switcher arrive in _(M2)_ (`localePrefix: 'as-needed'`, `localeDetection: false`).
- Payload `fallback: false`: editors fill both locales; seeds write both.

## 10. Environment & infra

- `apps/cms/.env.example` → `apps/cms/.env`; `apps/web/.env.local.example` → `apps/web/.env.local`.
- CMS fails fast on missing `PAYLOAD_SECRET` / `DATABASE_URI` (`src/lib/env.ts`).
- Full env matrix: [`specs/06-infra-devex.md`](./specs/06-infra-devex.md) § Env matrix. No default GTM id, no GoGym vars.
- Turbo runs in strict env mode: build-time vars go in `turbo.json` `globalEnv`, runtime-only secrets in `globalPassThroughEnv`. Add new vars there or Turbo strips them.
- Local MongoDB: anything on `mongodb://127.0.0.1:27017/autosearch` (e.g. `docker run --rm -p 27017:27017 mongo:7`) until the dev compose lands _(M7)_.
- Naming: packages `@autosearch/*`; containers / network / bucket / DB `autosearch-*` / `autosearch-network` / `autosearch-media` / `autosearch`.

## 11. Seeding & local media _(M3+)_

Idempotent `payload run` scripts that upsert by slug/filename and write both locales; `--local-media` blanks S3 env to use local disk. No AS Service content or assets.

## 12. Deploy _(M7)_

`DEPLOYMENT.md` will cover it. Pattern: `turbo prune` 3-stage Docker images built with `pnpm --filter … build` (not `turbo run build`), Next standalone, CMS basePath assert, Traefik with site `/` + CMS `/cms`.

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

Payload-generated files under `apps/cms/src/app/(payload)/` and `importMap.js`: regenerate, don't hand-edit.

## 14. Definition of done

- [ ] `pnpm generate:types` → `pnpm typecheck` → `pnpm lint` → `pnpm format` all green
- [ ] New UI strings added to **both** `translations/ua.json` and `translations/en.json`
- [ ] No hardcoded user-facing copy (CMS or translations)
- [ ] CMS-driven components render gracefully (or `null`) when fields are empty
- [ ] No hex/rgb in SCSS modules; tokens only
