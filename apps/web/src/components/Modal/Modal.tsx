'use client';

import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

import styles from './Modal.module.scss';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  closeLabel?: string;
  /** Called instead of Radix’s default focus return (which can scroll the page). */
  onCloseAutoFocus?: (event: Event) => void;
};

export function Modal({
  open,
  onOpenChange,
  title,
  children,
  closeLabel = 'Close',
  onCloseAutoFocus,
}: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content
          className={styles.content}
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            if (onCloseAutoFocus) {
              onCloseAutoFocus(event);
              return;
            }
            event.preventDefault();
          }}
        >
          <div className={styles.header}>
            <Dialog.Title className={styles.title}>{title}</Dialog.Title>
            <Dialog.Close className={styles.close} aria-label={closeLabel}>
              ✕
            </Dialog.Close>
          </div>
          <div className={styles.body}>{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
