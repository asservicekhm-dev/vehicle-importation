export const COOKIE_CONSENT_KEY = 'as_autosearch_cookie_consent';

type ConsentState = 'denied' | 'granted';

type GtmWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

/** Tag Assistant / GTM Preview opens a popup or iframe — hide the consent banner there. */
export function isTagAssistantSession(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const query = window.location.search;
    const hash = window.location.hash;
    const referrer = document.referrer;
    const framed = window.self !== window.top;

    return (
      framed ||
      /[?&]gtm_debug=/.test(query) ||
      /[?&]gtm_preview=/.test(query) ||
      /[?&]gtm_auth=/.test(query) ||
      hash.includes('gtm_debug') ||
      referrer.includes('tagassistant.google.com')
    );
  } catch {
    return true;
  }
}

export function updateGtmConsent(state: ConsentState) {
  const w = window as GtmWindow;
  w.dataLayer = w.dataLayer || [];
  const gtag =
    w.gtag ??
    function gtag(...args: unknown[]) {
      w.dataLayer?.push(args);
    };
  w.gtag = gtag;
  gtag('consent', 'update', {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
    analytics_storage: state,
  });
}
