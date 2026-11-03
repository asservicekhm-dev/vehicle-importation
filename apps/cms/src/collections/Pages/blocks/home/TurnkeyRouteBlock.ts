import type { Block } from 'payload';

export const TurnkeyRouteBlock: Block = {
  slug: 'turnkey-route-block',
  labels: { singular: 'Turnkey route', plural: 'Turnkey routes' },
  interfaceName: 'TurnkeyRouteBlockFields',
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
      name: 'steps',
      type: 'array',
      label: 'Steps',
      labels: { singular: 'Step', plural: 'Steps' },
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
          label: 'Body (default)',
        },
        {
          name: 'bodyUsa',
          type: 'textarea',
          localized: true,
          label: 'Body override — USA',
        },
        {
          name: 'bodyEurope',
          type: 'textarea',
          localized: true,
          label: 'Body override — Europe',
        },
        {
          name: 'bodyKorea',
          type: 'textarea',
          localized: true,
          label: 'Body override — Korea',
        },
      ],
    },
  ],
};
