import type { CheckboxField, TextField } from 'payload';

import { formatSlugHook } from './formatSlug';

type Overrides = {
  checkboxOverrides?: Partial<CheckboxField>;
  slugOverrides?: Partial<TextField>;
};

type Slug = (fieldToUse?: string, overrides?: Overrides) => [TextField, CheckboxField];

export const slugField: Slug = (fieldToUse = 'title', overrides = {}) => {
  const { checkboxOverrides, slugOverrides } = overrides;

  const checkBoxField: CheckboxField = {
    admin: {
      hidden: true,
      position: 'sidebar',
    },
    defaultValue: true,
    name: 'slugLock',
    type: 'checkbox',
    ...checkboxOverrides,
  };

  // @ts-expect-error Partial TextField overrides are intentional.
  const slugField: TextField = {
    index: true,
    label: 'Slug',
    name: 'slug',
    type: 'text',
    localized: true,
    ...(slugOverrides || {}),
    admin: {
      position: 'sidebar',
      ...(slugOverrides?.admin || {}),
      components: {
        Field: {
          clientProps: {
            checkboxFieldPath: checkBoxField.name,
            fieldToUse,
          },
          path: '@/fields/slug/SlugComponent#SlugComponent',
        },
      },
    },
    hooks: {
      beforeValidate: [formatSlugHook(fieldToUse)],
    },
  };

  return [slugField, checkBoxField];
};
