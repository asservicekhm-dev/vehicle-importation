export const THEME_COOKIE = 'theme';

/** One year. */
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Meta theme-color values (literals allowed here; modules must use tokens). */
export const THEME_COLOR = {
  light: '#f6f6f6',
  dark: '#0b1122',
} as const;
