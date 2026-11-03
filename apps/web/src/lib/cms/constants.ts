/** Populate depth for page fetches (blocks + form fields + media). */
export const PAGE_DEPTH = 4;

export const HOME_SLUG = 'home';

export const CACHE_TAGS = {
  pages: 'pages',
  page: (slug: string) => `pages:${slug}`,
  blog: 'blog',
  blogPost: (slug: string) => `blog:${slug}`,
  redirects: 'redirects',
  globals: 'globals',
  header: 'global_header',
  footer: 'global_footer',
  contacts: 'global_contacts',
  siteSettings: 'global_site_settings',
  priceList: 'global_price_list',
} as const;
