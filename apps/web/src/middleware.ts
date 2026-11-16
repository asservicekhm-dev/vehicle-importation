import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { defaultLocale, locales } from '@autosearch/config';

import { routing } from './i18n/routing';
import { getCmsBaseUrl } from './lib/cmsBaseUrl';

const handleI18nRouting = createMiddleware(routing);

const REDIRECTS_TTL_MS = 60_000;
const REDIRECTS_TIMEOUT_MS = 800;

type RedirectDoc = {
  from?: string;
  type?: string;
  to?: {
    type?: string;
    url?: string;
    reference?: {
      value?: {
        slug?: string;
      };
    };
  };
};

type RedirectsCache = {
  docs: RedirectDoc[];
  expiresAt: number;
};

let redirectsCache: RedirectsCache | null = null;
let lastGoodRedirects: RedirectDoc[] = [];

async function getRedirectDocs(): Promise<RedirectDoc[]> {
  const now = Date.now();
  if (redirectsCache && redirectsCache.expiresAt > now) {
    return redirectsCache.docs;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REDIRECTS_TIMEOUT_MS);

  try {
    const cmsBase = getCmsBaseUrl();
    const res = await fetch(`${cmsBase}/api/redirects?limit=100&depth=1`, {
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Redirects fetch failed: ${res.status}`);
    }

    const data = (await res.json()) as { docs?: RedirectDoc[] };
    const docs = data.docs ?? [];
    redirectsCache = { docs, expiresAt: now + REDIRECTS_TTL_MS };
    lastGoodRedirects = docs;
    return docs;
  } catch {
    if (lastGoodRedirects.length > 0) return lastGoodRedirects;
    return [];
  } finally {
    clearTimeout(timer);
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split('/').filter(Boolean);
  const currentLocaleCandidate = segments[0];
  const hasLocale = (locales as readonly string[]).includes(currentLocaleCandidate);
  const localePrefix = hasLocale ? `/${currentLocaleCandidate}` : '';

  try {
    const docs = await getRedirectDocs();
    const pathnameWithoutLocale = hasLocale ? `/${segments.slice(1).join('/')}` || '/' : pathname;

    const redirect = docs.find((r) => {
      if (!r.from) return false;
      const normalizedFrom = r.from.replace(/\/$/, '') || '/';
      const normalizedPathname = pathnameWithoutLocale.replace(/\/$/, '') || '/';
      return normalizedFrom === normalizedPathname;
    });

    if (redirect?.to) {
      let destinationPath: string;

      if (redirect.to.type === 'reference') {
        const slug = redirect.to.reference?.value?.slug;
        destinationPath = slug === 'home' || !slug ? '/' : `/${slug}`;
      } else {
        destinationPath = redirect.to.url || '/';
      }

      const isAbsolute = /^https?:\/\//.test(destinationPath);
      if (isAbsolute) {
        return NextResponse.redirect(new URL(destinationPath), redirect.type === '301' ? 301 : 302);
      }

      const withLocale =
        destinationPath === '/' ? localePrefix || '/' : `${localePrefix}${destinationPath}`;

      return NextResponse.redirect(
        new URL(withLocale, request.url),
        redirect.type === '301' ? 301 : 302,
      );
    }
  } catch {
    // CMS unavailable — continue without redirects
  }

  const response = handleI18nRouting(request);
  response.headers.set('x-locale', hasLocale ? currentLocaleCandidate : defaultLocale);
  return response;
}

export const config = {
  matcher: ['/', '/(ua|en)/:path*', '/((?!_next|_vercel|api|.*\\..*).*)'],
};
