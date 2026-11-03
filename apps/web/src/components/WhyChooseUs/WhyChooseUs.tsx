'use client';

import type { ReactNode } from 'react';
import clsx from 'clsx';

import { AnimatedContent } from '@/components/AnimatedContent';
import { CMSMedia } from '@/components/CMSMedia';
import { Container } from '@/components/Container';
import type { WhyChooseUsBlockFields } from '@autosearch/cms/payload-types';

import styles from './WhyChooseUs.module.scss';

type Props = WhyChooseUsBlockFields;

const ICON_PATHS: Record<string, ReactNode> = {
  contract: (
    <>
      <path d='M7 4.5h10A1.5 1.5 0 0 1 18.5 6v12A1.5 1.5 0 0 1 17 19.5H7A1.5 1.5 0 0 1 5.5 18V6A1.5 1.5 0 0 1 7 4.5Z' />
      <path d='M8.5 9h7M8.5 12h7M8.5 15h4' />
    </>
  ),
  search: (
    <>
      <circle cx='11' cy='11' r='5.5' />
      <path d='M15.5 15.5 19 19' />
    </>
  ),
  globe: (
    <>
      <circle cx='12' cy='12' r='7.5' />
      <path d='M4.5 12h15M12 4.5c2.2 2.4 3.3 5 3.3 7.5s-1.1 5.1-3.3 7.5M12 4.5C9.8 6.9 8.7 9.5 8.7 12s1.1 5.1 3.3 7.5' />
    </>
  ),
  route: (
    <>
      <circle cx='6.5' cy='6.5' r='2' />
      <circle cx='17.5' cy='17.5' r='2' />
      <path d='M8.5 7.5c2.5 0 3.5 2 5.5 4.5s3 4.5 5.5 4.5' />
    </>
  ),
  shield: (
    <path d='M12 4.5 18.5 7v5.2c0 3.7-2.6 6.3-6.5 8.3-3.9-2-6.5-4.6-6.5-8.3V7L12 4.5Z' />
  ),
  check: (
    <path d='M6.5 12.5 10 16l7.5-8' />
  ),
};

function ReasonIcon({ iconKey }: { iconKey?: string | null }) {
  const key = iconKey && ICON_PATHS[iconKey] ? iconKey : 'check';
  return (
    <span className={styles.icon} data-icon={key} aria-hidden>
      <svg
        className={styles.iconSvg}
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        {ICON_PATHS[key]}
      </svg>
    </span>
  );
}

export function WhyChooseUs({
  id,
  blockName,
  eyebrow,
  title,
  titleAccent,
  intro,
  background,
  items,
}: Props) {
  const heading = title?.trim() ?? '';
  const accent = titleAccent?.trim() ?? '';
  const list = items?.filter((item) => item?.title?.trim() && item?.body?.trim()) ?? [];
  if (!heading && !accent && !list.length) return null;

  const sectionId = (blockName || id || 'why-us').toString();
  const headingId = `${sectionId}-title`;
  const hasBg = Boolean(background && typeof background !== 'string');

  return (
    <section
      className={clsx(styles.section, hasBg && styles.sectionWithBg)}
      id={sectionId}
      aria-labelledby={heading || accent ? headingId : undefined}
    >
      {hasBg ? (
        <div className={styles.bg} aria-hidden>
          <CMSMedia media={background} className={styles.bgImg} fill sizes='100vw' />
          <div className={styles.bgScrim} />
        </div>
      ) : null}

      <Container>
        <AnimatedContent
          className={styles.layout}
          distance={64}
          duration={0.75}
          threshold={0.15}
          stagger={0.08}
        >
          <div className={styles.copy}>
            {eyebrow?.trim() ? <p className={styles.eyebrow}>{eyebrow.trim()}</p> : null}
            {heading || accent ? (
              <h2 id={headingId} className={styles.title}>
                {heading ? <span className={styles.titleMain}>{heading}</span> : null}
                {heading && accent ? ' ' : null}
                {accent ? <span className={styles.titleAccent}>{accent}</span> : null}
              </h2>
            ) : null}
            {intro?.trim() ? <p className={styles.intro}>{intro.trim()}</p> : null}
          </div>

          {list.length ? (
            <ul className={styles.list}>
              {list.map((item, index) => (
                <li key={item.id ?? index} className={styles.item}>
                  <ReasonIcon iconKey={item.iconKey} />
                  <div>
                    <h3 className={styles.itemTitle}>{item.title}</h3>
                    <p className={styles.itemBody}>{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </AnimatedContent>
      </Container>
    </section>
  );
}
