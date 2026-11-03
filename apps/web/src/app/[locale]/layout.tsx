import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';

import { routing } from '@/i18n/routing';
import { fontClassNames } from '@/lib/fonts';
import { THEME_COLOR } from '@/lib/theme/constants';
import { themeInitScript } from '@/lib/theme/script';
import { getThemePreference } from '@/lib/theme/server';
import { Layout } from '@/views/Layout';
import { isLocale, type Locale, localeToHreflang } from '@autosearch/config';

import '@/scss/globals.scss';

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

  const [preference, translations] = await Promise.all([getThemePreference(), getMessages()]);
  // Explicit prefs are SSR-safe. `system` is resolved by the inline script before paint —
  // omit `data-theme` here so React doesn't fight the script during hydration.
  const resolvedTheme = preference === 'system' ? undefined : preference;
  const themeColor =
    preference === 'dark'
      ? THEME_COLOR.dark
      : preference === 'light'
        ? THEME_COLOR.light
        : undefined;

  return (
    <html
      lang={localeToHreflang[locale]}
      className={fontClassNames}
      data-theme-pref={preference}
      {...(resolvedTheme ? { 'data-theme': resolvedTheme } : {})}
      suppressHydrationWarning
    >
      <head>
        <meta name='theme-color' content={themeColor} suppressHydrationWarning />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={translations}>
          <Layout themePreference={preference}>{children}</Layout>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
