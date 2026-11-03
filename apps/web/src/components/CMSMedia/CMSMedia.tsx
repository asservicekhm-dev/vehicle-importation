import Image from 'next/image';

import type { CmsMedia } from '@/types/cms';

type Props = {
  media?: CmsMedia | null;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
};

export function CMSMedia({ media, className, fill, sizes, priority }: Props) {
  if (!media) return null;

  const url = media.url?.trim();

  if (!url) return null;

  const mime = media.mimeType ?? '';
  const alt = media.alt?.trim() || '';

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
