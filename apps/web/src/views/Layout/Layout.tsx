import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';

import { BackToTop } from '@/components/BackToTop';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import type { ThemePreference } from '@autosearch/config';

import styles from './Layout.module.scss';

type Props = {
  children: ReactNode;
  themePreference: ThemePreference;
  enableThemeToggle?: boolean;
};

export async function Layout({
  children,
  themePreference,
  enableThemeToggle = true,
}: Props) {
  const t = await getTranslations('Layout');

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href='#main'>
        {t('skipToContent')}
      </a>
      <Header themePreference={themePreference} enableThemeToggle={enableThemeToggle} />
      <main id='main' className={styles.main} tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
