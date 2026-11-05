'use client';

import { useLocale, useTranslations } from 'next-intl';

import { AnimatedContent } from '@/components/AnimatedContent';
import { CMSLink } from '@/components/CMSLink';
import { Container } from '@/components/Container';
import { useGlobals } from '@/contexts/GlobalsContext';
import type { UkraineCoverageBlockFields } from '@autosearch/cms/payload-types';
import { defaultAddressEn, defaultAddressUa } from '@autosearch/config';

import styles from './UkraineCoverage.module.scss';

type Props = UkraineCoverageBlockFields;

function buildEmbedSrc(lat: number, lng: number, locale: string): string {
  const hl = locale === 'en' ? 'en' : 'uk';
  const params = new URLSearchParams({
    q: `${lat},${lng}`,
    z: '16',
    hl,
    output: 'embed',
  });
  return `https://maps.google.com/maps?${params.toString()}`;
}

export function UkraineCoverage({
  id,
  blockName,
  eyebrow,
  title,
  titleAccent,
  body,
  officeLabel,
  officeCity,
  latitude,
  longitude,
  routeUrl,
  routeLabel,
  cities,
  cta,
}: Props) {
  const t = useTranslations('UkraineCoverage');
  const locale = useLocale();
  const { contacts } = useGlobals();

  const heading = title?.trim() ?? '';
  const accent = titleAccent?.trim() ?? '';
  const cityList = cities?.filter((city) => city?.name?.trim()) ?? [];
  const hasCoords =
    typeof latitude === 'number' &&
    Number.isFinite(latitude) &&
    typeof longitude === 'number' &&
    Number.isFinite(longitude);
  const mapsUrl = routeUrl?.trim() ?? '';
  const hasMap = hasCoords && mapsUrl.length > 0;

  if (!heading && !accent && !cityList.length && !hasMap) return null;

  const sectionId = (blockName || id || 'coverage').toString();
  const headingId = `${sectionId}-title`;
  const hasCta = Boolean(cta?.label?.trim());
  const fallbackAddress = locale === 'en' ? defaultAddressEn : defaultAddressUa;
  const address = contacts?.address?.trim() || fallbackAddress;
  const buttonLabel = routeLabel?.trim() || t('route');
  const embedTitle = officeCity?.trim() || address || t('mapTitle');

  return (
    <section
      className={styles.section}
      id={sectionId}
      aria-labelledby={heading || accent ? headingId : undefined}
    >
      <Container>
        <AnimatedContent
          className={styles.layout}
          distance={88}
          duration={0.95}
          stagger={0.08}
        >
          <div className={styles.copy}>
            {eyebrow?.trim() ? <p className={styles.eyebrow}>{eyebrow.trim()}</p> : null}
            {heading || accent ? (
              <h2 id={headingId} className={styles.title}>
                {heading ? <span className={styles.titleMain}>{heading}</span> : null}
                {heading && accent ? ' ' : null}
                {accent ? <span className={styles.titleAccent}>{accent}</span> : null}
              </h2>
            ) : null}
            {body?.trim() ? <p className={styles.body}>{body.trim()}</p> : null}
            {officeLabel?.trim() || officeCity?.trim() ? (
              <p className={styles.office}>
                {officeLabel?.trim() ? (
                  <span className={styles.officeLabel}>{officeLabel.trim()}</span>
                ) : null}
                {officeCity?.trim() ? (
                  <span className={styles.officeCity}>{officeCity.trim()}</span>
                ) : null}
              </p>
            ) : null}
            {address ? <p className={styles.address}>{address}</p> : null}
            {cityList.length ? (
              <ul className={styles.cityList}>
                {cityList.map((city, index) => (
                  <li key={city.id ?? index} className={styles.cityChip}>
                    {city.name}
                  </li>
                ))}
              </ul>
            ) : null}
            {hasCta ? (
              <CMSLink link={cta} className={styles.cta}>
                {cta?.label}
              </CMSLink>
            ) : null}
          </div>

          {hasMap ? (
            <div className={styles.mapCard}>
              <iframe
                className={styles.mapFrame}
                src={buildEmbedSrc(latitude, longitude, locale)}
                title={embedTitle}
                loading='lazy'
                referrerPolicy='no-referrer-when-downgrade'
                allowFullScreen
              />
              <a
                className={styles.routeBtn}
                href={mapsUrl}
                target='_blank'
                rel='noopener noreferrer'
              >
                {buttonLabel}
              </a>
            </div>
          ) : null}
        </AnimatedContent>
      </Container>
    </section>
  );
}
