import type { GlobalConfig } from 'payload';

import { link } from '@/fields/link';

import { makeRevalidateGlobal } from './hooks/revalidateGlobal';

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
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
      label: 'Description',
      localized: true,
      name: 'description',
      required: false,
      type: 'textarea',
    },
    {
      admin: {
        components: {
          RowLabel: '@/fields/CustomRowLabel#CustomRowLabel',
        },
        description: 'Footer navigation links.',
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
    {
      fields: [
        link({
          appearances: false,
          overrides: {
            label: 'Link',
          },
        }),
      ],
      label: 'Legal links',
      labels: {
        plural: 'Legal links',
        singular: 'Legal link',
      },
      name: 'legalLinks',
      type: 'array',
    },
    {
      defaultValue: '© AS Autosearch. All rights reserved.',
      label: 'Copyright line',
      localized: true,
      name: 'copyrightText',
      required: false,
      type: 'text',
    },
  ],
  hooks: {
    afterChange: [makeRevalidateGlobal('global_footer')],
  },
};
