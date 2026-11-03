import type { Block } from 'payload';

export const DummySectionBlock: Block = {
  slug: 'dummy-section',
  labels: {
    singular: 'Dummy section',
    plural: 'Dummy sections',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
    },
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'ctaLabel',
      type: 'text',
      localized: true,
    },
  ],
};
