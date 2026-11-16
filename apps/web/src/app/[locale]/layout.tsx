import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';

import { Cookies } from '@/components/Cookies';
import { JsonLd } from '@/components/JsonLd/JsonLd';
import { GoogleTagManager, GoogleTagManagerNoscript } from '@/components/GoogleTagManager';
import { HashScroll } from '@/components/HashScroll';
import { ThemeSync } from '@/components/ThemeSync';
import { GlobalsProvider } from '@/contexts/GlobalsContext';
import { routing } from '@/i18n/routing';
import { getBrandIconUrls, pickBrandIcon } from '@/lib/cms/brandIcons';
import { getGlobals } from '@/lib/cms/getGlobals';
import { fontClassNames } from '@/lib/fonts';
import { APPLE_TOUCH_LINK_ID, FAVICON_LINK_ID } from '@/lib/theme/icons';
import { animInitScript } from '@/lib/anim/script';
import { siteJsonLd } from '@/lib/seo/jsonLd';
import { siteOrigin } from '@/lib/seo/pageMetadata';
import { themeInitScript } from '@/lib/theme/script';
import { getThemePreference } from '@/lib/theme/server';
import { Layout } from '@/views/Layout';
import { isLocale, isThemePreference, type Locale, localeToHreflang } from '@autosearch/config';

import '@/scss/globals.scss';

export const dynamic = 'force-dynamic';

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) return {};

  const locale = localeParam as Locale;
  const { siteSettings } = await getGlobals(locale);
  const siteName = siteSettings?.siteName?.trim() || 'AS Autosearch';
  const description = siteSettings?.defaultMetaDescription?.trim() || undefined;

  return {
    metadataBase: new URL(siteOrigin()),
    title: {
      default: siteSettings?.defaultMetaTitle?.trim() || siteName,
    },
    description,
    applicationName: siteName,
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) notFound();

  const locale = localeParam as Locale;

  setRequestLocale(locale);

  const [{ header, footer, contacts, siteSettings, priceList }, translations] = await Promise.all([
    getGlobals(locale),
    getMessages(),
  ]);

  // Cookie wins over the site default. Explicit light/dark is also written to
  // `data-theme` so client navigations (locale switch) don't drop the resolved theme.
  const preference = await getThemePreference(
    isThemePreference(siteSettings?.defaultTheme) ? siteSettings.defaultTheme : null,
  );
  const enableThemeToggle = siteSettings?.enableThemeToggle !== false;

  const icons = getBrandIconUrls(siteSettings);
  // Explicit light/dark picks the matching icon. `system` stays on the light
  // asset until the inline script, or ThemeSync after a client navigation, swaps it.
  const ssrThemeHint = preference === 'system' ? undefined : preference;
  const initialFavicon = pickBrandIcon(ssrThemeHint, icons.faviconLight, icons.faviconDark);
  const initialAppleTouch = pickBrandIcon(
    ssrThemeHint,
    icons.appleTouchLight,
    icons.appleTouchDark,
  );

  const gtmId = siteSettings?.gtmId?.trim() || process.env.NEXT_PUBLIC_GTM_ID?.trim() || '';

  return (
    <html
      lang={localeToHreflang[locale]}
      className={fontClassNames}
      data-theme-pref={preference}
      {...(preference === 'light' || preference === 'dark' ? { 'data-theme': preference } : {})}
      {...(icons.faviconLight ? { 'data-favicon-light': icons.faviconLight } : {})}
      {...(icons.faviconDark ? { 'data-favicon-dark': icons.faviconDark } : {})}
      {...(icons.appleTouchLight ? { 'data-apple-touch-light': icons.appleTouchLight } : {})}
      {...(icons.appleTouchDark ? { 'data-apple-touch-dark': icons.appleTouchDark } : {})}
      suppressHydrationWarning
    >
      <head>
        <meta name='theme-color' content='' suppressHydrationWarning />
        {initialFavicon ? (
          <link id={FAVICON_LINK_ID} rel='icon' type='image/webp' href={initialFavicon} />
        ) : null}
        {initialAppleTouch ? (
          <link id={APPLE_TOUCH_LINK_ID} rel='apple-touch-icon' href={initialAppleTouch} />
        ) : null}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: animInitScript }} />
        <GoogleTagManager gtmId={gtmId} />
      </head>
      <body suppressHydrationWarning>
        <JsonLd
          data={siteJsonLd({
            locale,
            header,
            contacts,
            siteSettings,
          })}
        />
        <GoogleTagManagerNoscript gtmId={gtmId} />
        <NextIntlClientProvider locale={locale} messages={translations}>
          <ThemeSync preference={preference} />
          <GlobalsProvider
            header={header}
            footer={footer}
            contacts={contacts}
            siteSettings={siteSettings}
            priceList={priceList}
          >
            <Layout themePreference={preference} enableThemeToggle={enableThemeToggle}>
              {children}
            </Layout>
            <HashScroll />
            <Cookies gtmEnabled={Boolean(gtmId)} />
          </GlobalsProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
