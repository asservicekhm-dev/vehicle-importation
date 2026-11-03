'use client';

import { type MouseEvent, useCallback, useEffect, useId, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { AnimatedContent } from '@/components/AnimatedContent';
import { CMSMedia } from '@/components/CMSMedia';
import { Container } from '@/components/Container';
import type { TestimonialsBlockFields } from '@autosearch/cms/payload-types';

import styles from './Testimonials.module.scss';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

type Props = TestimonialsBlockFields;

function QuoteIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 42 32'
      fill='none'
      aria-hidden
      className={className}
    >
      <path
        d='M14 7.77143C11.9778 7.77143 10.5 8.38095 9.56667 9.6C8.63333 10.6667 8.16667 12.3429 8.16667 14.6286V16H16.3333V32H0V16C0 10.6667 1.24444 6.70476 3.73333 4.11429C6.22222 1.37143 9.64444 0 14 0H16.3333V7.77143H14ZM39.6667 7.77143C37.6444 7.77143 36.1667 8.38095 35.2333 9.6C34.3 10.6667 33.8333 12.3429 33.8333 14.6286V16H42V32H25.6667V16C25.6667 10.6667 26.9111 6.70476 29.4 4.11429C31.8889 1.37143 35.3111 0 39.6667 0H42V7.77143H39.6667Z'
        fill='currentColor'
      />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg width='20' height='20' viewBox='0 0 20 20' fill='none' aria-hidden>
      <path
        d='M12.5 4.5L7 10l5.5 5.5'
        stroke='currentColor'
        strokeWidth='1.6'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width='20' height='20' viewBox='0 0 20 20' fill='none' aria-hidden>
      <path
        d='M7.5 4.5L13 10l-5.5 5.5'
        stroke='currentColor'
        strokeWidth='1.6'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

export function Testimonials({ id, blockName, eyebrow, titleAccent, title, items }: Props) {
  const t = useTranslations('Testimonials');
  const uid = useId().replace(/:/g, '');
  const prevClass = `testimonials-prev-${uid}`;
  const nextClass = `testimonials-next-${uid}`;

  const heading = title?.trim() ?? '';
  const accent = titleAccent?.trim() ?? '';
  const list = items?.filter((item) => item?.quote?.trim() && item?.authorName?.trim()) ?? [];
  const sectionId = (blockName || id || 'testimonials').toString();
  const headingId = `${sectionId}-title`;

  const swiperRef = useRef<SwiperType | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [thumbWidth, setThumbWidth] = useState(100);
  const [thumbLeft, setThumbLeft] = useState(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartProgress = useRef(0);

  const updateScrollbar = useCallback((swiper: SwiperType) => {
    const total = swiper.slides.length;
    const visible =
      typeof swiper.params.slidesPerView === 'number' ? swiper.params.slidesPerView : 1;
    if (total <= visible) {
      setThumbWidth(100);
      setThumbLeft(0);
      return;
    }
    const ratio = Math.min(visible / total, 1);
    const progress = swiper.progress ?? 0;
    setThumbWidth(ratio * 100);
    setThumbLeft(progress * (1 - ratio) * 100);
  }, []);

  const onSwiper = useCallback(
    (swiper: SwiperType) => {
      swiperRef.current = swiper;
      updateScrollbar(swiper);
    },
    [updateScrollbar],
  );

  const onSlideChange = useCallback(
    (swiper: SwiperType) => {
      updateScrollbar(swiper);
    },
    [updateScrollbar],
  );

  const handleTrackClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const swiper = swiperRef.current;
    if (!swiper || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const progress = Math.max(0, Math.min(1, clickX / rect.width));
    swiper.setProgress(progress, 300);
  }, []);

  const handleThumbMouseDown = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const swiper = swiperRef.current;
      if (!swiper) return;
      isDragging.current = true;
      dragStartX.current = event.clientX;
      dragStartProgress.current = swiper.progress ?? 0;

      const onMouseMove = (ev: globalThis.MouseEvent) => {
        if (!isDragging.current || !trackRef.current || !swiperRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const dx = ev.clientX - dragStartX.current;
        const delta = dx / rect.width;
        const newProgress = Math.max(0, Math.min(1, dragStartProgress.current + delta));
        swiperRef.current.setProgress(newProgress, 0);
        updateScrollbar(swiperRef.current);
      };

      const onMouseUp = () => {
        isDragging.current = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [updateScrollbar],
  );

  useEffect(() => {
    return () => {
      isDragging.current = false;
    };
  }, []);

  if (!heading && !accent && !list.length) return null;

  const showNav = list.length > 1;

  return (
    <section
      className={styles.section}
      id={sectionId}
      aria-labelledby={heading || accent ? headingId : undefined}
    >
      <Container>
        <div className={styles.panel}>
          <AnimatedContent distance={48} duration={0.7} threshold={0.15}>
            <div className={styles.topBar}>
              {heading || accent ? (
                <h2 id={headingId} className={styles.title}>
                  {accent ? <span className={styles.titleAccent}>{accent}</span> : null}
                  {heading ? <span className={styles.titleMain}>{heading}</span> : null}
                </h2>
              ) : null}
              {eyebrow?.trim() ? (
                <span className={styles.eyebrow}>
                  <span className={styles.eyebrowDot} aria-hidden />
                  {eyebrow.trim()}
                </span>
              ) : null}
            </div>
          </AnimatedContent>

          {list.length ? (
            <>
              <div className={styles.sliderWrap}>
                {showNav ? (
                  <>
                    <button
                      type='button'
                      className={`${styles.navBtn} ${styles.navPrev} ${prevClass}`}
                      aria-label={t('prev')}
                    >
                      <ChevronLeft />
                    </button>
                    <button
                      type='button'
                      className={`${styles.navBtn} ${styles.navNext} ${nextClass}`}
                      aria-label={t('next')}
                    >
                      <ChevronRight />
                    </button>
                  </>
                ) : null}

                <Swiper
                  className={styles.slider}
                  modules={[Pagination, Navigation]}
                  spaceBetween={16}
                  slidesPerView={1}
                  speed={550}
                  watchOverflow
                  rewind={list.length > 1}
                  onSwiper={onSwiper}
                  onSlideChange={onSlideChange}
                  onProgress={(swiper) => updateScrollbar(swiper)}
                  navigation={
                    showNav
                      ? {
                          prevEl: `.${prevClass}`,
                          nextEl: `.${nextClass}`,
                        }
                      : undefined
                  }
                  pagination={
                    list.length > 1
                      ? {
                          clickable: true,
                          horizontalClass: styles.bullets,
                          bulletClass: `swiper-pagination-bullet ${styles.bullet}`,
                          bulletActiveClass: `swiper-pagination-bullet-active ${styles.bulletActive}`,
                        }
                      : false
                  }
                  breakpoints={{
                    768: { slidesPerView: 1.4, spaceBetween: 20 },
                    1200: { slidesPerView: 2.2, spaceBetween: 24 },
                    1750: { slidesPerView: 3, spaceBetween: 24 },
                  }}
                >
                  {list.map((item, index) => {
                    const hasAvatar = Boolean(item.avatar && typeof item.avatar !== 'string');
                    return (
                      <SwiperSlide key={item.id ?? index} className={styles.slideOuter}>
                        <article className={styles.card}>
                          <QuoteIcon className={styles.cardQuoteIcon} />
                          <p className={styles.quote}>{item.quote}</p>
                          <div className={styles.author}>
                            {hasAvatar ? (
                              <span className={styles.avatar}>
                                <CMSMedia
                                  media={item.avatar}
                                  className={styles.avatarImg}
                                  fill
                                  sizes='64px'
                                />
                              </span>
                            ) : null}
                            <div className={styles.authorInfo}>
                              <span className={styles.authorName}>{item.authorName}</span>
                              {item.authorRole?.trim() ? (
                                <span className={styles.authorRole}>{item.authorRole.trim()}</span>
                              ) : null}
                            </div>
                          </div>
                        </article>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              </div>

              {list.length > 1 ? (
                <div className={styles.scrollbarWrap}>
                  <div
                    ref={trackRef}
                    className={styles.scrollbarTrack}
                    onClick={handleTrackClick}
                  >
                    <div
                      className={styles.scrollbarThumb}
                      style={{ width: `${thumbWidth}%`, left: `${thumbLeft}%` }}
                      onMouseDown={handleThumbMouseDown}
                    />
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
