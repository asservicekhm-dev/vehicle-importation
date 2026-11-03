import { getMediaUrl } from '@/lib/cms/resolveMediaUrl';
import type { SiteSetting } from '@autosearch/cms/payload-types';

export type BrandIconUrls = {
  faviconLight: string | null;
  faviconDark: string | null;
  appleTouchLight: string | null;
  appleTouchDark: string | null;
};

export function getBrandIconUrls(siteSettings: SiteSetting | null): BrandIconUrls {
  return {
    faviconLight:
      getMediaUrl(siteSettings?.faviconLight, 'favicon') ?? getMediaUrl(siteSettings?.faviconLight),
    faviconDark:
      getMediaUrl(siteSettings?.faviconDark, 'favicon') ?? getMediaUrl(siteSettings?.faviconDark),
    appleTouchLight:
      getMediaUrl(siteSettings?.appleTouchIconLight, 'icon') ??
      getMediaUrl(siteSettings?.appleTouchIconLight),
    appleTouchDark:
      getMediaUrl(siteSettings?.appleTouchIconDark, 'icon') ??
      getMediaUrl(siteSettings?.appleTouchIconDark),
  };
}

export function pickBrandIcon(
  theme: 'light' | 'dark' | undefined,
  light: string | null,
  dark: string | null,
): string | null {
  if (theme === 'dark') return dark || light;
  return light || dark;
}
