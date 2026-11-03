import { cache } from 'react';
import { notFound } from 'next/navigation';

import { payload } from '@/api';
import { CACHE_TAGS, HOME_SLUG, PAGE_DEPTH } from '@/lib/cms/constants';
import type { Config, Page } from '@autosearch/cms/payload-types';
import type { Locale } from '@autosearch/config';

export const getPageBySlug = cache(async (slug: string, locale: Locale): Promise<Page> => {
  const slugFinal = slug || HOME_SLUG;

  const res = await payload.find({
    collection: 'pages',
    depth: PAGE_DEPTH,
    locale: locale as Config['locale'],
    draft: false,
    where: {
      and: [{ slug: { equals: slugFinal } }, { _status: { equals: 'published' } }],
    },
    // @ts-expect-error SDK next options
    next: { tags: [CACHE_TAGS.pages, CACHE_TAGS.page(slugFinal)] },
  });

  const doc = res.docs?.[0];
  if (!doc) notFound();
  return doc;
});
