import { Button } from '@/components/Button';
import { Container } from '@/components/Container';

import type { DesignSeedContent } from '../content';

import styles from './Services.module.scss';

type Props = {
  content: DesignSeedContent['services'];
};

export function Services({ content }: Props) {
  if (!content.featured.title && !content.rows.length) return null;

  return (
    <section className={styles.section} id='services'>
      <Container>
        <h2 className={styles.heading}>{content.title}</h2>
        <article className={styles.featured}>
          <h3 className={styles.featuredTitle}>{content.featured.title}</h3>
          <p className={styles.featuredBody}>{content.featured.body}</p>
          <div>
            <Button asChild>
              <a href='#callback'>{content.featured.cta}</a>
            </Button>
          </div>
        </article>
        <ul className={styles.rows}>
          {content.rows.map((row) => (
            <li key={row.title} className={styles.row}>
              <p className={styles.rowTitle}>{row.title}</p>
              <p className={styles.rowScope}>{row.scope}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
