# 07 — Domain mapping (AS Autosearch dealership)

Maps dealership product needs onto patterns from AS Service.

**Locales (fixed):** Ukrainian is the default language; English is the second supported language (`ua` / `en`).

## Product framing

| AS Service (source) | AS Autosearch (target) |
| --- | --- |
| Auto repair / maintenance site | Car dealership / car search (“Автопідбір”) |
| Services catalog + single service pages | Inventory + car detail + services (finance, trade-in) |
| Parts Selection wizard | Car selection / preference wizard |
| Booking form | Test-drive / callback / trade-in leads |

## Sitemap (proposed)

```
/                         Home
/cars                     Inventory listing (filters + load more)
/cars/[slug]              Car detail
/brands                   Optional brands index
/brands/[slug]            Brand landing (optional)
/services/[slug]          Finance, trade-in, warranty, insurance…
/autosearch or /pidbir    Multi-step car-search wizard
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
| Inventory | Dedicated route `/cars` + optional CMS shell page | Listing UI (new) + filters from `cars` / taxonomies |
| Car detail | `/cars/[slug]` | service-hero→gallery, service-info→summary+price, feature cards, benefits, related cars, booking-form |
| Service landing | `Pages` or `services` collection + blocks | Same stack as AS single-service |
| Autosearch wizard | Dedicated client flow + lead submit | New multi-step UI; reuse form submission |
| About | `Pages` blocks | about-intro, team, video, reviews, faq |
| Blog | viewType `blog` + collection | Existing Blog views |
| Contacts | viewType `contacts` | contacts-info, form, our-links |
| Legal | viewType `information` | Rich text / article blocks |

## Feature → pattern reuse

| Feature | Reuse from source | Gaps to build |
| --- | --- | --- |
| Inventory listing | `useLoadMore`, BlogFilterTabs pattern, ServicesCatalog UX | Server filters, pagination, `CarCard`, sort, URL query sync |
| Car detail gallery | ServiceGallery, ServiceHero | Lightbox, thumbnails, status badges |
| Specs table | ServiceFeatureCards / new | Spec grid from `cars` fields |
| Brands marquee | CarBrands | Drive from `brands` collection |
| Lead forms | BookingForm + ContactsForm + `sendForm` → `form-submissions` → `leads` | Same primary inbox as AS Service; see [09-booking-and-leads.md](./09-booking-and-leads.md). Hidden car id, lead type, optional date; no GoGym |
| Test drive | FeedbackModal / booking-form | Same inbox; calendar/slot optional and informational only |
| Trade-in / finance | PartsHow (steps) + booking-form + services pages | Dedicated services docs |
| Autosearch wizard | Parts Selection multi-step idea (AS) | New wizard state machine; no Parts schema lock-in |
| Team | TeamBlock | Optional `team-members` collection |
| Reviews | Testimonials / Reviews | Optional `reviews` collection |
| Map / branches | contacts-info + contacts global | Multi-branch if needed |
| Theme | — | See [04-design-tokens.md](./04-design-tokens.md) |
| SEO | seoUtils, sitemap | Vehicle/AutoDealer JSON-LD; cars in sitemap |

## Block composition recipes

### Home (CMS)

```
auto-hero-block
about-intro-block
directions-block          # New / Used / Trade-in / Finance
popular-services-block    # or featured-cars listing block (new)
car-brands-block
testimonials-block
service-faq-block
booking-form-block
blog-home-block
```

### Car detail (route + optional CMS blocks)

```
page-breadcrumbs-block
service-hero / gallery
service-info (price + CTAs: test drive, call, credit)
service-feature-cards / specs
service-benefits
related-services → related cars
booking-form-block
```

### Autosearch wizard (app route)

Steps (proposal — confirm with stakeholders):

1. Budget / payment preference  
2. Body type / seats  
3. Fuel / transmission  
4. Brand preferences  
5. Contact capture → `leads` type `general` or `callback`

Persist answers in URL or session; submit via `sendForm` with structured `submissionData`.

## viewType / collection checklist

| Need | Use |
| --- | --- |
| Marketing landings | `pages` + blocks |
| Inventory CRUD | `cars` (+ brands, models, taxonomies) |
| Leads inbox | `leads` (replacing contact-submissions) |
| After-sales / finance content | `services` or pages |
| News | `blog*` |
| Nav / chrome | globals Header, Footer, Contacts, SiteSettings |

**Drop from greenfield:** Explore, subscriptions, gamification blocks, gogym feedback API.

**Booking:** lead capture only (not a workshop calendar). Pipeline and acceptance criteria in [09-booking-and-leads.md](./09-booking-and-leads.md).

## Open questions (content / product)

1. Single showroom or multi-branch?
2. New only, used only, or both? Certified program?
3. Live inventory sync (CRM/DMS) vs CMS-only editors?
4. Autosearch wizard mandatory on home or separate IA?
5. Financing partners (banks) — logos only or deep links?
6. Default theme: light, dark, or system?
7. Keep Toxigenesis/Gilroy licenses for Autosearch?
8. GTM / analytics IDs for the new property?
9. Domain and `/cms` path on same host (recommended) vs split?

*(Languages are decided: Ukrainian default + English. App locale codes stay `ua`/`en`; SEO hreflang uses `uk` for Ukrainian.)*

## Success criteria for v1

- Home + inventory list + car detail + contacts + lead form working end-to-end.
- Light/dark theme with no flash and WCAG AA on core text pairs.
- CMS editors can update copy/media without deploys.
- Full Ukrainian (default) + English parity for chrome, CMS fields, and seeded pages.
- Deployable via same Docker/Traefik pattern under `autosearch` names.
