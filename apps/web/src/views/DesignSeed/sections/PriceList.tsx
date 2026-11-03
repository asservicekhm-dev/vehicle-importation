import { Container } from '@/components/Container';
import type { PriceList as PriceListGlobal } from '@autosearch/cms/payload-types';
import type { Locale } from '@autosearch/config';

import type { DesignSeedContent } from '../content';
import { PriceCard } from './PriceCard';

import styles from './PriceList.module.scss';

type Props = {
  content: DesignSeedContent['prices'];
  priceList: PriceListGlobal | null;
  locale: Locale;
};

/** Heuristic: turnkey / під ключ is the featured product card. */
function isFeaturedGroup(title: string | null | undefined, index: number, total: number) {
  const normalized = title?.toLowerCase() ?? '';
  if (/під\s*ключ|turnkey|ключ/.test(normalized)) return true;
  // Fallback: second sheet when there are exactly two (inspection, turnkey).
  return total === 2 && index === 1;
}

export function PriceListSection({ content, priceList, locale }: Props) {
  const groups = priceList?.groups?.filter((g) => g?.title) ?? [];
  if (!groups.length) return null;

  const heading = priceList?.title?.trim() || content.title;

  return (
    <section className={styles.section} id='prices'>
      <Container>
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
              addonsHeading={content.addonsHeading}
              fromPrefix={content.fromPrefix}
              locale={locale}
              featured={isFeaturedGroup(group.title, index, groups.length)}
              index={index}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
