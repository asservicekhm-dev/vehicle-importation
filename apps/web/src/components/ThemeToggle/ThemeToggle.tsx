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
      {themePreferences.map((value) => (
        <button
          key={value}
          type='button'
          className={styles.option}
          aria-pressed={preference === value}
          onClick={() => onSelect(value)}
        >
          {t(value)}
        </button>
      ))}
    </div>
  );
}
