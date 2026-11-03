import type { Block } from 'payload';

export const BookingFormBlock: Block = {
  slug: 'booking-form-block',
  labels: { singular: 'Booking / lead form', plural: 'Booking / lead forms' },
  interfaceName: 'BookingFormBlockFields',
  fields: [
    {
      name: 'variant',
      type: 'select',
      label: 'Layout variant',
      defaultValue: 'callback',
      options: [
        { label: 'Pitch (compact consult)', value: 'pitch' },
        { label: 'Callback (full request)', value: 'callback' },
      ],
      admin: {
        description:
          'Pitch: shorter copy + name/phone emphasis. Callback: fuller two-column request form.',
      },
    },
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      label: 'Eyebrow',
    },
    {
      name: 'note',
      type: 'text',
      localized: true,
      label: 'Note under description',
      admin: {
        description: 'Optional supporting line (e.g. response time). Useful for pitch layout.',
      },
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
      name: 'description',
      type: 'textarea',
      localized: true,
      label: 'Description',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Image',
    },
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
      localized: true,
      label: 'Form',
    },
    {
      name: 'layout',
      type: 'group',
      label: 'Field mapping',
      fields: [
        {
          name: 'nameField',
          type: 'text',
          localized: true,
          label: 'Name field',
          defaultValue: 'name',
        },
        {
          name: 'phoneField',
          type: 'text',
          localized: true,
          label: 'Phone field',
          defaultValue: 'phone',
        },
        {
          name: 'messageField',
          type: 'text',
          localized: true,
          label: 'Message field',
          defaultValue: 'message',
        },
        {
          name: 'emailField',
          type: 'text',
          localized: true,
          label: 'Email field',
        },
      ],
    },
  ],
};
