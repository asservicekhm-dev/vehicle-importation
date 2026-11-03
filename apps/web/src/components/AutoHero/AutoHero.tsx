'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import clsx from 'clsx';
import { gsap } from 'gsap';

import { Button } from '@/components/Button';
import { CMSLink } from '@/components/CMSLink';
import { CMSMedia } from '@/components/CMSMedia';
import { Container } from '@/components/Container';
import { type OriginId, useOrigin } from '@/components/OriginProvider';
import { renderAccentText, stripAccentMarkers } from '@/lib/accentText';
import type { AutoHeroBlockFields, Media } from '@autosearch/cms/payload-types';

import styles from './AutoHero.module.scss';

type Props = AutoHeroBlockFields;

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function isOriginId(value: string | null | undefined): value is OriginId {
  return value === 'usa' || value === 'europe' || value === 'korea';
}

function asMedia(value: unknown): Media | null {
  if (!value || typeof value === 'string') return null;
  return value as Media;
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
  const heading = title?.trim();
  const body = subtitle?.trim();
  const points = highlights?.filter((item) => item?.label?.trim()) ?? [];
  const originItems =
    origins?.filter((item) => item?.label?.trim() && isOriginId(item.originId)) ?? [];
  const { origin, setOrigin } = useOrigin();
  const frameRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const originPanelRef = useRef<HTMLDivElement>(null);
  const highlightsRef = useRef<HTMLUListElement>(null);

  useIsomorphicLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return undefined;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reduce) {
      frame.dataset.heroEntered = '';
      return undefined;
    }

    const contentTargets = [
      titleRef.current,
      subtitleRef.current,
      actionsRef.current,
      originPanelRef.current,
      highlightsRef.current,
    ].filter((el): el is NonNullable<typeof el> => Boolean(el));

    if (!contentTargets.length) {
      frame.dataset.heroEntered = '';
      return undefined;
    }

    const markEntered = () => {
      frame.dataset.heroEntered = '';
      gsap.set(contentTargets, { clearProps: 'opacity,transform' });
    };

    const ctx = gsap.context(() => {
      gsap.to(contentTargets, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.09,
        onComplete: markEntered,
      });
    }, frame);

    return () => {
      ctx.revert();
      delete frame.dataset.heroEntered;
    };
  }, []);

  if (!heading && !body && !originItems.length && !points.length) return null;

  const active = originItems.find((item) => item.originId === origin) ?? originItems[0] ?? null;
  const activeOriginId = active && isOriginId(active.originId) ? active.originId : null;
  const sectionId = (blockName || id || 'hero').toString();
  const headingPlain = heading ? stripAccentMarkers(heading) : undefined;
  const fallbackMedia = asMedia(backgroundImage);

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

  return (
    <section className={styles.section} id={sectionId}>
      <Container>
        <div className={styles.frame} ref={frameRef}>
          <div className={styles.photo} aria-hidden>
            {photoLayers.map((layer) => (
              <div
                key={layer.key}
                className={clsx(styles.photoLayer, layer.active && styles.photoLayerActive)}
              >
                <CMSMedia
                  media={layer.media}
                  fill
                  className={styles.photoImg}
                  sizes='100vw'
                  priority={layer.active}
                />
              </div>
            ))}
            <div className={styles.photoScrim} />
          </div>

          <div className={styles.top}>
            <div className={styles.content}>
              {heading ? (
                <h1 className={styles.title} aria-label={headingPlain} ref={titleRef}>
                  {renderAccentText(heading, styles.accent)}
                </h1>
              ) : null}
              {body ? (
                <p className={styles.subtitle} ref={subtitleRef}>
                  {renderAccentText(body, styles.accent)}
                </p>
              ) : null}
              {buttons?.length ? (
                <div className={styles.actions} ref={actionsRef}>
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
            </div>

            {active ? (
              <div className={styles.originPanel} ref={originPanelRef}>
                <div className={styles.switcher} role='group' aria-label='Origin'>
                  {originItems.map((item) => (
                    <button
                      key={item.id ?? item.originId}
                      type='button'
                      className={styles.originBtn}
                      aria-pressed={item.originId === active.originId}
                      onClick={() => {
                        if (isOriginId(item.originId)) setOrigin(item.originId);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <p className={styles.meta}>
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
            <ul className={styles.highlights} ref={highlightsRef}>
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
