import { Container } from '@/components/Container';

import type { DesignSeedContent } from '../content';

import styles from './InspectionSheet.module.scss';

type Props = {
  content: DesignSeedContent['inspection'];
};

export function InspectionSheet({ content }: Props) {
  if (!content.items.length) return null;

  return (
    <section className={styles.section} id='inspection'>
      <Container>
        <div className={styles.layout}>
          <h2 className={styles.heading}>{content.title}</h2>
          <ul className={styles.list}>
            {content.items.map((item) => (
              <li key={item.title} className={styles.item}>
                <span className={styles.check}>
                  <span className={styles.mark} aria-hidden>
                    ✓
                  </span>
                  {item.title}
                </span>
                <p className={styles.detail}>{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
