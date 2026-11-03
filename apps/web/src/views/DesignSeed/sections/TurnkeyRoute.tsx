import { Container } from '@/components/Container';

import type { DesignSeedContent, OriginId } from '../content';

import styles from './TurnkeyRoute.module.scss';

type Props = {
  content: DesignSeedContent['route'];
  origin: OriginId;
};

export function TurnkeyRoute({ content, origin }: Props) {
  if (!content.steps.length) return null;

  return (
    <section className={styles.section} id='route'>
      <Container>
        <h2 className={styles.heading}>{content.title}</h2>
        <div className={styles.trackWrap}>
          <div className={styles.line} aria-hidden />
          <ol className={styles.track}>
            {content.steps.map((step, index) => {
              const body = step.byOrigin?.[origin] ?? step.body;
              return (
                <li key={step.title} className={styles.step}>
                  <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span>
                  <h3 className={styles.title}>{step.title}</h3>
                  <p className={styles.body}>{body}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </Container>
    </section>
  );
}
