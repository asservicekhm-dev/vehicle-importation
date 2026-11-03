'use client';

import { useLocale } from 'next-intl';

import { AnimatedContent } from '@/components/AnimatedContent';
import { Container } from '@/components/Container';
import { PriceCard } from '@/components/PriceCard';
import { useGlobals } from '@/contexts/GlobalsContext';
import type { PriceListBlockFields } from '@autosearch/cms/payload-types';
import { isLocale } from '@autosearch/config';

import styles from './PriceListSection.module.scss';

type Props = PriceListBlockFields;

function isFeaturedGroup(title: string | null | undefined, index: number, total: number) {
  const normalized = title?.toLowerCase() ?? '';
  if (/під\s*ключ|turnkey|ключ/.test(normalized)) return true;
  return total === 2 && index === 1;
}

export function PriceListSection({
  id,
  blockName,
  titleOverride,
  addonsHeading,
  fromPrefix,
}: Props) {
  const { priceList } = useGlobals();
  const localeParam = useLocale();
  const locale = isLocale(localeParam) ? localeParam : 'ua';

  const groups = priceList?.groups?.filter((g) => g?.title) ?? [];
  if (!groups.length) return null;

  const heading = titleOverride?.trim() || priceList?.title?.trim();
  if (!heading) return null;

  const addonsLabel = addonsHeading?.trim() || (locale === 'ua' ? 'Додатково' : 'Add-ons');
  const fromLabel = fromPrefix?.trim() || (locale === 'ua' ? 'від' : 'From');
  const sectionId = (blockName || id || 'prices').toString();

  return (
    <section className={styles.section} id={sectionId}>
      <Container>
        <AnimatedContent distance={64} duration={0.75} threshold={0.15} stagger={0.08}>
          <h2 className={styles.heading}>{heading}</h2>
          <div className={styles.grid} data-animate='price-grid'>
            {groups.map((group, index) => (
              <PriceCard
                key={group.id ?? index}
                title={group.title!}
                basisLabel={group.basisLabel}
                rows={group.rows}
                addons={group.addons}
                notes={group.notes}
                addonsHeading={addonsLabel}
                fromPrefix={fromLabel}
                locale={locale}
                featured={isFeaturedGroup(group.title, index, groups.length)}
                index={index}
              />
            ))}
          </div>
        </AnimatedContent>
      </Container>
    </section>
  );
}
