import type { GlobalConfig } from 'payload';

import { makeRevalidateGlobal } from './hooks/revalidateGlobal';

export const Contacts: GlobalConfig = {
  slug: 'contacts',
  label: 'Contacts',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'phones',
      label: 'Phones',
      type: 'array',
      labels: {
        singular: 'Phone',
        plural: 'Phones',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          localized: true,
        },
        {
          name: 'number',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'email',
      type: 'text',
      label: 'Email',
    },
    {
      name: 'address',
      type: 'text',
      localized: true,
      label: 'Address',
    },
    {
      name: 'hours',
      type: 'textarea',
      localized: true,
      label: 'Working hours',
    },
    {
      name: 'gMapLink',
      type: 'text',
      label: 'Google Map link',
    },
  ],
  hooks: {
    afterChange: [makeRevalidateGlobal('global_contacts')],
  },
};
