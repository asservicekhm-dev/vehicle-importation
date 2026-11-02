# 05 — UI components & design patterns

Paths relative to `apps/web/src/`. Tokens: “Legacy” = dark/orange Wayon; “AS” = `--as-*` (map to semantic tokens in Autosearch — see [04-design-tokens.md](./04-design-tokens.md)).

## 1. Primitives

| Component | Path | Purpose | Verdict | Autosearch notes |
| --- | --- | --- | --- | --- |
| Button | `components/Button` | Pill CTA | **Adapt (rewrite)** | Still violet/legacy. Replace with `variant: primary\|outline\|ghost`, sizes; becomes shared AS button (~8 sections duplicate CTAs today). |
| Input / Textarea | `components/Input`, `Textarea` | RHF fields | **Adapt** | Re-skin to semantic tokens; phone mask. |
| CheckboxGroup | `components/CheckboxGroup` | Multi-select + extras | **Adapt** | Consent / interests. |
| Accordion | `components/Accordion` | Headless Radix | **Keep** | FAQ / specs. |
| Modal | `components/Modal` | Dialog + mobile menu | **Adapt** | Re-skin; fix empty `Dialog.Title`; test-drive modal. |
| Tag | `components/Tag` | Outlined pill | **Adapt** | `VehicleBadge` (New/Used/Warranty). |
| AlertNotification | `components/AlertNotification` | Radix toast | **Adapt or Drop** | Prefer one system (sonner already used by ContactsForm). |
| SpinningLoader | `components/SpinningLoader` | Spinner | **Adapt** | Map primary → brand. |
| Text | `components/Text` | Legacy type scale | **Drop for AS** | AS sections set typography in SCSS. |
| Copy / Email | `components/Copy`, `Email` | Clipboard / mailto | **Keep** | Phone/VIN copy. |
| SelectLanguage | `components/SelectLanguage` | Locale switcher (`ua` ↔ `en`) | **Adapt** | Dead code in source — **mount in Header** (desktop + mobile). Ukrainian default; English required. |

## 2. Layout

| Component | Verdict | Notes |
| --- | --- | --- |
| Container / ChromeContainer | **Keep** | Max 1440; AS Home often uses `.pageContainer` instead — unify. |
| SectionEyebrow | **Keep** | Canonical eyebrow (dot + uppercase). |
| BreadCrumbs | **Keep** | Use `asService` only; add BreadcrumbList JSON-LD. |
| Responsive / ViewportSplit / ResponsiveBlocksSlot | **Keep** | SSR dual-branch strategy. |
| SmoothScroll (Lenis) | **Keep** | `data-lenis-prevent` on nested scrollers. |
| InViewAnimation | **Keep** | Framer `useInView`; AS uses `effect='y'`. |
| AnimatedCounter | **Keep** | Stats. |
| Layout (Header/Footer shell) | **Keep** | Drop `/go` gate. |

## 3. CMS glue

| Component | Verdict | Notes |
| --- | --- | --- |
| CMSMedia | **Keep** | Image/video by mimeType. |
| CMSLink | **Keep** | reference / custom / anchor / form; add `cars` relation. |
| CMSForm + ContactsForm | **Adapt** | Merge into one Form; layout slots + dealership fields. |
| RichText | **Adapt** | Re-skin for articles / car descriptions. |
| RenderBlocks | **Keep** | Drop Parts gallery hack. |
| LocalizedLink | **Adapt** | Prefer next-intl navigation. |
| PayloadLivePreview | **Keep** | |
| FeedbackModal | **Adapt** | Enquiry / test-drive. |

## 4. Shared sections

| Component | Verdict | Repurpose |
| --- | --- | --- |
| UniversalSlider | **Keep / Adapt** | Bullets → primary; carousels. |
| PartnersBlock | **Drop** | Prefer `CarBrands` pattern. |
| ServiceCard | **Keep** | `LinkTile` / category tiles; later real `CarCard`. |
| Faq / FaqBlock | **Drop** | Use `ServiceFaq`. |
| Banner (empty) | **Drop** | |
| BannerBlock | **Adapt or Drop** | Promo. |
| ConsultationCTA | **Adapt** | Callback widget. |

## 5. AS Home sections → dealership mapping

| Block slug | Component | Verdict | Dealership use |
| --- | --- | --- | --- |
| `auto-hero-block` | AutoHero | **Keep** | Home hero; optional quick-search strip later |
| `about-intro-block` | AboutIntro | **Keep** | About dealership + stats |
| `popular-services-block` | PopularServices | **Adapt** | Featured models / departments; i18n “Детальніше” |
| `services-catalog-block` | ServicesCatalog | **Adapt** | Client filter only — replace with real inventory listing |
| `directions-block` | Directions | **Keep** | New / used / trade-in / finance |
| `testimonials-block` | Testimonials | **Keep** | Customer stories |
| `reviews-block` | Reviews | **Keep** | Ratings |
| `service-faq-block` | ServiceFaq | **Keep** | FAQ |
| `booking-form-block` | BookingForm | **Keep** | Lead form → Payload inbox ([09-booking-and-leads.md](./09-booking-and-leads.md)); test-drive / callback / trade-in |
| `service-hero-block` | ServiceHero | **Adapt** | Vehicle hero → gallery |
| `service-info-block` | ServiceInfo | **Adapt** | Vehicle summary + price |
| `service-feature-cards-block` | ServiceFeatureCards | **Adapt** | Equipment / features |
| `service-benefits-block` | ServiceBenefits | **Keep** | Why us |
| `service-gallery-block` | ServiceGallery | **Keep** | Car photos; add lightbox |
| `related-services-block` | RelatedServices | **Keep** | Similar cars (needs real cards) |
| `car-brands-block` | CarBrands | **Keep** | Brands marquee |
| `team-block` | TeamBlock | **Keep** | Sales team |
| `video-banner-block` | VideoBlock | **Keep** | Showroom video |
| `page-breadcrumbs-block` | PageBreadcrumbs | **Keep** | |
| `parts-*-block` | Parts* | **Adapt** | Generic info / why / steps / CTA |
| Legacy Home + gamification | HeroScroll, PlayBig, … | **Drop** | Optional: restyle `LastBlog` |

## 6. Header & Footer

| View | Verdict | Notes |
| --- | --- | --- |
| Header | **Keep, simplify** | Three-pill desktop (featured / nav / phone); light tokens; drop dark branch, store pills, `resolveHeaderVariantRows`. Add ThemeToggle. |
| Header mobile | **Keep** | Radix Modal drill-down. |
| Footer | **Keep** | Inverse surface card; CMS logo instead of hardcoded “AS SERVICE”; i18n “Вгору”. |
| BackToTop | **Keep** | |
| FooterNewsletter | **Adapt** | Optional arrivals signup (not mounted today). |

## 7. Design patterns to carry

### Section rhythm

1. `SectionEyebrow` → heading (`title` / `titleAccent` / optional `titleAfter`) → description → content → optional CTA.
2. Soft page bg; white cards with 12–20px radius and light shadow; panels at `--radius-lg` (~26px).
3. Section padding ~48px mobile / 64–96px desktop; max width 1440.
4. Block wrappers get stable `id` + `scroll-margin-top: 96px`.

### Cards

- Default marketing sections: white card on soft bg, hover lift ~2px.
- Dark/inverse panels for reviews strip and footer.
- Hero / intro copy: often **no card**.

### CTAs (implement once as shared Button)

| Style | Spec |
| --- | --- |
| Primary | Brand fill, white text, ~46–48px, radius-sm, hover darken + lift |
| Outline | Transparent, ink border |
| White | On dark hero |
| Ghost | Transparent + arrow nudge |

### Motion

| Layer | Tool |
| --- | --- |
| Reveal | Framer `InViewAnimation` (`y`, staggered) |
| Smooth scroll | Lenis |
| Carousels | Swiper |
| Marquees | CSS keyframes + `prefers-reduced-motion` |
| Counters | `AnimatedCounter` |

### Hardcoded strings to eliminate

“Детальніше”, empty catalog copy, video aria-labels, Footer “Вгору” / brand text — move to CMS or `translations/{ua,en}.json`.

## Priority for starter scaffold

1. Tokens + ThemeToggle + Header/Footer restyle.
2. Shared `Button`, `Input`, `SectionEyebrow`, `Container`, CMS glue.
3. AutoHero, AboutIntro, CarBrands, ServiceFaq, BookingForm, Testimonials.
4. Inventory-specific: CarCard, catalog filters, car detail gallery (new).
5. Drop all legacy/gamification components at scaffold time.
