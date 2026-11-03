import { getRequestConfig } from 'next-intl/server';

import { defaultLocale, isLocale } from '@autosearch/config';

import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = isLocale(requested) ? requested : defaultLocale;

  if (!routing.locales.includes(locale)) {
    return {
      locale: defaultLocale,
      messages: (await import(`../../translations/${defaultLocale}.json`)).default,
    };
  }

  return {
    locale,
    messages: (await import(`../../translations/${locale}.json`)).default,
  };
});
