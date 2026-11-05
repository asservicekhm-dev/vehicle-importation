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
/** Matches `@include laptop` (≥1200). */
const LAPTOP_MQ = '(min-width: 1200px)';

type Props = TurnkeyRouteBlockFields;
type Step = NonNullable<NonNullable<TurnkeyRouteBlockFields['steps']>[number]>;

function chunkSteps(steps: Step[], size: number): Step[][] {
  const rows: Step[][] = [];
  for (let i = 0; i < steps.length; i += size) {
    rows.push(steps.slice(i, i + size));
  }
  return rows;
}

function placeVerticalLine(wrap: HTMLElement, line: HTMLElement) {
  const numbers = Array.from(wrap.querySelectorAll(`.${styles.number}`));
  if (numbers.length < 2) {
    line.style.visibility = 'hidden';
    return;
  }

  line.style.visibility = 'visible';
  const wrapRect = wrap.getBoundingClientRect();
  const first = numbers[0].getBoundingClientRect();
  const last = numbers[numbers.length - 1].getBoundingClientRect();
  const top = first.top + first.height / 2 - wrapRect.top;
  const height = last.top + last.height / 2 - wrapRect.top - top;
  gsap.set(line, {
    top,
    height: Math.max(height, 0),
    left: first.left + first.width / 2 - wrapRect.left - 1,
  });
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
    const horizontalLines = Array.from(wrap.querySelectorAll(`.${styles.line}`));
    const verticalLine = wrap.querySelector(`.${styles.lineVertical}`) as HTMLElement | null;
    const stepEls = Array.from(wrap.querySelectorAll(`.${styles.step}`));

    if (reduce) {
      gsap.set(horizontalLines, { scaleX: 1 });
      if (verticalLine) {
        placeVerticalLine(wrap, verticalLine);
        gsap.set(verticalLine, { scaleY: 1, transformOrigin: 'top center' });
      }
      gsap.set(stepEls, { clearProps: 'all' });
      return undefined;
    }

    const mm = gsap.matchMedia();

    mm.add(
      {
        isLaptop: LAPTOP_MQ,
        isMobile: `(max-width: 1199px)`,
      },
      (context) => {
        const { isLaptop } = context.conditions as { isLaptop: boolean };
        let catchUp: (() => void) | undefined;
        let resizeObserver: ResizeObserver | undefined;

        const ctx = gsap.context(() => {
          gsap.set(stepEls, { opacity: 0, y: 36 });

          const tl = gsap.timeline({ paused: true });

          if (isLaptop) {
            if (horizontalLines.length) {
              gsap.set(horizontalLines, { scaleX: 0, transformOrigin: 'left center' });
              tl.to(
                horizontalLines,
                { scaleX: 1, duration: 0.9, ease: 'power2.out', stagger: 0.12 },
                0,
              );
            }
          } else if (verticalLine) {
            placeVerticalLine(wrap, verticalLine);
            gsap.set(verticalLine, { scaleY: 0, transformOrigin: 'top center' });
            tl.to(verticalLine, { scaleY: 1, duration: 1.05, ease: 'power2.out' }, 0);

            resizeObserver = new ResizeObserver(() => {
              placeVerticalLine(wrap, verticalLine);
              ScrollTrigger.refresh();
            });
            resizeObserver.observe(wrap);
          }

          tl.to(
            stepEls,
            {
              opacity: 1,
              y: 0,
              duration: 0.65,
              ease: 'power3.out',
              stagger: 0.08,
              clearProps: 'transform',
            },
            0.12,
          );

          let started = false;
          const stopCatchUp = () => {
            if (!catchUp) return;
            window.removeEventListener('scroll', catchUp);
            ScrollTrigger.removeEventListener('scrollStart', catchUp);
            ScrollTrigger.removeEventListener('scrollEnd', catchUp);
          };
          const play = () => {
            if (started) return;
            started = true;
            stopCatchUp();
            if (!isLaptop && verticalLine) placeVerticalLine(wrap, verticalLine);
            tl.play();
          };
          const finish = () => {
            if (started && tl.progress() === 1) return;
            started = true;
            stopCatchUp();
            if (!isLaptop && verticalLine) placeVerticalLine(wrap, verticalLine);
            tl.progress(1);
          };

          catchUp = () => {
            if (started) return;
            const rect = wrap.getBoundingClientRect();
            const viewH = window.innerHeight || document.documentElement.clientHeight;
            if (rect.bottom <= 0) {
              finish();
              return;
            }
            if (rect.top < viewH && rect.bottom > 0) play();
          };

          ScrollTrigger.create({
            trigger: wrap,
            start: 'top bottom+=36',
            once: true,
            onEnter: play,
            onRefresh: () => catchUp?.(),
          });

          catchUp();
          requestAnimationFrame(() => catchUp?.());
          window.addEventListener('scroll', catchUp, { passive: true });
          ScrollTrigger.addEventListener('scrollStart', catchUp);
          ScrollTrigger.addEventListener('scrollEnd', catchUp);
        }, wrap);

        return () => {
          if (catchUp) {
            window.removeEventListener('scroll', catchUp);
            ScrollTrigger.removeEventListener('scrollStart', catchUp);
            ScrollTrigger.removeEventListener('scrollEnd', catchUp);
          }
          resizeObserver?.disconnect();
          ctx.revert();
        };
      },
    );

    return () => {
      mm.revert();
    };
  }, [list.length]);

  if (!heading && !list.length) return null;

  const sectionId = (blockName || id || 'route').toString();

  return (
    <section className={styles.section} id={sectionId}>
      <Container>
        <AnimatedContent distance={88} duration={0.95} stagger={0.08}>
          {eyebrow?.trim() ? <p className={styles.eyebrow}>{eyebrow.trim()}</p> : null}
          {heading ? <h2 className={styles.heading}>{heading}</h2> : null}
        </AnimatedContent>

        {rows.length ? (
          <div className={styles.trackWrap} ref={trackWrapRef}>
            <div className={styles.lineVertical} aria-hidden />
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
