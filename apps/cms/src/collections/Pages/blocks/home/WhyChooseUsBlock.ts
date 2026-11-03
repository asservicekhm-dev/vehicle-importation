import type { Block } from 'payload';

export const WhyChooseUsBlock: Block = {
  slug: 'why-choose-us-block',
  labels: { singular: 'Why choose us', plural: 'Why choose us sections' },
  interfaceName: 'WhyChooseUsBlockFields',
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
      name: 'intro',
      type: 'textarea',
      localized: true,
      label: 'Intro',
    },
    {
      name: 'background',
      type: 'upload',
      relationTo: 'media',
      label: 'Background image',
    },
    {
      name: 'items',
      type: 'array',
      label: 'Reasons',
      labels: { singular: 'Reason', plural: 'Reasons' },
      minRows: 1,
      fields: [
        {
          name: 'iconKey',
          type: 'select',
          label: 'Icon',
          defaultValue: 'check',
          options: [
            { label: 'Check', value: 'check' },
            { label: 'Contract', value: 'contract' },
            { label: 'Search', value: 'search' },
            { label: 'Globe', value: 'globe' },
            { label: 'Route', value: 'route' },
            { label: 'Shield', value: 'shield' },
          ],
        },
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
          required: true,
          label: 'Body',
        },
      ],
    },
  ],
};
