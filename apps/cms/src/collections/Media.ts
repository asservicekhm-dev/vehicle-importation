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
    },
  ],
  upload: {
    staticDir: process.env.MEDIA_PATH || path.resolve(process.cwd(), 'media'),
    mimeTypes: ['image/*'],
    formatOptions: {
      format: 'webp',
      options: {
        quality: 90,
      },
    },
    imageSizes: [
      {
        name: 'favicon',
        width: 32,
        height: 32,
        position: 'centre',
        withoutEnlargement: false,
        formatOptions: {
          format: 'webp',
          options: { quality: 90 },
        },
      },
      {
        name: 'icon',
        width: 180,
        height: 180,
        position: 'centre',
        withoutEnlargement: false,
        formatOptions: {
          format: 'webp',
          options: { quality: 92 },
        },
      },
    ],
  },
};
