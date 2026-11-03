'use client';

import { useLocale, useTranslations } from 'next-intl';

import { usePathname, useRouter } from '@/i18n/navigation';
import { type Locale, locales } from '@autosearch/config';

import styles from './LocaleSwitcher.module.scss';

export function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  const onSelect = (next: Locale) => {
    if (next === locale) return;

    router.replace(pathname, { locale: next });
  };

  return (
    <div className={styles.root} role='group' aria-label={t('label')}>
      {locales.map((code) => (
        <button
          key={code}
          type='button'
          className={styles.option}
          aria-pressed={locale === code}
          onClick={() => onSelect(code)}
        >
          {t(code)}
        </button>
      ))}
    </div>
  );
}
