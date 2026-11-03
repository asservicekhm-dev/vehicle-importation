'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Container } from '@/components/Container';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { Modal } from '@/components/Modal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Link } from '@/i18n/navigation';
import type { ThemePreference } from '@autosearch/config';

import styles from './Header.module.scss';

const NAV_ITEMS = [
  { href: '/about', labelKey: 'navAbout' as const },
  { href: '/services', labelKey: 'navServices' as const },
  { href: '/contacts', labelKey: 'navContacts' as const },
];

type Props = {
  themePreference: ThemePreference;
};

export function Header({ themePreference }: Props) {
  const t = useTranslations('Header');
  const [menuOpen, setMenuOpen] = useState(false);

  const phoneHref = `tel:${t('phone').replace(/\s+/g, '')}`;

  return (
    <header className={styles.header}>
      <Container>
        <div className={styles.inner}>
          <Link className={styles.brand} href='/'>
            {t('brand')}
          </Link>

          <nav className={styles.desktopNav} aria-label={t('menuTitle')}>
            <ul className={styles.navList}>
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link className={styles.navLink} href={item.href}>
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
            <a className={styles.phone} href={phoneHref} aria-label={t('phoneAria')}>
              {t('phone')}
            </a>
          </nav>

          <div className={styles.controls}>
            <LocaleSwitcher />
            <ThemeToggle initialPreference={themePreference} />
          </div>

          <button
            type='button'
            className={styles.menuButton}
            aria-label={t('menuOpen')}
            onClick={() => setMenuOpen(true)}
          >
            {t('menuTitle')}
          </button>
        </div>
      </Container>

      <Modal
        open={menuOpen}
        onOpenChange={setMenuOpen}
        title={t('menuTitle')}
        closeLabel={t('menuClose')}
      >
        <nav className={styles.mobileNav} aria-label={t('menuTitle')}>
          <ul className={styles.mobileLinks}>
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  className={styles.navLink}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                >
                  {t(item.labelKey)}
                </Link>
              </li>
            ))}
            <li>
              <a className={styles.phone} href={phoneHref} aria-label={t('phoneAria')}>
                {t('phone')}
              </a>
            </li>
          </ul>
          <div className={styles.mobileControls}>
            <LocaleSwitcher />
            <ThemeToggle initialPreference={themePreference} />
          </div>
        </nav>
      </Modal>
    </header>
  );
}
