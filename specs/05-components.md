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
| Tag | `components/Tag` | Outlined pill | **Adapt** | Generic badge (promo / status labels). |
| AlertNotification | `components/AlertNotification` | Radix toast | **Adapt or Drop** | Prefer one system (sonner already used by ContactsForm). |
| SpinningLoader | `components/SpinningLoader` | Spinner | **Adapt** | Map primary → brand. |
| Text | `components/Text` | Legacy type scale | **Drop for AS** | AS sections set typography in SCSS. |
| Copy / Email | `components/Copy`, `Email` | Clipboard / mailto | **Keep** | Phone / email copy. |
| SelectLanguage | `components/SelectLanguage` | Locale switcher (`ua` ↔ `en`) | **Adapt** | Dead code in source — **mount in Header** (desktop + mobile). Ukrainian default; English required. |

## 2. Layout

| Component | Verdict | Notes |
| --- | --- | --- |
| Container / ChromeContainer | **Keep** | Max 1440; AS Home often uses `.pageContainer` instead — unify. |
| SectionEyebrow | **Drop** | Tracked uppercase eyebrow + dot is a generic tell; headings stand alone (see [10-design-direction.md](./10-design-direction.md)). |
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
| CMSLink | **Keep** | reference / custom / anchor / form; add `services` / `promotions` relations as needed. |
| CMSForm + ContactsForm | **Adapt** | Merge into one Form; layout slots + dealership fields. |
| RichText | **Adapt** | Re-skin for articles / service descriptions. |
| RenderBlocks | **Keep** | Drop Parts gallery hack. |
| LocalizedLink | **Adapt** | Prefer next-intl navigation. |
| PayloadLivePreview | **Keep** | |
| FeedbackModal | **Adapt** | Enquiry / test-drive. |

## 4. Shared sections

| Component | Verdict | Repurpose |
| --- | --- | --- |
| UniversalSlider | **Keep / Adapt** | Bullets → primary; carousels. |
| PartnersBlock | **Drop** | Prefer `CarBrands` pattern. |
| ServiceCard | **Keep** | `LinkTile` / category tiles. |
| Faq / FaqBlock | **Drop** | Use `ServiceFaq`. |
| Banner (empty) | **Drop** | |
| BannerBlock | **Adapt or Drop** | Promo. |
| ConsultationCTA | **Adapt** | Callback widget. |

## 5. AS Home sections → dealership mapping

| Block slug | Component | Verdict | Dealership use |
| --- | --- | --- | --- |
| `auto-hero-block` | AutoHero | **Keep** | Home hero |
| `about-intro-block` | AboutIntro | **Keep** | About dealership + stats |
| `popular-services-block` | PopularServices | **Adapt** | Featured departments / services; i18n “Детальніше” |
| `services-catalog-block` | ServicesCatalog | **Adapt** | Client filter for service tiles (no inventory) |
| `directions-block` | Directions | **Adapt** | Five services: featured turnkey panel + four scope rows (inspection, expert-for-a-day, diagnostics, travel) |
| `inspection-checklist-block` | InspectionChecklist | **Add** | Contents of pre-purchase inspection (mileage, crash, paint, chassis, documents) |
| `turnkey-route-block` | TurnkeyRoute | **Add** | Signature sequence: Budget → Search → Check → Buy → Shipping → Customs → MVS registration → Handover; origin-aware mid steps |
| `price-list` (global-driven section) | PriceList | **Add** | Two sheets from the `price-list` global; not a duplicated block |
| `testimonials-block` | Testimonials | **Keep** | Customer stories |
| `why-choose-us-block` | WhyChooseUs | **Add** | Why clients choose AS Autosearch |
| `comparison-block` | Comparison | **Add** | Without turnkey partner vs with AS Autosearch |
| `ukraine-coverage-block` | UkraineCoverage | **Add** | Google Maps office embed + Route button; address from Contacts |
| `reviews-block` | Reviews | **Keep** | Ratings |
| `service-faq-block` | ServiceFaq | **Keep** | FAQ |
| `booking-form-block` | BookingForm | **Keep** | Lead form → Payload inbox ([09-booking-and-leads.md](./09-booking-and-leads.md)); early pitch + bottom callback on Home |
| `service-hero-block` | ServiceHero | **Adapt** | Service landing hero |
| `service-info-block` | ServiceInfo | **Adapt** | Service summary + CTAs |
| `service-feature-cards-block` | ServiceFeatureCards | **Adapt** | Service features |
| `service-benefits-block` | ServiceBenefits | **Keep** | Why us |
| `service-gallery-block` | ServiceGallery | **Keep** | Service / showroom media; optional lightbox |
| `related-services-block` | RelatedServices | **Keep** | Related service cards |
| `car-brands-block` | CarBrands | **Keep** | Marketing brand logo marquee (CMS media) |
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

1. Heading (Toxigenesis uppercase H1/H2; no colour accent on a single word) → description → content → optional CTA. No eyebrow.
2. Paper page bg; white / surface cards with radius hierarchy (12 controls / 16 panels / 26 media); brand band for the turnkey route.
3. Section padding ~48px mobile / 64–96px desktop; max width 1440.
4. Block wrappers get stable `id` + `scroll-margin-top: 96px`.
5. Prices and service scopes use hairline sheet rows with tabular figures — not identical card grids.

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
| Ghost / link | Transparent text link; no arrow glyph |

### Motion

| Layer | Tool |
| --- | --- |
| Reveal | Framer `InViewAnimation` (`y`, staggered) |
| Smooth scroll | Lenis |
| Carousels | Swiper |
| Marquees | CSS keyframes + `prefers-reduced-motion` |
| Counters | `AnimatedCounter` |

### Hardcoded strings to eliminate

“Детальніше”, empty-state copy, video aria-labels, Footer “Вгору” / brand text — move to CMS or `translations/{ua,en}.json`.

## Priority for starter scaffold

1. Tokens + ThemeToggle + Header/Footer restyle.
2. Shared `Button`, `Input`, `Container`, CMS glue.
3. AutoHero (origins), Directions (five services), PriceList, InspectionChecklist, TurnkeyRoute, ServiceFaq, BookingForm, Testimonials.
4. Drop all legacy/gamification components at scaffold time.
