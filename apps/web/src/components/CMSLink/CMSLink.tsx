import type { ReactNode } from 'react';

import { Link } from '@/i18n/navigation';
import { resolveLinkHref } from '@/lib/cms/resolveLinkHref';
import type { Header } from '@autosearch/cms/payload-types';

type CmsLink = NonNullable<NonNullable<Header['navItems']>[number]>['link'];

type Props = {
  link?: CmsLink | null;
  className?: string;
  children?: ReactNode;
};

function isInternalPath(url: string) {
  return url.startsWith('/') && !url.startsWith('//');
}

export function CMSLink({ link, className, children }: Props) {
  if (!link) return null;

  const label = children ?? link.label?.trim();
  if (!label) return null;

  if (link.type === 'form') return null;

  const href = resolveLinkHref(link);
  if (!href) return null;

  if (href.startsWith('#')) {
    return (
      <a className={className} href={href}>
        {label}
      </a>
    );
  }

  if (isInternalPath(href)) {
    return (
      <Link className={className} href={href}>
        {label}
      </Link>
    );
  }

  return (
    <a
      className={className}
      href={href}
      {...(link.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {label}
    </a>
  );
}
