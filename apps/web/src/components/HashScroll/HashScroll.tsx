'use client';

import { useEffect, useLayoutEffect } from 'react';

import { smoothScrollToHash } from '@/lib/smoothScrollTo';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/** Late passes cover ScrollTrigger refreshes after fonts, images, and split chunks. */
const RETRY_MS = [0, 50, 150, 400, 900, 1600];

function hashId(): string {
  const hash = window.location.hash;
  if (!hash || hash === '#') return '';
  try {
    return decodeURIComponent(hash.slice(1)).trim();
  } catch {
    return hash.slice(1).trim();
  }
}

function isAligned(id: string): boolean {
  const el = document.getElementById(id);
  if (!el) return false;
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  return Math.abs(el.getBoundingClientRect().top - margin) <= 3;
}

/**
 * Direct loads of `/#route` stay at the top the first time.
 * ScrollTrigger.refresh() during startup calls scrollTo(0) and sets
 * history.scrollRestoration to "manual", which cancels the browser's pending
 * fragment scroll. A cached reload applies the hash before that refresh, so
 * only the first visit is wrong. Re-apply the hash after that refresh.
 */
export function HashScroll() {
  useIsomorphicLayoutEffect(() => {
    const id = hashId();
    if (!id) return undefined;

    let userMoved = false;
    const stop = () => {
      userMoved = true;
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest('a[href*="#"]')) stop();
    };

    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchmove', stop, { passive: true });
    window.addEventListener('hashchange', stop);
    window.addEventListener('click', onClick, true);

    const align = () => {
      if (userMoved || isAligned(id)) return;
      smoothScrollToHash(`#${id}`, { updateUrl: false, behavior: 'auto' });
    };

    // Registered after block layout effects, so this runs after ScrollTrigger's
    // startup refresh (also a rAF) and still before the first paint.
    const raf = requestAnimationFrame(() => {
      align();
      requestAnimationFrame(align);
    });

    const timers = RETRY_MS.map((ms) => window.setTimeout(align, ms));

    const onLoad = () => {
      align();
      requestAnimationFrame(align);
    };
    window.addEventListener('load', onLoad);

    let cancelled = false;
    void document.fonts?.ready.then(() => {
      if (cancelled) return;
      align();
      requestAnimationFrame(align);
    });

    return () => {
      cancelled = true;
      userMoved = true;
      cancelAnimationFrame(raf);
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener('load', onLoad);
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchmove', stop);
      window.removeEventListener('hashchange', stop);
      window.removeEventListener('click', onClick, true);
    };
  }, []);

  return null;
}
