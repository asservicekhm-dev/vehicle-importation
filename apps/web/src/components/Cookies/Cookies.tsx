'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/Button';
import { COOKIE_CONSENT_KEY, isTagAssistantSession, updateGtmConsent } from '@/lib/gtmConsent';

import styles from './Cookies.module.scss';

type Props = {
  /** When true, Accept/Decline also update GTM Consent Mode. */
  gtmEnabled?: boolean;
};

type ConsentChoice = 'granted' | 'denied';

const ENTER_DELAY_MS = 400;
const EXIT_MS = 320;

export function Cookies({ gtmEnabled = false }: Props) {
  const t = useTranslations('Cookies');
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isTagAssistantSession()) return;

    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored === 'granted' || stored === 'denied') {
      if (gtmEnabled) updateGtmConsent(stored);
      return;
    }

    setMounted(true);
    const enterTimer = window.setTimeout(() => setOpen(true), ENTER_DELAY_MS);
    return () => window.clearTimeout(enterTimer);
  }, [gtmEnabled]);

  const choose = (state: ConsentChoice) => {
    if (busy) return;
    setBusy(true);
    localStorage.setItem(COOKIE_CONSENT_KEY, state);
    if (gtmEnabled) updateGtmConsent(state);
    setOpen(false);
    window.setTimeout(() => setMounted(false), EXIT_MS);
  };

  if (!mounted) return null;

  return (
    <div
      className={clsx(styles.wrapper, open && styles.open)}
      role='dialog'
      aria-labelledby='cookie-consent-title'
      aria-describedby='cookie-consent-description'
    >
      <h2 id='cookie-consent-title' className={styles.title}>
        {t('title')}
      </h2>
      <p id='cookie-consent-description' className={styles.description}>
        {t('description')}
      </p>
      <div className={styles.actions}>
        <Button
          type='button'
          variant='primary'
          size='sm'
          className={styles.action}
          disabled={busy}
          onClick={() => choose('granted')}
        >
          {t('accept')}
        </Button>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className={styles.action}
          disabled={busy}
          onClick={() => choose('denied')}
        >
          {t('decline')}
        </Button>
      </div>
    </div>
  );
}
