'use client';

import { AnimatedContent } from '@/components/AnimatedContent';
import { CMSMedia } from '@/components/CMSMedia';
import { Container } from '@/components/Container';
import type { ServiceHeroBlockFields } from '@autosearch/cms/payload-types';

import styles from './ServiceHero.module.scss';

type Props = ServiceHeroBlockFields;

export function ServiceHero({ id, blockName, eyebrow, title, description, image }: Props) {
  const heading = title?.trim() ?? '';
  const body = description?.trim() ?? '';
  const hasImage = Boolean(image && typeof image !== 'string');
  if (!heading && !body && !hasImage) return null;

  const sectionId = (blockName || id || 'service-hero').toString();
  const headingId = `${sectionId}-title`;

  return (
    <section
      className={styles.section}
      id={sectionId}
      aria-labelledby={heading ? headingId : undefined}
    >
      <Container>
        <div className={styles.layout}>
          <AnimatedContent distance={72} duration={0.9}>
            <div className={styles.copy}>
              {eyebrow?.trim() ? <p className={styles.eyebrow}>{eyebrow.trim()}</p> : null}
              {heading ? (
                <h1 id={headingId} className={styles.title}>
                  {heading}
                </h1>
              ) : null}
              {body ? <p className={styles.description}>{body}</p> : null}
            </div>
          </AnimatedContent>
          {hasImage ? (
            <div className={styles.media}>
              <CMSMedia
                media={image}
                className={styles.img}
                fill
                sizes='(min-width: 1200px) 45vw, 100vw'
                priority
              />
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
