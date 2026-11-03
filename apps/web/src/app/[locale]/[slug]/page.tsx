import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import {
  renderBlog,
  renderContacts,
  renderHome,
  renderInformation,
} from '@/appViewHandlers/pageBySlugViewHandlers';
import { getPageBySlug } from '@/lib/cms/getPageBySlug';
import { isLocale, type Locale } from '@autosearch/config';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

export default async function CmsPage({ params }: Props) {
  const { slug, locale: localeParam } = await params;

  if (!isLocale(localeParam)) notFound();

  const locale = localeParam as Locale;
  setRequestLocale(locale);

  const page = await getPageBySlug(slug, locale);

  switch (page.viewType) {
    case 'home':
      return renderHome({ page });
    case 'information':
      return renderInformation({ page });
    case 'contacts':
      return renderContacts({ page });
    case 'blog':
      return renderBlog({ page });
    default:
      return null;
  }
}
