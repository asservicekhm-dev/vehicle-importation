'use client';

import { createContext, type ReactNode, useContext, useState } from 'react';

export type OriginId = 'usa' | 'europe' | 'korea';

type OriginContextValue = {
  origin: OriginId;
  setOrigin: (id: OriginId) => void;
};

const OriginContext = createContext<OriginContextValue | null>(null);

export function OriginProvider({ children }: { children: ReactNode }) {
  const [origin, setOrigin] = useState<OriginId>('usa');

  return <OriginContext.Provider value={{ origin, setOrigin }}>{children}</OriginContext.Provider>;
}

export function useOrigin(): OriginContextValue {
  const ctx = useContext(OriginContext);
  if (!ctx) {
    return { origin: 'usa', setOrigin: () => undefined };
  }
  return ctx;
}
