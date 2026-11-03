import type { Block } from 'payload';

import { link } from '@/fields/link';

export const UkraineCoverageBlock: Block = {
  slug: 'ukraine-coverage-block',
  labels: { singular: 'Ukraine coverage', plural: 'Ukraine coverage sections' },
  interfaceName: 'UkraineCoverageBlockFields',
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
      name: 'body',
      type: 'textarea',
      localized: true,
      label: 'Body',
    },
    {
      name: 'officeLabel',
      type: 'text',
      localized: true,
      label: 'Office label',
      admin: { description: 'e.g. “Офіс” / “Office”' },
    },
    {
      name: 'officeCity',
      type: 'text',
      localized: true,
      label: 'Office city',
      admin: { description: 'e.g. Хмельницький' },
    },
    {
      name: 'latitude',
      type: 'number',
      required: true,
      label: 'Latitude',
      admin: { description: 'Office map pin latitude.' },
    },
    {
      name: 'longitude',
      type: 'number',
      required: true,
      label: 'Longitude',
      admin: { description: 'Office map pin longitude.' },
    },
    {
      name: 'routeUrl',
      type: 'text',
      required: true,
      label: 'Route URL',
      admin: {
        description: 'Google Maps link for the Route button (opens in a new tab).',
      },
    },
    {
      name: 'routeLabel',
      type: 'text',
      localized: true,
      label: 'Route button label',
      admin: { description: 'e.g. “Маршрут” / “Route”' },
    },
    {
      name: 'cities',
      type: 'array',
      label: 'Coverage cities',
      labels: { singular: 'City', plural: 'Cities' },
      admin: { description: 'Optional city chips (coverage list). Address comes from Contacts.' },
      fields: [
        {
          name: 'name',
          type: 'text',
          localized: true,
          required: true,
          label: 'Name',
        },
      ],
    },
    link({
      appearances: false,
      optional: true,
      overrides: { name: 'cta', label: 'CTA' },
    }),
  ],
};
