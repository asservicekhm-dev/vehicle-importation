'use client';

import { Container } from '@/components/Container';
import { LazyMount } from '@/components/LazyMount';
import type { AboutIntroBlockFields } from '@autosearch/cms/payload-types';

import styles from './AboutIntro.module.scss';

type Props = AboutIntroBlockFields;

const loadAboutIntro = () => import('./AboutIntro').then((m) => m.AboutIntro);

function AboutIntroShell({ id, blockName, eyebrow, title, titleAccent, description }: Props) {
  const heading = title?.trim() ?? '';
  const accent = titleAccent?.trim() ?? '';
  const body = description?.trim() ?? '';
  const paragraphs = body ? body.split('\n').map((p) => p.trim()).filter(Boolean) : [];
  const sectionId = (blockName || id || 'about').toString();
  const headingId = `${sectionId}-title`;

  if (!heading && !accent && !paragraphs.length) return null;

  return (
    <section
      className={styles.section}
      id={sectionId}
      aria-labelledby={headingId}
      data-ac-shell
      aria-busy
    >
      <Container>
        <div className={styles.topRow}>
          <div className={styles.eyebrowCol}>
            {eyebrow?.trim() ? (
              <p className={styles.eyebrow}>
                <span className={styles.eyebrowMark} aria-hidden />
                {eyebrow.trim()}
              </p>
            ) : null}
          </div>
          <div className={styles.content}>
            <div className={styles.heading}>
              {heading || accent ? (
                <h2 id={headingId} className={styles.title}>
                  {heading ? <span className={styles.titleMain}>{heading}</span> : null}
                  {heading && accent ? ' ' : null}
                  {accent ? <span className={styles.titleAccent}>{accent}</span> : null}
                </h2>
              ) : null}
            </div>
            {paragraphs.length ? (
              <div className={styles.descriptionBlock}>
                {paragraphs.map((para) => (
                  <p key={para} className={styles.description}>
                    {para}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}

export function AboutIntroDeferred(props: Props) {
  return (
    <LazyMount load={loadAboutIntro} props={props} shell={<AboutIntroShell {...props} />} />
  );
}
