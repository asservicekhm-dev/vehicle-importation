import { payload } from '@/api';
import { HOME_SLUG } from '@/lib/cms/constants';
import { isIndexablePageSlug, localizedPageUrl } from '@/lib/seo/pageMetadata';
import type { Config } from '@autosearch/cms/payload-types';
import { defaultLocale, type Locale, locales, localeToHreflang } from '@autosearch/config';

export type PublicUrl = {
  id: string;
  kind: 'page' | 'post';
  locale: Locale;
  slug: string;
  url: string;
  title?: string;
  description?: string;
  updatedAt?: string;
  languages: Record<string, string>;
};

type ListedDoc = {
  id: string;
  slug?: string | null;
  title?: string | null;
  updatedAt?: string | null;
  meta?: {
    title?: string | null;
    description?: string | null;
  } | null;
};

function oneLine(value: string | null | undefined): string | undefined {
  const text = value?.replace(/\s+/g, ' ').trim();
  return text || undefined;
}

function urlFor(kind: PublicUrl['kind'], locale: Locale, slug: string): string {
  if (kind === 'post') return localizedPageUrl(locale, `blog/${slug}`);
  return localizedPageUrl(locale, slug);
}

async function findPublished(collection: 'pages' | 'blog', locale: Locale): Promise<ListedDoc[]> {
  const docs: ListedDoc[] = [];
  let page = 1;

  for (;;) {
    const res = await payload.find({
      collection,
      locale: locale as Config['locale'],
      depth: 0,
      limit: 100,
      page,
      where: { _status: { equals: 'published' } },
      // @ts-expect-error SDK next options
      next: { revalidate: 300 },
    });

    const batch = (res.docs ?? []) as ListedDoc[];
    docs.push(...batch);
    const totalPages = res.totalPages ?? 1;
    if (page >= totalPages || batch.length === 0) break;
    page += 1;
    if (page > 50) break;
  }

  return docs;
}

function homeFallback(): PublicUrl[] {
  const languages: Record<string, string> = {
    'x-default': localizedPageUrl(defaultLocale, HOME_SLUG),
  };
  for (const locale of locales) {
    languages[localeToHreflang[locale]] = localizedPageUrl(locale, HOME_SLUG);
  }

  return locales.map((locale) => ({
    id: `home-${locale}`,
    kind: 'page' as const,
    locale,
    slug: HOME_SLUG,
    url: localizedPageUrl(locale, HOME_SLUG),
    languages,
  }));
}

async function collect(collection: 'pages' | 'blog', kind: PublicUrl['kind']): Promise<PublicUrl[]> {
  const byId = new Map<string, Partial<Record<Locale, ListedDoc>>>();

  for (const locale of locales) {
    const docs = await findPublished(collection, locale);
    for (const doc of docs) {
      const slug = doc.slug?.trim();
      if (!slug) continue;
      if (kind === 'page' && !isIndexablePageSlug(slug)) continue;
      const bucket = byId.get(doc.id) ?? {};
      bucket[locale] = doc;
      byId.set(doc.id, bucket);
    }
  }

  const urls: PublicUrl[] = [];

  for (const [id, bucket] of byId) {
    const languages: Record<string, string> = {};
    for (const locale of locales) {
      const doc = bucket[locale];
      const slug = doc?.slug?.trim();
      if (!slug) continue;
      languages[localeToHreflang[locale]] = urlFor(kind, locale, slug);
    }

    const defaultDoc = bucket[defaultLocale];
    const defaultSlug = defaultDoc?.slug?.trim();
    if (defaultSlug) {
      languages['x-default'] = urlFor(kind, defaultLocale, defaultSlug);
    }

    for (const locale of locales) {
      const doc = bucket[locale];
      const slug = doc?.slug?.trim();
      if (!doc || !slug) continue;
      urls.push({
        id,
        kind,
        locale,
        slug,
        url: urlFor(kind, locale, slug),
        title: oneLine(doc.meta?.title) || oneLine(doc.title),
        description: oneLine(doc.meta?.description),
        updatedAt: doc.updatedAt || undefined,
        languages,
      });
    }
  }

  return urls;
}

function dedupe(urls: PublicUrl[]): PublicUrl[] {
  const seen = new Map<string, PublicUrl>();
  for (const url of urls) {
    if (!seen.has(url.url)) seen.set(url.url, url);
  }
  return [...seen.values()];
}

/** Published, indexable URLs for both locales. Home-only when the CMS is down. */
export async function listPublicUrls(): Promise<PublicUrl[]> {
  let pages: PublicUrl[] = [];
  let posts: PublicUrl[] = [];

  try {
    pages = await collect('pages', 'page');
  } catch {
    pages = [];
  }

  try {
    posts = await collect('blog', 'post');
  } catch {
    posts = [];
  }

  if (pages.length === 0) pages = homeFallback();
  return dedupe([...pages, ...posts]);
}
