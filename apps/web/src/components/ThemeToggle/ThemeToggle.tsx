'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { applyThemePreference } from '@/lib/theme/client';
import {
  defaultThemePreference,
  isThemePreference,
  type ThemePreference,
  themePreferences,
} from '@autosearch/config';

import styles from './ThemeToggle.module.scss';

function readPreference(fallback: ThemePreference): ThemePreference {
  const value = document.documentElement.dataset.themePref;

  return isThemePreference(value) ? value : fallback;
}

function SunIcon() {
  return (
    <svg width='16' height='16' viewBox='0 0 16 16' fill='none' aria-hidden>
      <circle cx='8' cy='8' r='3.25' stroke='currentColor' strokeWidth='1.4' />
      <path
        d='M8 1.25V2.75M8 13.25V14.75M1.25 8H2.75M13.25 8H14.75M3.05 3.05L4.1 4.1M11.9 11.9L12.95 12.95M12.95 3.05L11.9 4.1M4.1 11.9L3.05 12.95'
        stroke='currentColor'
        strokeWidth='1.4'
        strokeLinecap='round'
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width='16' height='16' viewBox='0 0 16 16' fill='none' aria-hidden>
      <path
        d='M13.5 9.35A5.75 5.75 0 0 1 6.65 2.5 5.75 5.75 0 1 0 13.5 9.35Z'
        stroke='currentColor'
        strokeWidth='1.4'
        strokeLinejoin='round'
      />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg width='16' height='16' viewBox='0 0 16 16' fill='none' aria-hidden>
      <rect x='2.25' y='3.25' width='11.5' height='8' rx='1.5' stroke='currentColor' strokeWidth='1.4' />
      <path d='M5.5 13.25h5' stroke='currentColor' strokeWidth='1.4' strokeLinecap='round' />
    </svg>
  );
}

const ICONS = {
  light: SunIcon,
  dark: MoonIcon,
  system: SystemIcon,
} as const;

type Props = {
  /** Cookie/SSR preference so the first client render matches the server HTML. */
  initialPreference?: ThemePreference;
};

export function ThemeToggle({ initialPreference = defaultThemePreference }: Props) {
  const t = useTranslations('ThemeToggle');
  const [preference, setPreference] = useState<ThemePreference>(initialPreference);

  useEffect(() => {
    setPreference(readPreference(initialPreference));
  }, [initialPreference]);

  useEffect(() => {
    if (preference !== 'system') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      applyThemePreference('system');
    };

    media.addEventListener('change', onChange);

    return () => media.removeEventListener('change', onChange);
  }, [preference]);

  const onSelect = (next: ThemePreference) => {
    applyThemePreference(next);
    setPreference(next);
  };

  return (
    <div className={styles.root} role='group' aria-label={t('label')}>
      {themePreferences.map((value) => {
        const Icon = ICONS[value];
        return (
          <button
            key={value}
            type='button'
            className={styles.option}
            aria-label={t(value)}
            aria-pressed={preference === value}
            title={t(value)}
            onClick={() => onSelect(value)}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
}
