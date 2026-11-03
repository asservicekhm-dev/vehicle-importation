import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';

import { Cookies } from '@/components/Cookies';
import { GoogleTagManager, GoogleTagManagerNoscript } from '@/components/GoogleTagManager';
import { GlobalsProvider } from '@/contexts/GlobalsContext';
import { routing } from '@/i18n/routing';
import { getBrandIconUrls, pickBrandIcon } from '@/lib/cms/brandIcons';
import { getGlobals } from '@/lib/cms/getGlobals';
import { fontClassNames } from '@/lib/fonts';
import { THEME_COLOR } from '@/lib/theme/constants';
import { APPLE_TOUCH_LINK_ID, FAVICON_LINK_ID } from '@/lib/theme/icons';
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

export default async function LocaleLayout({ children, params }: Props) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) notFound();

  const locale = localeParam as Locale;

  setRequestLocale(locale);

  const [{ header, footer, contacts, siteSettings, priceList }, translations] = await Promise.all([
    getGlobals(locale),
    getMessages(),
  ]);

  const siteDefault = isThemePreference(siteSettings?.defaultTheme)
    ? siteSettings.defaultTheme
    : null;
  const preference = await getThemePreference(siteDefault);
  const enableThemeToggle = siteSettings?.enableThemeToggle !== false;

  const resolvedTheme = preference === 'system' ? undefined : preference;
  const themeColor =
    preference === 'dark'
      ? THEME_COLOR.dark
      : preference === 'light'
        ? THEME_COLOR.light
        : undefined;

  const icons = getBrandIconUrls(siteSettings);
  const initialFavicon = pickBrandIcon(resolvedTheme, icons.faviconLight, icons.faviconDark);
  const initialAppleTouch = pickBrandIcon(
    resolvedTheme,
    icons.appleTouchLight,
    icons.appleTouchDark,
  );

  const gtmId = siteSettings?.gtmId?.trim() || process.env.NEXT_PUBLIC_GTM_ID?.trim() || '';

  return (
    <html
      lang={localeToHreflang[locale]}
      className={fontClassNames}
      data-theme-pref={preference}
      {...(resolvedTheme ? { 'data-theme': resolvedTheme } : {})}
      {...(icons.faviconLight ? { 'data-favicon-light': icons.faviconLight } : {})}
      {...(icons.faviconDark ? { 'data-favicon-dark': icons.faviconDark } : {})}
      {...(icons.appleTouchLight ? { 'data-apple-touch-light': icons.appleTouchLight } : {})}
      {...(icons.appleTouchDark ? { 'data-apple-touch-dark': icons.appleTouchDark } : {})}
      suppressHydrationWarning
    >
      <head>
        <meta name='theme-color' content={themeColor} suppressHydrationWarning />
        {initialFavicon ? (
          <link id={FAVICON_LINK_ID} rel='icon' type='image/webp' href={initialFavicon} />
        ) : null}
        {initialAppleTouch ? (
          <link id={APPLE_TOUCH_LINK_ID} rel='apple-touch-icon' href={initialAppleTouch} />
        ) : null}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <GoogleTagManager gtmId={gtmId} />
      </head>
      <body suppressHydrationWarning>
        <GoogleTagManagerNoscript gtmId={gtmId} />
        <NextIntlClientProvider locale={locale} messages={translations}>
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
            <Cookies enabled={Boolean(gtmId)} />
          </GlobalsProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
