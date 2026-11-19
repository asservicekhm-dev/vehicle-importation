import { unstable_cache } from 'next/cache';
import { cache } from 'react';

import { payload } from '@/api';
import { CACHE_TAGS } from '@/lib/cms/constants';
import type { Blog, Config } from '@autosearch/cms/payload-types';
import type { Locale } from '@autosearch/config';

export const BLOG_PAGE_LIMIT = 12;

export const getBlogPosts = cache(
  (
    locale: Locale,
    opts?: { page?: number; limit?: number },
  ): Promise<{ docs: Blog[]; totalDocs: number; totalPages: number; page: number }> => {
    const page = Math.max(1, opts?.page ?? 1);
    const limit = opts?.limit ?? BLOG_PAGE_LIMIT;

    const getCached = unstable_cache(
      async () => {
        const res = await payload.find({
          collection: 'blog',
          locale: locale as Config['locale'],
          depth: 2,
          limit,
          page,
          sort: '-updatedAt',
          where: { _status: { equals: 'published' } },
        });

        return {
          docs: (res.docs ?? []) as Blog[],
          totalDocs: res.totalDocs ?? 0,
          totalPages: res.totalPages ?? 1,
          page,
        };
      },
      ['blog-list', locale, String(page), String(limit)],
      {
        tags: [CACHE_TAGS.blog],
        revalidate: false,
      },
    );

    return getCached();
  },
);

export const getBlogPostBySlug = cache((slug: string, locale: Locale): Promise<Blog | null> => {
  const getCached = unstable_cache(
    async () => {
      const res = await payload.find({
        collection: 'blog',
        locale: locale as Config['locale'],
        depth: 2,
        limit: 1,
        where: {
          and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
        },
      });

      return (res.docs?.[0] as Blog | undefined) ?? null;
    },
    ['blog-by-slug', slug, locale],
    {
      tags: [CACHE_TAGS.blog, CACHE_TAGS.blogPost(slug)],
      revalidate: false,
    },
  );

  return getCached();
});
