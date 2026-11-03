import type { MapperKey } from './blockMappersRegistry';
import type { UnifiedBlockStub } from './blockTypes';
import { RenderBlocksBody } from './RenderBlocksBody.client';

type Props = {
  blocks?: UnifiedBlockStub[] | null;
  mapperKey?: MapperKey;
};

export function RenderBlocks({ blocks, mapperKey = 'unified' }: Props) {
  if (!blocks?.length) return null;

  return <RenderBlocksBody blocks={blocks} mapperKey={mapperKey} />;
}
