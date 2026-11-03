# 03 — Frontend patterns

Source: `apps/web`. Patterns are ranked Keep / Adapt / Drop for Autosearch.

## Summary matrix

| Pattern | Verdict |
| --- | --- |
| `[locale]` App Router + catch-all `[slug]` | **Keep** (trim routes) |
| `viewType` → handler → view | **Adapt** |
| `RenderBlocks` + mappers | **Keep** (slim mapper) |
| Lazy Payload SDK Proxy | **Keep** |
| next-intl + CMS redirects middleware | **Adapt** |
| SEO / sitemap / robots | **Adapt** |
| Form pipeline | **Adapt** (drop gogym) |
| `force-dynamic` + depth | **Adapt** |
| Graceful-null blocks | **Keep** (mandatory) |

## 1. App Router

```
src/app/
  robots.ts
  sitemap.xml/
  [locale]/
    layout.tsx          # <html>, fonts, globals, providers
    page.tsx            # re-exports [slug] (home)
    [slug]/page.tsx     # CMS pages via viewType
    blog/[slug]/
    author/[slug]/      # Drop unless needed
    explore/…           # Drop
    under-development/… # Optional Drop
```

**Do**

- Keep `[locale]/layout.tsx` as the only root layout.
- Load `header` / `footer` / `contacts` with `Promise.all` + try/catch fallback.
- Pass globals through `GlobalsProvider`; do not re-fetch in leaves.
- Await `params` / `searchParams` (Next 15 promises).
- Keep thin `app/` files; put UI in `views/` and `components/`.

**Don't**

- Hardcode site title (`Smarty Landing`) or `themeColor: '#130520'`.
- Keep `/go` chrome-hiding gate.
- Add App Router routes for content that a `viewType` can model — prefer CMS pages over one-off routes (blog detail may still be a dedicated route).

## 2. viewType routing

Flow in `[slug]/page.tsx`:

1. `getPageBySlug` → `payload.find({ collection: 'pages', depth: 8, locale, where: { slug } })`.
2. `generateMetadata` via `generatePageMetadata`.
3. `match(page.viewType).with(...).otherwise(() => null)`.

Handlers live in `appViewHandlers/pageBySlugViewHandlers.tsx`.

**Do**

- Wrap `getPageBySlug` in React `cache()` (blog already does; pages do not — double fetch today).
- Keep handlers returning views; fetch view-specific data inside the handler.
- Sync enum ↔ CMS select ↔ `.with()` branches.

**Don't**

- Import Explore / Subscriptions viewTypes into a greenfield project.
- Use unbounded `limit: 1000` scans without `select`.

**Autosearch enum sketch:** `home | information | contacts | blog` (+ optional placeholders).

## 3. RenderBlocks

```
Page.layout / homeBlocks
  → <RenderBlocks mapperKey="unified" />
  → RenderBlocksBody (client)
  → BLOCK_MAPPERS[mapperKey]
  → mapper[block.blockType] → Component
```

- Types: `UnifiedBlock` from generated `Page` type; mappers use `satisfies BlockMapper<UnifiedBlock>`.
- Pass only serializable `mapperKey` across the RSC → client boundary.
- Unknown `blockType` → `null`.
- Stable section `id`s from CMS block name; `scroll-margin-top: 96px`.
- Responsive wrappers SSR both branches, then keep one after `matchMedia(768)`.

**Do / Don't**

- Do compose mappers with spreads.
- Don't pass mapper objects as props.
- Don't keep page-specific hacks like `enrichPartsAssortmentGallery` in the renderer.
- Don't start with the 55-entry legacy mapper — one dealership mapper only.

## 4. Payload client (`src/api/index.ts`)

- Lazy `Proxy` → `PayloadApiClient<Config>` with `apiURL: ${getCmsBaseUrl()}/api`.
- `getCmsBaseUrl()`: `CMS_INTERNAL_URL` (server) else `NEXT_PUBLIC_CMS_URL`.
- Fetcher currently tags everything `['tag']` — useless with `force-dynamic`.

**Adapt:** per-collection tags when moving to ISR + on-demand revalidation.

## 5. i18n + middleware

**Requirement:** support exactly two languages — **Ukrainian (default)** and **English**.

| | Ukrainian | English |
| --- | --- | --- |
| Locale code | `ua` | `en` |
| URL | no prefix | `/en/…` |
| Translations | `translations/ua.json` | `translations/en.json` |

- `localeDetection: false`, `localePrefix: 'as-needed'` (no Accept-Language redirect).
- Middleware: (1) fetch CMS redirects, (2) next-intl.
- UI chrome (Header, Footer, forms, theme toggle, empty states) uses `next-intl`; every new key is added to **both** message files.
- Locale switcher is required in Header (desktop + mobile).

**Adapt**

- Cache redirects (`revalidate` + `tags: ['redirects']`); do not `no-store` every request.
- One source of truth: `defaultLocale = 'ua'`, `locales = ['ua', 'en']` in `packages/config`.
- Prefer `next-intl` `createNavigation` over duplicated `LocalizedLink` / `useHomeHref` (they disagree on default-locale prefix today).
- Drop placeholder header `x-your-custom-locale`.
- Do not ship a single-locale build or treat English as optional.

## 6. SEO

- Drive metadata from Payload SEO `meta` fields + per-locale `slugs` (hreflang `ua` → `uk`).
- Sitemap: dynamic, degrade to home-only if CMS down; Cache-Control with SWR.
- **Adapt:** site name from `SiteSettings`; paginate large collections (e.g. blog); add JSON-LD (`AutoDealer`); filter duplicate `/home` URLs; disallow admin/api in robots.

## 7. Forms

Booking / enquiry must match the AS Service **primary inbox** only. Full spec: [09-booking-and-leads.md](./09-booking-and-leads.md).

| Piece | Verdict |
| --- | --- |
| `sendForm` → `/api/form-submissions` | **Keep** — sole write path |
| `ContactsForm` (layout slots + validation) | **Adapt** — merge with `CMSForm`; power `booking-form-block` |
| `CMSForm` | Merge into one component |
| afterChange → Admin inbox (`leads`) + optional email | **Keep** (CMS) |
| `submitLandingFeedback` / `gogymApiBase` | **Drop** |
| `acceptCookies` server action | **Drop** (unused; Cookies uses localStorage) |

**Do**

- Proxy writes through a server action (browser never needs CMS write URL).
- Guard unpopulated form relationships (`typeof form === 'string'` → `null`).
- Return early on `!result.ok` — today success toast can fire after Payload failure.
- Seed a booking Form with name/phone/message and `submissionKind` that creates inbox rows.

**Don't**

- Hardcode Russian validation strings.
- Ship without spam protection (honeypot `companyWebsite` + `sendForm` rate limit are required).
- Call any external lead API in parallel with Payload.

## 8. lib / hooks

| File | Verdict |
| --- | --- |
| `lib/cmsBaseUrl.ts` | **Keep** |
| `lib/gtmConsent.ts` + GTM component | **Adapt** — no default GTM id |
| `lib/gogymApiBase.ts` | **Drop** |
| `lib/explore*` | **Drop** |
| `hooks/useLoadMore.ts` | **Adapt** for blog / list UIs |
| `utils/resolvePayloadMediaUrl.ts` | **Keep** |

## 9. force-dynamic and depth

| Location | Today |
| --- | --- |
| layout, `[slug]` | `force-dynamic` |
| Pages fetch | `depth: 8` (comment still says 4) |
| Globals | depth 1–2 |
| Blog post | depth 2–3 |
| Sitemaps | depth 0 |

**Adapt:** start `force-dynamic`, then ISR + webhook revalidation; named `PAGE_DEPTH` (~3–4) with documented rationale; `select` for lists.

## 10. Graceful null rendering (mandatory)

Reference pattern (`AboutWayonBlock` and AS sections):

1. Props optional/nullable.
2. Normalize: trim, filter empty list items.
3. Whole-block `return null` when nothing meaningful remains.
4. Hard-dependency guard for relationships.
5. Per-element conditional render.
6. `aria-labelledby` only when a heading exists.
7. Don't hardcode UA/RU fallbacks — use `next-intl`.

## Autosearch route sketch

| Route | Source |
| --- | --- |
| `/`, `/[slug]` | Pages + viewType (Home holds About `#about` + Contacts `#contacts` sections) |
| `/blog`, `/blog/[slug]` | Blog |
| `/services/…` | Service landings (M5) |
| Legal pages | Information viewType |

No `/about` or `/contacts` routes in v1 — chrome uses Home anchors.
