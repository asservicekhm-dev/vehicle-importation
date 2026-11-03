import type { GlobalConfig } from 'payload';

import { makeRevalidateGlobal } from './hooks/revalidateGlobal';

const priceRowFields = [
  {
    name: 'label',
    type: 'text' as const,
    required: true,
    localized: true,
    label: 'Label',
  },
  {
    name: 'amount',
    type: 'number' as const,
    required: true,
    label: 'Amount',
    admin: {
      description: 'Numeric amount only — not localized.',
    },
  },
  {
    name: 'currency',
    type: 'select' as const,
    required: true,
    defaultValue: 'uah',
    options: [
      { label: 'UAH', value: 'uah' },
      { label: 'USD', value: 'usd' },
    ],
    label: 'Currency',
  },
  {
    name: 'from',
    type: 'checkbox' as const,
    defaultValue: false,
    label: 'From (prefix)',
    admin: {
      description: 'Shows “від” / “From” before the amount.',
    },
  },
];

export const PriceList: GlobalConfig = {
  slug: 'price-list',
  label: 'Price list',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      label: 'Section title',
    },
    {
      name: 'groups',
      type: 'array',
      label: 'Price sheets',
      labels: {
        singular: 'Sheet',
        plural: 'Sheets',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
          label: 'Sheet title',
        },
        {
          name: 'basisLabel',
          type: 'text',
          localized: true,
          label: 'Basis label',
          admin: {
            description: 'e.g. Vehicle price / Vehicle budget',
          },
        },
        {
          name: 'rows',
          type: 'array',
          label: 'Rows',
          labels: {
            singular: 'Row',
            plural: 'Rows',
          },
          fields: priceRowFields,
        },
        {
          name: 'addons',
          type: 'array',
          label: 'Add-ons',
          labels: {
            singular: 'Add-on',
            plural: 'Add-ons',
          },
          fields: priceRowFields,
        },
        {
          name: 'notes',
          type: 'array',
          label: 'Footnotes',
          labels: {
            singular: 'Note',
            plural: 'Notes',
          },
          fields: [
            {
              name: 'text',
              type: 'textarea',
              required: true,
              localized: true,
              label: 'Note',
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [makeRevalidateGlobal('global_price_list')],
  },
};
