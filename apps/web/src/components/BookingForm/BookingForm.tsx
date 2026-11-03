'use client';

import clsx from 'clsx';

import { AnimatedContent } from '@/components/AnimatedContent';
import { CMSMedia } from '@/components/CMSMedia';
import { ContactsForm } from '@/components/ContactsForm';
import { Container } from '@/components/Container';
import type { BookingFormBlockFields, Form, Media } from '@autosearch/cms/payload-types';

import styles from './BookingForm.module.scss';

type Props = BookingFormBlockFields;

export function BookingForm({
  id,
  blockName,
  variant: variantProp,
  eyebrow,
  note,
  title,
  titleAccent,
  description,
  image,
  form,
  layout,
}: Props) {
  if (!form || typeof form === 'string') return null;

  const variant = variantProp === 'pitch' ? 'pitch' : 'callback';
  const isPitch = variant === 'pitch';
  const heading = title?.trim();
  const accent = titleAccent?.trim();
  const body = description?.trim();
  const aside = note?.trim();
  const media = image && typeof image === 'object' ? (image as Media) : null;
  const sectionId = (blockName || id || (isPitch ? 'pitch' : 'callback')).toString();

  return (
    <section
      className={clsx(styles.section, isPitch ? styles.sectionPitch : styles.sectionCallback)}
      id={sectionId}
      data-variant={variant}
    >
      <Container>
        <AnimatedContent distance={64} duration={0.75} threshold={0.15}>
          <div className={clsx(styles.layout, isPitch ? styles.layoutPitch : styles.layoutCallback)}>
            {isPitch ? (
              <>
                <div className={styles.pitchMain}>
                  <div className={styles.copy}>
                    {heading || accent ? (
                      <h2 className={styles.title}>
                        {heading ? <span>{heading}</span> : null}
                        {heading && accent ? ' ' : null}
                        {accent ? <span className={styles.accent}>{accent}</span> : null}
                      </h2>
                    ) : null}
                    {body ? <p className={styles.description}>{body}</p> : null}
                    {aside ? <p className={styles.note}>{aside}</p> : null}
                  </div>
                  <div className={clsx(styles.card, styles.cardPitch)}>
                    <ContactsForm
                      form={form as Form}
                      layout={layout ?? null}
                      hideMessage
                      compact
                    />
                  </div>
                </div>
                {media ? (
                  <div className={styles.mediaPitch}>
                    <CMSMedia
                      media={media}
                      fill
                      className={styles.mediaImg}
                      sizes='(min-width: 1200px) 42vw, (min-width: 768px) 40vw, 100vw'
                    />
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <div className={styles.copy}>
                  {eyebrow?.trim() ? <p className={styles.eyebrow}>{eyebrow.trim()}</p> : null}
                  {heading || accent ? (
                    <h2 className={styles.title}>
                      {heading ? <span>{heading}</span> : null}
                      {heading && accent ? ' ' : null}
                      {accent ? <span className={styles.accent}>{accent}</span> : null}
                    </h2>
                  ) : null}
                  {body ? <p className={styles.description}>{body}</p> : null}
                  {aside ? <p className={styles.note}>{aside}</p> : null}
                  {media ? (
                    <div className={styles.media}>
                      <CMSMedia
                        media={media}
                        fill
                        className={styles.mediaImg}
                        sizes='(min-width: 1200px) 40vw, (min-width: 768px) 40vw, 100vw'
                      />
                    </div>
                  ) : null}
                </div>
                <div className={styles.card}>
                  <ContactsForm form={form as Form} layout={layout ?? null} />
                </div>
              </>
            )}
          </div>
        </AnimatedContent>
      </Container>
    </section>
  );
}
