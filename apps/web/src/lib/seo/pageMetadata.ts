import type { Metadata } from 'next';

import { HOME_SLUG } from '@/lib/cms/constants';
import { getMediaUrl } from '@/lib/cms/resolveMediaUrl';
import type { Page } from '@autosearch/cms/payload-types';
import { defaultLocale, type Locale, locales, localeToHreflang } from '@autosearch/config';

const SITE_NAME = 'AS Autosearch';

function siteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_URL?.trim() || 'http://localhost:3000';
  return raw.replace(/\/$/, '');
}

function collapseDuplicateSlashes(url: string): string {
  return url.replace(/([^:]\/)\/+/g, '$1');
}

/** Public path for a page slug (`home` → `/`, nested `services/x` → `/services/x`). */
export function pagePathFromSlug(slug: string | null | undefined): string {
  const value = slug?.trim() || HOME_SLUG;
  if (value === HOME_SLUG) return '/';
  return `/${value.replace(/^\/+/, '')}`;
}

export function localizedPageUrl(locale: Locale, slug: string | null | undefined): string {
  const path = pagePathFromSlug(slug);
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  const joined =
    path === '/' ? `${siteOrigin()}${prefix || '/'}` : `${siteOrigin()}${prefix}${path}`;
  return collapseDuplicateSlashes(joined);
}

export function generatePageMetadata(page: Page, locale: Locale): Metadata {
  const title = page.meta?.title?.trim() || page.title?.trim() || SITE_NAME;
  const description = page.meta?.description?.trim() || undefined;
  const imageUrl = getMediaUrl(page.meta?.image);
  const canonical = localizedPageUrl(locale, page.slug);

  const languages = Object.fromEntries(
    locales.map((code) => [localeToHreflang[code], localizedPageUrl(code, page.slug)]),
  );

  return {
    title,
    description,
    robots: 'index, follow',
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: 'website',
      ...(imageUrl
        ? {
            images: [
              {
                url: imageUrl,
                alt: title,
                width: 1200,
                height: 630,
              },
            ],
          }
        : {}),
    },
  };
}
