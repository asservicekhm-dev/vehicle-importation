import { getRequestConfig } from 'next-intl/server';

import { defaultLocale } from '@autosearch/config';

export default getRequestConfig(async () => {
  const locale = defaultLocale;

  return {
    locale,
    messages: (await import(`../../translations/${locale}.json`)).default,
  };
});
