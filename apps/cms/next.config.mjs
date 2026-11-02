import { withPayload } from '@payloadcms/next/withPayload';

function cmsBasePath() {
  const raw = (process.env.CMS_BASE_PATH || '').trim();

  if (!raw || raw === '/') return '';

  return (raw.startsWith('/') ? raw : `/${raw}`).replace(/\/$/, '');
}

const basePath = cmsBasePath();

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(basePath ? { basePath } : {}),
  redirects: () => Promise.resolve([{ source: '/', destination: '/admin', permanent: false }]),
  transpilePackages: ['@autosearch/config'],
  ...(process.env.DISABLE_STANDALONE !== 'true' && { output: 'standalone' }),
};

/**
 * Without `devBundleServerPackages`, withPayload marks @payloadcms/* as serverExternalPackages in dev,
 * so Node loads them unbundled and chokes on CSS imported by @payloadcms/ui (react-image-crop).
 * @see https://payloadcms.com/docs/getting-started/installation
 */
export default withPayload(nextConfig, {
  devBundleServerPackages: true,
});
