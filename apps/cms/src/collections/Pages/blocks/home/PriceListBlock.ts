import type { Block } from 'payload';

export const PriceListBlock: Block = {
  slug: 'price-list-block',
  labels: { singular: 'Price list', plural: 'Price list sections' },
  interfaceName: 'PriceListBlockFields',
  fields: [
    {
      name: 'titleOverride',
      type: 'text',
      localized: true,
      label: 'Title override',
      admin: {
        description:
          'Optional. Falls back to the price-list global title. Rows always come from the global.',
      },
    },
    {
      name: 'addonsHeading',
      type: 'text',
      localized: true,
      label: 'Add-ons heading',
      admin: {
        description: 'Heading above add-on rows (e.g. “Additional services”).',
      },
    },
    {
      name: 'fromPrefix',
      type: 'text',
      localized: true,
      label: '“From” prefix',
      admin: {
        description: 'Shown before amounts marked as “from” (e.g. “від” / “From”).',
      },
    },
  ],
};
