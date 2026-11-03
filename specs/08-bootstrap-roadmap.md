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

**Home-first (Autosearch domain recipe):** promote design-seed sections into CMS blocks, not only the AS Service port list.

- Home seed order: AutoHero (origins) → Directions → PriceList marker (reads `price-list` global) → InspectionChecklist → TurnkeyRoute → Testimonials → ServiceFaq → BookingForm.
- Also register (thin UI, not required on Home seed): AboutIntro, CarBrands, PageBreadcrumbs.
- Merge form component; booking → Payload inbox per [09-booking-and-leads.md](./09-booking-and-leads.md) (`sendForm` only; no GoGym).
- Seed booking Form (`submissionKind: lead`) + `booking-form-block` on Home; verify Admin `leads` row on submit.
- **Exit:** Home matches Autosearch rhythm on light + dark; booking creates inbox lead.

## Milestone 5 — Secondary IA

- Blog (port) + Services landings (`/services/{perevirka,pid-kliuch,ekspert-na-den,diagnostyka,vyizd}`).
- **Not in M5:** separate About / Contacts pages. Primary chrome keeps Home section anchors (`#about`, `#contacts`, etc.) — same as current header seed; do not add `/about` or `/contacts` routes for v1.
- Partners / promotions optional.
- SEO polish, robots, GTM with consent (no default container id).

**Shipped:** nested `[...slug]` Pages; five service seeds + service-* blocks; Directions primary Order / secondary Learn more; `blog` + categories + authors; `/blog` + `/blog/[slug]`; `robots.ts` + `sitemap.ts`; GTM + Cookies (empty id = off).

## Milestone 6 — Infra harden

- Full `.deploy` compose (dev/prod), Traefik, MinIO, seed backup/restore.
- CI + deploy workflows with health gates.
- `pnpm new block` scaffolder; seed-all runner.
- Docs: README, DEPLOYMENT, SERVER_SETUP.

**Shipped:** `Dockerfile.cms` / `Dockerfile.web`; `.deploy` compose + Traefik v3.6 + MinIO; `seed.mjs` backup/restore + `seed:all` / `pnpm seed <area>`; `ci.yml` + `deploy.yml` (health gates, SSH harden); `pnpm new component|view|block`; DEPLOYMENT + SERVER_SETUP + README/AGENTS sync.

## Milestone 7 — Soft launch checklist

Tracking sheet: [11-soft-launch-checklist.md](./11-soft-launch-checklist.md).

**Engineering done in repo:**

- [x] Ukrainian + English parity verified (translations, CMS seeds, locale switcher)
- [x] Booking form: `form-submissions` + `leads` inbox; success only on Payload ok; no gogym calls
- [x] Spam protection on public forms (honeypot `companyWebsite` + CMS reject + `sendForm` 5/min/IP)
- [x] Cross-app revalidation wired (`WEB_URL` + `REVALIDATE_SECRET` → `/api/revalidate`) — smoke on staging still required
- [x] Staging content seed runbook (`SERVER_SETUP.md`; not AS Service dump)
- [x] A11y baselines (skip link, `:focus-visible`, `prefers-reduced-motion`) — full QA pass still required

**Human / staging gates (block public launch):**

- [ ] Theme default + toggle signed off
- [ ] Dark palette designer review
- [ ] Font licenses cleared (`apps/web/src/fonts/NOTICE.md`)
- [ ] Staging seed applied + revalidate smoke
- [ ] Accessibility QA pass (keyboard, contrast, reduced motion)

## Explicit non-goals for v1

- Inventory / cars catalog (`brands`, `cars`, `/cars` routes, CarCard)
- Autosearch multi-step search wizard
- Explore / knowledge-base system
- Gamification / app-download / tariff pages
- GoGym / Smarty Landing integrations
- Preserving Wayon dark-orange dual palette
- Full DMS/CRM sync
