'use client';

import { AnimatedContent } from '@/components/AnimatedContent';
import { Container } from '@/components/Container';
import type { ServiceBenefitsBlockFields } from '@autosearch/cms/payload-types';

import styles from './ServiceBenefits.module.scss';

type Props = ServiceBenefitsBlockFields;

export function ServiceBenefits({ id, blockName, title, items }: Props) {
  const heading = title?.trim() ?? '';
  const list = items?.filter((item) => item?.title?.trim()) ?? [];
  if (!heading && list.length === 0) return null;

  const sectionId = (blockName || id || 'service-benefits').toString();
  const headingId = `${sectionId}-title`;

  return (
    <section
      className={styles.section}
      id={sectionId}
      aria-labelledby={heading ? headingId : undefined}
    >
      <Container>
        <AnimatedContent distance={72} duration={0.9} stagger={0.06}>
          {heading ? (
            <h2 id={headingId} className={styles.title}>
              {heading}
            </h2>
          ) : null}
          {list.length > 0 ? (
            <ul className={styles.list}>
              {list.map((item, index) => (
                <li key={item.id ?? index}>
                  <h3 className={styles.itemTitle}>{item.title}</h3>
                  {item.body?.trim() ? <p className={styles.itemBody}>{item.body.trim()}</p> : null}
                </li>
              ))}
            </ul>
          ) : null}
        </AnimatedContent>
      </Container>
    </section>
  );
}
