import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload';

import { triggerWebRevalidate } from '@/lib/revalidate';
import type { Page } from '@/payload-types';

export const revalidatePage: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req: { context },
}) => {
  const tags = ['pages'];
  const paths: string[] = [];

  if (doc.slug) {
    tags.push(`pages:${doc.slug}`);
    paths.push(doc.slug === 'home' ? '/' : `/${doc.slug}`);
  }

  if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
    tags.push(`pages:${previousDoc.slug}`);
    paths.push(previousDoc.slug === 'home' ? '/' : `/${previousDoc.slug}`);
  }

  void triggerWebRevalidate({ tags, paths }, context as { skipRevalidate?: boolean });

  return doc;
};

export const revalidatePageDelete: CollectionAfterDeleteHook<Page> = ({
  doc,
  req: { context },
}) => {
  const tags = ['pages'];
  const paths: string[] = [];

  if (doc?.slug) {
    tags.push(`pages:${doc.slug}`);
    paths.push(doc.slug === 'home' ? '/' : `/${doc.slug}`);
  }

  void triggerWebRevalidate({ tags, paths }, context as { skipRevalidate?: boolean });

  return doc;
};
