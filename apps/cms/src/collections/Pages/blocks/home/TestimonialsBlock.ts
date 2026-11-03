import type { Block } from 'payload';

export const TestimonialsBlock: Block = {
  slug: 'testimonials-block',
  labels: { singular: 'Testimonials', plural: 'Testimonials sections' },
  interfaceName: 'TestimonialsBlockFields',
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      label: 'Eyebrow',
      admin: { description: 'Small uppercase label, e.g. "Відгуки клієнтів".' },
    },
    {
      name: 'titleAccent',
      type: 'text',
      localized: true,
      label: 'Title accent',
      admin: {
        description: 'First (accent) line rendered in accent color. E.g. "Нам довіряють".',
      },
    },
    {
      name: 'title',
      type: 'textarea',
      localized: true,
      required: true,
      label: 'Title',
      admin: { description: 'Second line in on-brand white. E.g. "свої авто".' },
    },
    {
      name: 'items',
      type: 'array',
      label: 'Items',
      labels: { singular: 'Item', plural: 'Items' },
      minRows: 1,
      fields: [
        {
          name: 'quote',
          type: 'textarea',
          localized: true,
          required: true,
          label: 'Quote',
        },
        {
          name: 'authorName',
          type: 'text',
          localized: true,
          required: true,
          label: 'Author name',
        },
        {
          name: 'authorRole',
          type: 'text',
          localized: true,
          label: 'Author role / car',
        },
        {
          name: 'avatar',
          type: 'upload',
          relationTo: 'media',
          label: 'Avatar',
        },
      ],
    },
  ],
};
