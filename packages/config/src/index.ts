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
