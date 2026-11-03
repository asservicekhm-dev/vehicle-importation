import type { Block } from 'payload';

export const InspectionChecklistBlock: Block = {
  slug: 'inspection-checklist-block',
  labels: { singular: 'Inspection checklist', plural: 'Inspection checklists' },
  interfaceName: 'InspectionChecklistBlockFields',
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
      name: 'intro',
      type: 'textarea',
      localized: true,
      label: 'Intro',
    },
    {
      name: 'items',
      type: 'array',
      label: 'Checklist items',
      labels: { singular: 'Item', plural: 'Items' },
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
          name: 'detail',
          type: 'textarea',
          localized: true,
          label: 'Detail',
        },
      ],
    },
  ],
};
