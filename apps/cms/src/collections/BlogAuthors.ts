import type { CollectionConfig } from 'payload';

import { slugField } from '@/fields/slug';

export const BlogAuthors: CollectionConfig = {
  slug: 'blog-authors',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Content',
    useAsTitle: 'name',
    defaultColumns: ['name', 'updatedAt'],
  },
  labels: {
    singular: 'Blog author',
    plural: 'Blog authors',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      localized: true,
      required: true,
      label: 'Name',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Photo',
    },
    {
      name: 'role',
      type: 'text',
      localized: true,
      label: 'Role / position',
    },
    ...slugField(),
  ],
};
