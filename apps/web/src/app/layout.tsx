import type { ReactNode } from 'react';

import { defaultLocale, localeToHreflang } from '@autosearch/config';

import '@/scss/globals.scss';

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang={localeToHreflang[defaultLocale]}>
      <body>{children}</body>
    </html>
  );
}
