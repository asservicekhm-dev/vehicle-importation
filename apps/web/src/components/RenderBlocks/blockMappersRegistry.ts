import type { UnifiedBlockMapper } from './blockTypes';
import { unifiedBlocksMapper } from './unifiedBlocksMapper';

export const BLOCK_MAPPERS = {
  unified: unifiedBlocksMapper,
} as const satisfies Record<string, UnifiedBlockMapper>;

export type MapperKey = keyof typeof BLOCK_MAPPERS;
