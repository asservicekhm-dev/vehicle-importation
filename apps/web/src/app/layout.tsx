import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

/** Passthrough — the real `<html>` shell lives in `[locale]/layout`. */
export default function RootLayout({ children }: Props) {
  return children;
}
