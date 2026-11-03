import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getBlogPostBySlug } from '@/lib/cms/getBlogPosts';
import { generatePageMetadata } from '@/lib/seo/pageMetadata';
import { BlogPost } from '@/views/Blog';
import type { Page } from '@autosearch/cms/payload-types';
import { isLocale, type Locale } from '@autosearch/config';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale: localeParam } = await params;
  if (!isLocale(localeParam)) return { robots: 'noindex' };
  const locale = localeParam as Locale;
  const post = await getBlogPostBySlug(slug, locale);
  if (!post) return { robots: 'noindex' };

  const asPage = {
    title: post.title,
    slug: `blog/${post.slug}`,
    meta: post.meta,
  } as Page;

  return generatePageMetadata(asPage, locale);
}

export default async function BlogPostPage({ params }: Props) {
  const { slug, locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();

  const locale = localeParam as Locale;
  setRequestLocale(locale);

  const post = await getBlogPostBySlug(slug, locale);
  if (!post) notFound();

  const t = await getTranslations('Blog');
  return <BlogPost post={post} backLabel={t('backToList')} />;
}
