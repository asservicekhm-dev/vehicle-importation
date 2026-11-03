export const locales = ['ua', 'en'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ua';

export const localeLabels: Record<Locale, string> = {
  ua: 'Українська',
  en: 'English',
};

/** App/CMS code `ua` stays as-is in URLs and Payload; only SEO/`<html lang>` use BCP 47 `uk`. */
export const localeToHreflang: Record<Locale, string> = {
  ua: 'uk',
  en: 'en',
};

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (locales as readonly string[]).includes(value);

export const themePreferences = ['light', 'dark', 'system'] as const;

export type ThemePreference = (typeof themePreferences)[number];

/** Fallback when SiteSettings.defaultTheme is unset. */
export const defaultThemePreference: ThemePreference = 'system';

export const isThemePreference = (value: unknown): value is ThemePreference =>
  typeof value === 'string' && (themePreferences as readonly string[]).includes(value);
