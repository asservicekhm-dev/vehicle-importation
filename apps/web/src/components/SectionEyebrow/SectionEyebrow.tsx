import type { ReactNode } from 'react';

import styles from './SectionEyebrow.module.scss';

type Props = {
  children: ReactNode;
};

export function SectionEyebrow({ children }: Props) {
  if (!children) return null;

  return (
    <p className={styles.root}>
      <span className={styles.dot} aria-hidden />
      <span>{children}</span>
    </p>
  );
}
