import Image from 'next/image';

import { getCmsBaseUrl } from '@/lib/cmsBaseUrl';
import type { Media } from '@autosearch/cms/payload-types';

type Props = {
  media?: Media | string | null;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
};

function resolveMediaUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
    return url;
  }

  try {
    const base = getCmsBaseUrl();
    return `${base}${url.startsWith('/') ? url : `/${url}`}`;
  } catch {
    return url;
  }
}

export function CMSMedia({ media, className, fill, sizes, priority }: Props) {
  if (!media || typeof media === 'string') return null;

  const rawUrl = media.url?.trim();
  if (!rawUrl) return null;

  const url = resolveMediaUrl(rawUrl);
  const mime = media.mimeType ?? '';
  const alt = (typeof media.alt === 'string' ? media.alt : '')?.trim() || '';

  if (mime.startsWith('video/')) {
    return <video className={className} src={url} controls playsInline />;
  }

  if (mime.startsWith('image/') || !mime) {
    if (fill) {
      return (
        <Image className={className} src={url} alt={alt} fill sizes={sizes} priority={priority} />
      );
    }

    const width = media.width && media.width > 0 ? media.width : 1200;
    const height = media.height && media.height > 0 ? media.height : 800;

    return (
      <Image
        className={className}
        src={url}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
      />
    );
  }

  return null;
}
