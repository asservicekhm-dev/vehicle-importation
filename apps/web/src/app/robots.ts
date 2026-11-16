import type { MetadataRoute } from 'next';

import { siteOrigin } from '@/lib/seo/pageMetadata';

export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/cms', '/cms/'],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
