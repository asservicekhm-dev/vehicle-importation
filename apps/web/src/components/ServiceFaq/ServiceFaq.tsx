'use client';

import { Accordion } from '@/components/Accordion';
import { AnimatedContent } from '@/components/AnimatedContent';
import { Container } from '@/components/Container';
import { useGlobals } from '@/contexts/GlobalsContext';
import type { ServiceFaqBlockFields } from '@autosearch/cms/payload-types';

import styles from './ServiceFaq.module.scss';

type Props = ServiceFaqBlockFields;

export function ServiceFaq({
  id,
  blockName,
  eyebrow,
  title,
  items,
  contactTitle,
  contactText,
  contactPhone,
}: Props) {
  const { header, contacts } = useGlobals();
  const heading = title?.trim();
  const faqItems = items?.filter((item) => item?.question?.trim() && item?.answer?.trim()) ?? [];
  const phone =
    contactPhone?.trim() || header?.phone?.trim() || contacts?.phones?.[0]?.number?.trim() || '';

  if (!heading && !faqItems.length && !contactTitle?.trim()) return null;

  const sectionId = (blockName || id || 'faq').toString();
  const phoneHref = phone ? `tel:${phone.replace(/\s+/g, '')}` : '';

  return (
    <section className={styles.section} id={sectionId}>
      <Container>
        <AnimatedContent
          className={styles.layout}
          distance={88}
          duration={0.95}
          stagger={0.08}
        >
          <div>
            {eyebrow?.trim() ? <p className={styles.eyebrow}>{eyebrow.trim()}</p> : null}
            {heading ? <h2 className={styles.heading}>{heading}</h2> : null}
            {faqItems.length ? (
              <Accordion
                items={faqItems.map((item, index) => ({
                  value: item.id ?? `faq-${index}`,
                  title: item.question!,
                  content: <p>{item.answer}</p>,
                }))}
              />
            ) : null}
          </div>
          {contactTitle?.trim() || contactText?.trim() || phone ? (
            <aside className={styles.formPanel}>
              {contactTitle?.trim() ? (
                <h2 className={styles.formTitle}>{contactTitle.trim()}</h2>
              ) : null}
              {contactText?.trim() ? <p className={styles.formBody}>{contactText.trim()}</p> : null}
              {phoneHref ? (
                <a className={styles.phone} href={phoneHref}>
                  {phone}
                </a>
              ) : null}
            </aside>
          ) : null}
        </AnimatedContent>
      </Container>
    </section>
  );
}
