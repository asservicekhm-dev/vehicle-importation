'use client';

import { AnimatedContent } from '@/components/AnimatedContent';
import { CMSLink } from '@/components/CMSLink';
import { Container } from '@/components/Container';
import type { ServiceInfoBlockFields } from '@autosearch/cms/payload-types';

import styles from './ServiceInfo.module.scss';

type Props = ServiceInfoBlockFields;

export function ServiceInfo({ id, blockName, title, body, primaryCta, secondaryCta }: Props) {
  const heading = title?.trim() ?? '';
  const text = body?.trim() ?? '';
  const hasPrimary = Boolean(primaryCta?.label?.trim());
  const hasSecondary = Boolean(secondaryCta?.label?.trim());
  if (!heading && !text && !hasPrimary && !hasSecondary) return null;

  const sectionId = (blockName || id || 'service-info').toString();
  const headingId = `${sectionId}-title`;

  return (
    <section
      className={styles.section}
      id={sectionId}
      aria-labelledby={heading ? headingId : undefined}
    >
      <Container>
        <AnimatedContent distance={56} duration={0.85}>
          <div className={styles.inner}>
            {heading ? (
              <h2 id={headingId} className={styles.title}>
                {heading}
              </h2>
            ) : null}
            {text ? <p className={styles.body}>{text}</p> : null}
            {hasPrimary || hasSecondary ? (
              <div className={styles.actions}>
                {hasPrimary ? (
                  <CMSLink link={primaryCta} className={styles.primary}>
                    {primaryCta?.label}
                  </CMSLink>
                ) : null}
                {hasSecondary ? (
                  <CMSLink link={secondaryCta} className={styles.secondary}>
                    {secondaryCta?.label}
                  </CMSLink>
                ) : null}
              </div>
            ) : null}
          </div>
        </AnimatedContent>
      </Container>
    </section>
  );
}
