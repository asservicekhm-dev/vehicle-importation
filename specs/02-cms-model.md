# 02 — CMS content model

Source: `apps/cms` (Payload 3.83.0, MongoDB, Lexical, S3/MinIO). Decisions are for a **new** Autosearch dealership project (greenfield), so enum/slug renames do not need migrations of existing AS Service Mongo docs.

## Known issues in the source repo (do not copy)

1. **Cross-app revalidation is ineffective.** CMS `revalidatePath` / `revalidateTag` cannot reach the separate web Next app. Web uses `force-dynamic` and a useless global fetch tag `['tag']`. Replace with a webhook to `WEB_URL/api/revalidate` + shared secret.
2. **`@payloadcms/plugin-search` is installed but not registered.** Dead code.
3. **Form builder is hand-rolled** under `plugins/form-builder/`, not the stock `@payloadcms/plugin-form-builder` wiring.
4. **`TopBanner` global exists but is not registered** in `payload.config.ts`.
5. Stale branding in SEO/footer defaults: “Smarty Landing”, “GoGym YM”.
6. Pages have **no drafts**; live preview only sees saved data.

## Collections — Keep / Adapt / Drop

| Slug | Purpose | Verdict |
| --- | --- | --- |
| `users` | Admin auth | **Keep** — add `role`, `name` |
| `media` | Uploads | **Keep** — localize `alt`, optional `caption` |
| `pages` | CMS-driven routes via `viewType` | **Adapt** — see below |
| `blog` | Posts | **Keep** (optional rename News/Journal) |
| `blog-categories` | Taxonomy | **Keep** |
| `blog-authors` | Authors | **Keep** |
| `forms` | Form Builder defs | **Keep** — extend for lead types (see [09-booking-and-leads.md](./09-booking-and-leads.md)) |
| `form-submissions` | Raw submissions + email | **Keep** — primary write path for booking |
| `contact-submissions` | Lead inbox | **Adapt** → unified `leads` (same hook pattern as today) |
| `newsletter-subscriptions` | Newsletter inbox | **Keep** (optional) |
| `redirects` | 301/302 | **Keep** — cache on web |
| `explore-sections` / `explore-pages` | Docs builder | **Drop** |

### Pages `viewType`

| Value | Verdict |
| --- | --- |
| `home` | **Adapt** → generic landing / blocks page |
| `blog` | **Keep** |
| `contacts` | **Keep** |
| `information` | **Keep** (legal / privacy; drop US/EU region scaffolding) |
| `explore` | **Drop** |
| `subscriptions` | **Drop** |
| `catalog` | **Drop** — no inventory listing viewType |
| `externalLinks` | **Optional** |
| `underDevelopment` | **Optional** |

**Starter enum:** `home | information | contacts | blog`.

**Starter rule:** one localized `layout` (blocks) field instead of six duplicated block arrays (`homeBlocks`, `informationBlocks`, …).

## Globals

| Slug | Verdict | Notes |
| --- | --- | --- |
| `header` | **Adapt** | Rename `prototypeLink` → `ctaLink`; drop GoGym store-link variants |
| `footer` | **Keep** | Fix copyright default |
| `contacts` | **Adapt** | `phones[]`, hours, `branches` relationship |
| `banner` | **Adapt** | Announcement / promo |
| `site-settings` | **Adapt** | Add `siteName`, default meta, analytics IDs, **`defaultTheme`**, `enableThemeToggle` |
| `top-banner` | **Adapt or Drop** | Register as strip, or omit |

## Block inventory (registered in `unifiedPageBlocks.ts`)

### Keep (dealership-ready)

| Slug | Purpose |
| --- | --- |
| `auto-hero-block` | Hero: image, title, CTAs |
| `about-intro-block` | Eyebrow, title, stats, images |
| `page-breadcrumbs-block` | Breadcrumb trail |
| `testimonials-block` | Quote / video slider |
| `reviews-block` | Review cards |
| `service-faq-block` | FAQ + contact panel |
| `booking-form-block` | Lead form + image |
| `service-hero-block` | Full-width image banner |
| `service-info-block` | Intro + buttons |
| `service-feature-cards-block` | Stacked feature cards |
| `service-gallery-block` | Media row + video overlay |
| `service-benefits-block` | Benefit scroller |
| `related-services-block` | Compact card grid |
| `team-block` | Team carousel |
| `video-banner-block` | Video + quote |
| `car-brands-block` | Brand logo marquee |
| `cta-block` | Title + image + buttons |
| `partners-block` | Logo rows (banks / leasing) |
| `blog-home-block` | Featured posts |
| `faq-block` | Generic FAQ |
| `heading-block` | Section heading |
| `contacts-info-block` | Map / photo / directions |
| `contacts-our-links-block` | Social / link cards |
| `contacts-form-block` | Form + layout mapping |
| `responsive-blocks-unified` | Mobile/desktop wrapper |
| `responsive-blocks-section` | Section-scoped wrapper |

Article content (rename from Explore; keep for blog/legal):

| Slug | Verdict |
| --- | --- |
| `hint-block`, `explore-title`, `explore-paragraph`, `explore-image`, `explore-table` | **Keep** (rename for starter) |
| `explore-html`, `explore-feature-card(s)`, `explore-tabs`, `explore-subtitle` | **Drop** |

### Adapt

| Slug | Repurpose |
| --- | --- |
| `popular-services-block` | Features / departments; prefer relation to `services` |
| `directions-block` | “What we offer” (new / used / trade-in / finance) |
| `services-catalog-block` | Service/department tiles with CMS filters (no inventory) |
| `related-services-block` | Relationship-driven related services |
| `car-brands-block` | Marketing logo marquee — manual CMS logos (no `brands` collection) |
| `booking-form-block` + `contacts-form-block` | Merge into one `lead-form-block` |
| `parts-info` / `parts-why` / `parts-how` / `parts-need` | Generic info / why / steps / CTA panels |
| `parts-assortment-block` | **Drop** or accessories only |
| `consultation-cta-block` | Callback lead widget |
| `subscribe-block` | Newsletter |
| `about-wayon-block` | About company (rename label) |
| `home-section-block` | Section wrapper with background token |
| `features-bento-block` | Optional bento |

### Drop

`hero-scroll-block`, `hero-2-block`, `everything-under-control-block`, `launch-map-block`, `launch-regions-block`, `section-faq-block`, `quotes-block`, `comments-block`, `download-app-block`, `play-big-block`, `peek-inside-block`, `forget-quizzes-block`, `challenges-block`, `team-wayon-block`, `contacts-payment-block`, explore wrappers, and unused `downloadButton` field.

## Shared fields (Keep)

| Field | Path | Notes |
| --- | --- | --- |
| `link()` / `linkGroup()` | `fields/link.ts` | Extend `relationTo` with `services`, `promotions` |
| `slugField()` | `fields/slug/` | Localized slug + lock |
| `seoFields` | `fields/seo/` | Manual SEO group |
| `dateField()` | `fields/date/` | `publishedOn` |
| Lexical | `payload.config.ts` | h2/h3, bold, link, lists, blockquote |

## Plugins

| Plugin | Verdict |
| --- | --- |
| SEO | **Keep** — fix title suffix |
| Redirects | **Keep** — cache on web |
| Custom form-builder | **Keep** — harden duplicate-email check; spam protection |
| Search | **Drop** unless required |
| S3 storage | **Keep** |
| Live preview | **Keep** — add drafts + draft mode |
| payload-cloud | **Drop** |

## Media / S3

- When S3 is configured: `generateFileURL` → `/api/media-redirect?k=<key>` → presigned GET (or local disk fallback).
- Env: `S3_BUCKET`, keys, `S3_ENDPOINT`, `S3_PUBLIC_URL`, `S3_FORCE_PATH_STYLE`, optional `S3_PRESIGN_*`.
- Spec note: prefer stable public URLs / CDN for Autosearch if image performance matters; document trade-off vs current presign-302 pattern.

## Locales (fixed requirement)

| Language | Code | URL | Role |
| --- | --- | --- | --- |
| Ukrainian | `ua` | no prefix (`/`, `/about`) | **Default** |
| English | `en` | `/en/…` | Second locale |

- Payload localization: both locales registered; `defaultLocale: 'ua'`; `fallback: false` (editors fill each locale; missing copy does not silently fall back).
- Localized fields (titles, slugs, block copy, SEO) must be authored in **both** Ukrainian and English.
- Seeds write both locales.
- SEO hreflang: map `ua` → `uk` (BCP 47) while keeping the app/CMS locale code `ua` (same as the source repo). Do not rename the code to `uk` unless URLs and Payload docs are migrated together.

## Proposed dealership collections

No inventory collections (`brands`, `models`, `cars`, car taxonomies, `car-features`) in v1.

| Collection | Purpose | Key fields |
| --- | --- | --- |
| `branches` | Showrooms | address, geo, phones, hours, mapEmbed |
| `team-members` | Sales staff | name, photo, phone, branch |
| `services` | Trade-in, finance, after-sales | title, slug, blocks, SEO |
| `leads` | Unified inbox | type, status, branch, UTM, consent |
| `reviews` | Testimonials | rating, text, video |
| `promotions` | Offers | validity, blocks |
| `partners` | Banks / leasing | logo, url, type |
| `faqs` | Reusable FAQ items | question, answer, category |

### `leads`

- `type`: `callback` | `test-drive` | `trade-in` | `finance` | `general`.
- `status`: `new` | `in-progress` | `won` | `lost`.
- Contact fields + optional `branch` relation + source URL + UTM + consent + `formSubmission` link.
- Add rate-limit / honeypot (public create is open today).
- Full booking → inbox behaviour: [09-booking-and-leads.md](./09-booking-and-leads.md).

## Block recipe (carry into AGENTS.md)

1. Define schema in `collections/Pages/blocks/<area>/<Name>Block.ts`.
2. Register in shared blocks registry.
3. `pnpm generate:types`.
4. Map in web mapper (`'slug': Component`).
5. Build component; return `null` when empty.
6. Render via `RenderBlocks` + registry.

## Responsive blocks

`buildResponsiveBlocksBlock({ label, slug, blocks })` → Mobile / Desktop tabs (`mobileBlocks` / `desktopBlocks`), ≤767 / ≥768. Keep one wrapper slug per scope. Nested depth requires high fetch depth on web (today `depth: 8`).
