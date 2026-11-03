import type { Block } from 'payload';

export const ComparisonBlock: Block = {
  slug: 'comparison-block',
  labels: { singular: 'Comparison', plural: 'Comparison sections' },
  interfaceName: 'ComparisonBlockFields',
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
      name: 'intro',
      type: 'textarea',
      localized: true,
      label: 'Intro',
    },
    {
      name: 'leftColumn',
      type: 'group',
      label: 'Left column (without partner)',
      fields: [
        {
          name: 'heading',
          type: 'text',
          localized: true,
          required: true,
          label: 'Heading',
        },
        {
          name: 'items',
          type: 'array',
          label: 'Items',
          labels: { singular: 'Item', plural: 'Items' },
          minRows: 1,
          fields: [
            {
              name: 'text',
              type: 'text',
              localized: true,
              required: true,
              label: 'Text',
            },
          ],
        },
      ],
    },
    {
      name: 'rightColumn',
      type: 'group',
      label: 'Right column (with Autosearch)',
      fields: [
        {
          name: 'heading',
          type: 'text',
          localized: true,
          required: true,
          label: 'Heading',
        },
        {
          name: 'items',
          type: 'array',
          label: 'Items',
          labels: { singular: 'Item', plural: 'Items' },
          minRows: 1,
          fields: [
            {
              name: 'text',
              type: 'text',
              localized: true,
              required: true,
              label: 'Text',
            },
          ],
        },
      ],
    },
  ],
};
