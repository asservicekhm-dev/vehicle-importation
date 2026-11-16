import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

function s3RemotePatterns(): NonNullable<NextConfig['images']>['remotePatterns'] {
  const patterns: NonNullable<NextConfig['images']>['remotePatterns'] = [
    { protocol: 'http', hostname: 'localhost', port: '3001', pathname: '/**' },
    { protocol: 'http', hostname: '127.0.0.1', port: '3001', pathname: '/**' },
    { protocol: 'http', hostname: 'localhost', port: '9000', pathname: '/**' },
    { protocol: 'http', hostname: '127.0.0.1', port: '9000', pathname: '/**' },
  ];

  const publicUrl = process.env.NEXT_PUBLIC_S3_PUBLIC_URL?.trim();
  if (publicUrl) {
    try {
      const u = new URL(publicUrl);
      patterns.push({
        protocol: u.protocol.replace(':', '') as 'http' | 'https',
        hostname: u.hostname,
        ...(u.port ? { port: u.port } : {}),
        pathname: '/**',
      });
    } catch {
      // ignore invalid URL
    }
  }

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
