'use client';

import type { PropsWithChildren } from 'react';

import type { Contact, Footer, Header, SiteSetting } from '@autosearch/cms/payload-types';

import { GlobalsContext } from './GlobalsContext';

type Props = {
  contacts?: Contact | null;
  footer?: Footer | null;
  header?: Header | null;
  siteSettings?: SiteSetting | null;
};

export function GlobalsProvider({
  children,
  contacts = null,
  footer = null,
  header = null,
  siteSettings = null,
}: PropsWithChildren<Props>) {
  return (
    <GlobalsContext.Provider value={{ contacts, footer, header, siteSettings }}>
      {children}
    </GlobalsContext.Provider>
  );
}
