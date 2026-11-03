import { cookies } from 'next/headers';

import {
  defaultThemePreference,
  isThemePreference,
  type ThemePreference,
} from '@autosearch/config';

import { THEME_COOKIE } from './constants';

export async function getThemePreference(
  siteDefault?: ThemePreference | null,
): Promise<ThemePreference> {
  const store = await cookies();
  const value = store.get(THEME_COOKIE)?.value;

  if (isThemePreference(value)) return value;

  if (isThemePreference(siteDefault)) return siteDefault;

  return defaultThemePreference;
}
