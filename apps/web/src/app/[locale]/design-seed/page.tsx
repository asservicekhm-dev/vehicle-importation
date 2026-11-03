import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { getGlobals } from '@/lib/cms/getGlobals';
import { DesignSeedPage } from '@/views/DesignSeed/DesignSeedPage';
import { isLocale, type Locale } from '@autosearch/config';

type Props = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: 'Design seed — AS Autosearch',
  robots: { index: false, follow: false },
};

export default async function DesignSeedRoute({ params }: Props) {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();

  const locale = localeParam as Locale;
  setRequestLocale(locale);

  const { priceList } = await getGlobals(locale);

  return <DesignSeedPage locale={locale} priceList={priceList} />;
}
