'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

import { AnimatedContent } from '@/components/AnimatedContent';
import { CMSLink } from '@/components/CMSLink';
import { CMSMedia } from '@/components/CMSMedia';
import { Container } from '@/components/Container';
import { CountUp } from '@/components/CountUp';
import type { AboutIntroBlockFields } from '@autosearch/cms/payload-types';

import styles from './AboutIntro.module.scss';

type Props = AboutIntroBlockFields;

function parseStatValue(raw: string): { to: number; prefix: string; suffix: string } | null {
  const trimmed = raw.trim();
  const match = trimmed.match(/^([^\d-]*)(-?\d+(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  const to = Number(match[2]);
  if (!Number.isFinite(to)) return null;
  return { prefix: match[1] ?? '', to, suffix: match[3] ?? '' };
}

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

function Eyebrow({ text, className }: { text?: string | null; className?: string }) {
  const value = text?.trim();
  if (!value) return null;
  return (
    <p className={clsx(styles.eyebrow, className)}>
      <span className={styles.eyebrowMark} aria-hidden />
      {value}
    </p>
  );
}

export function AboutIntro({
  id,
  blockName,
  eyebrow,
  title,
  titleAccent,
  description,
  cta,
  stats,
}: Props) {
  const heading = title?.trim() ?? '';
  const accent = titleAccent?.trim() ?? '';
  const body = description?.trim() ?? '';
  const paragraphs = body ? body.split('\n').map((p) => p.trim()).filter(Boolean) : [];
  const statItems = stats?.filter((item) => item?.value?.trim() && item?.label?.trim()) ?? [];
  const hasCta = Boolean(cta?.label?.trim());

  if (!heading && !accent && !paragraphs.length && !statItems.length) return null;

  const sectionId = (blockName || id || 'about').toString();
  const headingId = `${sectionId}-title`;

  return (
    <section className={styles.section} id={sectionId} aria-labelledby={headingId}>
      <Container>
        <AnimatedContent distance={64} duration={0.75} threshold={0.15} stagger={0.08}>
          <div className={styles.topRow}>
            <div className={styles.eyebrowCol}>
              <Eyebrow text={eyebrow} />
            </div>

            <div className={styles.content}>
              <div className={styles.heading}>
                <Eyebrow text={eyebrow} className={styles.eyebrowMobile} />
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

              {hasCta ? (
                <CMSLink link={cta} className={styles.ctaLink}>
                  <span className={styles.ctaBtn}>
                    {cta?.label}
                    <ArrowIcon />
                  </span>
                </CMSLink>
              ) : null}
            </div>
          </div>

          {statItems.length ? <StatsScroller stats={statItems} /> : null}
        </AnimatedContent>
      </Container>
    </section>
  );
}

type StatItem = NonNullable<NonNullable<AboutIntroBlockFields['stats']>[number]>;

function StatValue({ raw, delay }: { raw: string; delay: number }) {
  const parsed = parseStatValue(raw);
  if (!parsed) return <p className={styles.statValue}>{raw}</p>;

  return (
    <CountUp
      className={styles.statValue}
      from={0}
      to={parsed.to}
      prefix={parsed.prefix}
      suffix={parsed.suffix}
      duration={1.2}
      delay={delay}
      mode='count'
      easing='easeOut'
      trigger='view'
    />
  );
}

function StatsScroller({ stats }: { stats: StatItem[] }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [thumbWidth, setThumbWidth] = useState(100);
  const [thumbLeft, setThumbLeft] = useState(0);
  const [canScroll, setCanScroll] = useState(false);

  const updateProgress = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const overflows = scrollWidth > clientWidth + 1;
    setCanScroll(overflows);
    if (!overflows) {
      setThumbWidth(100);
      setThumbLeft(0);
      return;
    }
    const ratio = clientWidth / scrollWidth;
    const maxScroll = scrollWidth - clientWidth;
    setThumbWidth(ratio * 100);
    setThumbLeft((scrollLeft / maxScroll) * (1 - ratio) * 100);
  }, []);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    updateProgress();
    el.addEventListener('scroll', updateProgress, { passive: true });
    const ro = new ResizeObserver(updateProgress);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateProgress);
      ro.disconnect();
    };
  }, [updateProgress, stats.length]);

  return (
    <div className={styles.statsWrap}>
      <div className={styles.statsRow} ref={rowRef}>
        {stats.map((stat, index) => {
          const hasBg = Boolean(stat.image && typeof stat.image !== 'string');
          return (
            <div key={stat.id ?? index} className={styles.statSlide}>
              <div className={clsx(styles.statCard, hasBg ? styles.statCardDark : styles.statCardLight)}>
                {hasBg ? (
                  <>
                    <CMSMedia media={stat.image} className={styles.statBgImg} fill sizes='280px' />
                    <div className={styles.statOverlay} aria-hidden />
                  </>
                ) : null}
                <div className={styles.statContent}>
                  <StatValue raw={stat.value ?? ''} delay={index * 0.08} />
                  <p className={styles.statLabel}>{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div
        className={clsx(styles.statsScrollbar, !canScroll && styles.statsScrollbarHidden)}
        aria-hidden
      >
        <div className={styles.statsScrollbarTrack}>
          <div
            className={styles.statsScrollbarThumb}
            style={{ width: `${thumbWidth}%`, left: `${thumbLeft}%` }}
          />
        </div>
      </div>
    </div>
  );
}
