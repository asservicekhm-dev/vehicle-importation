/**
 * Public CMS URL without a trailing slash (may include a path prefix such as `/cms`).
 */
export function getCmsBaseUrl(): string {
  const isServer = typeof window === 'undefined';
  const url =
    (isServer ? process.env.CMS_INTERNAL_URL?.trim() : undefined) ||
    process.env.NEXT_PUBLIC_CMS_URL?.trim();

  if (!url) {
    throw new Error('CMS url is not set (set CMS_INTERNAL_URL and/or NEXT_PUBLIC_CMS_URL)');
  }

  return url.replace(/\/$/, '');
}
