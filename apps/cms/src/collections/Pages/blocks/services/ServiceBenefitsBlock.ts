import type { Block } from 'payload';

export const ServiceBenefitsBlock: Block = {
  slug: 'service-benefits-block',
  labels: { singular: 'Service benefits', plural: 'Service benefits sections' },
  interfaceName: 'ServiceBenefitsBlockFields',
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
      label: 'Benefits',
      labels: { singular: 'Benefit', plural: 'Benefits' },
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
