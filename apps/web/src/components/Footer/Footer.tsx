'use client';

import { useTranslations } from 'next-intl';

import { Container } from '@/components/Container';
import { Link } from '@/i18n/navigation';

import styles from './Footer.module.scss';

const NAV_ITEMS = [
  { href: '/about', labelKey: 'navAbout' as const },
  { href: '/services', labelKey: 'navServices' as const },
  { href: '/contacts', labelKey: 'navContacts' as const },
];

export function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.inner}>
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link className={styles.navLink} href={item.href}>
                  {t(item.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
          <div className={styles.meta}>
            <p className={styles.copyright}>{t('copyright')}</p>
            <button
              type='button'
              className={styles.backToTop}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              {t('backToTop')}
            </button>
          </div>
        </div>
      </Container>
    </footer>
  );
}
