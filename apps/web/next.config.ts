import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

type RemotePatterns = NonNullable<NextConfig['images']>['remotePatterns'];

function pushOrigin(patterns: RemotePatterns, raw: string | undefined) {
  const value = raw?.trim();
  if (!value || !patterns) return;
  try {
    const u = new URL(value);
    const protocol = u.protocol.replace(':', '') as 'http' | 'https';
    if (protocol !== 'http' && protocol !== 'https') return;
    patterns.push({
      protocol,
      hostname: u.hostname,
      ...(u.port ? { port: u.port } : {}),
      pathname: '/**',
    });
  } catch {
    // ignore invalid URL
  }
}

function s3RemotePatterns(): RemotePatterns {
  const patterns: RemotePatterns = [
    { protocol: 'http', hostname: 'localhost', port: '3001', pathname: '/**' },
    { protocol: 'http', hostname: '127.0.0.1', port: '3001', pathname: '/**' },
    { protocol: 'http', hostname: 'localhost', port: '9000', pathname: '/**' },
    { protocol: 'http', hostname: '127.0.0.1', port: '9000', pathname: '/**' },
    // SSR image srcs use CMS_INTERNAL_URL (http://cms:3001[/cms]). The optimizer
    // allowlist is fixed at `next build`, and that var is not a public build ARG,
    // so the Compose service host has to be allowed explicitly.
    { protocol: 'http', hostname: 'cms', port: '3001', pathname: '/**' },
  ];

  pushOrigin(patterns, process.env.NEXT_PUBLIC_S3_PUBLIC_URL);
  pushOrigin(patterns, process.env.NEXT_PUBLIC_CMS_URL);
  pushOrigin(patterns, process.env.CMS_INTERNAL_URL);
  pushOrigin(patterns, process.env.NEXT_IMAGE_CMS_INTERNAL_ORIGIN);

  return patterns;
}

const nextConfig: NextConfig = {
  transpilePackages: ['@autosearch/config'],
  sassOptions: {
    additionalData: `@use "@/scss/mixins" as *;`,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    // Floor for optimized remote CMS images when upstream Cache-Control is weak.
    // Do not use a year — remote URLs are not content-hashed.
    minimumCacheTTL: 14400,
    remotePatterns: s3RemotePatterns(),
    unoptimized: process.env.NEXT_IMAGE_UNOPTIMIZED === 'true',
  },
  ...(process.env.DISABLE_STANDALONE !== 'true' && { output: 'standalone' }),
};

export default withNextIntl(nextConfig);
