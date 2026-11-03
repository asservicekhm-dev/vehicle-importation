'use client';

import type { PayloadClientReactComponent, RowLabelComponent } from 'payload';
import { useRowLabel } from '@payloadcms/ui';

export const CustomRowLabel: PayloadClientReactComponent<RowLabelComponent> = () => {
  const { data } = useRowLabel<{
    link?: { label?: string };
    title?: string;
    label?: string;
  }>();

  if (data.link?.label) return data.link.label;
  if (data.title) return data.title;
  if (data.label) return data.label;
  return 'Item';
};
