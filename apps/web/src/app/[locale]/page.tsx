import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { renderHome } from '@/appViewHandlers/pageBySlugViewHandlers';
import { CmsPageJsonLd } from '@/components/JsonLd/CmsPageJsonLd';
import { HOME_SLUG } from '@/lib/cms/constants';
import { getPageBySlug } from '@/lib/cms/getPageBySlug';
import { generatePageMetadata } from '@/lib/seo/pageMetadata';
import { isLocale, type Locale } from '@autosearch/config';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) return { robots: 'noindex' };

  const locale = localeParam as Locale;
  try {
    const page = await getPageBySlug(HOME_SLUG, locale);
    return generatePageMetadata(page, locale);
  } catch {
    return { robots: 'noindex' };
  }
}

export default async function HomePage({ params }: Props) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) notFound();

  const locale = localeParam as Locale;
  setRequestLocale(locale);

  const page = await getPageBySlug(HOME_SLUG, locale);

  return (
    <>
      <CmsPageJsonLd page={page} locale={locale} />
      {renderHome({ page })}
    </>
  );
}
