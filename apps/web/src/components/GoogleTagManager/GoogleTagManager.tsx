import Script from 'next/script';

type Props = {
  gtmId?: string | null;
};

function resolveGtmId(explicit?: string | null): string {
  const fromProp = explicit?.trim() ?? '';
  if (fromProp) return fromProp;
  return (process.env.NEXT_PUBLIC_GTM_ID ?? '').trim();
}

/**
 * Consent Mode defaults + GTM. Empty id disables GTM (no default container).
 * Consent defaults stay inline so they run before tags; gtm.js loads afterInteractive
 * so it does not compete with the LCP hero.
 */
export function GoogleTagManager({ gtmId }: Props) {
  const id = resolveGtmId(gtmId);
  if (!id) return null;

  return (
    <>
      <script
        id='gtm-consent-default'
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});`,
        }}
      />
      <Script id='google-tag-manager' strategy='afterInteractive'>{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${id}');`}</Script>
    </>
  );
}

export function GoogleTagManagerNoscript({ gtmId }: Props) {
  const id = resolveGtmId(gtmId);
  if (!id) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${id}`}
        height={0}
        width={0}
        style={{ display: 'none', visibility: 'hidden' }}
        title='Google Tag Manager'
      />
    </noscript>
  );
}
