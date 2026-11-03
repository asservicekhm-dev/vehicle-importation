'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { AnimatedContent } from '@/components/AnimatedContent';
import { Container } from '@/components/Container';
import { useOrigin } from '@/components/OriginProvider';
import type { TurnkeyRouteBlockFields } from '@autosearch/cms/payload-types';

import styles from './TurnkeyRoute.module.scss';

gsap.registerPlugin(ScrollTrigger);

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const STEPS_PER_ROW = 4;

type Props = TurnkeyRouteBlockFields;
type Step = NonNullable<NonNullable<TurnkeyRouteBlockFields['steps']>[number]>;

function chunkSteps(steps: Step[], size: number): Step[][] {
  const rows: Step[][] = [];
  for (let i = 0; i < steps.length; i += size) {
    rows.push(steps.slice(i, i + size));
  }
  return rows;
}

export function TurnkeyRoute({ id, blockName, eyebrow, title, steps }: Props) {
  const { origin } = useOrigin();
  const trackWrapRef = useRef<HTMLDivElement>(null);
  const heading = title?.trim();
  const list = steps?.filter((step) => step?.title?.trim()) ?? [];
  const rows = chunkSteps(list, STEPS_PER_ROW);

  useIsomorphicLayoutEffect(() => {
    const wrap = trackWrapRef.current;
    if (!wrap || !list.length) return undefined;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const lines = Array.from(wrap.querySelectorAll(`.${styles.line}`));
    const stepEls = Array.from(wrap.querySelectorAll(`.${styles.step}`));

    if (reduce) {
      gsap.set(lines, { scaleX: 1 });
      gsap.set(stepEls, { clearProps: 'all' });
      return undefined;
    }

    const ctx = gsap.context(() => {
      if (lines.length) gsap.set(lines, { scaleX: 0, transformOrigin: 'left center' });
      gsap.set(stepEls, { opacity: 0, y: 28 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: 'top 78%',
          once: true,
        },
      });

      if (lines.length) {
        tl.to(lines, { scaleX: 1, duration: 0.9, ease: 'power2.out', stagger: 0.12 }, 0);
      }

      tl.to(
        stepEls,
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: 'power3.out',
          stagger: 0.08,
          clearProps: 'transform',
        },
        lines.length ? 0.15 : 0,
      );
    }, wrap);

    return () => ctx.revert();
  }, [list.length]);

  if (!heading && !list.length) return null;

  const sectionId = (blockName || id || 'route').toString();

  return (
    <section className={styles.section} id={sectionId}>
      <Container>
        <AnimatedContent distance={64} duration={0.75} threshold={0.15} stagger={0.08}>
          {eyebrow?.trim() ? <p className={styles.eyebrow}>{eyebrow.trim()}</p> : null}
          {heading ? <h2 className={styles.heading}>{heading}</h2> : null}
        </AnimatedContent>

        {rows.length ? (
          <div className={styles.trackWrap} ref={trackWrapRef}>
            {rows.map((row, rowIndex) => (
              <div key={row[0]?.id ?? `row-${rowIndex}`} className={styles.row}>
                <div className={styles.line} aria-hidden />
                <ol className={styles.track} start={rowIndex * STEPS_PER_ROW + 1}>
                  {row.map((step, index) => {
                    const stepNumber = rowIndex * STEPS_PER_ROW + index + 1;
                    const byOrigin =
                      origin === 'usa'
                        ? step.bodyUsa
                        : origin === 'europe'
                          ? step.bodyEurope
                          : step.bodyKorea;
                    const body = byOrigin?.trim() || step.body?.trim() || '';
                    return (
                      <li key={step.id ?? stepNumber} className={styles.step}>
                        <span className={styles.number}>
                          {String(stepNumber).padStart(2, '0')}
                        </span>
                        <h3 className={styles.title}>{step.title}</h3>
                        {body ? <p className={styles.body}>{body}</p> : null}
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
