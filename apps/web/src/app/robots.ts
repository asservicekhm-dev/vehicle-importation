import type { MetadataRoute } from 'next';

function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_URL?.trim() || 'http://localhost:3000').replace(/\/$/, '');
}

export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/cms', '/cms/', '/design-seed', '/en/design-seed'],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
