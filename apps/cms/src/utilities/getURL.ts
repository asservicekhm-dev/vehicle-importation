import canUseDOM from './canUseDOM';
import { getCmsBasePath } from './cmsBasePath';

/** Public CMS URL (may include a path prefix such as `/cms`). */
export const getServerSideURL = () => {
  let url = process.env.NEXT_PUBLIC_CMS_URL;

  if (!url) {
    url = 'http://localhost:3001';
  }

  return url.replace(/\/$/, '');
};

/** Origin only — Payload `serverURL` cannot include a path. */
export const getServerOrigin = () => {
  try {
    return new URL(getServerSideURL()).origin;
  } catch {
    return getServerSideURL();
  }
};

export const getClientSideURL = () => {
  if (canUseDOM) {
    const protocol = window.location.protocol;
    const domain = window.location.hostname;
    const port = window.location.port;
    const origin = `${protocol}//${domain}${port ? `:${port}` : ''}`;
    return `${origin}${getCmsBasePath()}`;
  }

  return process.env.NEXT_PUBLIC_CMS_URL || '';
};
