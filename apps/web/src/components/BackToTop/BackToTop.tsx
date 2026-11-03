'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import styles from './BackToTop.module.scss';

const SHOW_AFTER_Y = 480;

export function BackToTop() {
  const t = useTranslations('Footer');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_Y);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type='button'
      className={clsx(styles.fab, visible && styles.visible)}
      onClick={scrollToTop}
      aria-label={t('backToTopAria')}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
    >
      <svg
        width='18'
        height='18'
        viewBox='0 0 10 10'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        aria-hidden
      >
        <path
          d='M5 8.5V1.5M5 1.5L1.5 5M5 1.5L8.5 5'
          stroke='currentColor'
          strokeWidth='1.4'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </button>
  );
}
