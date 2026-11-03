import type { Block } from 'payload';

import { link } from '@/fields/link';

export const AboutIntroBlock: Block = {
  slug: 'about-intro-block',
  labels: { singular: 'About intro', plural: 'About intro sections' },
  interfaceName: 'AboutIntroBlockFields',
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
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: 'Description',
    },
    link({
      appearances: false,
      optional: true,
      overrides: { name: 'cta', label: 'CTA' },
    }),
    {
      name: 'images',
      type: 'array',
      label: 'Images',
      maxRows: 2,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Image',
        },
      ],
    },
    {
      name: 'stats',
      type: 'array',
      label: 'Stats',
      maxRows: 4,
      fields: [
        {
          name: 'value',
          type: 'text',
          localized: true,
          required: true,
          label: 'Value',
        },
        {
          name: 'label',
          type: 'textarea',
          localized: true,
          required: true,
          label: 'Label',
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Background image',
          admin: {
            description: 'Optional. With image the card renders dark; without it stays light.',
          },
        },
      ],
    },
  ],
};
