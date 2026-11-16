import { Manrope } from 'next/font/google';
import localFont from 'next/font/local';

/** Primary heading font — Toxigenesis Bold. Not LCP; skip preload. */
export const toxigenesisFont = localFont({
  src: '../fonts/toxigenesis-bold.woff2',
  weight: '700',
  style: 'normal',
  variable: '--font-toxigenesis',
  display: 'swap',
  preload: false,
});

/** Body UI font — Gilroy Regular / Medium / SemiBold / Bold. */
export const gilroyFont = localFont({
  src: [
    { path: '../fonts/gilroy-regular.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/gilroy-medium.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/gilroy-semibold.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/gilroy-bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-gilroy',
  display: 'swap',
  adjustFontFallback: 'Arial',
});

/** Heading fallback when Toxigenesis fails to load (Cyrillic + Latin). */
export const manropeFont = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['700', '800'],
  variable: '--font-fallback-heading',
  display: 'swap',
  preload: false,
});

export const fontClassNames = [
  toxigenesisFont.variable,
  gilroyFont.variable,
  manropeFont.variable,
].join(' ');
