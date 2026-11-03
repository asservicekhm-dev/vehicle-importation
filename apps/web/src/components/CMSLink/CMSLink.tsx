'use client';

import type { MouseEvent, ReactNode } from 'react';

import { Link } from '@/i18n/navigation';
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

function isSamePageHash(href: string) {
  return href.startsWith('#') && href.length > 1;
}

export function CMSLink({ link, className, children, onNavigate }: Props) {
  if (!link) return null;

  const label = children ?? link.label?.trim();
  if (!label) return null;

  if (link.type === 'form') return null;

  const href = resolveLinkHref(link);
  if (!href) return null;

  if (isSamePageHash(href)) {
    const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      smoothScrollToHash(href);
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
