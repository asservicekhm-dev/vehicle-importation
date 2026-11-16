'use client';

import { Container } from '@/components/Container';
import { LazyMount } from '@/components/LazyMount';
import type { TestimonialsBlockFields } from '@autosearch/cms/payload-types';

import styles from './Testimonials.module.scss';

type Props = TestimonialsBlockFields;

const loadTestimonials = () => import('./Testimonials').then((m) => m.Testimonials);

function TestimonialsShell({ id, blockName, eyebrow, titleAccent, title, items }: Props) {
  const heading = title?.trim() ?? '';
  const accent = titleAccent?.trim() ?? '';
  const list = items?.filter((item) => item?.quote?.trim() && item?.authorName?.trim()) ?? [];
  const sectionId = (blockName || id || 'testimonials').toString();
  const headingId = `${sectionId}-title`;

  if (!heading && !accent && !list.length) return null;

  return (
    <section
      className={styles.section}
      id={sectionId}
      aria-labelledby={heading || accent ? headingId : undefined}
      data-ac-shell
      aria-busy
    >
      <Container>
        <div className={styles.panel}>
          <div className={styles.topBar}>
            {heading || accent ? (
              <h2 id={headingId} className={styles.title}>
                {accent ? <span className={styles.titleAccent}>{accent}</span> : null}
                {heading ? <span className={styles.titleMain}>{heading}</span> : null}
              </h2>
            ) : null}
            {eyebrow?.trim() ? (
              <span className={styles.eyebrow}>
                <span className={styles.eyebrowDot} aria-hidden />
                {eyebrow.trim()}
              </span>
            ) : null}
          </div>
          {list.length ? (
            <ul className={styles.shellList}>
              {list.map((item) => (
                <li key={item.id ?? item.authorName} className={styles.shellItem}>
                  <p className={styles.shellQuote}>{item.quote}</p>
                  <p className={styles.shellAuthor}>
                    {item.authorName}
                    {item.authorRole?.trim() ? ` — ${item.authorRole.trim()}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

export function TestimonialsDeferred(props: Props) {
  return (
    <LazyMount load={loadTestimonials} props={props} shell={<TestimonialsShell {...props} />} />
  );
}
