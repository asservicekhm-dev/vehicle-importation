import type { Block } from 'payload';

import { link } from '@/fields/link';

export const ServiceInfoBlock: Block = {
  slug: 'service-info-block',
  labels: { singular: 'Service info', plural: 'Service info sections' },
  interfaceName: 'ServiceInfoBlockFields',
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      label: 'Title',
    },
    {
      name: 'body',
      type: 'textarea',
      localized: true,
      label: 'Body',
    },
    link({
      appearances: false,
      optional: true,
      overrides: {
        name: 'primaryCta',
        label: 'Primary CTA',
      },
    }),
    link({
      appearances: false,
      optional: true,
      overrides: {
        name: 'secondaryCta',
        label: 'Secondary CTA',
      },
    }),
  ],
};
