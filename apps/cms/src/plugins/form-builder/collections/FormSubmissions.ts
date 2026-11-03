import type { CollectionConfig } from 'payload';

import { onFormSubmissionCreate } from '../hooks/onFormSubmissionCreate';
import { preventDuplicateFormEmail } from '../hooks/preventDuplicateFormEmail';

export const FormSubmissions: CollectionConfig = {
  slug: 'form-submissions',
  access: {
    create: () => true,
    read: ({ req }) => !!req.user,
  },
  admin: {
    group: 'Forms',
  },
  fields: [
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
      label: 'Form',
    },
    {
      name: 'submissionData',
      type: 'array',
      required: true,
      label: 'Submission data',
      fields: [
        { name: 'field', type: 'text', required: true, label: 'Field name' },
        { name: 'value', type: 'text', label: 'Field value' },
      ],
    },
  ],
  hooks: {
    beforeChange: [preventDuplicateFormEmail],
    afterChange: [onFormSubmissionCreate],
  },
  labels: {
    singular: 'Form submission',
    plural: 'Form submissions',
  },
};
