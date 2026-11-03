export const FAVICON_LINK_ID = 'app-favicon';
export const APPLE_TOUCH_LINK_ID = 'app-apple-touch-icon';

/** Keep in sync with the inline snippet in `script.ts`. */
export function syncThemeIcons(theme: 'light' | 'dark'): void {
  const root = document.documentElement;
  const favicon =
    theme === 'dark'
      ? root.dataset.faviconDark || root.dataset.faviconLight
      : root.dataset.faviconLight || root.dataset.faviconDark;
  const apple =
    theme === 'dark'
      ? root.dataset.appleTouchDark || root.dataset.appleTouchLight
      : root.dataset.appleTouchLight || root.dataset.appleTouchDark;

  const faviconEl = document.getElementById(FAVICON_LINK_ID);
  if (faviconEl instanceof HTMLLinkElement && favicon) {
    faviconEl.href = favicon;
  }

  const appleEl = document.getElementById(APPLE_TOUCH_LINK_ID);
  if (appleEl instanceof HTMLLinkElement && apple) {
    appleEl.href = apple;
  }
}
