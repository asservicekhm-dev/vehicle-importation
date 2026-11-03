import clsx from 'clsx';
import Image from 'next/image';

import { getMediaUrl } from '@/lib/cms/resolveMediaUrl';
import type { Media } from '@autosearch/cms/payload-types';

import styles from './ThemeLogo.module.scss';

type Props = {
  light?: Media | string | null;
  dark?: Media | string | null;
  alt: string;
  className?: string;
  /** Inverse surfaces swap which mark is visible per theme. */
  onInverse?: boolean;
  priority?: boolean;
  size?: number;
};

export function ThemeLogo({
  light,
  dark,
  alt,
  className,
  onInverse = false,
  priority = false,
  size = 40,
}: Props) {
  const lightUrl = getMediaUrl(light);
  const darkUrl = getMediaUrl(dark);

  if (!lightUrl && !darkUrl) return null;

  const singleUrl = lightUrl && darkUrl ? null : lightUrl || darkUrl;

  return (
    <span className={clsx(styles.root, onInverse && styles.onInverse, className)}>
      <span className={styles.stack} style={{ width: size, height: size }}>
        {singleUrl ? (
          <Image
            className={styles.img}
            src={singleUrl}
            alt={alt}
            width={size}
            height={size}
            sizes={`${size}px`}
            priority={priority}
          />
        ) : (
          <>
            {lightUrl ? (
              <Image
                className={clsx(styles.img, styles.layered, styles.forLight)}
                src={lightUrl}
                alt={alt}
                width={size}
                height={size}
                sizes={`${size}px`}
                priority={priority}
              />
            ) : null}
            {darkUrl ? (
              <Image
                className={clsx(styles.img, styles.layered, styles.forDark)}
                src={darkUrl}
                alt=''
                aria-hidden
                width={size}
                height={size}
                sizes={`${size}px`}
                priority={priority}
              />
            ) : null}
          </>
        )}
      </span>
    </span>
  );
}
