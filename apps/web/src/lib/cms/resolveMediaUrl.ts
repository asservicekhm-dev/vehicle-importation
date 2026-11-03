import { getCmsBaseUrl } from '@/lib/cmsBaseUrl';
import type { Media } from '@autosearch/cms/payload-types';

export function resolveMediaUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
    return url;
  }

  try {
    const base = getCmsBaseUrl();
    return `${base}${url.startsWith('/') ? url : `/${url}`}`;
  } catch {
    return url;
  }
}

type MediaSize = 'favicon' | 'icon';

/** Absolute URL for a populated Media doc, optionally preferring a generated size. */
export function getMediaUrl(
  media: Media | string | null | undefined,
  size?: MediaSize,
): string | null {
  if (!media || typeof media === 'string') return null;

  const sized = size ? media.sizes?.[size]?.url?.trim() : null;
  const raw = sized || media.url?.trim();
  if (!raw) return null;

  return resolveMediaUrl(raw);
}
