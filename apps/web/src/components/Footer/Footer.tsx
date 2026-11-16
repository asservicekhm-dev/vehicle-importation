'use client';

import { useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { CMSLink } from '@/components/CMSLink';
import { CMSMedia } from '@/components/CMSMedia';
import { useGlobals } from '@/contexts/GlobalsContext';
import { Link } from '@/i18n/navigation';
import { smoothScrollToTop } from '@/lib/smoothScrollTo';
import type { Contact, Header, Media } from '@autosearch/cms/payload-types';
import {
  defaultAddressEn,
  defaultAddressUa,
  defaultEmail,
  defaultFacebookUrl,
  defaultHoursEn,
  defaultHoursUa,
  defaultInstagramUrl,
  defaultPhoneDisplay,
} from '@autosearch/config';

import styles from './Footer.module.scss';

type NavLink = NonNullable<NonNullable<Header['navItems']>[number]>['link'];

type NavRow = {
  id?: string | null;
  link: NavLink;
};

type SocialRow = {
  id?: string | null;
  label: string;
  url: string;
  icon?: (string | null) | Media;
};

const FALLBACK_NAV: { href: string; labelKey: 'navAbout' | 'navServices' | 'navContacts' }[] = [
  { href: '#about', labelKey: 'navAbout' },
  { href: '#services', labelKey: 'navServices' },
  { href: '#contacts', labelKey: 'navContacts' },
];

function extractNavRows(raw: unknown): NavRow[] {
  if (!Array.isArray(raw)) return [];

  const rows: NavRow[] = [];
  raw.forEach((item, index) => {
    if (!item || typeof item !== 'object' || !('link' in item)) return;
    const link = (item as { id?: string | null; link?: NavLink }).link;
    if (!link?.label?.trim()) return;
    rows.push({
      id: (item as { id?: string | null }).id ?? `nav-${index}`,
      link,
    });
  });
  return rows;
}

function contactSocials(contact: Contact | null): SocialRow[] {
  const list = contact?.socialLinks;
  const rows: SocialRow[] = [];

  list?.forEach((item, index) => {
    const label = item?.label?.trim() ?? '';
    const url = item?.url?.trim() ?? '';
    if (!label || !url) return;
    rows.push({
      id: item.id ?? `soc-${index}`,
      label,
      url,
      icon: item.icon,
    });
  });

  if (rows.length === 0) {
    rows.push({ id: 'fallback-instagram', label: 'Instagram', url: defaultInstagramUrl });
    rows.push({ id: 'fallback-facebook', label: 'Facebook', url: defaultFacebookUrl });
  }

  return rows;
}

function phoneToTelHref(phone: string): string {
  const compact = phone.replace(/[^\d+]/g, '');
  if (compact.startsWith('+')) return `tel:${compact}`;
  return `tel:${compact.replace(/\D/g, '')}`;
}

function BackToTopButton({ label, ariaLabel, onClick }: { label: string; ariaLabel: string; onClick: () => void }) {
  return (
    <button type='button' className={styles.backToTopBtn} onClick={onClick} aria-label={ariaLabel}>
      <span>{label}</span>
      <svg
        width='10'
        height='10'
        viewBox='0 0 10 10'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        aria-hidden
      >
        <path
          d='M5 8.5V1.5M5 1.5L1.5 5M5 1.5L8.5 5'
          stroke='currentColor'
          strokeWidth='1.2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </button>
  );
}

export function Footer() {
  const t = useTranslations('Footer');
  const locale = useLocale();
  const { contacts, footer, header } = useGlobals();

  const scrollToTop = useCallback(() => {
    smoothScrollToTop({ clearHash: true });
  }, []);

  const fromFooter = extractNavRows(footer?.navItems);
  const fromHeader = extractNavRows(header?.navItems);
  const navItems = fromFooter.length > 0 ? fromFooter : fromHeader;

  const copyright = footer?.copyrightText?.trim() || t('copyright');
  const brandLabel = footer?.logoText?.trim() || t('brand');
  const fallbackAddress = locale === 'en' ? defaultAddressEn : defaultAddressUa;
  const fallbackHours = locale === 'en' ? defaultHoursEn : defaultHoursUa;

  const address = contacts?.address?.trim() || fallbackAddress;
  const hours = contacts?.hours?.trim() || fallbackHours;
  const email = contacts?.email?.trim() || defaultEmail;
  const phone =
    contacts?.phones?.find((p) => p?.number?.trim())?.number?.trim() ||
    header?.phone?.trim() ||
    defaultPhoneDisplay;
  const socialList = contactSocials(contacts);
  const hasContactBlock = Boolean(address || hours || phone || email || socialList.length);

  const renderCmsNav = (keyPrefix: string) =>
    navItems.map((item, index) => (
      <CMSLink key={`${keyPrefix}-${item.id ?? index}`} className={styles.navLink} link={item.link} />
    ));

  const renderFallbackNav = (keyPrefix: string) =>
    FALLBACK_NAV.map((item) => (
      <Link key={`${keyPrefix}-${item.href}`} className={styles.navLink} href={item.href}>
        {t(item.labelKey)}
      </Link>
    ));

  const navContent = (keyPrefix: string) =>
    navItems.length > 0 ? renderCmsNav(keyPrefix) : renderFallbackNav(keyPrefix);

  return (
    <footer id='contacts' className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.navBarDesktop}>
          <nav className={styles.navLinks} aria-label={t('navAria')}>
            {navContent('desktop')}
          </nav>
          <BackToTopButton label={t('backToTop')} ariaLabel={t('backToTopAria')} onClick={scrollToTop} />
        </div>

        <div className={styles.mobileTop}>
          <BackToTopButton label={t('backToTop')} ariaLabel={t('backToTopAria')} onClick={scrollToTop} />
        </div>

        <div className={styles.divider} />

        {hasContactBlock ? (
          <div className={styles.contactSection}>
            <div className={styles.contactRight}>
              {address ? <p className={styles.address}>{address}</p> : null}
              {hours ? <p className={styles.hours}>{hours}</p> : null}
              {phone ? (
                <a className={styles.phone} href={phoneToTelHref(phone)}>
                  {phone}
                </a>
              ) : null}
              {email ? (
                <a className={styles.emailLink} href={`mailto:${email}`}>
                  {email}
                </a>
              ) : null}

              {socialList.length > 0 ? (
                <div className={styles.socials}>
                  {socialList.map((social) => (
                    <a
                      key={social.id}
                      href={social.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className={styles.socialBtn}
                      aria-label={social.label}
                    >
                      {social.icon && typeof social.icon !== 'string' ? (
                        <CMSMedia media={social.icon} className={styles.socialIcon} sizes='22px' />
                      ) : (
                        <span className={styles.socialFallback} aria-hidden>
                          {social.label.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className={styles.dividerMobile} />
        <nav className={styles.navMobile} aria-label={t('navAria')}>
          {navContent('mobile')}
        </nav>

        <div className={styles.divider} />

        <div className={styles.bottomRow}>
          <Link href='/' className={styles.brandLink} aria-label={brandLabel}>
            <span className={styles.brandText}>{brandLabel}</span>
          </Link>
          <p className={styles.copyright}>{copyright}</p>
        </div>
      </div>
    </footer>
  );
}
