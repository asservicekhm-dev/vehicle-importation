import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import { Slot } from '@radix-ui/react-slot';

import styles from './Button.module.scss';

export type ButtonVariant = 'primary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  children: ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'md',
  asChild = false,
  className,
  children,
  type = 'button',
  ...props
}: Props) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      className={clsx(styles.button, styles[variant], styles[size], className)}
      {...(!asChild ? { type } : {})}
      {...props}
    >
      {children}
    </Comp>
  );
}
