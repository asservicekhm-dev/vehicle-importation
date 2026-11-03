import type { ReactNode } from 'react';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import type { ThemePreference } from '@autosearch/config';

import styles from './Layout.module.scss';

type Props = {
  children: ReactNode;
  themePreference: ThemePreference;
  enableThemeToggle?: boolean;
};

export function Layout({ children, themePreference, enableThemeToggle = true }: Props) {
  return (
    <div className={styles.shell}>
      <Header themePreference={themePreference} enableThemeToggle={enableThemeToggle} />
      <main className={styles.main}>{children}</main>
      <Footer />
    </div>
  );
}
