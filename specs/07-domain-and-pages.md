# 07 — Domain mapping (AS Autosearch)

Maps product needs onto patterns from AS Service. Product decisions below supersede the earlier “dealership / New·Used·Trade-in·Finance” framing.

**Locales (fixed):** Ukrainian is the default language; English is the second supported language (`ua` / `en`).

## Product framing

| AS Service (source) | AS Autosearch (target) |
| --- | --- |
| Auto repair / maintenance site | Car search & import (“Автопідбір”) marketing site |
| Services catalog + single service pages | Services landings for the five offerings below |
| Parts Selection wizard | **Drop** — no search wizard in v1 |
| Booking form | Callback / enquiry leads |

**Where the cars come from:** the USA, Europe and South Korea. This is the hero origin switcher, separate from the service menu.

**Services** (order from their Instagram; Ukrainian names are drafts for the client to confirm):

1. **Перевірка авто перед покупкою** (pre-purchase / one-time vehicle inspection). One vehicle the client has already chosen.
2. **Підбір авто під ключ** (turnkey car search). The main product. Search from the client's preferences, then full support: trips to other cities, car markets, registration at the MVS service centre, handover.
3. **Експерт на день** (expert for a day). Inspections for one day, 9:00–18:00. The client picks the cars; they inspect 5–8 of them.
4. **Комп'ютерна діагностика** (computer diagnostics). Its own service: active ECU error codes and a read of the vehicle data.
5. **Виїзд в інші міста** (travel to other cities). Domestic travel to inspect and buy, then deliver to the client. Not the same as an overseas origin.

**Audience:** private buyers across Ukraine (office in Khmelnytskyi). They fear hidden costs, a hidden crash history and wound-back mileage.

**Primary job of the site:** turn that worry into a callback request.

## Price list (source of truth for seeds)

Heading on the source sheet: “FAS AUTO SEARCH”. Site name stays **AS Autosearch**. Bands are stored as written, including the overlapping “over $20,000” and “over $40,000” inspection rows. Editable in CMS via the `price-list` global (see [02-cms-model.md](./02-cms-model.md)).

### One-time vehicle inspection (by vehicle price)

| Vehicle price | Price |
| --- | ---: |
| Up to $10,000 | 1,500 UAH |
| Up to $20,000 | 2,000 UAH |
| Over $20,000 | 3,000 UAH |
| Over $40,000 | $100 |

**Additional services**

| Service | Price |
| --- | ---: |
| Inspection at a service station | +700 UAH |
| Service history check | +700 UAH |
| Comprehensive vehicle inspection | From $100 |
| Expert for a day | From $100 |

- *Comprehensive vehicle inspection* includes a standard vehicle inspection, full diagnostics at a service station, and checking the vehicle against dealer databases for repairs, major accidents, and body repairs.
- *Expert for a day:* fuel costs are additional for trips outside Khmelnytskyi.
- Comprehensive inspection and expert-for-a-day stay **add-ons** on this sheet. They do not become extra top-level services.

### Turnkey car search (by vehicle budget)

| Vehicle budget | Price |
| --- | ---: |
| Up to $10,000 | $400 |
| Up to $15,000 | $500 |
| Up to $20,000 | $600 |
| Up to $30,000 | $700 |

**Travel to another city:** from 2,000 UAH (on the turnkey sheet, where the source put it).

## Sitemap (proposed)

```
/                         Home (single marketing landing; About + Contacts are sections)
/services/perevirka       Pre-purchase inspection
/services/pid-kliuch      Turnkey car search
/services/ekspert-na-den  Expert for a day
/services/diagnostyka     Computer diagnostics
/services/vyizd           Travel to other cities
/blog                     News
/blog/[slug]              Post
/privacy (etc.)           Information viewType
```

**Home section anchors (primary chrome — header / footer):** not separate pages in v1.

| Anchor | Section |
| --- | --- |
| `#about` | `about-intro-block` |
| `#services` | Directions / services |
| `#route` | Turnkey route (“how we work”) |
| `#prices` | Price list |
| `#contacts` | Contacts band (footer `id="contacts"` + coverage) |
| `#callback` | Bottom booking form |

Do **not** ship `/about` or `/contacts` routes for v1; nav must not deep-link those paths.

Locales: Ukrainian (`ua`) unprefixed by default; English (`en`) under `/en/…`. Both are required for chrome, CMS copy, and seeds.

## Page → data source

| Page | Mechanism | Primary blocks / collections |
| --- | --- | --- |
| Home | `Pages` viewType `home` | auto-hero, early booking-form (pitch), about-intro, why-choose-us, directions, comparison, price-list, inspection-checklist, turnkey-route, ukraine-coverage, testimonials, faq, booking-form (callback); About + Contacts live here as sections |
| Service landing | `Pages` or `services` collection + blocks | Same stack as AS single-service |
| Blog | viewType `blog` + collection | Existing Blog views |
| Legal | viewType `information` | Rich text / article blocks |

## Feature → pattern reuse

| Feature | Reuse from source | Gaps to build |
| --- | --- | --- |
| Brands marquee | CarBrands | Manual CMS logos on the block (no `brands` collection) |
| Lead forms | BookingForm + ContactsForm + `sendForm` → `form-submissions` → `leads` | Same primary inbox as AS Service; see [09-booking-and-leads.md](./09-booking-and-leads.md). Lead type, optional date; no GoGym |
| Callback / enquiry | FeedbackModal / booking-form | Same inbox; calendar/slot optional and informational only |
| Price list | — | `price-list` global + home section |
| Turnkey journey | PartsHow (steps) | `turnkey-route-block`; origin-aware shipping/customs |
| Inspection contents | — | `inspection-checklist-block` |
| Team | TeamBlock | Optional `team-members` collection |
| Reviews | Testimonials / Reviews | Optional `reviews` collection |
| Map / branches | contacts-info + contacts global | Multi-branch if needed |
| Why choose us | — | `why-choose-us-block` on Home |
| Comparison | — | `comparison-block` (without partner / with Autosearch) |
| Ukraine coverage | — | `ukraine-coverage-block` (Google Maps office pin + route; not inventory) |
| Theme | — | See [04-design-tokens.md](./04-design-tokens.md) |
| SEO | seoUtils, sitemap | AutoDealer JSON-LD; no vehicle/inventory sitemap |

## Block composition recipes

### Home (CMS)

```
auto-hero-block              # origins USA / Europe / Korea switcher
booking-form-block           # early pitch (selling copy) — same Form as bottom
about-intro-block
why-choose-us-block          # trust reasons
directions-block             # five services: featured turnkey + four scope rows
comparison-block             # without partner vs with AS Autosearch
price-list-block             # reads the price-list global
inspection-checklist-block   # contents of pre-purchase inspection
turnkey-route-block          # Budget → … → MVS registration → Handover
ukraine-coverage-block       # Google Maps office pin + route / cities list
testimonials-block
service-faq-block
booking-form-block           # bottom callback
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
| Service landings | `pages` (or later `services` collection) |
| News | `blog*` |
| Nav / chrome | globals Header, Footer, Contacts, SiteSettings, **PriceList** |

**Drop from greenfield:** Inventory (`cars` / `brands` catalogs), Autosearch search wizard, Explore, subscriptions, gamification blocks, gogym feedback API.

**Booking:** lead capture only (not a workshop calendar). Pipeline and acceptance criteria in [09-booking-and-leads.md](./09-booking-and-leads.md).

## Open questions (content / product)

1. Confirm Ukrainian service names (drafts above).
2. Confirm overlapping inspection bands (“over $20,000” vs “over $40,000”) with the client.
3. Default theme: light, dark, or system? _(decided for scaffold: system)_
4. Keep Toxigenesis/Gilroy licenses for Autosearch? _(cleared for scaffold)_
5. GTM / analytics IDs for the new property?
6. Domain and `/cms` path on same host (recommended) vs split?

*(Languages are decided: Ukrainian default + English. App locale codes stay `ua`/`en`; SEO hreflang uses `uk` for Ukrainian.)*

## Success criteria for v1

- Home + contacts + lead form working end-to-end.
- Light/dark theme with no flash and WCAG AA on core text pairs.
- CMS editors can update copy, media and **prices** without deploys.
- Full Ukrainian (default) + English parity for chrome, CMS fields, and seeded pages.
- Deployable via same Docker/Traefik pattern under `autosearch` names.
