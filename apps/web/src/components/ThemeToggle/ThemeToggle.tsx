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

function readPreference(): ThemePreference {
  const value = document.documentElement.dataset.themePref;

  return isThemePreference(value) ? value : defaultThemePreference;
}

export function ThemeToggle() {
  const t = useTranslations('ThemeToggle');
  const [preference, setPreference] = useState<ThemePreference>(defaultThemePreference);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPreference(readPreference());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || preference !== 'system') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      applyThemePreference('system');
    };

    media.addEventListener('change', onChange);

    return () => media.removeEventListener('change', onChange);
  }, [preference, ready]);

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
