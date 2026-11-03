import type { CollectionConfig } from 'payload';

export const BlogCategories: CollectionConfig = {
  slug: 'blog-categories',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'updatedAt'],
  },
  labels: {
    singular: 'Blog category',
    plural: 'Blog categories',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
      label: 'Title',
    },
  ],
};
