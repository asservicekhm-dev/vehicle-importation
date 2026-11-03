import type { CollectionConfig } from 'payload';

import { dateField } from '@/fields/date';
import { seoFields } from '@/fields/seo';
import { slugField } from '@/fields/slug';
import { optionalEnv } from '@/lib/env';

import { pageBlocks } from './blocks/registry';
import { revalidatePage, revalidatePageDelete } from './hooks/revalidatePage';

const RESERVED_SLUGS = new Set(['cms']);

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'viewType', 'updatedAt'],
    livePreview: {
      url: ({ data, locale }) => {
        const base = (optionalEnv('WEB_URL') || 'http://localhost:3000').replace(/\/$/, '');
        const code =
          typeof locale === 'string'
            ? locale
            : locale && typeof locale === 'object' && 'code' in locale
              ? String((locale as { code: string }).code)
              : 'ua';
        const prefix = code === 'ua' ? '' : `/${code}`;
        const pageSlug = typeof data?.slug === 'string' ? data.slug : 'home';
        const path = pageSlug === 'home' ? '' : `/${pageSlug}`;
        return `${base}${prefix}${path || '/'}`;
      },
    },
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'viewType',
      type: 'select',
      required: true,
      defaultValue: 'information',
      options: [
        { label: 'Home', value: 'home' },
        { label: 'Information', value: 'information' },
        { label: 'Contacts', value: 'contacts' },
        { label: 'Blog', value: 'blog' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      localized: true,
      labels: {
        singular: 'Block',
        plural: 'Blocks',
      },
      blocks: pageBlocks,
    },
    {
      type: 'tabs',
      tabs: [seoFields],
    },
    ...slugField(),
    dateField(),
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.slug && RESERVED_SLUGS.has(String(data.slug).toLowerCase())) {
          throw new Error('Slug "cms" is reserved (collides with the CMS base path).');
        }
        return data;
      },
    ],
    afterChange: [revalidatePage],
    afterDelete: [revalidatePageDelete],
  },
};
