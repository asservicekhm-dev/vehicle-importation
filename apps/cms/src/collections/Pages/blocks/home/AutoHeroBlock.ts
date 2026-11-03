import type { Block } from 'payload';

import { link } from '@/fields/link';

export const AutoHeroBlock: Block = {
  slug: 'auto-hero-block',
  labels: { singular: 'Auto hero', plural: 'Auto heroes' },
  interfaceName: 'AutoHeroBlockFields',
  fields: [
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Background image (fallback)',
      admin: {
        description:
          'Used when an origin has no image. Prefer setting an image on each origin for the switcher crossfade.',
      },
    },
    {
      name: 'title',
      type: 'textarea',
      localized: true,
      required: true,
      label: 'Title',
      admin: {
        description:
          'Wrap highlighted phrases in [[double brackets]], e.g. Авто [[під ключ]] зі [[США]].',
      },
    },
    {
      name: 'subtitle',
      type: 'textarea',
      localized: true,
      label: 'Subtitle',
      admin: {
        description: 'Same [[accent]] markers as the title.',
      },
    },
    {
      name: 'buttons',
      type: 'array',
      label: 'Buttons',
      maxRows: 2,
      fields: [
        link({ appearances: false, overrides: { label: 'Link' } }),
        {
          name: 'style',
          type: 'select',
          required: true,
          defaultValue: 'primary',
          label: 'Style',
          options: [
            { label: 'Primary', value: 'primary' },
            { label: 'Outline', value: 'outline' },
            { label: 'Ghost', value: 'ghost' },
          ],
        },
      ],
    },
    {
      name: 'highlights',
      type: 'array',
      label: 'Strong points',
      labels: { singular: 'Point', plural: 'Points' },
      maxRows: 6,
      admin: {
        description: 'Trust / why-us strip under the hero (Yastreb-style value props).',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          localized: true,
          required: true,
          label: 'Label',
          admin: {
            description: 'Supports [[accent]] markers.',
          },
        },
      ],
    },
    {
      name: 'origins',
      type: 'array',
      label: 'Origins',
      labels: { singular: 'Origin', plural: 'Origins' },
      minRows: 1,
      maxRows: 3,
      fields: [
        {
          name: 'originId',
          type: 'select',
          required: true,
          label: 'Origin id',
          options: [
            { label: 'USA', value: 'usa' },
            { label: 'Europe', value: 'europe' },
            { label: 'Korea', value: 'korea' },
          ],
        },
        {
          name: 'label',
          type: 'text',
          localized: true,
          required: true,
          label: 'Label',
        },
        {
          name: 'term',
          type: 'text',
          localized: true,
          label: 'Typical term',
        },
        {
          name: 'check',
          type: 'textarea',
          localized: true,
          label: 'What we check',
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Origin image',
        },
      ],
    },
  ],
};
