import { HOME_SLUG } from '@/lib/cms/constants';
import type { Page } from '@autosearch/cms/payload-types';

type LinkLike = {
  type?: ('reference' | 'custom' | 'anchor' | 'form') | null;
  url?: string | null;
  hash?: string | null;
  reference?: {
    relationTo: 'pages';
    value: string | Page;
  } | null;
};

export function resolveLinkHref(link?: LinkLike | null): string | null {
  if (!link?.type) return null;

  const hash = link.hash?.replace(/^#/, '').trim();
  const withHash = (path: string) => (hash ? `${path}#${hash}` : path);

  if (link.type === 'custom') {
    const url = link.url?.trim();
    if (!url) return null;
    if (hash && !url.includes('#')) return withHash(url);
    return url;
  }

  if (link.type === 'reference') {
    const value = link.reference?.value;
    const slug =
      typeof value === 'object' && value !== null
        ? value.slug
        : typeof value === 'string'
          ? null
          : null;
    if (!slug) return null;
    const path = slug === HOME_SLUG ? '/' : `/${slug}`;
    return withHash(path);
  }

  if (link.type === 'anchor') {
    if (!hash) return null;
    return `#${hash}`;
  }

  // form — wired in Milestone 4
  return null;
}
