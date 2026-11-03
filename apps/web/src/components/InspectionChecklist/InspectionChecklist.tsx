import { AnimatedContent } from '@/components/AnimatedContent';
import { Container } from '@/components/Container';
import type { InspectionChecklistBlockFields } from '@autosearch/cms/payload-types';

import styles from './InspectionChecklist.module.scss';

type Props = InspectionChecklistBlockFields;

export function InspectionChecklist({ id, blockName, eyebrow, title, intro, items }: Props) {
  const heading = title?.trim();
  const list = items?.filter((item) => item?.title?.trim()) ?? [];
  if (!heading && !list.length) return null;

  const sectionId = (blockName || id || 'inspection').toString();

  return (
    <section className={styles.section} id={sectionId}>
      <Container>
        <AnimatedContent
          className={styles.layout}
          distance={64}
          duration={0.75}
          threshold={0.15}
          stagger={0.08}
        >
          <div>
            {eyebrow?.trim() ? <p className={styles.eyebrow}>{eyebrow.trim()}</p> : null}
            {heading ? <h2 className={styles.heading}>{heading}</h2> : null}
            {intro?.trim() ? <p className={styles.intro}>{intro.trim()}</p> : null}
          </div>
          {list.length ? (
            <ul className={styles.list}>
              {list.map((item, index) => (
                <li key={item.id ?? index} className={styles.item}>
                  <span className={styles.check}>
                    <span className={styles.mark} aria-hidden>
                      ✓
                    </span>
                    {item.title}
                  </span>
                  {item.detail?.trim() ? (
                    <p className={styles.detail}>{item.detail.trim()}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </AnimatedContent>
      </Container>
    </section>
  );
}
