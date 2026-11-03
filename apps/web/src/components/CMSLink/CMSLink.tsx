'use client';

import type { MouseEvent, ReactNode } from 'react';
import { useLocale } from 'next-intl';

import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import {
  emitBookingServiceDeepLink,
  readServiceFromHref,
} from '@/lib/booking/serviceDeepLink';
import { resolveLinkHref } from '@/lib/cms/resolveLinkHref';
import { smoothScrollToHash } from '@/lib/smoothScrollTo';
import type { Header } from '@autosearch/cms/payload-types';

type HeaderLink = NonNullable<NonNullable<Header['navItems']>[number]>['link'];

/** Accept header links and block CTA links (label may be optional on some schemas). */
type CmsLink = Omit<HeaderLink, 'label'> & { label?: string | null };

type Props = {
  link?: CmsLink | null;
  className?: string;
  children?: ReactNode;
  onNavigate?: () => void;
};

function isInternalPath(url: string) {
  return url.startsWith('/') && !url.startsWith('//');
}

function parseInternalHref(href: string): { pathname: string; search: string; hash: string } {
  const url = new URL(href, 'http://local.invalid');
  return {
    pathname: url.pathname.replace(/\/$/, '') || '/',
    search: url.search,
    hash: url.hash,
  };
}

/** Locale-prefixed href for native <a> (next-intl Link drops/ignores hashes). */
function withLocalePrefix(href: string, locale: string): string {
  if (!isInternalPath(href)) return href;
  if (locale === routing.defaultLocale) return href;
  return `/${locale}${href}`;
}

/** Same document: `#hash`, `?query#hash`, or same pathname with query/hash. */
function isSameDocumentHref(href: string, pathname: string): boolean {
  if (href.startsWith('#') || href.startsWith('?')) return true;
  if (!isInternalPath(href)) return false;
  try {
    const { pathname: linkPath } = parseInternalHref(href);
    const current = pathname.replace(/\/$/, '') || '/';
    return linkPath === current;
  } catch {
    return false;
  }
}

export function CMSLink({ link, className, children, onNavigate }: Props) {
  const pathname = usePathname();
  const locale = useLocale();

  if (!link) return null;

  const label = children ?? link.label?.trim();
  if (!label) return null;

  if (link.type === 'form') return null;

  const href = resolveLinkHref(link);
  if (!href) return null;

  if (isSameDocumentHref(href, pathname)) {
    const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();

      // Pure in-page anchors keep the current query string.
      if (href.startsWith('#')) {
        smoothScrollToHash(href);
        onNavigate?.();
        return;
      }

      const resolved = new URL(href, window.location.href);
      const nextSearch = resolved.search;
      const nextHash = resolved.hash;
      const serviceMode = readServiceFromHref(href);

      const nextUrl = `${window.location.pathname}${nextSearch}${nextHash}`;
      const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      const urlChanged = nextUrl !== currentUrl;

      const scrollToForm = () => {
        if (nextHash) smoothScrollToHash(nextHash, { updateUrl: false });
      };

      // Scroll before history mutation — Next.js patches pushState and resets scroll
      // in the same turn (first CTA click was URL-only until the second click).
      scrollToForm();

      if (serviceMode) {
        emitBookingServiceDeepLink(serviceMode);
      }

      if (urlChanged) {
        window.history.pushState(null, '', nextUrl);
        // Re-assert after Next's history patch, then again after mode fields expand.
        window.setTimeout(scrollToForm, 32);
      }

      if (serviceMode) {
        window.setTimeout(scrollToForm, 320);
      }

      onNavigate?.();
    };

    return (
      <a className={className} href={withLocalePrefix(href, locale)} onClick={onClick}>
        {label}
      </a>
    );
  }

  if (isInternalPath(href)) {
    const { pathname: targetPath, search, hash } = parseInternalHref(href);

    // Cross-route section links (`/#services` from `/blog`): native <a> keeps the hash.
    // next-intl <Link> soft-nav often lands on `/` without scrolling to the section.
    if (hash) {
      return (
        <a className={className} href={withLocalePrefix(href, locale)} onClick={onNavigate}>
          {label}
        </a>
      );
    }

    return (
      <Link className={className} href={`${targetPath}${search}`} onClick={onNavigate}>
        {label}
      </Link>
    );
  }

  return (
    <a
      className={className}
      href={href}
      onClick={onNavigate}
      {...(link.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {label}
    </a>
  );
}
