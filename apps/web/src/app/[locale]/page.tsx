import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { renderHome } from '@/appViewHandlers/pageBySlugViewHandlers';
import { HOME_SLUG } from '@/lib/cms/constants';
import { getPageBySlug } from '@/lib/cms/getPageBySlug';
import { isLocale, type Locale } from '@autosearch/config';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) notFound();

  const locale = localeParam as Locale;
  setRequestLocale(locale);

  const page = await getPageBySlug(HOME_SLUG, locale);

  return renderHome({ page });
}
