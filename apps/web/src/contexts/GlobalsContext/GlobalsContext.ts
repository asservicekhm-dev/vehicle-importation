'use client';

import { createContext, useContext } from 'react';

import type {
  Contact,
  Footer,
  Header,
  PriceList,
  SiteSetting,
} from '@autosearch/cms/payload-types';

export type GlobalsValue = {
  contacts: Contact | null;
  footer: Footer | null;
  header: Header | null;
  siteSettings: SiteSetting | null;
  priceList: PriceList | null;
};

export const GlobalsContext = createContext<GlobalsValue | null>(null);

export const useGlobals = () => {
  const globals = useContext(GlobalsContext);

  if (globals === null) {
    throw new Error('useGlobals must be used within a GlobalsProvider');
  }

  return globals;
};
