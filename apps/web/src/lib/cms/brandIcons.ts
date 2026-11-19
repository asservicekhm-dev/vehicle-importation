import { getPublicMediaUrl } from '@/lib/cms/resolveMediaUrl';
import type { SiteSetting } from '@autosearch/cms/payload-types';

export type BrandIconUrls = {
  faviconLight: string | null;
  faviconDark: string | null;
  appleTouchLight: string | null;
  appleTouchDark: string | null;
};

export function getBrandIconUrls(siteSettings: SiteSetting | null): BrandIconUrls {
  return {
    // Originals are already 32px and 180px. The generated size keys are not in MinIO.
    faviconLight: getPublicMediaUrl(siteSettings?.faviconLight),
    faviconDark: getPublicMediaUrl(siteSettings?.faviconDark),
    appleTouchLight: getPublicMediaUrl(siteSettings?.appleTouchIconLight),
    appleTouchDark: getPublicMediaUrl(siteSettings?.appleTouchIconDark),
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
