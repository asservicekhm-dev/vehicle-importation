import type { Block } from 'payload';

export const ServiceFaqBlock: Block = {
  slug: 'service-faq-block',
  labels: { singular: 'Service FAQ', plural: 'Service FAQ sections' },
  interfaceName: 'ServiceFaqBlockFields',
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
      name: 'items',
      type: 'array',
      label: 'FAQ items',
      labels: { singular: 'Item', plural: 'Items' },
      minRows: 1,
      fields: [
        {
          name: 'question',
          type: 'text',
          localized: true,
          required: true,
          label: 'Question',
        },
        {
          name: 'answer',
          type: 'textarea',
          localized: true,
          required: true,
          label: 'Answer',
        },
      ],
    },
    {
      name: 'contactTitle',
      type: 'text',
      localized: true,
      label: 'Contact panel title',
    },
    {
      name: 'contactText',
      type: 'textarea',
      localized: true,
      label: 'Contact panel text',
    },
    {
      name: 'contactPhone',
      type: 'text',
      label: 'Contact phone',
      admin: {
        description: 'Optional override. Falls back to Header / Contacts global on the web.',
      },
    },
  ],
};
