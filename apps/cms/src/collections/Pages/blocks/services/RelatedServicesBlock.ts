import type { Block } from 'payload';

import { link } from '@/fields/link';

export const RelatedServicesBlock: Block = {
  slug: 'related-services-block',
  labels: { singular: 'Related services', plural: 'Related services sections' },
  interfaceName: 'RelatedServicesBlockFields',
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      label: 'Title',
    },
    {
      name: 'items',
      type: 'array',
      label: 'Services',
      labels: { singular: 'Service', plural: 'Services' },
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
          name: 'body',
          type: 'textarea',
          localized: true,
          label: 'Short description',
        },
        link({
          appearances: false,
          optional: true,
          overrides: {
            name: 'link',
            label: 'Link',
          },
        }),
      ],
    },
  ],
};
