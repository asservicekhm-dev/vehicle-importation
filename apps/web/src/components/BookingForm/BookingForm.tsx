'use client';

import { AnimatedContent } from '@/components/AnimatedContent';
import { CMSMedia } from '@/components/CMSMedia';
import { ContactsForm } from '@/components/ContactsForm';
import { Container } from '@/components/Container';
import type { BookingFormBlockFields, Form } from '@autosearch/cms/payload-types';

import styles from './BookingForm.module.scss';

type Props = BookingFormBlockFields;

export function BookingForm({
  id,
  blockName,
  eyebrow,
  title,
  titleAccent,
  description,
  image,
  form,
  layout,
}: Props) {
  if (!form || typeof form === 'string') return null;

  const heading = title?.trim();
  const accent = titleAccent?.trim();
  const body = description?.trim();
  const sectionId = (blockName || id || 'callback').toString();

  return (
    <section className={styles.section} id={sectionId}>
      <Container>
        <AnimatedContent distance={64} duration={0.75} threshold={0.15}>
          <div className={styles.layout}>
            <div className={styles.copy}>
              {eyebrow?.trim() ? <p className={styles.eyebrow}>{eyebrow.trim()}</p> : null}
              {heading || accent ? (
                <h2 className={styles.title}>
                  {heading ? <span>{heading} </span> : null}
                  {accent ? <span className={styles.accent}>{accent}</span> : null}
                </h2>
              ) : null}
              {body ? <p className={styles.description}>{body}</p> : null}
              {image && typeof image === 'object' ? (
                <div className={styles.media}>
                  <CMSMedia media={image} fill sizes='(min-width: 1200px) 40vw, 100vw' />
                </div>
              ) : null}
            </div>
            <div className={styles.card}>
              <ContactsForm form={form as Form} layout={layout ?? null} />
            </div>
          </div>
        </AnimatedContent>
      </Container>
    </section>
  );
}
