import type { ReactNode } from 'react';

import { Link } from '@/i18n/navigation';
import type { CmsLink } from '@/types/cms';

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

  if (link.type === 'custom') {
    const url = link.url?.trim();

    if (!url) return null;

    if (isInternalPath(url)) {
      return (
        <Link className={className} href={url}>
          {label}
        </Link>
      );
    }

    return (
      <a
        className={className}
        href={url}
        {...(link.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {label}
      </a>
    );
  }

  // reference / form / anchor — wired in Milestone 3+
  return null;
}
