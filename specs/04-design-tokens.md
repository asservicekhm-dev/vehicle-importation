# 04 — Design tokens & theme system

Code-only audit of `apps/web/src/scss` and modules. Autosearch needs a **light/dark theme switch**; the source repo has none (only per-component light/dark variants).

## Problem today

`vars.scss` holds **two palettes in one `:root`**:

1. Legacy dark/orange Wayon (`--bg-0`, `--accent-0`, ~30 aliases including misleading `--Pure-violet`, `--ui-green-*`).
2. AS Service light (`--as-*`: primary `#324596`, accent `#54a9e3`, text `#0e131e`).

`html`/`body` still use legacy `--bg-0` / `--text-0`, while new Home sections use `--as-*`. Header hardcodes `isLightHeader = true` and rebinds legacy vars locally. ~644 hex + ~428 rgba literals appear in modules; many duplicate tokens.

**Rule for Autosearch:** one semantic token set, two themes, **no aliases**.

## Semantic tokens

| Token | Role |
| --- | --- |
| `--color-bg` | Page background |
| `--color-surface-1` | Soft sections / inset cards |
| `--color-surface-2` | Elevated cards / inputs |
| `--color-surface-inverse` | Footer / dark bands |
| `--color-text` | Primary text |
| `--color-text-muted` | Secondary text |
| `--color-text-inverse` | On inverse surfaces |
| `--color-border` | Decorative hairlines |
| `--color-border-strong` | Form controls (≥3:1) |
| `--color-primary` | Brand fills |
| `--color-primary-hover` | Primary hover |
| `--color-on-primary` | Text on primary |
| `--color-link` | Text links (AA) |
| `--color-accent` | Decorative (dots, highlights) |
| `--color-accent-text` | Accent as text (AA) |
| `--color-error` / `--color-success` | Status |
| `--color-focus-ring` | `:focus-visible` |
| `--color-overlay` | Modal scrim |
| `--shadow-1` / `--shadow-2` | Elevation |

Theme-independent: `--radius-{sm,md,lg,pill}`, `--space-1…24` (4px base), `--font-heading` / `--font-body`, `--text-xs…4xl`, `--header-offset`.

## Light theme (from `--as-*`)

| Token | Value |
| --- | --- |
| `--color-bg` | `#ffffff` |
| `--color-surface-1` | `#f6f6f6` |
| `--color-surface-2` | `#ffffff` |
| `--color-surface-inverse` | `#2e408a` |
| `--color-text` | `#0e131e` |
| `--color-text-muted` | `#525257` |
| `--color-primary` | `#324596` |
| `--color-primary-hover` | `#2e408a` |
| `--color-on-primary` | `#ffffff` |
| `--color-link` | `#324596` |
| `--color-accent` | `#54a9e3` |
| `--color-accent-text` | `#2b66a8` |
| `--color-error` | `#c9261f` (adjusted from `#d7312d` for soft-bg AA) |
| `--color-border` | `rgb(14 19 30 / 12%)` |
| `--color-border-strong` | `#767680` |

**Drop** orange `#ff6a00` and all violet leftovers (`#7f58ff`, `#130520`, `#372d57`).

## Dark theme (derived — needs design sign-off)

Same blue family; elevation steps lighter than page bg.

| Token | Value |
| --- | --- |
| `--color-bg` | `#0e131e` |
| `--color-surface-1` | `#161c2b` |
| `--color-surface-2` | `#1d2538` |
| `--color-surface-inverse` | `#f6f6f6` |
| `--color-text` | `#eef1f8` |
| `--color-text-muted` | `#a3acc2` |
| `--color-primary` | `#4a5fc4` |
| `--color-primary-hover` | `#5468cf` |
| `--color-link` | `#8fa0ec` |
| `--color-accent` / `--color-accent-text` | `#54a9e3` |
| `--color-error` | `#ff8a85` |
| `--color-border` | `rgb(255 255 255 / 12%)` |
| `--color-border-strong` | `#7a8299` |

Do **not** reuse `#324596` as dark-mode body text (≈2.15:1 on `#0e131e`).

## WCAG AA notes

| Pair | Result |
| --- | --- |
| Light text / muted / primary-as-text on white or soft | Pass |
| White on `#324596` / `#2e408a` | Pass |
| Accent `#54a9e3` as text on white | **Fail** — use `--color-accent-text` |
| White on accent | **Fail** — use dark ink on accent fills |
| Border `#c1c1c1` as control outline | **Fail** (≥3:1) — use `--color-border-strong` |
| Legacy error `#f53f4d` on white | **Fail** — replace |

## Draft `tokens.scss`

```scss
:root {
  /* private primitives */
  --_p-ink-900: #0e131e;
  --_p-ink-800: #161c2b;
  --_p-ink-700: #1d2538;
  --_p-ink-600: #7a8299;
  --_p-ink-300: #a3acc2;
  --_p-ink-100: #eef1f8;
  --_p-gray-700: #525257;
  --_p-gray-500: #767680;
  --_p-gray-100: #f6f6f6;
  --_p-white: #ffffff;
  --_p-blue-900: #2e408a;
  --_p-blue-800: #324596;
  --_p-blue-600: #4a5fc4;
  --_p-blue-500: #5468cf;
  --_p-blue-300: #8fa0ec;
  --_p-sky-600: #2b66a8;
  --_p-sky-400: #54a9e3;
  --_p-red-600: #c9261f;
  --_p-red-300: #ff8a85;
  --_p-green-700: #1f7a4d;
  --_p-green-300: #5fd39a;

  --radius-sm: 12px;
  --radius-md: 16px;
  --radius-lg: 26px;
  --radius-pill: 999px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;

  --font-heading: var(--font-toxigenesis), var(--font-fallback-heading), sans-serif;
  --font-body: var(--font-gilroy), system-ui, sans-serif;

  --text-xs: 0.8125rem;
  --text-sm: 0.875rem;
  --text-md: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 2.5rem;
  --text-4xl: 3rem;
}

:root,
:root[data-theme='light'] {
  color-scheme: light;
  --color-bg: var(--_p-white);
  --color-surface-1: var(--_p-gray-100);
  --color-surface-2: var(--_p-white);
  --color-surface-inverse: var(--_p-blue-900);
  --color-text: var(--_p-ink-900);
  --color-text-muted: var(--_p-gray-700);
  --color-text-inverse: var(--_p-white);
  --color-border: rgb(14 19 30 / 12%);
  --color-border-strong: var(--_p-gray-500);
  --color-primary: var(--_p-blue-800);
  --color-primary-hover: var(--_p-blue-900);
  --color-on-primary: var(--_p-white);
  --color-link: var(--_p-blue-800);
  --color-accent: var(--_p-sky-400);
  --color-accent-text: var(--_p-sky-600);
  --color-error: var(--_p-red-600);
  --color-success: var(--_p-green-700);
  --color-focus-ring: var(--_p-blue-800);
  --color-overlay: rgb(14 19 30 / 35%);
  --shadow-1: 0 1px 2px rgb(14 19 30 / 4%), 0 2px 8px rgb(14 19 30 / 6%);
  --shadow-2: 0 4px 16px rgb(14 19 30 / 10%), 0 16px 48px rgb(14 19 30 / 10%);
}

:root[data-theme='dark'] {
  color-scheme: dark;
  --color-bg: var(--_p-ink-900);
  --color-surface-1: var(--_p-ink-800);
  --color-surface-2: var(--_p-ink-700);
  --color-surface-inverse: var(--_p-gray-100);
  --color-text: var(--_p-ink-100);
  --color-text-muted: var(--_p-ink-300);
  --color-text-inverse: var(--_p-ink-900);
  --color-border: rgb(255 255 255 / 12%);
  --color-border-strong: var(--_p-ink-600);
  --color-primary: var(--_p-blue-600);
  --color-primary-hover: var(--_p-blue-500);
  --color-on-primary: var(--_p-white);
  --color-link: var(--_p-blue-300);
  --color-accent: var(--_p-sky-400);
  --color-accent-text: var(--_p-sky-400);
  --color-error: var(--_p-red-300);
  --color-success: var(--_p-green-300);
  --color-focus-ring: var(--_p-blue-300);
  --color-overlay: rgb(0 0 0 / 55%);
  --shadow-1: 0 1px 2px rgb(0 0 0 / 30%), 0 2px 8px rgb(0 0 0 / 30%);
  --shadow-2: 0 4px 16px rgb(0 0 0 / 40%), 0 16px 48px rgb(0 0 0 / 40%);
}
```

`globals.scss`: `html`/`body` use `--color-bg` / `--color-text` / `--font-body`; restore `:focus-visible` (today global `:focus { outline: none }`).

## Breakpoints (`mixins.scss`)

| Mixin | Query |
| --- | --- |
| `tablet` | min-width 768px |
| `laptop` | min-width 1200px |
| `desktop` | min-width 1750px |
| `maxTablet` | max-width 767px |

**Adapt:** resolve 1200 vs 1280 inconsistency (`laptop` vs `maxLaptop`/`onlyLaptop`) before copying. Keep `sassOptions.additionalData` auto-import of mixins.

## Fonts

| Role | File / loader | CSS var |
| --- | --- | --- |
| Heading | Toxigenesis Bold (local woff) | `--font-toxigenesis` → `--font-heading` |
| Body | Gilroy 400–700 (local woff2) | `--font-gilroy` → `--font-body` |
| Fallback | Manrope (google, cyrillic) | `--font-fallback-heading` |

Confirm **Cyrillic coverage** for Toxigenesis/Gilroy (Ukrainian-first). Drop unused `mustica-pro-semibold.otf` and string `'Inter'` fallbacks. Licensing must be cleared for Autosearch redistribution.

## Theme switch mechanism

### State

- Preference: `light` | `dark` | `system`.
- Resolved: always `light` | `dark` on `<html data-theme>`.
- Cookie `theme=…` (functional preference). Missing cookie → `SiteSettings.defaultTheme` → `system`.

### Server (`layout.tsx`)

1. Read cookie + SiteSettings.
2. If preference is explicit light/dark, set `data-theme` in SSR HTML.
3. Set `data-theme-pref`, `suppressHydrationWarning`, `color-scheme` meta.

### No-flash script (inline `<head>`)

Resolve `system` via `matchMedia('(prefers-color-scheme: dark)')` and set `data-theme` before paint. Update `theme-color` meta (`#ffffff` / `#0e131e`).

### Toggle

- Client `ThemeToggle` in Header (and mobile menu).
- i18n keys in both locale files (`ua` Ukrainian default + `en`).
- Write cookie; update `data-theme` immediately; listen to `prefers-color-scheme` when pref is `system`.
- Respect `prefers-reduced-motion`.

### SiteSettings fields

```ts
defaultTheme: 'system' | 'light' | 'dark'
enableThemeToggle: boolean // default true
```

### Media

- Prefer `currentColor` SVGs over CSS filter hacks.
- Optional `logoDark` on Header global, or one SVG that adapts.

## Do not reintroduce aliases

1. Delete `vars.scss` legacy + `--as-*`. Do not keep `--old: var(--new)`.
2. Semantics reference `--_p-*` primitives or literals only — **not** other semantics.
3. Modules never reference `--_p-*`.
4. No `var(--token, #fallback)` in modules.
5. No new hex/rgb in `*.module.scss` outside `tokens.scss` (enforce with stylelint).
6. Rename legacy `--color-error` value in the same PR that introduces the semantic token.
7. Component-local vars (`--hero2-*`) are exempt.

## Component migration notes

| Component | Change |
| --- | --- |
| Button | Replace violet/dark with `primary \| secondary \| ghost` |
| Faq | Drop `tone`; use tokens |
| BreadCrumbs | Drop variants; one theme-aware style |
| Header | Remove `isLightHeader` / `.light` branch; read tokens |
| Mixins | Fix broken `hover-white`/`hover-red`; scrollbar → `--color-primary` |

## Open questions

- Dark palette is **derived**, not designed — needs designer review.
- `#fff` usages are ambiguous (surface vs on-primary) — no blind find-replace.
- Third-party: sonner, Radix, Swiper need themed props/CSS.
- CMS rich text may embed fixed colors.
