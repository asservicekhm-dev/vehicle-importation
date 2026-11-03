'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { CMSLink } from '@/components/CMSLink';
import { Container } from '@/components/Container';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { Modal } from '@/components/Modal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useGlobals } from '@/contexts/GlobalsContext';
import { Link } from '@/i18n/navigation';
import type { ThemePreference } from '@autosearch/config';

import styles from './Header.module.scss';

const FALLBACK_NAV = [
  { href: '/about', labelKey: 'navAbout' as const },
  { href: '/services', labelKey: 'navServices' as const },
  { href: '/contacts', labelKey: 'navContacts' as const },
];

type Props = {
  themePreference: ThemePreference;
  enableThemeToggle?: boolean;
};

export function Header({ themePreference, enableThemeToggle = true }: Props) {
  const t = useTranslations('Header');
  const { header } = useGlobals();
  const [menuOpen, setMenuOpen] = useState(false);

  const cmsNav = header?.navItems?.filter((item) => item.link?.label) ?? [];
  const phone = header?.phone?.trim() || t('phone');
  const phoneHref = `tel:${phone.replace(/\s+/g, '')}`;

  return (
    <header className={styles.header}>
      <Container>
        <div className={styles.inner}>
          <Link className={styles.brand} href='/'>
            {t('brand')}
          </Link>

          <nav className={styles.desktopNav} aria-label={t('menuTitle')}>
            <ul className={styles.navList}>
              {cmsNav.length > 0
                ? cmsNav.map((item, index) => (
                    <li key={item.id ?? index}>
                      <CMSLink className={styles.navLink} link={item.link} />
                    </li>
                  ))
                : FALLBACK_NAV.map((item) => (
                    <li key={item.href}>
                      <Link className={styles.navLink} href={item.href}>
                        {t(item.labelKey)}
                      </Link>
                    </li>
                  ))}
            </ul>
            <a className={styles.phone} href={phoneHref} aria-label={t('phoneAria')}>
              {phone}
            </a>
          </nav>

          <div className={styles.controls}>
            <LocaleSwitcher />
            {enableThemeToggle ? <ThemeToggle initialPreference={themePreference} /> : null}
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
            {cmsNav.length > 0
              ? cmsNav.map((item, index) => (
                  <li key={item.id ?? index}>
                    <CMSLink className={styles.navLink} link={item.link} />
                  </li>
                ))
              : FALLBACK_NAV.map((item) => (
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
                {phone}
              </a>
            </li>
          </ul>
          <div className={styles.mobileControls}>
            <LocaleSwitcher />
            {enableThemeToggle ? <ThemeToggle initialPreference={themePreference} /> : null}
          </div>
        </nav>
      </Modal>
    </header>
  );
}
