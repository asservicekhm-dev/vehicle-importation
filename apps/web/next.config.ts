import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  transpilePackages: ['@autosearch/config'],
  sassOptions: {
    additionalData: `@use "@/scss/mixins" as *;`,
  },
  ...(process.env.DISABLE_STANDALONE !== 'true' && { output: 'standalone' }),
};

export default withNextIntl(nextConfig);
