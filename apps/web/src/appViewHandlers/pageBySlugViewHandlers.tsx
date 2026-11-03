import { getTranslations } from 'next-intl/server';

import { RenderBlocks } from '@/components/RenderBlocks';
import { getBlogPosts } from '@/lib/cms/getBlogPosts';
import { BlogList } from '@/views/Blog';
import type { Page } from '@autosearch/cms/payload-types';
import type { Locale } from '@autosearch/config';

/** Shared blocks shell for marketing / information pages. */
function renderBlocksLayout(page: Page) {
  return <RenderBlocks blocks={page.layout} mapperKey='unified' />;
}

export function renderHome({ page }: { page: Page }) {
  return renderBlocksLayout(page);
}

export function renderInformation({ page }: { page: Page }) {
  return renderBlocksLayout(page);
}

export function renderContacts({ page }: { page: Page }) {
  return renderBlocksLayout(page);
}

export async function renderBlog({ page, locale }: { page: Page; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'Blog' });
  const { docs } = await getBlogPosts(locale);
  const readMore = page.blogReadMoreLabel?.trim() || t('readMore');

  return (
    <>
      {page.layout?.length ? <RenderBlocks blocks={page.layout} mapperKey='unified' /> : null}
      <BlogList page={page} posts={docs} readMoreLabel={readMore} emptyLabel={t('empty')} />
    </>
  );
}
