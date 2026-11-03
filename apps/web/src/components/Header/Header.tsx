'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { CMSLink } from '@/components/CMSLink';
import { Container } from '@/components/Container';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { Modal } from '@/components/Modal';
import { ThemeLogo } from '@/components/ThemeLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useGlobals } from '@/contexts/GlobalsContext';
import { Link } from '@/i18n/navigation';
import { getMediaUrl } from '@/lib/cms/resolveMediaUrl';
import { defaultPhoneDisplay, type ThemePreference } from '@autosearch/config';

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

function PhoneIcon() {
  return (
    <svg
      className={styles.phoneIcon}
      width='16'
      height='16'
      viewBox='0 0 18.3 19.85'
      fill='none'
      aria-hidden
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M13.4638 18.3035C12.1438 18.2549 8.40285 17.7379 4.48501 13.821C0.568097 9.90316 0.0520135 6.16316 0.0025135 4.84224C-0.0708198 2.82924 1.47101 0.87399 3.2521 0.110407C3.46658 0.0177934 3.70145 -0.0174674 3.93367 0.00808463C4.16589 0.0336367 4.38747 0.119124 4.57668 0.256157C6.04335 1.32499 7.05535 2.94199 7.92435 4.21341C8.11555 4.49274 8.1973 4.83266 8.15402 5.16839C8.11075 5.50412 7.94547 5.81219 7.68968 6.03391L5.90126 7.36216C5.81486 7.42455 5.75404 7.51618 5.7301 7.62004C5.70616 7.72389 5.72073 7.8329 5.7711 7.92682C6.17626 8.66291 6.89676 9.75924 7.72176 10.5842C8.54676 11.4092 9.69535 12.1774 10.4828 12.6284C10.5815 12.6838 10.6977 12.6993 10.8075 12.6717C10.9173 12.6441 11.0123 12.5754 11.0731 12.4799L12.2373 10.708C12.4513 10.4237 12.767 10.2332 13.1183 10.1765C13.4697 10.1198 13.8293 10.2012 14.1219 10.4037C15.4117 11.2965 16.9168 12.2911 18.0187 13.7018C18.1668 13.8924 18.2611 14.1193 18.2916 14.3587C18.322 14.5982 18.2876 14.8415 18.1919 15.0631C17.4247 16.8533 15.4832 18.3777 13.4638 18.3035Z'
        fill='currentColor'
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <span className={styles.menuIcon} aria-hidden>
      <span className={styles.menuIconLine} />
      <span className={styles.menuIconLine} />
      <span className={styles.menuIconLine} />
    </span>
  );
}

export function Header({ themePreference, enableThemeToggle = true }: Props) {
  const t = useTranslations('Header');
  const { header } = useGlobals();
  const [menuOpen, setMenuOpen] = useState(false);

  const cmsNav = header?.navItems?.filter((item) => item.link?.label) ?? [];
  const phone = header?.phone?.trim() || defaultPhoneDisplay;
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, '')}`;
  const logoText = header?.logoText?.trim() || '';
  const hasMark = Boolean(getMediaUrl(header?.logoLight) || getMediaUrl(header?.logoDark));
  const brandLabel = logoText || t('brand');
  const showBrandText = Boolean(logoText) || !hasMark;

  return (
    <header className={styles.header}>
      <Container>
        <div className={styles.inner}>
          <Link className={styles.brand} href='/' aria-label={brandLabel}>
            <ThemeLogo
              light={header?.logoLight}
              dark={header?.logoDark}
              alt={brandLabel}
              size={48}
              priority
            />
            {showBrandText ? <span className={styles.brandText}>{brandLabel}</span> : null}
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
          </nav>

          <div className={styles.desktopRight}>
            <a className={styles.phonePill} href={phoneHref} aria-label={t('phoneAria')}>
              <span className={styles.phoneIconWrap}>
                <PhoneIcon />
              </span>
              <span className={styles.phoneText}>{phone}</span>
            </a>
            <LocaleSwitcher />
            {enableThemeToggle ? <ThemeToggle initialPreference={themePreference} /> : null}
          </div>

          <div className={styles.mobileRight}>
            <a className={styles.phoneIconButton} href={phoneHref} aria-label={t('phoneAria')}>
              <PhoneIcon />
            </a>
            <button
              type='button'
              className={menuOpen ? `${styles.menuButton} ${styles.menuButtonOpen}` : styles.menuButton}
              aria-label={menuOpen ? t('menuClose') : t('menuOpen')}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <MenuIcon />
            </button>
          </div>
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
                    <CMSLink
                      className={styles.navLink}
                      link={item.link}
                      onNavigate={() => setMenuOpen(false)}
                    />
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
              <a className={styles.phonePill} href={phoneHref} aria-label={t('phoneAria')}>
                <span className={styles.phoneIconWrap}>
                  <PhoneIcon />
                </span>
                <span className={styles.phoneText}>{phone}</span>
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
