import type { Field } from 'payload';

import deepMerge from '@/utilities/deepMerge';

export type LinkAppearances = 'default' | 'outline';

export const appearanceOptions: Record<LinkAppearances, { label: string; value: string }> = {
  default: {
    label: 'Default',
    value: 'default',
  },
  outline: {
    label: 'Outline',
    value: 'outline',
  },
};

type LinkType = (options?: {
  appearances?: LinkAppearances[] | false;
  optional?: boolean;
  disableLabel?: boolean;
  overrides?: Record<string, unknown>;
}) => Field;

export const link: LinkType = ({
  appearances = false,
  disableLabel = false,
  optional = false,
  overrides = {},
} = {}) => {
  const linkResult: Field = {
    admin: {
      hideGutter: true,
    },
    fields: [
      {
        fields: [
          {
            admin: {
              layout: 'horizontal',
              width: '50%',
            },
            defaultValue: 'reference',
            name: 'type',
            options: [
              { label: 'Internal link', value: 'reference' },
              { label: 'Custom URL', value: 'custom' },
              { label: 'Current page anchor', value: 'anchor' },
              { label: 'CMS Form', value: 'form' },
            ],
            type: 'radio',
          },
          {
            admin: {
              style: {
                alignSelf: 'flex-end',
              },
              condition: (_, siblingData) =>
                siblingData?.type !== 'form' && siblingData?.type !== 'anchor',
              width: '50%',
            },
            label: 'Open in new tab',
            name: 'newTab',
            type: 'checkbox',
          },
        ],
        type: 'row',
      },
    ],
    name: 'link',
    type: 'group',
  };

  const linkTypes: Field[] = [
    {
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'reference',
      },
      label: 'Document to link to',
      maxDepth: 1,
      name: 'reference',
      relationTo: ['pages'],
      required: !optional,
      ...(optional
        ? {
            validate: (
              value: unknown,
              { siblingData }: { siblingData?: { type?: string; label?: string } },
            ) => {
              if (siblingData?.type !== 'reference') return true;
              if (!String(siblingData?.label ?? '').trim()) return true;
              if (value == null || value === '') return 'Select a document when the label is set';
              return true;
            },
          }
        : {}),
      type: 'relationship',
    },
    {
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'custom',
      },
      label: 'Custom URL',
      name: 'url',
      required: !optional,
      ...(optional
        ? {
            validate: (
              value: unknown,
              { siblingData }: { siblingData?: { type?: string; label?: string } },
            ) => {
              if (siblingData?.type !== 'custom') return true;
              if (!String(siblingData?.label ?? '').trim()) return true;
              if (!String(value ?? '').trim()) return 'Enter URL when the label is set';
              return true;
            },
          }
        : {}),
      type: 'text',
    },
    {
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'form',
      },
      label: 'CMS Form',
      name: 'form',
      required: !optional,
      ...(optional
        ? {
            validate: (
              value: unknown,
              { siblingData }: { siblingData?: { type?: string; label?: string } },
            ) => {
              if (siblingData?.type !== 'form') return true;
              if (!String(siblingData?.label ?? '').trim()) return true;
              if (value == null || value === '') return 'Select a form when the label is set';
              return true;
            },
          }
        : {}),
      relationTo: 'forms',
      type: 'relationship',
    },
  ];

  if (!disableLabel) {
    linkResult.fields.push({
      fields: [
        {
          admin: {
            width: '50%',
          },
          label: 'Label',
          name: 'label',
          required: !optional,
          localized: true,
          type: 'text',
        },
        ...linkTypes,
      ],
      type: 'row',
    });
  } else {
    linkResult.fields = [...linkResult.fields, ...linkTypes];
  }

  linkResult.fields.push({
    admin: {
      condition: (_data, siblingData) =>
        siblingData?.type === 'reference' ||
        siblingData?.type === 'custom' ||
        siblingData?.type === 'anchor',
      description:
        'HTML id without #. Appended as URL hash for internal/custom links; required for anchor type when label is set.',
    },
    label: 'Anchor (fragment)',
    name: 'hash',
    required: false,
    type: 'text',
    validate: (
      value: unknown,
      { siblingData }: { siblingData?: { type?: string; label?: string } },
    ) => {
      if (siblingData?.type !== 'anchor') return true;
      if (!String(siblingData?.label ?? '').trim()) return true;
      if (!String(value ?? '').trim()) return 'Enter anchor id (without #) for this link type';
      return true;
    },
  });

  if (appearances !== false) {
    let appearanceOptionsToUse = [appearanceOptions.default, appearanceOptions.outline];

    if (appearances) {
      appearanceOptionsToUse = appearances.map((appearance) => appearanceOptions[appearance]);
    }

    linkResult.fields.push({
      admin: {
        description: 'Choose how the link should be rendered.',
      },
      defaultValue: 'default',
      name: 'appearance',
      options: appearanceOptionsToUse,
      type: 'select',
    });
  }

  return deepMerge(linkResult, overrides);
};
