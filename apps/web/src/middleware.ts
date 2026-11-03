import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { defaultLocale, locales } from '@autosearch/config';

import { routing } from './i18n/routing';
import { getCmsBaseUrl } from './lib/cmsBaseUrl';

const handleI18nRouting = createMiddleware(routing);

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split('/').filter(Boolean);
  const currentLocaleCandidate = segments[0];
  const hasLocale = (locales as readonly string[]).includes(currentLocaleCandidate);
  const localePrefix = hasLocale ? `/${currentLocaleCandidate}` : '';

  try {
    const cmsBase = getCmsBaseUrl();
    const redirects = (await fetch(`${cmsBase}/api/redirects?limit=100&depth=1`, {
      next: { tags: ['redirects'], revalidate: 60 },
    }).then((res) => res.json())) as { docs?: RedirectDoc[] };

    const pathnameWithoutLocale = hasLocale ? `/${segments.slice(1).join('/')}` || '/' : pathname;

    const redirect = redirects.docs?.find((r) => {
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
