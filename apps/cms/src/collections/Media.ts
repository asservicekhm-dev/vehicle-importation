import path from 'path';
import type { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      localized: true,
      required: false,
    },
    {
      name: 'caption',
      type: 'text',
      localized: true,
      required: false,
    },
  ],
  upload: {
    staticDir: process.env.MEDIA_PATH || path.resolve(process.cwd(), 'media'),
  },
};
