'use client';

import { useEffect, useLayoutEffect } from 'react';
import { useLocale } from 'next-intl';

import { applyThemePreference } from '@/lib/theme/client';
import type { ThemePreference } from '@autosearch/config';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

type Props = {
  /** Cookie or site default from the server render. */
  preference: ThemePreference;
};

/**
 * Locale changes re-render `<html>` from the server payload. The no-flash
 * script does not run again, so a `system` preference loses `data-theme`
 * and the page falls back to the light tokens. Re-apply before paint.
 */
export function ThemeSync({ preference }: Props) {
  const locale = useLocale();

  useIsomorphicLayoutEffect(() => {
    // Don't write the cookie here. A missing cookie must stay missing so a
    // later SiteSettings default can still apply. The toggle is the write path.
    applyThemePreference(preference, { persist: false });
  }, [locale, preference]);

  return null;
}
