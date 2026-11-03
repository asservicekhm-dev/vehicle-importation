import type { Block } from 'payload';

export const ServiceFeatureCardsBlock: Block = {
  slug: 'service-feature-cards-block',
  labels: { singular: 'Service feature cards', plural: 'Service feature card sections' },
  interfaceName: 'ServiceFeatureCardsBlockFields',
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
      label: 'Cards',
      labels: { singular: 'Card', plural: 'Cards' },
      minRows: 1,
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
      ],
    },
  ],
};
