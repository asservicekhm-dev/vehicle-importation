'use client';

import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const WIPES = {
  up: 'linear-gradient(to top, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
  down: 'linear-gradient(to bottom, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
  left: 'linear-gradient(to left, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
  right: 'linear-gradient(to right, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
  center:
    'radial-gradient(farthest-corner at 50% 50%, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
} as const;

type Wipe = keyof typeof WIPES | 'none';
type Direction = 'vertical' | 'horizontal';
type StaggerFrom = 'start' | 'end' | 'center' | 'edges' | 'random';
type TriggerMode = 'scroll' | 'mount';

export type AnimatedContentProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  children: ReactNode;
  container?: string | HTMLElement | null;
  distance?: number;
  direction?: Direction;
  reverse?: boolean;
  duration?: number;
  ease?: string;
  initialOpacity?: number;
  animateOpacity?: boolean;
  scale?: number;
  blur?: number;
  rotate?: number;
  tilt?: number;
  wipe?: Wipe;
  /** 0–1: how far into the viewport the top must reach before playing (0.2 ≈ start at top 80%). */
  threshold?: number;
  delay?: number;
  stagger?: number;
  staggerFrom?: StaggerFrom;
  trigger?: TriggerMode;
  once?: boolean;
  scrub?: boolean | number;
  disappearAfter?: number;
  disappearDuration?: number;
  disappearEase?: string;
  onStart?: () => void;
  onComplete?: () => void;
  onDisappearanceComplete?: () => void;
  className?: string;
  style?: CSSProperties;
};

function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

export function AnimatedContent({
  children,
  container,
  distance = 80,
  direction = 'vertical',
  reverse = false,
  duration = 0.9,
  ease = 'power3.out',
  initialOpacity = 0,
  animateOpacity = true,
  scale = 1,
  blur = 0,
  rotate = 0,
  tilt = 0,
  wipe = 'none',
  threshold = 0.18,
  delay = 0,
  stagger = 0,
  staggerFrom = 'start',
  trigger = 'scroll',
  once = true,
  scrub = false,
  disappearAfter = 0,
  disappearDuration = 0.5,
  disappearEase = 'power3.in',
  onStart,
  onComplete,
  onDisappearanceComplete,
  className = '',
  style,
  ...props
}: AnimatedContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const callbacksRef = useRef({ onStart, onComplete, onDisappearanceComplete });
  callbacksRef.current = { onStart, onComplete, onDisappearanceComplete };

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    let scroller: string | Element | null | undefined = container ?? null;
    if (typeof scroller === 'string') scroller = document.querySelector(scroller);

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    let catchUp: (() => void) | undefined;
    let disposeCatchUp: (() => void) | undefined;

    const ctx = gsap.context(() => {
      const targets = stagger > 0 && el.children.length ? Array.from(el.children) : [el];
      const horizontal = direction === 'horizontal';
      const axis = horizontal ? 'x' : 'y';
      const sign = reverse ? -1 : 1;
      const mask = wipe === 'none' ? undefined : WIPES[wipe];

      gsap.set(el, { visibility: 'visible' });

      if (reduce) {
        callbacksRef.current.onComplete?.();
        return;
      }

      const from: gsap.TweenVars = {
        [axis]: distance * sign,
        scale,
        opacity: animateOpacity ? initialOpacity : 1,
      };
      const to: gsap.TweenVars = {
        [axis]: 0,
        scale: 1,
        opacity: 1,
        duration,
        ease,
      };

      if (blur > 0) {
        from.filter = `blur(${blur}px)`;
        to.filter = 'blur(0px)';
      }
      if (rotate) {
        from.rotation = rotate * sign;
        to.rotation = 0;
      }
      if (tilt) {
        const tiltAxis = horizontal ? 'rotationY' : 'rotationX';
        from[tiltAxis] = horizontal ? -tilt * sign : tilt * sign;
        to[tiltAxis] = 0;
        from.transformPerspective = 900;
        to.transformPerspective = 900;
      }
      if (mask) {
        gsap.set(targets, { maskImage: mask, webkitMaskImage: mask });
        from['--ac-wipe'] = 0;
        to['--ac-wipe'] = 1;
      }
      if (stagger > 0) to.stagger = { each: stagger, from: staggerFrom };

      const settle = () => {
        if (scrub) return;
        gsap.set(targets, {
          clearProps: mask ? 'filter,transform,maskImage,webkitMaskImage' : 'filter,transform',
        });
      };

      const disappear = () => {
        if (disappearAfter <= 0) return;
        const out: gsap.TweenVars = {
          [axis]: -distance * sign,
          scale: 0.8,
          opacity: animateOpacity ? initialOpacity : 0,
          delay: disappearAfter,
          duration: disappearDuration,
          ease: disappearEase,
          onComplete: () => callbacksRef.current.onDisappearanceComplete?.(),
        };
        if (blur > 0) out.filter = `blur(${blur}px)`;
        if (stagger > 0) out.stagger = { each: stagger, from: staggerFrom };
        gsap.to(targets, out);
      };

      const tl = gsap.timeline({
        paused: true,
        onStart: () => callbacksRef.current.onStart?.(),
        onComplete: () => {
          callbacksRef.current.onComplete?.();
          settle();
          if (once && !scrub) disappear();
        },
      });
      tl.fromTo(targets, from, to, scrub ? 0 : Math.max(delay, 0));

      if (trigger === 'mount') {
        tl.play();
        return;
      }

      // Fire as soon as the resting layout box peeks into the viewport. A mid-viewport
      // start (e.g. top 82%) leaves below-the-fold peeks stuck at opacity 0 until scroll.
      const startPct = (1 - clamp01(threshold)) * 100;
      const scrubStart = `top ${startPct}%`;
      const scrollTriggerScroller = scroller || undefined;

      if (scrub) {
        ScrollTrigger.create({
          trigger: el,
          scroller: scrollTriggerScroller,
          start: scrubStart,
          end: `top ${Math.max(startPct - 45, 5)}%`,
          scrub: scrub === true ? true : Math.max(Number(scrub) || 0, 0.01),
          animation: tl,
        });
        return;
      }

      let started = false;
      let cancelled = false;
      let loadHandler: (() => void) | undefined;
      let io: IntersectionObserver | undefined;
      // Enter offset shifts getBoundingClientRect; ST must fire on the resting layout box
      // or laptop peeks under the hero stay blank (section padding visible, content below fold).
      const enterLead = Math.ceil(Math.abs(distance));
      const enterStart = horizontal ? `left right+=${enterLead}` : `top bottom+=${enterLead}`;

      const stopCatchUp = () => {
        if (catchUp) {
          window.removeEventListener('scroll', catchUp);
          document.removeEventListener('scroll', catchUp);
          ScrollTrigger.removeEventListener('scrollEnd', catchUp);
          ScrollTrigger.removeEventListener('scrollStart', catchUp);
        }
        if (loadHandler) window.removeEventListener('load', loadHandler);
        io?.disconnect();
        io = undefined;
      };
      disposeCatchUp = () => {
        cancelled = true;
        stopCatchUp();
      };

      const play = () => {
        if (cancelled || started) return;
        started = true;
        stopCatchUp();
        if (tl.progress() < 1) tl.play();
      };

      /** Snap to final state when the block was scrolled past without a chance to play. */
      const finish = () => {
        if (cancelled) return;
        if (started && tl.progress() === 1) return;
        started = true;
        stopCatchUp();
        tl.progress(1);
      };

      /**
       * Resting layout box. Subtract the wrapper enter translate when present.
       * Stagger moves children instead — the wrapper border-box is already the resting box.
       */
      const layoutBox = () => {
        const rect = el.getBoundingClientRect();
        const ox = Number(gsap.getProperty(el, 'x')) || 0;
        const oy = Number(gsap.getProperty(el, 'y')) || 0;
        return {
          top: rect.top - oy,
          bottom: rect.bottom - oy,
          left: rect.left - ox,
          right: rect.right - ox,
        };
      };

      /**
       * Fast wheel / trackpad scrolls can jump past ScrollTrigger's enter line
       * between ticks, so onEnter never fires and content stays at opacity 0.
       * Any viewport intersection of the resting layout box (incl. peeks) must play.
       * Listen on document too — some Chromium builds drop window scroll events.
       */
      catchUp = () => {
        if (cancelled || started) return;
        const box = layoutBox();
        const viewH = window.innerHeight || document.documentElement.clientHeight;
        const viewW = window.innerWidth || document.documentElement.clientWidth;
        if (horizontal) {
          if (box.right <= 0) {
            finish();
            return;
          }
          if (box.left < viewW && box.right > 0) play();
          return;
        }
        if (box.bottom <= 0) {
          finish();
          return;
        }
        if (box.top < viewH && box.bottom > 0) play();
      };

      ScrollTrigger.create({
        trigger: el,
        scroller: scrollTriggerScroller,
        start: enterStart,
        once,
        onEnter: play,
        onEnterBack: once ? undefined : play,
        onRefresh: () => catchUp?.(),
        onLeaveBack: once
          ? undefined
          : () => {
              started = false;
              if (mask) gsap.set(targets, { maskImage: mask, webkitMaskImage: mask });
              tl.reverse();
            },
      });

      if (typeof IntersectionObserver !== 'undefined') {
        io = new IntersectionObserver(
          (entries) => {
            if (cancelled || started) return;
            for (const entry of entries) {
              if (entry.isIntersecting || entry.intersectionRatio > 0) {
                play();
                return;
              }
              if (entry.boundingClientRect.bottom < 0) finish();
            }
          },
          {
            root: null,
            // Expand only the leading edge so we fire just before enter.
            rootMargin: horizontal
              ? `0px ${enterLead}px 0px 0px`
              : `0px 0px ${enterLead}px 0px`,
            threshold: [0, 0.01, 0.1],
          },
        );
        // Observe after paint so visibility:visible + layout are settled.
        requestAnimationFrame(() => {
          if (!cancelled && !started) io?.observe(el);
        });
      }

      catchUp();
      requestAnimationFrame(() => {
        catchUp?.();
        ScrollTrigger.refresh();
        requestAnimationFrame(() => catchUp?.());
      });
      // Hero media / fonts can push layout after first paint — re-check once settled.
      loadHandler = () => {
        ScrollTrigger.refresh();
        catchUp?.();
      };
      if (document.readyState === 'complete') {
        requestAnimationFrame(loadHandler);
      } else {
        window.addEventListener('load', loadHandler, { once: true });
      }
      void document.fonts?.ready?.then(() => {
        if (cancelled) return;
        ScrollTrigger.refresh();
        catchUp?.();
      });
      window.addEventListener('scroll', catchUp, { passive: true });
      document.addEventListener('scroll', catchUp, { passive: true, capture: true });
      ScrollTrigger.addEventListener('scrollStart', catchUp);
      ScrollTrigger.addEventListener('scrollEnd', catchUp);
    }, el);

    return () => {
      disposeCatchUp?.();
      ctx.revert();
    };
  }, [
    container,
    distance,
    direction,
    reverse,
    duration,
    ease,
    initialOpacity,
    animateOpacity,
    scale,
    blur,
    rotate,
    tilt,
    wipe,
    threshold,
    delay,
    stagger,
    staggerFrom,
    trigger,
    once,
    scrub,
    disappearAfter,
    disappearDuration,
    disappearEase,
  ]);

  return (
    <div ref={ref} className={className} style={{ visibility: 'hidden', ...style }} {...props}>
      {children}
    </div>
  );
}
