import { RenderBlocks } from '@/components/RenderBlocks';
import type { Page } from '@autosearch/cms/payload-types';

/** Shared blocks shell for all viewTypes until specialized views land in M4/M5. */
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

export function renderBlog({ page }: { page: Page }) {
  return renderBlocksLayout(page);
}
