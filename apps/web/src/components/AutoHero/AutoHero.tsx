'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { gsap } from 'gsap';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/Button';
import { CMSLink } from '@/components/CMSLink';
import { CMSMedia } from '@/components/CMSMedia';
import { Container } from '@/components/Container';
import { type OriginId, useOrigin } from '@/components/OriginProvider';
import { renderAccentText, stripAccentMarkers } from '@/lib/accentText';
import type { AutoHeroBlockFields, Media } from '@autosearch/cms/payload-types';

import styles from './AutoHero.module.scss';

type Props = AutoHeroBlockFields;

/** Dwell time per origin before auto-advancing — long enough to read, not a flash. */
const ORIGIN_AUTO_MS = 6500;

/** Container max-width is 1440px; keep hero srcset from requesting desktop max. */
const HERO_SIZES = '(min-width: 1440px) 1344px, 100vw';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function isOriginId(value: string | null | undefined): value is OriginId {
  return value === 'usa' || value === 'europe' || value === 'korea';
}

function asMedia(value: unknown): Media | null {
  if (!value || typeof value === 'string') return null;
  return value as Media;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export function AutoHero({
  id,
  blockName,
  title,
  subtitle,
  buttons,
  highlights,
  origins,
  backgroundImage,
}: Props) {
  const t = useTranslations('AutoHero');
  const heading = title?.trim();
  const body = subtitle?.trim();
  const points = highlights?.filter((item) => item?.label?.trim()) ?? [];
  const originItems =
    origins?.filter((item) => item?.label?.trim() && isOriginId(item.originId)) ?? [];
  const { origin, setOrigin } = useOrigin();
  /** Idle-load inactive origin slides so LCP only fetches the active photo. */
  const [mountAllLayers, setMountAllLayers] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const switcherRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const autoPausedRef = useRef(false);
  const heroInViewRef = useRef(true);
  const thumbReadyRef = useRef(false);

  useEffect(() => {
    if (mountAllLayers) return undefined;

    const mount = () => setMountAllLayers(true);
    let idleId: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(mount, { timeout: 2000 });
    } else {
      timer = setTimeout(mount, 1200);
    }

    return () => {
      if (idleId !== undefined) window.cancelIdleCallback?.(idleId);
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [mountAllLayers]);

  const active = originItems.find((item) => item.originId === origin) ?? originItems[0] ?? null;
  const activeOriginId = active && isOriginId(active.originId) ? active.originId : null;

  useIsomorphicLayoutEffect(() => {
    const switcher = switcherRef.current;
    const thumb = thumbRef.current;
    if (!switcher || !thumb || !activeOriginId) return undefined;

    const activeBtn = switcher.querySelector<HTMLElement>(
      `button[data-origin="${activeOriginId}"]`,
    );
    if (!activeBtn) {
      gsap.set(thumb, { opacity: 0 });
      return undefined;
    }

    const target = {
      width: activeBtn.offsetWidth,
      height: activeBtn.offsetHeight,
      x: activeBtn.offsetLeft,
      y: activeBtn.offsetTop,
      opacity: 1,
    };

    // First paint: place without tween. Later moves glide (CSS transitions were
    // getting killed by ResizeObserver when the thumb's own size changed).
    if (!thumbReadyRef.current || prefersReducedMotion()) {
      gsap.set(thumb, target);
      thumbReadyRef.current = true;
      return undefined;
    }

    const tween = gsap.to(thumb, {
      ...target,
      duration: 0.55,
      ease: 'power3.inOut',
      overwrite: true,
    });

    return () => {
      tween.kill();
    };
  }, [activeOriginId, originItems.length]);

  useEffect(() => {
    const onResize = () => {
      const switcher = switcherRef.current;
      const thumb = thumbRef.current;
      if (!switcher || !thumb || !activeOriginId) return;
      const activeBtn = switcher.querySelector<HTMLElement>(
        `button[data-origin="${activeOriginId}"]`,
      );
      if (!activeBtn) return;
      gsap.set(thumb, {
        width: activeBtn.offsetWidth,
        height: activeBtn.offsetHeight,
        x: activeBtn.offsetLeft,
        y: activeBtn.offsetTop,
        opacity: 1,
      });
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [activeOriginId]);

  const originIdsKey = originItems.map((item) => item.originId).join(',');

  useEffect(() => {
    const ids = originIdsKey.split(',').filter((value): value is OriginId => isOriginId(value));
    if (ids.length < 2) return undefined;
    if (typeof window === 'undefined') return undefined;
    if (prefersReducedMotion()) return undefined;

    const frame = frameRef.current;
    let io: IntersectionObserver | null = null;
    if (frame && typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        ([entry]) => {
          heroInViewRef.current = entry?.isIntersecting ?? true;
        },
        { threshold: 0.35 },
      );
      io.observe(frame);
    }

    const timer = window.setInterval(() => {
      if (document.hidden || autoPausedRef.current || !heroInViewRef.current) return;
      const current = ids.includes(origin) ? origin : ids[0];
      const index = ids.indexOf(current);
      const next = ids[(index + 1) % ids.length];
      if (next) setOrigin(next);
    }, ORIGIN_AUTO_MS);

    return () => {
      window.clearInterval(timer);
      io?.disconnect();
    };
  }, [origin, originIdsKey, setOrigin]);

  if (!heading && !body && !originItems.length && !points.length) return null;

  const sectionId = (blockName || id || 'hero').toString();
  const headingPlain = heading ? stripAccentMarkers(heading) : undefined;
  const fallbackMedia = asMedia(backgroundImage);

  const selectOrigin = (next: OriginId) => {
    setMountAllLayers(true);
    setOrigin(next);
  };

  const pauseAuto = () => {
    autoPausedRef.current = true;
  };

  const resumeAuto = () => {
    autoPausedRef.current = false;
  };

  const photoLayers: { key: string; media: Media; active: boolean }[] = [];
  originItems.forEach((item) => {
    const media = asMedia(item.image);
    if (!media || !isOriginId(item.originId)) return;
    photoLayers.push({
      key: item.originId,
      media,
      active: item.originId === activeOriginId,
    });
  });
  if (photoLayers.length === 0 && fallbackMedia) {
    photoLayers.push({ key: 'fallback', media: fallbackMedia, active: true });
  } else if (fallbackMedia && !photoLayers.some((layer) => layer.active)) {
    photoLayers.push({ key: 'fallback', media: fallbackMedia, active: true });
  }

  // First paint / SSR: only the active layer (priority). After idle, mount the rest
  // so origin switches can crossfade without competing for LCP bandwidth.
  const visibleLayers =
    mountAllLayers || photoLayers.length <= 1
      ? photoLayers
      : photoLayers.filter((layer) => layer.active);

  return (
    <section className={styles.section} id={sectionId}>
      <Container>
        <div className={styles.frame} ref={frameRef}>
          <div className={styles.photo} aria-hidden>
            {visibleLayers.map((layer) => (
              <div
                key={layer.key}
                data-origin={layer.key}
                className={clsx(styles.photoLayer, layer.active && styles.photoLayerActive)}
              >
                <CMSMedia
                  media={layer.media}
                  fill
                  className={styles.photoImg}
                  sizes={HERO_SIZES}
                  priority={layer.active}
                />
              </div>
            ))}
            <div className={styles.photoScrim} />
          </div>

          <div className={styles.content}>
            <div className={styles.lead}>
              {heading ? (
                <h1 className={styles.title} aria-label={headingPlain}>
                  {renderAccentText(heading, styles.accent)}
                </h1>
              ) : null}
              {body ? (
                <p className={styles.subtitle}>{renderAccentText(body, styles.accent)}</p>
              ) : null}
            </div>

            {buttons?.length ? (
              <div className={styles.actions}>
                {buttons.map((button, index) => {
                  const variant =
                    button.style === 'outline' || button.style === 'ghost'
                      ? button.style
                      : 'primary';
                  return (
                    <Button
                      key={button.id ?? index}
                      asChild
                      variant={variant}
                      className={
                        variant === 'primary' ? styles.primaryCta : styles.secondaryCta
                      }
                    >
                      <CMSLink link={button.link} />
                    </Button>
                  );
                })}
              </div>
            ) : null}

            {active ? (
              <div className={styles.originPanel}>
                <div
                  className={styles.switcher}
                  ref={switcherRef}
                  role='group'
                  aria-label={t('originLabel')}
                  onMouseEnter={pauseAuto}
                  onMouseLeave={resumeAuto}
                  onFocusCapture={pauseAuto}
                  onBlurCapture={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                      resumeAuto();
                    }
                  }}
                >
                  <span className={styles.thumb} ref={thumbRef} aria-hidden />
                  {originItems.map((item) => (
                    <button
                      key={item.id ?? item.originId}
                      type='button'
                      data-origin={item.originId}
                      className={styles.originBtn}
                      aria-pressed={item.originId === active.originId}
                      onClick={() => {
                        if (!isOriginId(item.originId)) return;
                        selectOrigin(item.originId);
                        // Selection restarts the dwell timer; don't leave auto paused on focus
                        resumeAuto();
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <p
                  key={activeOriginId ?? 'meta'}
                  className={styles.meta}
                  aria-live='polite'
                >
                  {active.term ? (
                    <span className={styles.metaTerm}>
                      {renderAccentText(active.term, styles.accent)}
                    </span>
                  ) : null}
                  {active.check ? (
                    <span>{renderAccentText(active.check, styles.accent)}</span>
                  ) : null}
                </p>
              </div>
            ) : null}
          </div>

          {points.length ? (
            <ul className={styles.highlights}>
              {points.map((point, index) => (
                <li key={point.id ?? index} className={styles.highlight}>
                  <span className={styles.highlightMark} aria-hidden />
                  <span className={styles.highlightLabel}>
                    {renderAccentText(point.label!.trim(), styles.accent)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
