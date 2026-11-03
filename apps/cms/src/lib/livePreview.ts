import { defaultLocale } from '@autosearch/config';

import { optionalEnv } from './env';

function normalizeWebBase(): string {
  return (optionalEnv('WEB_URL') || 'http://localhost:3000').replace(/\/$/, '');
}

function localePathPrefix(locale: unknown): string {
  const code =
    typeof locale === 'string'
      ? locale
      : locale && typeof locale === 'object' && 'code' in locale
        ? String((locale as { code: string }).code)
        : defaultLocale;
  return code === defaultLocale ? '' : `/${code}`;
}

type LivePreviewUrlArgs = {
  collectionConfig?: { slug?: string } | null;
  data?: Record<string, unknown> | null;
  globalConfig?: { slug?: string } | null;
  locale?: unknown;
};

export function buildLivePreviewUrl({
  collectionConfig,
  data,
  globalConfig,
  locale,
}: LivePreviewUrlArgs): string {
  const base = normalizeWebBase();
  const lp = localePathPrefix(locale);

  if (globalConfig?.slug) {
    return `${base}${lp || '/'}`;
  }

  if (collectionConfig?.slug === 'pages') {
    const pageSlug = typeof data?.slug === 'string' ? data.slug : 'home';
    const path = pageSlug === 'home' ? '' : `/${pageSlug}`;
    return `${base}${lp}${path}`;
  }

  return `${base}${lp || '/'}`;
}
