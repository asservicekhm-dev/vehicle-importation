# 08 — Bootstrap roadmap

Ordered milestones to stand up the Autosearch repo from this spec. Each milestone should leave the repo green (`lint` + `typecheck`).

## Milestone 0 — Repo scaffold

- Create monorepo: `apps/cms`, `apps/web`, optional `packages/{config,tsconfig,eslint-config}`.
- Pin stack versions from [01-architecture.md](./01-architecture.md).
- Wire pnpm workspace, turbo tasks (`dev`, `build`, `lint`, `typecheck`, `generate:types`).
- ESLint/Prettier without Tailwind plugin; SCSS Modules + mixins injection.
- `.env.example` files; empty Dockerfiles + `.deploy` stubs named `autosearch-*`.
- Root `AGENTS.md` from [06-infra-devex.md](./06-infra-devex.md) outline.
- **Exit:** `pnpm install`, both apps start empty.

## Milestone 1 — Tokens & theme

- Implement `tokens.scss` (light + dark) from [04-design-tokens.md](./04-design-tokens.md).
- Layout: fonts, no-flash script, cookie + `data-theme`, SiteSettings `defaultTheme`.
- `ThemeToggle` in Header; i18n keys.
- Stylelint rule: no hex in modules.
- **Exit:** blank page switches light/dark without flash; AA spot-check on text pairs.

## Milestone 2 — Primitives & chrome

- Shared `Button`, `Input`, `Textarea`, `CheckboxGroup`, `Accordion`, `Modal`, `SectionEyebrow`, `Container`.
- CMS glue: `CMSMedia`, `CMSLink`, `RichText`, `RenderBlocks` + empty mapper.
- Header / Footer against semantic tokens (no legacy variants).
- next-intl: Ukrainian default (`ua`, no prefix) + English (`en`, `/en`); middleware; `packages/config` locales; Header locale switcher.
- **Exit:** static chrome + dummy section render.

## Milestone 3 — CMS core

- Payload config: Users, Media, Pages (slim viewTypes), globals, SEO, redirects, form-builder, S3.
- Fields: `link`, `slug`, `seo`.
- Live preview + draft mode plan; revalidate webhook stub.
- `generate:types` + web imports via `@autosearch/cms/payload-types`.
- Seed: header/footer/contacts/home skeleton.
- **Exit:** Admin creates a page; web renders via `[slug]` + viewType handler.

## Milestone 4 — First marketing pages

- Port blocks: AutoHero, AboutIntro, Directions, CarBrands, Testimonials, ServiceFaq, BookingForm, PageBreadcrumbs.
- Merge form component; implement booking → Payload inbox per [09-booking-and-leads.md](./09-booking-and-leads.md) (`sendForm` only; no GoGym).
- Seed booking Form (`submissionKind: lead`) + `booking-form-block` on Home; verify Admin `leads` row on submit.
- Home seed content (placeholder media).
- **Exit:** Home matches AS Service rhythm on light theme; dark theme readable; booking creates inbox lead.

## Milestone 5 — Inventory

- Collections: `brands`, `cars` (+ taxonomies as needed), `leads`.
- Routes: `/cars`, `/cars/[slug]`.
- `CarCard`, filters, pagination/load-more; car detail using adapted service blocks.
- Sitemap + Vehicle JSON-LD.
- Booking form accepts hidden car context.
- **Exit:** Editors can publish a car; public list/detail + lead with car id.

## Milestone 6 — Secondary IA

- About, Contacts, Blog (port), Services landings, Autosearch wizard MVP.
- Partners / promotions optional.
- SEO polish, robots, GTM with consent (no default container id).

## Milestone 7 — Infra harden

- Full `.deploy` compose (dev/prod), Traefik, MinIO, seed backup/restore.
- CI + deploy workflows with health gates.
- `pnpm new block` scaffolder; seed-all runner.
- Docs: README, DEPLOYMENT, SERVER_SETUP.

## Milestone 8 — Soft launch checklist

- [ ] Theme default + toggle signed off
- [ ] Dark palette designer review
- [ ] Font licenses cleared
- [ ] Ukrainian + English parity verified (messages, CMS seeds, locale switcher)
- [ ] Booking form: `form-submissions` + `leads` inbox; success only on Payload ok; no gogym calls
- [ ] Spam protection on public forms
- [ ] Cross-app revalidation verified
- [ ] Staging content seed (not AS Service dump)
- [ ] Performance pass on car gallery images
- [ ] Accessibility pass (focus, contrast, reduced motion)

## Explicit non-goals for v1

- Explore / knowledge-base system
- Gamification / app-download / tariff pages
- GoGym / Smarty Landing integrations
- Preserving Wayon dark-orange dual palette
- Full DMS/CRM sync (unless product requires it in parallel)
