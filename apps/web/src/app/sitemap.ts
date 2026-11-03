import type { MetadataRoute } from 'next';

import { payload } from '@/api';
import { HOME_SLUG } from '@/lib/cms/constants';
import { localizedPageUrl, pagePathFromSlug } from '@/lib/seo/pageMetadata';
import { defaultLocale, type Locale, locales } from '@autosearch/config';

export const dynamic = 'force-dynamic';

function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_URL?.trim() || 'http://localhost:3000').replace(/\/$/, '');
}

function homeOnlySitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return locales.map((locale) => ({
    url: localizedPageUrl(locale, HOME_SLUG),
    lastModified: now,
    changeFrequency: 'daily',
    priority: 1,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const entries: MetadataRoute.Sitemap = [];

    for (const locale of locales) {
      const pages = await payload.find({
        collection: 'pages',
        locale,
        depth: 0,
        limit: 200,
        where: { _status: { equals: 'published' } },
        // @ts-expect-error SDK next options
        next: { revalidate: 300 },
      });

      for (const doc of pages.docs ?? []) {
        const slug = typeof doc.slug === 'string' ? doc.slug : HOME_SLUG;
        const path = pagePathFromSlug(slug);
        if (path === '/cms' || path.startsWith('/cms/')) continue;

        entries.push({
          url: localizedPageUrl(locale as Locale, slug),
          lastModified: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
          changeFrequency: slug === HOME_SLUG ? 'daily' : 'weekly',
          priority: slug === HOME_SLUG ? 1 : 0.7,
        });
      }
    }

    for (const locale of locales) {
      const posts = await payload.find({
        collection: 'blog',
        locale,
        depth: 0,
        limit: 500,
        where: { _status: { equals: 'published' } },
        // @ts-expect-error SDK next options
        next: { revalidate: 300 },
      });

      const prefix = locale === defaultLocale ? '' : `/${locale}`;
      for (const doc of posts.docs ?? []) {
        const slug = typeof doc.slug === 'string' ? doc.slug : '';
        if (!slug) continue;
        entries.push({
          url: `${siteOrigin()}${prefix}/blog/${slug}`,
          lastModified: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    }

    return entries.length > 0 ? entries : homeOnlySitemap();
  } catch {
    return homeOnlySitemap();
  }
}
