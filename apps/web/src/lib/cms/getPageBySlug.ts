import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { notFound } from 'next/navigation';

import { payload } from '@/api';
import { CACHE_TAGS, HOME_SLUG, PAGE_DEPTH } from '@/lib/cms/constants';
import type { Config, Page } from '@autosearch/cms/payload-types';
import type { Locale } from '@autosearch/config';

async function fetchPageBySlug(slugFinal: string, locale: Locale): Promise<Page | null> {
  const res = await payload.find({
    collection: 'pages',
    depth: PAGE_DEPTH,
    locale: locale as Config['locale'],
    draft: false,
    where: {
      and: [{ slug: { equals: slugFinal } }, { _status: { equals: 'published' } }],
    },
  });

  return (res.docs?.[0] as Page | undefined) ?? null;
}

export const getPageBySlug = cache(async (slug: string, locale: Locale): Promise<Page> => {
  const slugFinal = slug || HOME_SLUG;

  const getCached = unstable_cache(
    () => fetchPageBySlug(slugFinal, locale),
    ['page-by-slug', slugFinal, locale],
    {
      tags: [CACHE_TAGS.pages, CACHE_TAGS.page(slugFinal)],
      revalidate: false,
    },
  );

  const doc = await getCached();
  if (!doc) notFound();
  return doc;
});
