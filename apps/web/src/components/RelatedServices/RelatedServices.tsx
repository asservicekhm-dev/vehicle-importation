'use client';

import { AnimatedContent } from '@/components/AnimatedContent';
import { CMSLink } from '@/components/CMSLink';
import { Container } from '@/components/Container';
import type { RelatedServicesBlockFields } from '@autosearch/cms/payload-types';

import styles from './RelatedServices.module.scss';

type Props = RelatedServicesBlockFields;

export function RelatedServices({ id, blockName, title, items }: Props) {
  const heading = title?.trim() ?? '';
  const cards = items?.filter((item) => item?.title?.trim()) ?? [];
  if (!heading && cards.length === 0) return null;

  const sectionId = (blockName || id || 'related-services').toString();
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
          {cards.length > 0 ? (
            <ul className={styles.grid}>
              {cards.map((card, index) => {
                const hasLink = Boolean(card.link?.label?.trim());
                return (
                  <li key={card.id ?? index} className={styles.card}>
                    <h3 className={styles.cardTitle}>{card.title}</h3>
                    {card.body?.trim() ? <p className={styles.cardBody}>{card.body.trim()}</p> : null}
                    {hasLink ? (
                      <CMSLink link={card.link} className={styles.link}>
                        {card.link?.label}
                      </CMSLink>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </AnimatedContent>
      </Container>
    </section>
  );
}
