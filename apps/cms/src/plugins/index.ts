import type { Plugin } from 'payload';
import { redirectsPlugin } from '@payloadcms/plugin-redirects';
import { seoPlugin } from '@payloadcms/plugin-seo';
import type { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types';

import { triggerWebRevalidate } from '@/lib/revalidate';
import type { Page } from '@/payload-types';

import { formBuilder } from './form-builder';

const generateTitle: GenerateTitle<Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | AS Autosearch` : 'AS Autosearch';
};

const generateURL: GenerateURL<Page> = ({ doc }) => {
  const webUrl = (process.env.WEB_URL || 'http://localhost:3000').replace(/\/$/, '');
  if (!doc?.slug || doc.slug === 'home') return webUrl;
  return `${webUrl}/${doc.slug}`;
};

export const plugins: Plugin[] = [
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilder(),
  redirectsPlugin({
    collections: ['pages'],
    redirectTypes: ['301', '302'],
    overrides: {
      admin: {
        group: 'System',
      },
      hooks: {
        afterChange: [
          ({ doc, req: { context } }) => {
            void triggerWebRevalidate(
              { tags: ['redirects'] },
              context as { skipRevalidate?: boolean },
            );
            return doc;
          },
        ],
      },
    },
  }),
];
