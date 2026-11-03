import type { GlobalConfig } from 'payload';

import { link } from '@/fields/link';

import { makeRevalidateGlobal } from './hooks/revalidateGlobal';

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Header',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'logoLight',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo (light theme)',
      admin: {
        description: 'Dark mark for light backgrounds. Prefer WebP.',
      },
    },
    {
      name: 'logoDark',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo (dark theme)',
      admin: {
        description: 'Light mark for dark backgrounds. Prefer WebP.',
      },
    },
    {
      name: 'logoText',
      type: 'text',
      localized: true,
      label: 'Logo text',
      admin: {
        description: 'Wordmark shown next to the logo mark. Leave empty to hide.',
      },
    },
    {
      admin: {
        components: {
          RowLabel: '@/fields/CustomRowLabel#CustomRowLabel',
        },
        description: 'Primary navigation links.',
      },
      fields: [
        link({
          appearances: false,
          overrides: {
            label: 'Link',
          },
        }),
      ],
      label: 'Navigation',
      labels: {
        plural: 'Nav items',
        singular: 'Nav item',
      },
      name: 'navItems',
      type: 'array',
    },
    link({
      appearances: false,
      optional: true,
      overrides: {
        label: 'CTA link',
        name: 'ctaLink',
        admin: {
          description: 'Primary call-to-action in the header.',
        },
      },
    }),
    {
      name: 'phone',
      label: 'Phone number',
      type: 'text',
      required: false,
      admin: {
        description: 'E.g. "+380 (98) 525 52 11".',
      },
    },
  ],
  hooks: {
    afterChange: [makeRevalidateGlobal('global_header')],
  },
};
