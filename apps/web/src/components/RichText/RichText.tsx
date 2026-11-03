import type { ReactNode } from 'react';

import styles from './RichText.module.scss';

type LexicalTextNode = {
  type?: string;
  text?: string;
  children?: LexicalTextNode[];
};

type LexicalDoc = {
  root?: {
    children?: LexicalTextNode[];
  };
};

type Props = {
  data?: LexicalDoc | string | null;
  children?: ReactNode;
  className?: string;
};

function extractText(nodes: LexicalTextNode[] | undefined): string[] {
  if (!nodes?.length) return [];

  const paragraphs: string[] = [];

  for (const node of nodes) {
    if (node.type === 'paragraph' || node.type === 'heading') {
      const text = (node.children ?? [])
        .map((child) => child.text ?? '')
        .join('')
        .trim();

      if (text) paragraphs.push(text);
      continue;
    }

    if (node.text?.trim()) paragraphs.push(node.text.trim());
  }

  return paragraphs;
}

export function RichText({ data, children, className }: Props) {
  if (children) {
    return <div className={className ?? styles.root}>{children}</div>;
  }

  if (typeof data === 'string') {
    const text = data.trim();

    if (!text) return null;

    return (
      <div className={className ?? styles.root}>
        <p>{text}</p>
      </div>
    );
  }

  const paragraphs = extractText(data?.root?.children);

  if (!paragraphs.length) return null;

  return (
    <div className={className ?? styles.root}>
      {paragraphs.map((text) => (
        <p key={text}>{text}</p>
      ))}
    </div>
  );
}
