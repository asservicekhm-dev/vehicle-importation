'use client';

import { useTranslations } from 'next-intl';

import { CMSLink } from '@/components/CMSLink';
import { Container } from '@/components/Container';
import { ThemeLogo } from '@/components/ThemeLogo';
import { useGlobals } from '@/contexts/GlobalsContext';
import { Link } from '@/i18n/navigation';
import { getMediaUrl } from '@/lib/cms/resolveMediaUrl';

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
  const description = footer?.description?.trim();
  const logoText = footer?.logoText?.trim() || '';
  const hasMark = Boolean(getMediaUrl(footer?.logoLight) || getMediaUrl(footer?.logoDark));
  const brandLabel = logoText || t('brand');
  const showBrandText = Boolean(logoText) || !hasMark;

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.inner}>
          <div className={styles.brandBlock}>
            <Link className={styles.brand} href='/' aria-label={brandLabel}>
              <ThemeLogo
                light={footer?.logoLight}
                dark={footer?.logoDark}
                alt={brandLabel}
                size={48}
                onInverse
              />
              {showBrandText ? <span className={styles.brandText}>{brandLabel}</span> : null}
            </Link>
            {description ? <p className={styles.description}>{description}</p> : null}
          </div>
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
