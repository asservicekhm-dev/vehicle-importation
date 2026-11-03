import type { Block } from 'payload';

export const PageBreadcrumbsBlock: Block = {
  slug: 'page-breadcrumbs-block',
  labels: { singular: 'Page breadcrumbs', plural: 'Page breadcrumbs' },
  interfaceName: 'PageBreadcrumbsBlockFields',
  fields: [
    {
      name: 'currentLabel',
      type: 'text',
      localized: true,
      required: true,
      label: 'Current page label',
    },
    {
      name: 'ancestors',
      type: 'array',
      label: 'Ancestors',
      labels: { singular: 'Ancestor', plural: 'Ancestors' },
      fields: [
        {
          name: 'label',
          type: 'text',
          localized: true,
          required: true,
          label: 'Label',
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          label: 'URL',
        },
      ],
    },
  ],
};
