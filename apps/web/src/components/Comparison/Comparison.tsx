import { AnimatedContent } from '@/components/AnimatedContent';
import { Container } from '@/components/Container';
import type { ComparisonBlockFields } from '@autosearch/cms/payload-types';

import styles from './Comparison.module.scss';

type Props = ComparisonBlockFields;

export function Comparison({ id, blockName, eyebrow, title, intro, leftColumn, rightColumn }: Props) {
  const heading = title?.trim() ?? '';
  const leftItems = leftColumn?.items?.filter((item) => item?.text?.trim()) ?? [];
  const rightItems = rightColumn?.items?.filter((item) => item?.text?.trim()) ?? [];
  const leftHeading = leftColumn?.heading?.trim() ?? '';
  const rightHeading = rightColumn?.heading?.trim() ?? '';

  if (!heading && !leftItems.length && !rightItems.length) return null;

  const sectionId = (blockName || id || 'comparison').toString();
  const headingId = `${sectionId}-title`;

  return (
    <section
      className={styles.section}
      id={sectionId}
      aria-labelledby={heading ? headingId : undefined}
    >
      <Container>
        <AnimatedContent distance={64} duration={0.75} threshold={0.15} stagger={0.08}>
          <div className={styles.header}>
            {eyebrow?.trim() ? <p className={styles.eyebrow}>{eyebrow.trim()}</p> : null}
            {heading ? (
              <h2 id={headingId} className={styles.title}>
                {heading}
              </h2>
            ) : null}
            {intro?.trim() ? <p className={styles.intro}>{intro.trim()}</p> : null}
          </div>

          <div className={styles.columns}>
            {leftHeading || leftItems.length ? (
              <div className={styles.columnMuted}>
                {leftHeading ? <h3 className={styles.columnTitle}>{leftHeading}</h3> : null}
                {leftItems.length ? (
                  <ul className={styles.list}>
                    {leftItems.map((item, index) => (
                      <li key={item.id ?? index} className={styles.itemMuted}>
                        <span className={styles.markMuted} aria-hidden>
                          —
                        </span>
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            {rightHeading || rightItems.length ? (
              <div className={styles.columnAccent}>
                {rightHeading ? <h3 className={styles.columnTitle}>{rightHeading}</h3> : null}
                {rightItems.length ? (
                  <ul className={styles.list}>
                    {rightItems.map((item, index) => (
                      <li key={item.id ?? index} className={styles.itemAccent}>
                        <span className={styles.markAccent} aria-hidden>
                          ✓
                        </span>
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>
        </AnimatedContent>
      </Container>
    </section>
  );
}
