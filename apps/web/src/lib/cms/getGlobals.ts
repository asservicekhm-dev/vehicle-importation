import { cache } from 'react';

import { payload } from '@/api';
import { CACHE_TAGS } from '@/lib/cms/constants';
import type {
  Config,
  Contact,
  Footer,
  Header,
  PriceList,
  SiteSetting,
} from '@autosearch/cms/payload-types';
import type { Locale } from '@autosearch/config';

type GlobalSlug = 'header' | 'footer' | 'contacts' | 'site-settings' | 'price-list';

async function safeGlobal<T>(slug: GlobalSlug, locale: Locale, tag: string): Promise<T | null> {
  try {
    return (await payload.findGlobal({
      slug,
      locale: locale as Config['locale'],
      depth: 2,
      // @ts-expect-error SDK next options
      next: { tags: [CACHE_TAGS.globals, tag] },
    })) as T;
  } catch (err) {
    console.error(`[getGlobals] Failed to load ${slug}`, err);
    return null;
  }
}

export const getGlobals = cache(async (locale: Locale) => {
  const [header, footer, contacts, siteSettings, priceList] = await Promise.all([
    safeGlobal<Header>('header', locale, CACHE_TAGS.header),
    safeGlobal<Footer>('footer', locale, CACHE_TAGS.footer),
    safeGlobal<Contact>('contacts', locale, CACHE_TAGS.contacts),
    safeGlobal<SiteSetting>('site-settings', locale, CACHE_TAGS.siteSettings),
    safeGlobal<PriceList>('price-list', locale, CACHE_TAGS.priceList),
  ]);

  return { header, footer, contacts, siteSettings, priceList };
});
