import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import { fontClassNames } from '@/lib/fonts';
import { THEME_COLOR } from '@/lib/theme/constants';
import { themeInitScript } from '@/lib/theme/script';
import { getThemePreference } from '@/lib/theme/server';
import { defaultLocale, localeToHreflang } from '@autosearch/config';

import '@/scss/globals.scss';

type Props = {
  children: ReactNode;
};

export default async function RootLayout({ children }: Props) {
  const [preference, translations] = await Promise.all([getThemePreference(), getMessages()]);
  const resolvedTheme = preference === 'system' ? undefined : preference;
  const themeColor =
    preference === 'dark'
      ? THEME_COLOR.dark
      : preference === 'light'
        ? THEME_COLOR.light
        : THEME_COLOR.light;

  return (
    <html
      lang={localeToHreflang[defaultLocale]}
      className={fontClassNames}
      data-theme-pref={preference}
      {...(resolvedTheme ? { 'data-theme': resolvedTheme } : {})}
      suppressHydrationWarning
    >
      <head>
        <meta name='theme-color' content={themeColor} />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <NextIntlClientProvider locale={defaultLocale} messages={translations}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
