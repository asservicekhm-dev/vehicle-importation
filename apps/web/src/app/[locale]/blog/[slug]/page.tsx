import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { JsonLd } from '@/components/JsonLd/JsonLd';
import { getBlogPostBySlug } from '@/lib/cms/getBlogPosts';
import { blogJsonLd } from '@/lib/seo/jsonLd';
import { generatePageMetadata } from '@/lib/seo/pageMetadata';
import { BlogPost } from '@/views/Blog';
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

  return generatePageMetadata(
    {
      id: post.id,
      title: post.title,
      slug: post.slug,
      meta: post.meta,
    },
    locale,
    {
      collection: 'blog',
      openGraphType: 'article',
      publishedTime: post.publishedOn || post.createdAt,
      modifiedTime: post.updatedAt,
    },
  );
}

export default async function BlogPostPage({ params }: Props) {
  const { slug, locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();

  const locale = localeParam as Locale;
  setRequestLocale(locale);

  const post = await getBlogPostBySlug(slug, locale);
  if (!post) notFound();

  const t = await getTranslations('Blog');
  const common = await getTranslations('common');

  return (
    <>
      <JsonLd
        data={await blogJsonLd(post, locale, { home: common('home'), blog: t('indexTitle') })}
      />
      <BlogPost post={post} backLabel={t('backToList')} />
    </>
  );
}
