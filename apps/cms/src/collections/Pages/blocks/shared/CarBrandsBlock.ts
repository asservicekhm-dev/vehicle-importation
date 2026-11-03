import type { Block } from 'payload';

export const CarBrandsBlock: Block = {
  slug: 'car-brands-block',
  labels: { singular: 'Car brands marquee', plural: 'Car brands marquees' },
  interfaceName: 'CarBrandsBlockFields',
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
      label: 'Title accent substring',
    },
    {
      name: 'rows',
      type: 'array',
      label: 'Logo rows',
      labels: { singular: 'Row', plural: 'Rows' },
      minRows: 1,
      fields: [
        {
          name: 'logos',
          type: 'array',
          label: 'Logos',
          labels: { singular: 'Logo', plural: 'Logos' },
          fields: [
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              required: true,
              label: 'Logo',
            },
            {
              name: 'name',
              type: 'text',
              localized: true,
              label: 'Brand name',
            },
          ],
        },
      ],
    },
  ],
};
