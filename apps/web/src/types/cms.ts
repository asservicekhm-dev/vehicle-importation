import type { ReactNode } from 'react';

import type { Page } from '@autosearch/cms/payload-types';

export type UnifiedBlock = NonNullable<Page['layout']>[number];

export type DummySectionBlock = Extract<UnifiedBlock, { blockType: 'dummy-section' }>;

export type BlockMapper<TBlock extends { blockType: string }> = {
  [K in TBlock['blockType']]?: (block: Extract<TBlock, { blockType: K }>) => ReactNode;
};
