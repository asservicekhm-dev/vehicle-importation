import clsx from 'clsx';

import { formatPriceAmount } from '@/lib/formatPrice';
import type { Locale } from '@autosearch/config';

import styles from './PriceCard.module.scss';

export type PriceCardRow = {
  id?: string | null;
  label?: string | null;
  amount?: number | null;
  currency?: 'uah' | 'usd' | null;
  from?: boolean | null;
};

type Props = {
  title: string;
  basisLabel?: string | null;
  rows?: PriceCardRow[] | null;
  addons?: PriceCardRow[] | null;
  notes?: Array<{ id?: string | null; text?: string | null } | null> | null;
  addonsHeading: string;
  fromPrefix: string;
  locale: Locale;
  featured?: boolean;
  index?: number;
};

function formatRow(row: PriceCardRow, fromPrefix: string, locale: Locale) {
  if (row.amount == null || !row.currency || !row.label) return null;
  return formatPriceAmount({
    amount: row.amount,
    currency: row.currency,
    from: Boolean(row.from),
    fromPrefix,
    locale,
  });
}

export function PriceCard({
  title,
  basisLabel,
  rows,
  addons,
  notes,
  addonsHeading,
  fromPrefix,
  locale,
  featured = false,
  index = 0,
}: Props) {
  const tiers = rows?.filter((row) => row?.label && row.amount != null && row.currency) ?? [];
  const addonRows = addons?.filter((row) => row?.label && row.amount != null && row.currency) ?? [];
  const footnotes = notes?.filter((note) => note?.text?.trim()) ?? [];

  if (!title || !tiers.length) return null;

  return (
    <article
      className={clsx(styles.card, featured && styles.featured)}
      data-animate='price-card'
      data-animate-index={index}
      data-featured={featured ? 'true' : undefined}
    >
      <header className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {basisLabel ? <p className={styles.basis}>{basisLabel}</p> : null}
      </header>

      <ul className={styles.tiers}>
        {tiers.map((row, tierIndex) => {
          const amount = formatRow(row, fromPrefix, locale);
          if (!amount) return null;
          return (
            <li
              key={row.id ?? `${row.label}-${tierIndex}`}
              className={styles.tier}
              data-animate='price-tier'
              data-animate-index={tierIndex}
            >
              <p className={styles.tierLabel}>{row.label}</p>
              <p className={styles.tierAmount}>{amount}</p>
            </li>
          );
        })}
      </ul>

      {addonRows.length ? (
        <div className={styles.addons}>
          <p className={styles.addonsHeading}>{addonsHeading}</p>
          <ul className={styles.addonList}>
            {addonRows.map((row, addonIndex) => {
              const amount = formatRow(row, fromPrefix, locale);
              if (!amount) return null;
              return (
                <li key={row.id ?? `${row.label}-addon-${addonIndex}`} className={styles.addon}>
                  <p className={styles.addonLabel}>{row.label}</p>
                  <p className={styles.addonAmount}>{amount}</p>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {footnotes.length ? (
        <ul className={styles.notes}>
          {footnotes.map((note, noteIndex) => (
            <li key={note?.id ?? noteIndex}>
              <p className={styles.note}>{note?.text}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
