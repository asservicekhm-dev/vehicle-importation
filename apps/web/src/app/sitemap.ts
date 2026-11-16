import type { MetadataRoute } from 'next';

import { HOME_SLUG } from '@/lib/cms/constants';
import { listPublicUrls } from '@/lib/seo/publicUrls';

export const dynamic = 'force-dynamic';

function lastModified(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls = await listPublicUrls();

  return urls.map((entry) => {
    const modified = lastModified(entry.updatedAt);
    const isHome = entry.kind === 'page' && entry.slug === HOME_SLUG;

    return {
      url: entry.url,
      ...(modified ? { lastModified: modified } : {}),
      changeFrequency: isHome ? 'daily' : 'weekly',
      priority: isHome ? 1 : entry.kind === 'post' ? 0.6 : 0.7,
      alternates: {
        languages: entry.languages,
      },
    };
  });
}
