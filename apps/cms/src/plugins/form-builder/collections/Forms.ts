import type { Block, CollectionConfig } from 'payload';

import { userOnlyField } from '@/access/userOnly';

const TextField: Block = {
  slug: 'text',
  labels: { singular: 'Text', plural: 'Text fields' },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Field name',
      admin: { placeholder: 'name' },
    },
    { name: 'label', type: 'text', localized: true, label: 'Field label' },
    { name: 'placeholder', type: 'text', localized: true, label: 'Placeholder' },
    {
      name: 'isRequired',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      label: 'Required',
    },
  ],
};

const EmailField: Block = {
  slug: 'email',
  labels: { singular: 'Email', plural: 'Email fields' },
  fields: [
    { name: 'name', type: 'text', required: true, defaultValue: 'email', label: 'Field name' },
    { name: 'label', type: 'text', localized: true, defaultValue: 'Email', label: 'Field label' },
    { name: 'placeholder', type: 'text', localized: true, label: 'Placeholder' },
    {
      name: 'isRequired',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      label: 'Required',
    },
  ],
};

const PhoneNumberField: Block = {
  slug: 'phone-number',
  labels: { singular: 'Phone number', plural: 'Phone fields' },
  fields: [
    { name: 'name', type: 'text', required: true, defaultValue: 'phone', label: 'Field name' },
    { name: 'label', type: 'text', localized: true, required: true, label: 'Field label' },
    { name: 'placeholder', type: 'text', localized: true, label: 'Placeholder' },
    { name: 'isRequired', type: 'checkbox', required: true, defaultValue: true, label: 'Required' },
  ],
};

const MessageField: Block = {
  slug: 'message',
  labels: { singular: 'Message', plural: 'Message fields' },
  fields: [
    { name: 'name', type: 'text', required: true, defaultValue: 'message', label: 'Field name' },
    { name: 'label', type: 'text', localized: true, label: 'Field label' },
    { name: 'placeholder', type: 'text', localized: true, label: 'Placeholder' },
    {
      name: 'isRequired',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      label: 'Required',
    },
  ],
};

const CheckboxGroupField: Block = {
  slug: 'checkboxGroup',
  labels: { singular: 'Checkbox group', plural: 'Checkbox group fields' },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Field name' },
    { name: 'label', type: 'text', localized: true, label: 'Field label' },
    {
      name: 'selectList',
      type: 'array',
      required: true,
      labels: { singular: 'Option', plural: 'Options' },
      fields: [
        { name: 'name', type: 'text', localized: true, required: true, label: 'Option name' },
      ],
    },
    {
      name: 'isRequired',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      label: 'Required',
    },
  ],
};

export const Forms: CollectionConfig = {
  slug: 'forms',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Forms',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Form title',
    },
    {
      name: 'submissionKind',
      type: 'select',
      defaultValue: 'none',
      admin: {
        position: 'sidebar',
        description: 'Lead inbox fan-out lands in Milestone 4. Keep “none” for now.',
      },
      options: [
        { label: 'None (Form submissions only)', value: 'none' },
        { label: 'Lead (Milestone 4)', value: 'lead' },
      ],
    },
    {
      name: 'fields',
      type: 'blocks',
      required: true,
      label: 'Form fields',
      labels: { singular: 'Field', plural: 'Fields' },
      blocks: [TextField, EmailField, PhoneNumberField, MessageField, CheckboxGroupField],
    },
    {
      name: 'submitButtonLabel',
      type: 'text',
      localized: true,
      required: true,
      label: 'Submit button label',
      admin: { placeholder: 'Send' },
    },
    {
      name: 'successMessage',
      type: 'text',
      localized: true,
      required: true,
      label: 'Success message',
    },
    {
      name: 'preventDuplicateEmail',
      type: 'checkbox',
      defaultValue: false,
      label: 'Prevent duplicate email',
    },
    {
      name: 'duplicateEmailTitle',
      type: 'text',
      localized: true,
      label: 'Duplicate email title',
      admin: {
        condition: (_data, siblingData) => Boolean(siblingData?.preventDuplicateEmail),
      },
    },
    {
      name: 'duplicateEmailMessage',
      type: 'textarea',
      localized: true,
      label: 'Duplicate email message',
      admin: {
        condition: (_data, siblingData) => Boolean(siblingData?.preventDuplicateEmail),
      },
    },
    {
      name: 'emails',
      type: 'array',
      label: 'Notification emails',
      access: { read: userOnlyField },
      fields: [
        {
          name: 'emailTo',
          type: 'text',
          required: true,
          label: 'Email To',
        },
        {
          name: 'emailFrom',
          type: 'text',
          required: true,
          label: 'Email From',
        },
        {
          name: 'subject',
          type: 'text',
          required: true,
          defaultValue: 'New message received',
          label: 'Subject',
        },
        {
          name: 'message',
          type: 'richText',
          required: true,
          label: 'Message',
        },
      ],
    },
  ],
  labels: {
    singular: 'Form',
    plural: 'Forms',
  },
};
