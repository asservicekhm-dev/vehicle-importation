import type { ReactNode } from 'react';

/**
 * Renders CMS copy with optional sky accents.
 * Wrap phrases in double brackets: `Авто [[під ключ]] зі [[США]]`.
 * Brackets are stripped from the visible text.
 */
export function renderAccentText(text: string, accentClassName: string): ReactNode {
  const value = text.trim();
  if (!value) return null;

  const parts = value.split(/(\[\[.+?\]\])/g);
  if (parts.length === 1) return value;

  return parts.map((part, index) => {
    const match = /^\[\[(.+?)\]\]$/.exec(part);
    if (match) {
      return (
        <span key={index} className={accentClassName}>
          {match[1]}
        </span>
      );
    }
    return part ? <span key={index}>{part}</span> : null;
  });
}

/** Strip accent markers for plain-text contexts (aria-label, meta). */
export function stripAccentMarkers(text: string): string {
  return text.replace(/\[\[(.+?)\]\]/g, '$1');
}
