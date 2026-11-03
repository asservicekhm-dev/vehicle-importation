import type { Block } from 'payload';

import { link } from '@/fields/link';

export const DirectionsBlock: Block = {
  slug: 'directions-block',
  labels: { singular: 'Directions (services)', plural: 'Directions sections' },
  interfaceName: 'DirectionsBlockFields',
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      label: 'Eyebrow',
    },
    {
      name: 'title',
      type: 'textarea',
      localized: true,
      required: true,
      label: 'Title',
    },
    {
      name: 'titleAccent',
      type: 'text',
      localized: true,
      label: 'Title accent',
      admin: {
        description: 'Second heading line in primary blue (AS Service pattern).',
      },
    },
    {
      name: 'featured',
      type: 'group',
      label: 'Featured service (turnkey)',
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          required: true,
          label: 'Title',
        },
        {
          name: 'body',
          type: 'textarea',
          localized: true,
          label: 'Body',
        },
        link({
          appearances: false,
          optional: true,
          overrides: {
            name: 'cta',
            label: 'Primary CTA (order)',
          },
        }),
        link({
          appearances: false,
          optional: true,
          overrides: {
            name: 'secondaryCta',
            label: 'Secondary CTA (details)',
          },
        }),
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Image',
        },
      ],
    },
    {
      name: 'items',
      type: 'array',
      label: 'Service rows',
      labels: { singular: 'Row', plural: 'Rows' },
      maxRows: 6,
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          required: true,
          label: 'Title',
        },
        {
          name: 'scope',
          type: 'textarea',
          localized: true,
          label: 'Scope / short description',
        },
        link({
          appearances: false,
          optional: true,
          overrides: {
            name: 'link',
            label: 'Primary CTA (order)',
          },
        }),
        link({
          appearances: false,
          optional: true,
          overrides: {
            name: 'secondaryLink',
            label: 'Secondary CTA (details)',
          },
        }),
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Image',
        },
      ],
    },
  ],
};
