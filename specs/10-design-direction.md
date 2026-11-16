# 10 — Design direction (AS Autosearch)

Concrete design seed before M4 marketing blocks. Identity source: AS Service. Trust mechanics borrowed from Yastreb Car; look is not.

Product framing and prices: [07-domain-and-pages.md](./07-domain-and-pages.md). Tokens: [04-design-tokens.md](./04-design-tokens.md).

## Subject

- Cars from the USA, Europe and South Korea (hero origin switcher).
- Five services; turnkey search is the main product.
- Audience: private buyers across Ukraine (office in Khmelnytskyi). Fear hidden costs, crash history, wound-back mileage.
- Job of the site: turn that worry into a callback request.

## Palette

### Light

| Name | Hex | Role |
| --- | --- | --- |
| Paper | `#F6F6F6` | Page background |
| White | `#FFFFFF` | Raised surfaces (nav pills, panels, form) |
| Ink | `#0E131E` | Text |
| AS Blue | `#324596` | Primary actions and links |
| AS Deep | `#2E408A` | Hover + brand band |
| Sky | `#54A9E3` | Route line, active origin, check glyphs (never body text on paper) |
| Sky text | `#2B66A8` | Accent as text on paper |

### Dark (“blue night”)

| Name | Hex | Role |
| --- | --- | --- |
| Night | `#0B1122` | Background |
| Night-1 | `#121A2F` | Surface-1 |
| Night-2 | `#1A2442` | Surface-2 |
| Brand band | `#22337A` | Reads as AS blue, not black |
| Text | `#E8ECF5` | Body |
| Muted | `#9AA5BE` | Secondary (~7.5:1 on Night) |
| Border | `#25304D` | Hairlines |
| Border strong | `#56627F` | Controls (~3:1) |
| Primary | `#54A9E3` | CTA fill; on-primary is Night ink (~7.3:1) |
| Primary hover | `#7FBEEA` | |
| Link / accent text | `#8EC5EE` | (~10:1) |

Dropped in dark: periwinkle `#8FA0EC`, `#4A5FC4` / `#5468CF`. Error `#FF8A85` and success `#5FD39A` stay.

## Type

- **Toxigenesis:** display only (H1, H2), uppercase. Letter-spacing −0.01em, line-height 1.05. Emphasis from scale, never from colouring one word.
- **Gilroy:** everything else. H3 sentence case, weight 600. Body 1rem / 1.55, measure ~68ch.
- Prices, mileage, VINs: `font-variant-numeric: tabular-nums`. No monospace.
- Scale (1.25 from 16px): xs 0.8125 → sm 0.875 → md 1 → lg 1.25 → xl 1.5625 → 2xl 1.9375 → 3xl 2.4375 → 4xl 3.0625; `--text-display: clamp(2.5rem, 1.6rem + 4vw, 4.75rem)`.
- Tokens: `--leading-tight`, `--leading-body`, `--measure`.

## Radius

- 26px: hero and media
- 16px: panels
- 12px: controls
- Pill: nav and origin switcher

## Layout wireframe (left-aligned, 12-column)

```
HEADER   [AS Autosearch]  (Послуги  Як ми працюємо  Контакти)  (phone) (theme)(ua/en)
HERO  ┌──────────────────────────────── rounded 26 photo ───────────────────────────┐
      │ АВТО ПІД КЛЮЧ                                              [ car, clear ]     │
      │ ІЗ США, ЄВРОПИ ТА КОРЕЇ                                                      │
      │ sub (one sentence, max 42ch)                                                 │
      │ [Отримати консультацію]  Як ми працюємо                                      │
      │ ( США | Європа | Корея )  typical term · what we check there  <- switcher     │
      └──────────────────────────────────────────────────────────────────────────────┘
SERVICES  ┌── Підбір авто під ключ (featured, ~2/3) ────────┐
          │ search, markets, trips, MVS registration, handover│
          │ [Залишити заявку]                                │
          └──────────────────────────────────────────────────┘
          перевірка перед покупкою ...... одне авто, яке ви обрали
          експерт на день ................ 9:00–18:00, 5–8 авто
          комп'ютерна діагностика ........ коди ЕБУ і дані авто
          виїзд в інші міста ............. огляд, купівля, доставка вам
PRICES    two PriceCard components (surface cards). Turnkey featured with accent wash.
          Nested tier cards: band left, large tabular amount right. Add-ons in card footer.
          data-animate hooks for later motion — no entrance animation yet.
INSPECTION  ЩО ВХОДИТЬ У ПЕРЕВІРКУ     | sheet rows (mileage, crash, paint, chassis, docs)
ROUTE (signature, full-bleed brand band; turnkey only)
   Budget → Search → Check → Buy → Shipping → Customs → MVS → Handover
FAQ (accordion)          |  CALLBACK FORM
FOOTER
```

Header names the section, not all five services. Service rows carry a scope fact, not a sequence number.

## Principles

1. **The route is the one bold element.** Turnkey is a real sequence, so numbering is honest. Origin switcher changes shipping/customs. Line draws once on scroll-in; reduced motion → static.
2. **Proof over promises.** Each service states real scope. Inspection sheet = contents of service 1. Computer diagnostics stays its own row. Prices = second sheet, one band one figure. No stats row, no gold, no “premium” talk.
3. **Family resemblance to AS Service:** same fonts, blue, pills, hero radius. Structure and dark theme belong to Autosearch.
4. **Copy:** plain, active, sentence case. CTAs say what happens (“Отримати консультацію”, “Залишити заявку”). Draft factual claims marked for client confirm.

## Rejected defaults

| Default | Decision |
| --- | --- |
| Gold dark accent (Yastreb) | Rejected — other brand + “dark + one hot accent” cliché. Sky CTA in dark keeps AS colours. |
| Two-colour headline accent | **Keep (AS Service)** — CMS `[[phrase]]` markers render sky accents in hero (and reusable via `renderAccentText`). |
| Uppercase tracked eyebrow + dot (`SectionEyebrow`) | Removed. |
| Five identical service cards | Featured turnkey + four scope rows + inspection sheet. |
| Three pricing cards + highlighted middle | Two sheets; “from” is a field, not a badge. |
| Stats row / “→” on buttons | Dropped. |
| Fade-up on every section | Only route draw is non-triggered motion. |

## Preview

The dev-only `/design-seed` route and `apps/web/src/views/DesignSeed/` preview were removed. Home is the CMS page.

## Notes log

| Date | Note |
| --- | --- |
| 2026-11-03 | Initial seed: blue-night dark, five IG services, price-list global, design-seed route. |
| 2026-11-03 | Critique: `--color-text-inverse` fails on brand band in dark (night ink on navy). Added `--color-on-brand` (always light) for hero + route. Removed one accessory: no extra stats/eyebrow chrome. |
| 2026-11-03 | Verified `/design-seed` at 1440 (light+dark) and 390 mobile: origin switcher updates shipping/customs; prices from CMS global; form fields fill. |
| 2026-11-03 | Price list → `PriceCard` components (featured turnkey, nested tier cards, `data-animate` hooks for later motion). |