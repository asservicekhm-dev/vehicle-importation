import type { PriceList } from '@autosearch/cms/payload-types';
import type { BudgetCurrency } from '@autosearch/config';

export type PriceLine = {
  label: string;
  amount: number;
  currency: 'uah' | 'usd';
  from?: boolean;
};

function groups(priceList: PriceList | null | undefined) {
  return priceList?.groups ?? [];
}

/** Inspection sheet = first group; turnkey = second (matches seed order). */
export function inspectionGroup(priceList: PriceList | null | undefined) {
  return groups(priceList)[0] ?? null;
}

export function turnkeyGroup(priceList: PriceList | null | undefined) {
  return groups(priceList)[1] ?? null;
}

export function expertAddon(priceList: PriceList | null | undefined): PriceLine | null {
  const addon = inspectionGroup(priceList)?.addons?.find((item) => {
    const label = item.label?.toLowerCase() ?? '';
    return label.includes('експерт') || label.includes('expert');
  });
  if (!addon) return null;
  return {
    label: addon.label,
    amount: addon.amount,
    currency: addon.currency,
    from: Boolean(addon.from),
  };
}

export function inspectionAddonOptions(priceList: PriceList | null | undefined) {
  return (
    inspectionGroup(priceList)?.addons?.filter((item) => {
      const label = item.label?.toLowerCase() ?? '';
      return !(label.includes('експерт') || label.includes('expert'));
    }) ?? []
  );
}

export function inspectionRangeOptions(priceList: PriceList | null | undefined) {
  return inspectionGroup(priceList)?.rows ?? [];
}

/** Match turnkey fee row from entered car budget (USD bands in seed). */
export function estimateTurnkeyFee(
  priceList: PriceList | null | undefined,
  budget: number,
  currency: BudgetCurrency,
): PriceLine | null {
  if (!Number.isFinite(budget) || budget <= 0) return null;
  const group = turnkeyGroup(priceList);
  const rows = group?.rows ?? [];
  if (!rows.length) return null;

  // Seed bands are USD vehicle budgets. Convert rough EUR≈USD for matching; UAH → /40.
  let budgetUsd = budget;
  if (currency === 'uah') budgetUsd = budget / 40;
  if (currency === 'eur') budgetUsd = budget * 1.08;

  const thresholds = [10_000, 15_000, 20_000, 30_000];
  let index = rows.length - 1;
  for (let i = 0; i < thresholds.length; i++) {
    if (budgetUsd <= thresholds[i]!) {
      index = Math.min(i, rows.length - 1);
      break;
    }
  }

  const row = rows[index];
  if (!row) return null;
  return {
    label: row.label,
    amount: row.amount,
    currency: row.currency,
    from: Boolean(row.from),
  };
}

export function estimateInspectionTotal(
  priceList: PriceList | null | undefined,
  rangeIdOrLabel: string,
  addonIdsOrLabels: string[],
): PriceLine[] {
  const lines: PriceLine[] = [];
  const rows = inspectionRangeOptions(priceList);
  const row = rows.find((item) => item.id === rangeIdOrLabel || item.label === rangeIdOrLabel);
  if (row) {
    lines.push({
      label: row.label,
      amount: row.amount,
      currency: row.currency,
      from: Boolean(row.from),
    });
  }

  for (const key of addonIdsOrLabels) {
    const addon = inspectionAddonOptions(priceList).find(
      (item) => item.id === key || item.label === key,
    );
    if (!addon) continue;
    lines.push({
      label: addon.label,
      amount: addon.amount,
      currency: addon.currency,
      from: Boolean(addon.from),
    });
  }

  return lines;
}

export function formatMoney(amount: number, currency: string, from?: boolean): string {
  const formatted = new Intl.NumberFormat('uk-UA', {
    maximumFractionDigits: 0,
  }).format(amount);
  const code = currency.toUpperCase();
  const prefix = from ? 'від ' : '';
  return `${prefix}${formatted} ${code}`;
}

export function formatBudgetInput(raw: string): string {
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function parseBudgetInput(formatted: string): number {
  const digits = formatted.replace(/[^\d]/g, '');
  if (!digits) return NaN;
  return Number(digits);
}
