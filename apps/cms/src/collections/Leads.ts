import type { CollectionAfterReadHook, CollectionConfig } from 'payload';

const markAsReadOnOpen: CollectionAfterReadHook = async ({ doc, req }) => {
  const anyReq = req as { context?: Record<string, unknown> };
  if (anyReq.context?.__leadsMarkRead) return doc;
  if (!req.user) return doc;

  if (doc.status !== 'new') return doc;

  try {
    anyReq.context = { ...(anyReq.context ?? {}), __leadsMarkRead: true };
    await req.payload.update({
      collection: 'leads',
      id: doc.id,
      data: { status: 'in-progress', readAt: new Date().toISOString() },
      overrideAccess: true,
      req,
    });
  } catch {
    // Read should not fail if status update fails.
  }

  return doc;
};

export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: {
    singular: 'Lead',
    plural: 'Leads',
  },
  admin: {
    group: 'Forms',
    useAsTitle: 'name',
    defaultColumns: ['status', 'type', 'name', 'phone', 'createdAt'],
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    afterRead: [markAsReadOnOpen],
  },
  fields: [
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'In progress', value: 'in-progress' },
        { label: 'Won', value: 'won' },
        { label: 'Lost', value: 'lost' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'type',
      label: 'Lead type',
      type: 'select',
      defaultValue: 'general',
      options: [
        { label: 'Callback', value: 'callback' },
        { label: 'Test drive', value: 'test-drive' },
        { label: 'Trade-in', value: 'trade-in' },
        { label: 'Finance', value: 'finance' },
        { label: 'General', value: 'general' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'readAt',
      label: 'Opened at',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        condition: (_data, siblingData) => Boolean(siblingData?.readAt),
      },
    },
    {
      name: 'formSubmission',
      label: 'Form submission',
      type: 'relationship',
      relationTo: 'form-submissions',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'form',
      label: 'Form',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'email',
      label: 'Email',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'message',
      label: 'Message',
      type: 'textarea',
      admin: { readOnly: true },
    },
    {
      name: 'source',
      label: 'Source URL',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'consent',
      label: 'Consent',
      type: 'checkbox',
      defaultValue: false,
      admin: { readOnly: true },
    },
    {
      name: 'utm',
      label: 'UTM',
      type: 'group',
      admin: { readOnly: true },
      fields: [
        { name: 'source', type: 'text', label: 'utm_source' },
        { name: 'medium', type: 'text', label: 'utm_medium' },
        { name: 'campaign', type: 'text', label: 'utm_campaign' },
      ],
    },
  ],
};
