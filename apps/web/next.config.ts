import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@autosearch/config'],
  sassOptions: {
    additionalData: `@use "@/scss/mixins" as *;`,
  },
  ...(process.env.DISABLE_STANDALONE !== 'true' && { output: 'standalone' }),
};

export default nextConfig;
