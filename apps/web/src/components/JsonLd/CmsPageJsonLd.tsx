import { getTranslations } from 'next-intl/server';

import { JsonLd } from '@/components/JsonLd/JsonLd';
import { HOME_SLUG } from '@/lib/cms/constants';
import { breadcrumbJsonLd, faqJsonLd } from '@/lib/seo/jsonLd';
import type { Page } from '@autosearch/cms/payload-types';
import type { Locale } from '@autosearch/config';

type Props = {
  page: Page;
  locale: Locale;
};

export async function CmsPageJsonLd({ page, locale }: Props) {
  const t = await getTranslations('common');
  const slug = page.slug?.trim() || HOME_SLUG;
  const title = page.title?.trim();
  const data = [
    faqJsonLd(page),
    breadcrumbJsonLd({
      locale,
      homeName: t('home'),
      crumbs: title && slug !== HOME_SLUG ? [{ name: title, slug }] : [],
    }),
  ].filter((item) => item !== null);

  return <JsonLd data={data} />;
}
