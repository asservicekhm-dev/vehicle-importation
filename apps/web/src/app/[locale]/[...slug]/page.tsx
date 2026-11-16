import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import {
  renderBlog,
  renderContacts,
  renderHome,
  renderInformation,
} from '@/appViewHandlers/pageBySlugViewHandlers';
import { CmsPageJsonLd } from '@/components/JsonLd/CmsPageJsonLd';
import { getPageBySlug } from '@/lib/cms/getPageBySlug';
import { generatePageMetadata } from '@/lib/seo/pageMetadata';
import { isLocale, type Locale } from '@autosearch/config';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string[]; locale: string }>;
};

function slugFromParams(segments: string[] | undefined): string {
  if (!segments?.length) return '';
  return segments.map((part) => decodeURIComponent(part)).join('/');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: segments, locale: localeParam } = await params;
  if (!isLocale(localeParam)) return { robots: 'noindex' };

  const locale = localeParam as Locale;
  const slug = slugFromParams(segments);
  if (!slug) return { robots: 'noindex' };

  try {
    const page = await getPageBySlug(slug, locale);
    return generatePageMetadata(page, locale);
  } catch {
    return { robots: 'noindex' };
  }
}

export default async function CmsCatchAllPage({ params }: Props) {
  const { slug: segments, locale: localeParam } = await params;

  if (!isLocale(localeParam)) notFound();

  const locale = localeParam as Locale;
  setRequestLocale(locale);

  const slug = slugFromParams(segments);
  if (!slug) notFound();

  // Dedicated App Router handles `/blog/[postSlug]` — avoid treating it as a CMS page.
  if (segments[0] === 'blog' && segments.length > 1) notFound();

  const page = await getPageBySlug(slug, locale);

  const view = (() => {
    switch (page.viewType) {
      case 'home':
        return renderHome({ page });
      case 'information':
        return renderInformation({ page });
      case 'contacts':
        return renderContacts({ page });
      case 'blog':
        return renderBlog({ page, locale });
      default:
        return renderInformation({ page });
    }
  })();

  return (
    <>
      <CmsPageJsonLd page={page} locale={locale} />
      {view}
    </>
  );
}
