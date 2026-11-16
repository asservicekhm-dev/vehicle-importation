'use client';

import clsx from 'clsx';

import { Container } from '@/components/Container';
import { LazyMount } from '@/components/LazyMount';
import type { BookingFormBlockFields } from '@autosearch/cms/payload-types';

import styles from './BookingForm.module.scss';

type Props = BookingFormBlockFields;

const loadBookingForm = () =>
  import('./BookingForm').then((m) => m.BookingForm);

function BookingFormShell({
  id,
  blockName,
  variant: variantProp,
  eyebrow,
  note,
  title,
  titleAccent,
  description,
}: Props) {
  const variant = variantProp === 'pitch' ? 'pitch' : 'callback';
  const isPitch = variant === 'pitch';
  const heading = title?.trim();
  const accent = titleAccent?.trim();
  const body = description?.trim();
  const aside = note?.trim();
  const sectionId = (blockName || id || (isPitch ? 'pitch' : 'callback')).toString();

  return (
    <section
      className={clsx(styles.section, isPitch ? styles.sectionPitch : styles.sectionCallback)}
      id={sectionId}
      data-variant={variant}
      data-ac-shell
      aria-busy
    >
      <Container>
        <div className={clsx(styles.layout, isPitch ? styles.layoutPitch : styles.layoutCallback)}>
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
          </div>
          <div className={clsx(styles.card, isPitch && styles.cardPitch)} aria-hidden />
        </div>
      </Container>
    </section>
  );
}

export function BookingFormDeferred(props: Props) {
  return (
    <LazyMount
      load={loadBookingForm}
      props={props}
      shell={<BookingFormShell {...props} />}
    />
  );
}
