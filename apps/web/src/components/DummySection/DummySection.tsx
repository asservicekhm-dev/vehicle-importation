import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { SectionEyebrow } from '@/components/SectionEyebrow';
import type { DummySectionBlock } from '@/types/cms';

import styles from './DummySection.module.scss';

type Props = DummySectionBlock;

export function DummySection({ id, blockName, eyebrow, title, description, ctaLabel }: Props) {
  const heading = title?.trim();
  const body = description?.trim();
  const label = eyebrow?.trim();
  const cta = ctaLabel?.trim();

  if (!heading && !body && !label) return null;

  const sectionId = (blockName || id || 'dummy-section').toString();

  return (
    <section className={styles.section} id={sectionId}>
      <Container>
        <div className={styles.inner}>
          {label ? <SectionEyebrow>{label}</SectionEyebrow> : null}
          {heading ? <h2 className={styles.title}>{heading}</h2> : null}
          {body ? <p className={styles.description}>{body}</p> : null}
          {cta ? (
            <div className={styles.actions}>
              <Button type='button'>{cta}</Button>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
