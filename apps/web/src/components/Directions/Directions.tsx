'use client';

import { useTranslations } from 'next-intl';

import { AnimatedContent } from '@/components/AnimatedContent';
import { CMSLink } from '@/components/CMSLink';
import { CMSMedia } from '@/components/CMSMedia';
import { Container } from '@/components/Container';
import type { DirectionsBlockFields } from '@autosearch/cms/payload-types';

import styles from './Directions.module.scss';

type Props = DirectionsBlockFields;

type LinkField =
  | NonNullable<DirectionsBlockFields['featured']>['cta']
  | NonNullable<DirectionsBlockFields['featured']>['secondaryCta']
  | NonNullable<NonNullable<DirectionsBlockFields['items']>[number]>['link']
  | NonNullable<NonNullable<DirectionsBlockFields['items']>[number]>['secondaryLink'];

type ServiceCard = {
  id?: string | null;
  title: string;
  description?: string | null;
  image?: DirectionsBlockFields['featured'] extends { image?: infer I } ? I : unknown;
  primary?: LinkField;
  secondary?: LinkField;
};

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
      primary: featured.cta,
      secondary: featured.secondaryCta,
    });
  }

  items?.forEach((item, index) => {
    if (!item?.title?.trim()) return;
    cards.push({
      id: item.id ?? `item-${index}`,
      title: item.title.trim(),
      description: item.scope?.trim() || null,
      image: item.image,
      primary: item.link,
      secondary: item.secondaryLink,
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
        <AnimatedContent distance={72} duration={0.85}>
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
        </AnimatedContent>

        {cards.length > 0 ? (
          <AnimatedContent
            className={styles.grid}
            role='list'
            distance={96}
            duration={0.9}
            blur={6}
            scale={0.97}
            stagger={0.1}
          >
            {cards.map((card) => {
              const hasPrimary = Boolean(card.primary?.label?.trim());
              const hasSecondary = Boolean(card.secondary?.label?.trim());
              const hasImage = Boolean(card.image && typeof card.image !== 'string');

              return (
                <div key={card.id} className={styles.gridItem} role='listitem'>
                  <article className={styles.card}>
                    {hasImage ? (
                      <div className={styles.cardImage}>
                        <CMSMedia
                          media={card.image}
                          className={styles.cardImg}
                          fill
                          sizes='(min-width: 768px) 40vw, 100vw'
                        />
                      </div>
                    ) : null}
                    <div className={styles.cardBody}>
                      <h3 className={styles.cardTitle}>{card.title}</h3>
                      {card.description ? (
                        <p className={styles.cardDesc}>{card.description}</p>
                      ) : null}
                      {hasPrimary || hasSecondary ? (
                        <div className={styles.cardActions}>
                          {hasPrimary ? (
                            <CMSLink link={card.primary} className={styles.cardCta}>
                              {card.primary?.label}
                            </CMSLink>
                          ) : null}
                          {hasSecondary ? (
                            <CMSLink link={card.secondary} className={styles.cardCtaSecondary}>
                              {card.secondary?.label}
                            </CMSLink>
                          ) : null}
                        </div>
                      ) : (
                        <span className={styles.cardCtaMuted}>{t('order')}</span>
                      )}
                    </div>
                  </article>
                </div>
              );
            })}
          </AnimatedContent>
        ) : null}
      </Container>
    </section>
  );
}
