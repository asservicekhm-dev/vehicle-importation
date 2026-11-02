import { ThemeToggle } from '@/components/ThemeToggle';

import styles from './page.module.scss';

export default function HomePage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>AS Autosearch</h1>
      <p className={styles.muted}>Milestone 1 — tokens and theme</p>
      <ThemeToggle />
    </main>
  );
}
