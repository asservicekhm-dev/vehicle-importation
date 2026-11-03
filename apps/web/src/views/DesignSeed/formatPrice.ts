import type { Locale } from '@autosearch/config';

type Currency = 'uah' | 'usd';

export function formatPriceAmount(args: {
  amount: number;
  currency: Currency;
  from: boolean;
  fromPrefix: string;
  locale: Locale;
}): string {
  const { amount, currency, from, fromPrefix, locale } = args;
  const formatted = new Intl.NumberFormat(locale === 'ua' ? 'uk-UA' : 'en-US').format(amount);

  let figure: string;
  if (currency === 'usd') {
    figure = `$${formatted}`;
  } else if (locale === 'ua') {
    figure = `${formatted} грн`;
  } else {
    figure = `${formatted} UAH`;
  }

  return from ? `${fromPrefix} ${figure}` : figure;
}
