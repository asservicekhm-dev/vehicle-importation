import type { ReactNode } from 'react';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import type { ThemePreference } from '@autosearch/config';

import styles from './Layout.module.scss';

type Props = {
  children: ReactNode;
  themePreference: ThemePreference;
};

export function Layout({ children, themePreference }: Props) {
  return (
    <div className={styles.shell}>
      <Header themePreference={themePreference} />
      <main className={styles.main}>{children}</main>
      <Footer />
    </div>
  );
}
