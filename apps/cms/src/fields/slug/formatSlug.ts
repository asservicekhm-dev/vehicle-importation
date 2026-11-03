import type { FieldHook } from 'payload';
import slugify from 'slugify';

/** Slugify path segments separately so nested page slugs like `services/perevirka` keep `/`. */
export const formatSlug = (val: string) => {
  if (typeof val !== 'string') return val;

  return val
    .split('/')
    .map((segment) =>
      slugify(segment, {
        lower: true,
        strict: true,
      }),
    )
    .filter(Boolean)
    .join('/');
};

export const formatSlugHook =
  (fallback: string): FieldHook =>
  ({ data, operation, value }) => {
    if (typeof value === 'string') {
      return formatSlug(value);
    }

    if (operation === 'create' || !data?.slug) {
      const fallbackData = data?.[fallback];

      if (fallbackData && typeof fallbackData === 'string') {
        return formatSlug(fallbackData);
      }
    }

    return value;
  };
