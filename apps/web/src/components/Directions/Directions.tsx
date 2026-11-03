'use client';

import { useTranslations } from 'next-intl';

import { AnimatedContent } from '@/components/AnimatedContent';
import { CMSLink } from '@/components/CMSLink';
import { CMSMedia } from '@/components/CMSMedia';
import { Container } from '@/components/Container';
import type { DirectionsBlockFields } from '@autosearch/cms/payload-types';

import styles from './Directions.module.scss';

type Props = DirectionsBlockFields;

type ServiceCard = {
  id?: string | null;
  title: string;
  description?: string | null;
  image?: DirectionsBlockFields['featured'] extends { image?: infer I } ? I : unknown;
  link?: NonNullable<DirectionsBlockFields['featured']>['cta'] | NonNullable<
    NonNullable<DirectionsBlockFields['items']>[number]
  >['link'];
};

function ArrowIcon() {
  return (
    <svg width='8' height='8' viewBox='0 0 8 8' fill='none' aria-hidden>
      <path
        d='M6.6499 6.6499V0.649902H0.649902M6.6499 0.649902L0.649902 6.6499'
        stroke='currentColor'
        strokeWidth='1.3'
        strokeLinecap='round'
      />
    </svg>
  );
}

function Eyebrow({ text }: { text?: string | null }) {
  const value = text?.trim();
  if (!value) return null;
  return (
    <p className={styles.eyebrow}>
      <span className={styles.eyebrowMark} aria-hidden />
      {value}
    </p>
  );
}

export function Directions({
  id,
  blockName,
  eyebrow,
  title,
  titleAccent,
  featured,
  items,
}: Props) {
  const t = useTranslations('Directions');
  const heading = title?.trim() ?? '';
  const accent = titleAccent?.trim() ?? '';
  const sectionId = (blockName || id || 'services').toString();
  const headingId = `${sectionId}-title`;

  const cards: ServiceCard[] = [];

  if (featured?.title?.trim()) {
    cards.push({
      id: 'featured',
      title: featured.title.trim(),
      description: featured.body?.trim() || null,
      image: featured.image,
      link: featured.cta,
    });
  }

  items?.forEach((item, index) => {
    if (!item?.title?.trim()) return;
    cards.push({
      id: item.id ?? `item-${index}`,
      title: item.title.trim(),
      description: item.scope?.trim() || null,
      image: item.image,
      link: item.link,
    });
  });

  if (!heading && !accent && cards.length === 0) return null;

  return (
    <section
      className={styles.section}
      id={sectionId}
      aria-labelledby={heading || accent ? headingId : undefined}
    >
      <Container>
        <AnimatedContent distance={64} duration={0.75} threshold={0.15} stagger={0.08}>
          <div className={styles.header}>
            <div className={styles.titleBlock}>
              {heading || accent ? (
                <h2 id={headingId} className={styles.title}>
                  {heading ? <span className={styles.titleMain}>{heading}</span> : null}
                  {accent ? <span className={styles.titleAccent}>{accent}</span> : null}
                </h2>
              ) : null}
            </div>
            {eyebrow?.trim() ? (
              <div className={styles.eyebrowWrap}>
                <Eyebrow text={eyebrow} />
              </div>
            ) : null}
          </div>

          {cards.length > 0 ? (
            <ul className={styles.list}>
              {cards.map((card) => {
                const hasLink = Boolean(card.link?.label?.trim());
                const hasImage = Boolean(card.image && typeof card.image !== 'string');

                return (
                  <li key={card.id}>
                    <article className={styles.card}>
                      <div className={styles.cardMain}>
                        <h3 className={styles.cardTitle}>{card.title}</h3>
                        {hasLink ? (
                          <CMSLink link={card.link} className={styles.cardCta}>
                            <span className={styles.cardCtaInner}>
                              {card.link?.label}
                              <ArrowIcon />
                            </span>
                          </CMSLink>
                        ) : (
                          <span className={styles.cardCtaInnerMuted}>{t('more')}</span>
                        )}
                      </div>

                      {card.description ? <p className={styles.cardDesc}>{card.description}</p> : null}

                      {hasImage ? (
                        <div className={styles.cardImage}>
                          <CMSMedia media={card.image} className={styles.cardImg} fill sizes='200px' />
                        </div>
                      ) : null}
                    </article>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </AnimatedContent>
      </Container>
    </section>
  );
}
