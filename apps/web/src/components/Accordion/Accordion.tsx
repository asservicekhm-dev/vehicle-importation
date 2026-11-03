'use client';

import type { ReactNode } from 'react';
import * as RadixAccordion from '@radix-ui/react-accordion';

import styles from './Accordion.module.scss';

export type AccordionItem = {
  value: string;
  title: ReactNode;
  content: ReactNode;
};

type Props = {
  items: AccordionItem[];
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
};

export function Accordion({ items, type = 'single', defaultValue }: Props) {
  if (!items.length) return null;

  const sharedProps =
    type === 'multiple'
      ? {
          type: 'multiple' as const,
          defaultValue: Array.isArray(defaultValue)
            ? defaultValue
            : defaultValue
              ? [defaultValue]
              : undefined,
        }
      : {
          type: 'single' as const,
          collapsible: true,
          defaultValue: typeof defaultValue === 'string' ? defaultValue : undefined,
        };

  return (
    <RadixAccordion.Root className={styles.root} {...sharedProps}>
      {items.map((item) => (
        <RadixAccordion.Item key={item.value} className={styles.item} value={item.value}>
          <RadixAccordion.Header>
            <RadixAccordion.Trigger className={styles.trigger}>
              <span>{item.title}</span>
              <span className={styles.chevron} aria-hidden>
                ▾
              </span>
            </RadixAccordion.Trigger>
          </RadixAccordion.Header>
          <RadixAccordion.Content className={styles.content}>
            <div className={styles.contentInner}>{item.content}</div>
          </RadixAccordion.Content>
        </RadixAccordion.Item>
      ))}
    </RadixAccordion.Root>
  );
}
