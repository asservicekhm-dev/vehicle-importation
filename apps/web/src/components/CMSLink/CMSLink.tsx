'use client';

import type { MouseEvent, ReactNode } from 'react';

import { Link, usePathname } from '@/i18n/navigation';
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

/** Same document: `#hash`, `?query#hash`, or same pathname with query/hash. */
function isSameDocumentHref(href: string, pathname: string): boolean {
  if (href.startsWith('#') || href.startsWith('?')) return true;
  if (!isInternalPath(href)) return false;
  try {
    const url = new URL(href, 'http://local.invalid');
    const linkPath = url.pathname.replace(/\/$/, '') || '/';
    const current = pathname.replace(/\/$/, '') || '/';
    return linkPath === current;
  } catch {
    return false;
  }
}

export function CMSLink({ link, className, children, onNavigate }: Props) {
  const pathname = usePathname();

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
      <a className={className} href={href} onClick={onClick}>
        {label}
      </a>
    );
  }

  if (isInternalPath(href)) {
    return (
      <Link className={className} href={href} onClick={onNavigate}>
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
