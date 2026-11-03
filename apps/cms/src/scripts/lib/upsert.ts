import type { Payload } from 'payload';

import type { Locale } from '@autosearch/config';

const skip = { skipRevalidate: true } as const;

async function findPageIdBySlug(payload: Payload, slug: string): Promise<string | null> {
  for (const locale of ['ua', 'en'] as const) {
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
      locale,
      depth: 0,
    });
    if (existing.docs[0]?.id) return existing.docs[0].id;
  }
  return null;
}

export async function upsertPageBySlug(
  payload: Payload,
  args: {
    slug: string;
    locale: Locale;
    data: Record<string, unknown>;
  },
): Promise<{ id: string }> {
  const id = await findPageIdBySlug(payload, args.slug);

  if (id) {
    const doc = await payload.update({
      collection: 'pages',
      id,
      locale: args.locale,
      data: args.data,
      context: skip,
      draft: false,
    });
    return { id: doc.id };
  }

  const doc = await payload.create({
    collection: 'pages',
    locale: args.locale,
    data: {
      title: String(args.data.title ?? args.slug),
      viewType:
        (args.data.viewType as 'home' | 'information' | 'contacts' | 'blog') ?? 'information',
      slug: args.slug,
      ...args.data,
      _status: 'published',
    } as never,
    context: skip,
    draft: false,
  });
  return { id: doc.id };
}

export function updateGlobalLocale(
  payload: Payload,
  slug: 'header' | 'footer' | 'contacts' | 'site-settings' | 'price-list',
  locale: Locale,
  data: Record<string, unknown>,
) {
  return payload.updateGlobal({
    slug,
    locale,
    data,
    context: skip,
  });
}
