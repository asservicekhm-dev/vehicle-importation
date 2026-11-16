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
        <div className={styles.layout}>
          <AnimatedContent distance={72} duration={0.85}>
            <div>
              {eyebrow?.trim() ? <p className={styles.eyebrow}>{eyebrow.trim()}</p> : null}
              {heading ? <h2 className={styles.heading}>{heading}</h2> : null}
              {intro?.trim() ? <p className={styles.intro}>{intro.trim()}</p> : null}
            </div>
          </AnimatedContent>
          {list.length ? (
            <AnimatedContent
              className={styles.list}
              role='list'
              distance={96}
              duration={0.95}
              stagger={0.08}
            >
              {list.map((item, index) => (
                <div key={item.id ?? index} className={styles.item} role='listitem'>
                  <span className={styles.check}>
                    <span className={styles.mark} aria-hidden>
                      ✓
                    </span>
                    {item.title}
                  </span>
                  {item.detail?.trim() ? (
                    <p className={styles.detail}>{item.detail.trim()}</p>
                  ) : null}
                </div>
              ))}
            </AnimatedContent>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
