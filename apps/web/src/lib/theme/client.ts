import type { ThemePreference } from '@autosearch/config';

import { THEME_COLOR, THEME_COOKIE, THEME_COOKIE_MAX_AGE } from './constants';
import { syncThemeIcons } from './icons';

/** Resolve preference to a concrete theme. Keep in sync with `script.ts`. */
export function resolveTheme(pref: ThemePreference): 'light' | 'dark' {
  if (pref === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  return pref;
}

export function applyThemePreference(pref: ThemePreference): void {
  const resolved = resolveTheme(pref);
  const root = document.documentElement;

  root.setAttribute('data-theme-pref', pref);
  root.setAttribute('data-theme', resolved);

  document.cookie = `${THEME_COOKIE}=${pref}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; samesite=lax`;

  const meta = document.querySelector('meta[name="theme-color"]');

  if (meta) {
    meta.setAttribute('content', THEME_COLOR[resolved]);
  }

  syncThemeIcons(resolved);
}
