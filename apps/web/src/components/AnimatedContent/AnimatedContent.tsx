'use client';

import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import clsx from 'clsx';

import { getLenisInstance, onLenisScroll } from '@/components/SmoothScroll/lenisInstance';

import styles from './AnimatedContent.module.scss';

/**
 * While scroll is moving, the entrance waits until content reaches this far
 * up the viewport (0 = top, 1 = bottom). Lenis eases for ~1s, so a 1px
 * trigger finishes the fade before the block arrives.
 */
const REVEAL_LINE = 0.72;

/**
 * At rest (first paint, or after scroll settles), play when at least this
 * much of the block's resting box is already on screen. The pitch form under
 * the hero sits low in the first viewport — its top never reaches REVEAL_LINE
 * until you scroll, even though a large part of it is visible.
 */
const RESTING_VISIBLE_RATIO = 0.22;

export type AnimatedContentProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  children: ReactNode;
  /** Translate distance in px (positive = from below). */
  distance?: number;
  /** Transition duration in seconds. */
  duration?: number;
  /** Accepted for call-site compatibility; scale is not applied (keeps text sharp). */
  scale?: number;
  /** Stagger between direct children, in seconds. */
  stagger?: number;
  className?: string;
  style?: CSSProperties;
};

/**
 * Top of the pixels that actually move. Stagger translates children, not the
 * root, so the root's box alone reads as "in view" a full slide early.
 */
function movingTop(el: HTMLElement, distance: number, staggered: boolean): number {
  const top = el.getBoundingClientRect().top;
  return staggered ? top + distance : top;
}

/** Box where the content lands. `.single` is translated down until it plays. */
function restingBox(
  el: HTMLElement,
  distance: number,
  staggered: boolean,
): { top: number; bottom: number; height: number } {
  const rect = el.getBoundingClientRect();
  const shift = staggered ? 0 : distance;
  return { top: rect.top - shift, bottom: rect.bottom - shift, height: rect.height };
}

function overlap(top: number, bottom: number, vh: number): number {
  return Math.max(0, Math.min(bottom, vh) - Math.max(top, 0));
}

function scrollIsIdle(): boolean {
  const lenis = getLenisInstance();
  // Before SmoothScroll mounts, nothing is easing — first paint counts as rest.
  return !lenis || lenis.isScrolling === false;
}

function shouldPlay(el: HTMLElement, distance: number, staggered: boolean, idle: boolean): boolean {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || 0;
  if (rect.height <= 0 || vh <= 0) return false;

  // Scrolled past before we could play — don't leave it stuck at opacity 0.
  if (rect.bottom <= 0) return true;

  const top = movingTop(el, distance, staggered);
  const resting = restingBox(el, distance, staggered);
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - vh);
  const atEnd = window.scrollY >= maxScroll - 2;

  if (top >= vh) {
    // Stagger offset can keep the moving pixels below the fold on the last screen.
    return atEnd && rect.top < vh;
  }
  if (top <= vh * REVEAL_LINE) return true;

  if (idle) {
    const visible = overlap(resting.top, resting.bottom, vh);
    const bigSlice = visible >= Math.max(100, resting.height * RESTING_VISIBLE_RATIO);
    if (bigSlice) return true;
  }

  return atEnd;
}

/**
 * One-shot fade/slide once the block is actually in view.
 *
 * Pre-paint hide comes from `html[data-ac]` (head script) + CSS — so above-fold
 * content still enters without a visible→hidden flash. The play trigger follows
 * Lenis's smoothed position; a 1px intersection check finishes the fade while
 * the section is still easing into the viewport.
 */
export function AnimatedContent({
  children,
  distance = 88,
  duration = 0.85,
  scale: _scale = 1,
  stagger = 0,
  className = '',
  style,
  ...props
}: AnimatedContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(false);
  const staggered = stagger > 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reduce || typeof IntersectionObserver === 'undefined') {
      setPlay(true);
      return undefined;
    }

    // Ensure the no-flash flag exists even if the head script was skipped.
    document.documentElement.setAttribute('data-ac', '');

    let cancelled = false;
    let started = false;

    let unsubscribeLenis = () => {};

    const stop = () => {
      unsubscribeLenis();
      io.disconnect();
      window.removeEventListener('scroll', tryStart);
      window.removeEventListener('resize', tryStart);
    };

    const start = () => {
      if (cancelled || started) return;
      started = true;
      stop();
      // Two frames so the browser paints opacity:0 before transitioning.
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          if (!cancelled) setPlay(true);
        });
      });
    };

    const tryStart = () => {
      if (shouldPlay(el, distance, staggered, scrollIsIdle())) start();
    };

    // Observer only nudges a geometry check. `isIntersecting` is not the
    // trigger: with Lenis it reports the leading edge, a full ease too early.
    const io = new IntersectionObserver(tryStart, {
      threshold: [0, 0.25, 0.5],
      rootMargin: '0px 0px -28% 0px',
    });
    io.observe(el);

    window.addEventListener('scroll', tryStart, { passive: true });
    window.addEventListener('resize', tryStart);
    unsubscribeLenis = onLenisScroll(tryStart);

    tryStart();

    return () => {
      cancelled = true;
      stop();
    };
  }, [distance, staggered]);

  useEffect(() => {
    if (!staggered || !ref.current) return;
    const kids = ref.current.children;
    for (let i = 0; i < kids.length; i += 1) {
      (kids[i] as HTMLElement).style.setProperty('--ac-child-index', String(i));
    }
  }, [staggered, children]);

  const cssVars = {
    '--ac-y': `${distance}px`,
    '--ac-duration': `${duration}s`,
    '--ac-stagger': `${stagger}s`,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      className={clsx(
        styles.root,
        staggered ? styles.stagger : styles.single,
        play && styles.play,
        className,
      )}
      style={{ ...cssVars, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
