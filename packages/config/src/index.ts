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

/** Default public contacts — CMS Contacts/Header override; UI falls back here when unset. */
export const defaultPhoneDisplay = '+380 (98) 525 52 11';

export const defaultPhoneTelHref = `tel:${defaultPhoneDisplay.replace(/[^\d+]/g, '')}`;

export const defaultEmail = 'asservicekhm@gmail.com';

export const defaultAddressUa =
  'Україна, м. Хмельницький, вул. Героя України Володимира Дудченко (Гарнізонна), буд. 28';

export const defaultAddressEn =
  'Ukraine, Khmelnytskyi, Hero of Ukraine Volodymyr Dudchenko St. (Garnizonna), bldg. 28';

export const defaultHoursUa = 'Пн–Пт: 09:30–18:00\nСб–Нд: вихідний';

export const defaultHoursEn = 'Mon–Fri: 09:30–18:00\nSat–Sun: closed';

/** Known public social profiles — CMS Contacts.socialLinks override; UI may fall back. */
export const defaultInstagramUrl = 'https://www.instagram.com/autosearch.khm/';
export const defaultFacebookUrl = 'https://www.facebook.com/autosearch.khm/';

export {
  bookingServiceModes,
  budgetCurrencies,
  budgetCurrencyLabels,
  carBrands,
  carOrigins,
  carTypes,
  deliveryCities,
  isBookingServiceMode,
  localizeOptions,
  optionLabel,
  type BookingServiceMode,
  type BudgetCurrency,
  type LocalizedOption,
} from './booking';
