import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';

import { payload } from '@/api';
import { CACHE_TAGS, HOME_SLUG } from '@/lib/cms/constants';
import { getGlobals } from '@/lib/cms/getGlobals';
import { getMediaUrl } from '@/lib/cms/resolveMediaUrl';
import type { Config } from '@autosearch/cms/payload-types';
import { defaultLocale, type Locale, locales, localeToHreflang } from '@autosearch/config';

const SITE_NAME = 'AS Autosearch';

export function siteOrigin(): string {
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

export function isIndexablePageSlug(slug: string | null | undefined): boolean {
  const path = pagePathFromSlug(slug);
  if (path === '/design-seed' || path.startsWith('/design-seed/')) return false;
  if (path === '/cms' || path.startsWith('/cms/')) return false;
  if (path === '/api' || path.startsWith('/api/')) return false;
  return true;
}

type SeoMeta = {
  title?: string | null;
  description?: string | null;
  image?: Parameters<typeof getMediaUrl>[0];
};

export type SeoDoc = {
  id?: string;
  title?: string | null;
  slug?: string | null;
  meta?: SeoMeta | null;
};

type MetadataOptions = {
  collection?: 'pages' | 'blog';
  openGraphType?: 'website' | 'article';
  publishedTime?: string | null;
  modifiedTime?: string | null;
};

const ogLocale: Record<Locale, string> = {
  ua: 'uk_UA',
  en: 'en_US',
};

function publicUrl(collection: 'pages' | 'blog', locale: Locale, slug: string): string {
  if (collection === 'blog') return localizedPageUrl(locale, `blog/${slug}`);
  return localizedPageUrl(locale, slug);
}

function resolveTitle(raw: string, siteName: string): string {
  const title = raw.trim() || siteName;
  if (title.toLowerCase().includes(siteName.toLowerCase())) return title;
  const suffix = ` | ${siteName}`;
  if (title.length + suffix.length <= 60) return `${title}${suffix}`;
  return title;
}

const getPublishedSlug = cache(async (collection: 'pages' | 'blog', id: string, locale: Locale) => {
  const tag = collection === 'pages' ? CACHE_TAGS.pages : CACHE_TAGS.blog;

  const getCached = unstable_cache(
    async () => {
      try {
        const res = await payload.find({
          collection,
          locale: locale as Config['locale'],
          depth: 0,
          limit: 1,
          where: {
            and: [{ id: { equals: id } }, { _status: { equals: 'published' } }],
          },
        });
        const slug = res.docs?.[0]?.slug;
        return typeof slug === 'string' && slug.trim() ? slug.trim() : null;
      } catch {
        return null;
      }
    },
    ['published-slug', collection, id, locale],
    { tags: [tag], revalidate: false },
  );

  return getCached();
});

export async function generatePageMetadata(
  doc: SeoDoc,
  locale: Locale,
  opts?: MetadataOptions,
): Promise<Metadata> {
  const collection = opts?.collection ?? 'pages';
  const { siteSettings } = await getGlobals(locale);
  const siteName = siteSettings?.siteName?.trim() || SITE_NAME;
  const title = resolveTitle(doc.meta?.title?.trim() || doc.title?.trim() || siteName, siteName);
  const description =
    doc.meta?.description?.trim() || siteSettings?.defaultMetaDescription?.trim() || undefined;
  const imageUrl = getMediaUrl(doc.meta?.image);

  const currentSlug =
    collection === 'blog'
      ? doc.slug?.trim() || ''
      : doc.slug?.trim() || HOME_SLUG;

  const slugs: Partial<Record<Locale, string>> = {};
  if (currentSlug) slugs[locale] = currentSlug;

  if (doc.id) {
    await Promise.all(
      locales
        .filter((code) => code !== locale)
        .map(async (code) => {
          const sibling = await getPublishedSlug(collection, doc.id as string, code);
          if (sibling) slugs[code] = sibling;
        }),
    );
  }

  const languages: Record<string, string> = {};
  for (const code of locales) {
    const slug = slugs[code];
    if (!slug) continue;
    languages[localeToHreflang[code]] = publicUrl(collection, code, slug);
  }

  const canonical =
    (currentSlug ? publicUrl(collection, locale, currentSlug) : undefined) ||
    languages[localeToHreflang[locale]];

  if (languages[localeToHreflang[defaultLocale]]) {
    languages['x-default'] = languages[localeToHreflang[defaultLocale]];
  } else if (canonical) {
    languages['x-default'] = canonical;
  }

  const openGraphType = opts?.openGraphType ?? 'website';

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
      siteName,
      locale: ogLocale[locale],
      alternateLocale: locales.filter((code) => code !== locale).map((code) => ogLocale[code]),
      ...(openGraphType === 'article'
        ? {
            type: 'article' as const,
            ...(opts?.publishedTime ? { publishedTime: opts.publishedTime } : {}),
            ...(opts?.modifiedTime ? { modifiedTime: opts.modifiedTime } : {}),
          }
        : { type: 'website' as const }),
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
    twitter: {
      card: imageUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}
