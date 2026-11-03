import type { Block } from 'payload';

export const ServiceHeroBlock: Block = {
  slug: 'service-hero-block',
  labels: { singular: 'Service hero', plural: 'Service heroes' },
  interfaceName: 'ServiceHeroBlockFields',
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
      name: 'description',
      type: 'textarea',
      localized: true,
      label: 'Description',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Hero image',
    },
  ],
};
