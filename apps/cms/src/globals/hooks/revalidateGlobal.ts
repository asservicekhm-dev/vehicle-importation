import type { GlobalAfterChangeHook } from 'payload';

import { triggerWebRevalidate } from '@/lib/revalidate';

export function makeRevalidateGlobal(tag: string): GlobalAfterChangeHook {
  return ({ doc, req: { context } }) => {
    void triggerWebRevalidate({ tags: [tag, 'globals'] }, context as { skipRevalidate?: boolean });
    return doc;
  };
}
