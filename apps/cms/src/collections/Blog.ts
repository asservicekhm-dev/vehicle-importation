import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
} from 'payload';

import { dateField } from '@/fields/date';
import { seoFields } from '@/fields/seo';
import { slugField } from '@/fields/slug';
import { triggerWebRevalidate } from '@/lib/revalidate';

const revalidateBlog: CollectionAfterChangeHook = ({ doc, previousDoc, req: { context } }) => {
  const tags = ['blog', 'pages'];
  const paths = ['/blog'];
  const slug = typeof doc?.slug === 'string' ? doc.slug : null;
  const prevSlug = typeof previousDoc?.slug === 'string' ? previousDoc.slug : null;

  if (slug) {
    tags.push(`blog:${slug}`);
    paths.push(`/blog/${slug}`);
  }
  if (prevSlug && prevSlug !== slug) {
    tags.push(`blog:${prevSlug}`);
    paths.push(`/blog/${prevSlug}`);
  }

  void triggerWebRevalidate({ tags, paths }, context as { skipRevalidate?: boolean });
  return doc;
};

const revalidateBlogDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  const tags = ['blog', 'pages'];
  const paths = ['/blog'];
  const slug = typeof doc?.slug === 'string' ? doc.slug : null;
  if (slug) {
    tags.push(`blog:${slug}`);
    paths.push(`/blog/${slug}`);
  }
  void triggerWebRevalidate({ tags, paths }, context as { skipRevalidate?: boolean });
  return doc;
};

export const Blog: CollectionConfig = {
  slug: 'blog',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    preview: ({ slug }) => {
      const base = (process.env.WEB_URL || 'http://localhost:3000').replace(/\/$/, '');
      return `${base}/blog/${slug || ''}`;
    },
  },
  versions: {
    drafts: true,
  },
  labels: {
    singular: 'Blog post',
    plural: 'Blog',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
      label: 'Title',
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      label: 'Short description',
    },
    {
      name: 'body',
      type: 'richText',
      localized: true,
      label: 'Body',
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      label: 'Thumbnail',
      admin: { position: 'sidebar' },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'blog-categories',
      label: 'Category',
      admin: { position: 'sidebar' },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'blog-authors',
      label: 'Author',
      admin: { position: 'sidebar' },
    },
    {
      type: 'tabs',
      tabs: [seoFields],
    },
    ...slugField(),
    dateField(),
  ],
  hooks: {
    afterChange: [revalidateBlog],
    afterDelete: [revalidateBlogDelete],
  },
};
