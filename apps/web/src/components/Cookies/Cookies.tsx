'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { COOKIE_CONSENT_KEY, isTagAssistantSession, updateGtmConsent } from '@/lib/gtmConsent';

import styles from './Cookies.module.scss';

type Props = {
  enabled: boolean;
};

function CookiesContent({ onDone }: { onDone: () => void }) {
  const t = useTranslations('Cookies');

  const accept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'granted');
    updateGtmConsent('granted');
    onDone();
  };

  const decline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'denied');
    updateGtmConsent('denied');
    onDone();
  };

  return (
    <div className={styles.wrapper} role='dialog' aria-label={t('title')}>
      <p className={styles.description}>{t('description')}</p>
      <div className={styles.actions}>
        <button type='button' className={styles.accept} onClick={accept}>
          {t('accept')}
        </button>
        <button type='button' className={styles.decline} onClick={decline}>
          {t('decline')}
        </button>
      </div>
    </div>
  );
}

export function Cookies({ enabled }: Props) {
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    if (isTagAssistantSession()) {
      setReady(true);
      return;
    }

    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored === 'granted') updateGtmConsent('granted');
    if (stored === 'denied') updateGtmConsent('denied');
    setVisible(!stored);
    setReady(true);
  }, [enabled]);

  if (!enabled || !ready || !visible) return null;

  return <CookiesContent onDone={() => setVisible(false)} />;
}
