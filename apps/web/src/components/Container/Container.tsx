import type { ElementType, ReactNode } from 'react';
import clsx from 'clsx';

import styles from './Container.module.scss';

type Props = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
};

export function Container({ as: Comp = 'div', className, children }: Props) {
  return <Comp className={clsx(styles.root, className)}>{children}</Comp>;
}
