import { cache } from 'react';

import { payload } from '@/api';
import type { Blog, Config } from '@autosearch/cms/payload-types';
import type { Locale } from '@autosearch/config';

export const BLOG_PAGE_LIMIT = 12;

export const getBlogPosts = cache(
  async (
    locale: Locale,
    opts?: { page?: number; limit?: number },
  ): Promise<{ docs: Blog[]; totalDocs: number; totalPages: number; page: number }> => {
    const page = Math.max(1, opts?.page ?? 1);
    const limit = opts?.limit ?? BLOG_PAGE_LIMIT;

    const res = await payload.find({
      collection: 'blog',
      locale: locale as Config['locale'],
      depth: 2,
      limit,
      page,
      sort: '-updatedAt',
      where: { _status: { equals: 'published' } },
      // @ts-expect-error SDK next options
      next: { tags: ['blog'] },
    });

    return {
      docs: (res.docs ?? []) as Blog[],
      totalDocs: res.totalDocs ?? 0,
      totalPages: res.totalPages ?? 1,
      page,
    };
  },
);

export const getBlogPostBySlug = cache(async (slug: string, locale: Locale): Promise<Blog | null> => {
  const res = await payload.find({
    collection: 'blog',
    locale: locale as Config['locale'],
    depth: 2,
    limit: 1,
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
    },
    // @ts-expect-error SDK next options
    next: { tags: ['blog', `blog:${slug}`] },
  });

  return (res.docs?.[0] as Blog | undefined) ?? null;
});
