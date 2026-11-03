'use client';

import { useTranslations } from 'next-intl';

import { CMSLink } from '@/components/CMSLink';
import { Container } from '@/components/Container';
import { useGlobals } from '@/contexts/GlobalsContext';
import { Link } from '@/i18n/navigation';

import styles from './Footer.module.scss';

const FALLBACK_NAV = [
  { href: '/about', labelKey: 'navAbout' as const },
  { href: '/services', labelKey: 'navServices' as const },
  { href: '/contacts', labelKey: 'navContacts' as const },
];

export function Footer() {
  const t = useTranslations('Footer');
  const { footer } = useGlobals();

  const cmsNav = footer?.navItems?.filter((item) => item.link?.label) ?? [];
  const copyright = footer?.copyrightText?.trim() || t('copyright');

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.inner}>
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
          <div className={styles.meta}>
            <p className={styles.copyright}>{copyright}</p>
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
