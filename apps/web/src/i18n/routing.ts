import { defineRouting } from 'next-intl/routing';

import { defaultLocale, locales } from '@autosearch/config';

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale,
  localePrefix: 'as-needed',
  localeDetection: false,
});
