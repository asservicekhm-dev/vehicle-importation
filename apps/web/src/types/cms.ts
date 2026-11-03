import type { ReactNode } from 'react';

/** Local stubs until Milestone 3 generates `@autosearch/cms/payload-types`. */

export type CmsMedia = {
  id?: string;
  url?: string | null;
  alt?: string | null;
  mimeType?: string | null;
  width?: number | null;
  height?: number | null;
};

export type CmsLink = {
  type?: 'custom' | 'reference' | 'anchor' | 'form' | null;
  label?: string | null;
  url?: string | null;
  newTab?: boolean | null;
};

export type DummySectionBlock = {
  blockType: 'dummy-section';
  id?: string | null;
  blockName?: string | null;
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
  ctaLabel?: string | null;
};

export type UnifiedBlockStub = DummySectionBlock;

export type BlockMapper<TBlock extends { blockType: string }> = {
  [K in TBlock['blockType']]?: (block: Extract<TBlock, { blockType: K }>) => ReactNode;
};
