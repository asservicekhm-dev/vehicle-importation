import type { Payload } from 'payload';

import type { Locale } from '@autosearch/config';

const skip = { skipRevalidate: true } as const;

/** Pre-fix `formatSlug` collapsed `services/foo` → `servicesfoo`; still match those docs. */
function legacyFlatSlug(slug: string): string | null {
  if (!slug.includes('/')) return null;
  const flat = slug.replaceAll('/', '');
  return flat && flat !== slug ? flat : null;
}

async function findPageIdBySlug(payload: Payload, slug: string): Promise<string | null> {
  const candidates = [slug, legacyFlatSlug(slug)].filter((value): value is string => Boolean(value));

  for (const locale of ['ua', 'en'] as const) {
    for (const candidate of candidates) {
      const existing = await payload.find({
        collection: 'pages',
        where: { slug: { equals: candidate } },
        limit: 1,
        locale,
        depth: 0,
      });
      if (existing.docs[0]?.id) return existing.docs[0].id;
    }
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
      // Always re-assert slug so nested paths survive formatSlug migrations.
      data: { ...args.data, slug: args.slug },
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
