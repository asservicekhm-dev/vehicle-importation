/** Populate depth for page fetches. Nested marketing blocks arrive in M4. */
export const PAGE_DEPTH = 3;

export const HOME_SLUG = 'home';

export const CACHE_TAGS = {
  pages: 'pages',
  page: (slug: string) => `pages:${slug}`,
  redirects: 'redirects',
  globals: 'globals',
  header: 'global_header',
  footer: 'global_footer',
  contacts: 'global_contacts',
  siteSettings: 'global_site_settings',
} as const;
