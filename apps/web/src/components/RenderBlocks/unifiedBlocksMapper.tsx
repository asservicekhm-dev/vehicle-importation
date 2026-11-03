import { DummySection } from '@/components/DummySection';

import type { UnifiedBlockMapper } from './blockTypes';

export const unifiedBlocksMapper = {
  'dummy-section': (block) => <DummySection {...block} />,
} satisfies UnifiedBlockMapper;
