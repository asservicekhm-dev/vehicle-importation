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

import styles from './AnimatedContent.module.scss';

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

function isInView(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || 0;
  if (rect.height <= 0 || vh <= 0) return false;
  return rect.top < vh && rect.bottom > 0;
}

/** True when this node is (or wraps / sits in) the current `#hash` target. */
function isHashTarget(el: Element): boolean {
  const raw = window.location.hash;
  if (!raw || raw === '#') return false;
  let id = raw.slice(1);
  try {
    id = decodeURIComponent(id);
  } catch {
    // keep raw id
  }
  if (!id) return false;
  const target = document.getElementById(id);
  if (!target) return false;
  return target === el || target.contains(el) || el.contains(target);
}

/**
 * One-shot fade/slide when the block enters the viewport.
 *
 * Pre-paint hide comes from `html[data-ac]` (head script) + CSS — so above-fold
 * and hash deep-links still get an entrance without a visible→hidden flash.
 * React only flips `.play` after the "from" styles have committed.
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

    const start = () => {
      if (cancelled || started) return;
      started = true;
      // Two frames so the browser paints opacity:0 before transitioning.
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          if (!cancelled) setPlay(true);
        });
      });
    };

    const onScrollOrResize = () => {
      if (isInView(el) || isHashTarget(el)) start();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting || isInView(el) || isHashTarget(el)) {
          start();
          io.disconnect();
          window.removeEventListener('scroll', onScrollOrResize);
          window.removeEventListener('resize', onScrollOrResize);
        }
      },
      { threshold: [0, 0.05, 0.1], rootMargin: '0px' },
    );
    io.observe(el);

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    // Above-fold / hash: play entrance on first mount (already hidden via CSS).
    if (isInView(el) || isHashTarget(el)) {
      start();
    }

    return () => {
      cancelled = true;
      io.disconnect();
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, []);

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
      className={clsx(styles.root, staggered ? styles.stagger : styles.single, play && styles.play, className)}
      style={{ ...cssVars, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
