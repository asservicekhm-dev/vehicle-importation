import type { GlobalConfig } from 'payload';

import { themePreferences } from '@autosearch/config';

import { makeRevalidateGlobal } from './hooks/revalidateGlobal';

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      localized: true,
      defaultValue: 'AS Autosearch',
      label: 'Site name',
    },
    {
      name: 'defaultMetaTitle',
      type: 'text',
      localized: true,
      label: 'Default meta title',
    },
    {
      name: 'defaultMetaDescription',
      type: 'textarea',
      localized: true,
      label: 'Default meta description',
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
      label: 'Favicon',
    },
    {
      name: 'gtmId',
      type: 'text',
      label: 'Google Tag Manager ID',
      admin: {
        description: 'Optional. Leave empty to disable GTM. No default id.',
      },
    },
    {
      name: 'defaultTheme',
      type: 'select',
      defaultValue: 'system',
      options: themePreferences.map((value) => ({
        label: value.charAt(0).toUpperCase() + value.slice(1),
        value,
      })),
      label: 'Default theme preference',
      admin: {
        description: 'Used when the visitor has no theme cookie.',
      },
    },
    {
      name: 'enableThemeToggle',
      type: 'checkbox',
      defaultValue: true,
      label: 'Enable theme toggle',
    },
  ],
  hooks: {
    afterChange: [makeRevalidateGlobal('global_site_settings')],
  },
};
