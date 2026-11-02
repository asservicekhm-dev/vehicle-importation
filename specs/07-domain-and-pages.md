# 07 — Domain mapping (AS Autosearch dealership)

Maps dealership product needs onto patterns from AS Service.

**Locales (fixed):** Ukrainian is the default language; English is the second supported language (`ua` / `en`).

## Product framing

| AS Service (source) | AS Autosearch (target) |
| --- | --- |
| Auto repair / maintenance site | Car dealership / car search (“Автопідбір”) marketing site |
| Services catalog + single service pages | Services landings (finance, trade-in, warranty, …) |
| Parts Selection wizard | **Drop** — no search wizard in v1 |
| Booking form | Callback / enquiry / trade-in leads |

## Sitemap (proposed)

```
/                         Home
/services/[slug]          Finance, trade-in, warranty, insurance…
/about                    About / team
/blog                     News
/blog/[slug]              Post
/contacts                 Contacts + map + form
/privacy (etc.)           Information viewType
```

Locales: Ukrainian (`ua`) unprefixed by default; English (`en`) under `/en/…`. Both are required for chrome, CMS copy, and seeds.

## Page → data source

| Page | Mechanism | Primary blocks / collections |
| --- | --- | --- |
| Home | `Pages` viewType `home` | auto-hero, about-intro, directions, popular/featured, car-brands, testimonials, faq, booking-form, blog-home |
| Service landing | `Pages` or `services` collection + blocks | Same stack as AS single-service |
| About | `Pages` blocks | about-intro, team, video, reviews, faq |
| Blog | viewType `blog` + collection | Existing Blog views |
| Contacts | viewType `contacts` | contacts-info, form, our-links |
| Legal | viewType `information` | Rich text / article blocks |

## Feature → pattern reuse

| Feature | Reuse from source | Gaps to build |
| --- | --- | --- |
| Brands marquee | CarBrands | Manual CMS logos on the block (no `brands` collection) |
| Lead forms | BookingForm + ContactsForm + `sendForm` → `form-submissions` → `leads` | Same primary inbox as AS Service; see [09-booking-and-leads.md](./09-booking-and-leads.md). Lead type, optional date; no GoGym |
| Callback / enquiry | FeedbackModal / booking-form | Same inbox; calendar/slot optional and informational only |
| Trade-in / finance | PartsHow (steps) + booking-form + services pages | Dedicated services docs |
| Team | TeamBlock | Optional `team-members` collection |
| Reviews | Testimonials / Reviews | Optional `reviews` collection |
| Map / branches | contacts-info + contacts global | Multi-branch if needed |
| Theme | — | See [04-design-tokens.md](./04-design-tokens.md) |
| SEO | seoUtils, sitemap | AutoDealer JSON-LD; no vehicle/inventory sitemap |

## Block composition recipes

### Home (CMS)

```
auto-hero-block
about-intro-block
directions-block          # New / Used / Trade-in / Finance
popular-services-block    # features / departments
car-brands-block          # marketing logo marquee (CMS media)
testimonials-block
service-faq-block
booking-form-block
blog-home-block
```

### Service landing (CMS)

```
page-breadcrumbs-block
service-hero / gallery
service-info (summary + CTAs)
service-feature-cards
service-benefits
related-services
booking-form-block
```

## viewType / collection checklist

| Need | Use |
| --- | --- |
| Marketing landings | `pages` + blocks |
| Leads inbox | `leads` (replacing contact-submissions) |
| After-sales / finance content | `services` or pages |
| News | `blog*` |
| Nav / chrome | globals Header, Footer, Contacts, SiteSettings |

**Drop from greenfield:** Inventory (`cars` / `brands` catalogs), Autosearch search wizard, Explore, subscriptions, gamification blocks, gogym feedback API.

**Booking:** lead capture only (not a workshop calendar). Pipeline and acceptance criteria in [09-booking-and-leads.md](./09-booking-and-leads.md).

## Open questions (content / product)

1. Single showroom or multi-branch?
2. New only, used only, or both? Certified program? (marketing copy only — no inventory CRUD)
3. Financing partners (banks) — logos only or deep links?
4. Default theme: light, dark, or system? _(decided for scaffold: system)_
5. Keep Toxigenesis/Gilroy licenses for Autosearch? _(cleared for scaffold)_
6. GTM / analytics IDs for the new property?
7. Domain and `/cms` path on same host (recommended) vs split?

*(Languages are decided: Ukrainian default + English. App locale codes stay `ua`/`en`; SEO hreflang uses `uk` for Ukrainian.)*

## Success criteria for v1

- Home + contacts + lead form working end-to-end.
- Light/dark theme with no flash and WCAG AA on core text pairs.
- CMS editors can update copy/media without deploys.
- Full Ukrainian (default) + English parity for chrome, CMS fields, and seeded pages.
- Deployable via same Docker/Traefik pattern under `autosearch` names.
