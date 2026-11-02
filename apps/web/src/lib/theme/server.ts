import { cookies } from 'next/headers';

import {
  defaultThemePreference,
  isThemePreference,
  type ThemePreference,
} from '@autosearch/config';

import { THEME_COOKIE } from './constants';

export async function getThemePreference(): Promise<ThemePreference> {
  const store = await cookies();
  const value = store.get(THEME_COOKIE)?.value;

  return isThemePreference(value) ? value : defaultThemePreference;
}
