# Soft launch checklist (Milestone 7)

Engineering verification against `specs/08-bootstrap-roadmap.md` § Milestone 7. Human / designer gates remain unchecked until signed off.

| Item | Status | Notes |
| --- | --- | --- |
| Theme default + toggle | **Code ready** — needs product sign-off | Cookie → SiteSettings `defaultTheme` → `system`; `ThemeToggle` in Header; `enableThemeToggle` |
| Dark palette designer review | **Code ready** — needs designer | Light/dark tokens in `apps/web/src/scss/tokens.scss` |
| Font licenses cleared | **Blocked on owner** | Binaries in `apps/web/src/fonts/`; see `NOTICE.md` |
| UA + EN parity | **Verified in repo** | Translation keys match; `fallback: false`; dual-locale seeds; LocaleSwitcher |
| Booking → leads; ok-only; no GoGym | **Verified** | `sendForm` → form-submissions → leads; success only on `ok` |
| Spam protection | **Implemented** | Honeypot `companyWebsite` + CMS reject + `sendForm` rate limit (5/min/IP) |
| Cross-app revalidation | **Verified in code** | CMS hooks → `WEB_URL/api/revalidate` + secret; confirm on staging env |
| Staging content seed | **Runbook ready** | `SERVER_SETUP.md` § Staging; `pnpm seed:all` / `:local-media` |
| Accessibility pass | **Baselines in code** — needs QA | `:focus-visible`, skip link, `prefers-reduced-motion`; run keyboard/axe on staging |

## Human sign-off log

| Gate | Owner | Date | Result |
| --- | --- | --- | --- |
| Theme default / toggle | | | |
| Dark palette | | | |
| Font licenses | | | |
| Staging seed applied | | | |
| A11y pass | | | |
| Revalidate smoke on staging | | | |
