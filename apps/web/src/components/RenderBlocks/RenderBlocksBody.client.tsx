'use client';

import type { ReactNode } from 'react';

import { OriginProvider } from '@/components/OriginProvider';

import { BLOCK_MAPPERS, type MapperKey } from './blockMappersRegistry';
import type { UnifiedBlock } from './blockTypes';

import styles from './RenderBlocks.module.scss';

type Props = {
  blocks: UnifiedBlock[];
  mapperKey: MapperKey;
};

export function RenderBlocksBody({ blocks, mapperKey }: Props) {
  const mapper = BLOCK_MAPPERS[mapperKey];

  if (!blocks.length) return null;

  return (
    <OriginProvider>
      <div className={styles.list}>
        {blocks.map((block, index) => {
          const render = mapper[block.blockType] as ((b: UnifiedBlock) => ReactNode) | undefined;

          if (!render) return null;

          const key = block.id ?? `${block.blockType}-${index}`;

          return (
            <div key={key} className={styles.item}>
              {render(block)}
            </div>
          );
        })}
      </div>
    </OriginProvider>
  );
}
