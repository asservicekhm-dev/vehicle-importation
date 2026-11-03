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
    singular: { en: 'Lead', uk: 'Заявка' },
    plural: { en: 'Leads', uk: 'Заявки' },
  },
  admin: {
    group: { en: 'Forms', uk: 'Форми' },
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
      label: { en: 'Status', uk: 'Статус' },
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: { en: 'New', uk: 'Нова' }, value: 'new' },
        { label: { en: 'In progress', uk: 'В роботі' }, value: 'in-progress' },
        { label: { en: 'Won', uk: 'Успішна' }, value: 'won' },
        { label: { en: 'Lost', uk: 'Відхилена' }, value: 'lost' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'type',
      label: { en: 'Lead type', uk: 'Тип заявки' },
      type: 'select',
      defaultValue: 'general',
      options: [
        { label: { en: 'Consultation', uk: 'Консультація' }, value: 'consultation' },
        { label: { en: 'Turnkey search', uk: 'Підбір під ключ' }, value: 'turnkey' },
        { label: { en: 'Inspection', uk: 'Перевірка перед покупкою' }, value: 'inspection' },
        { label: { en: 'Expert for a day', uk: 'Експерт на день' }, value: 'expert' },
        { label: { en: 'Callback', uk: 'Зворотний дзвінок' }, value: 'callback' },
        { label: { en: 'Test drive', uk: 'Тест-драйв' }, value: 'test-drive' },
        { label: { en: 'Trade-in', uk: 'Trade-in' }, value: 'trade-in' },
        { label: { en: 'Finance', uk: 'Фінансування' }, value: 'finance' },
        { label: { en: 'General', uk: 'Загальна' }, value: 'general' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'readAt',
      label: { en: 'Opened at', uk: 'Відкрито' },
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        condition: (_data, siblingData) => Boolean(siblingData?.readAt),
      },
    },
    {
      name: 'formSubmission',
      label: { en: 'Form submission', uk: 'Відправлення форми' },
      type: 'relationship',
      relationTo: 'form-submissions',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'form',
      label: { en: 'Form', uk: 'Форма' },
      type: 'relationship',
      relationTo: 'forms',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'name',
      label: { en: 'Name', uk: "Імʼя" },
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'phone',
      label: { en: 'Phone', uk: 'Телефон' },
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'email',
      label: { en: 'Email', uk: 'Email' },
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'message',
      label: { en: 'Message', uk: 'Повідомлення' },
      type: 'textarea',
      admin: { readOnly: true },
    },
    {
      name: 'request',
      label: { en: 'Request details', uk: 'Деталі запиту' },
      type: 'group',
      admin: {
        readOnly: true,
        condition: (_data, siblingData) => {
          const request = siblingData?.request as Record<string, unknown> | undefined;
          if (!request || typeof request !== 'object') return false;
          return Object.values(request).some((value) => {
            if (typeof value === 'boolean') return value;
            return Boolean(String(value ?? '').trim());
          });
        },
      },
      fields: [
        { name: 'budget', type: 'text', label: { en: 'Budget', uk: 'Бюджет' } },
        {
          name: 'budgetCurrency',
          type: 'select',
          label: { en: 'Budget currency', uk: 'Валюта бюджету' },
          options: [
            { label: 'UAH', value: 'uah' },
            { label: 'USD', value: 'usd' },
            { label: 'EUR', value: 'eur' },
          ],
        },
        { name: 'origin', type: 'text', label: { en: 'Origin', uk: 'Регіон авто' } },
        { name: 'carType', type: 'text', label: { en: 'Car type', uk: 'Тип авто' } },
        { name: 'carBrand', type: 'text', label: { en: 'Car brand', uk: 'Марка' } },
        {
          name: 'otherCity',
          type: 'checkbox',
          label: {
            en: 'Delivery to another city',
            uk: 'Доставка в інше місто',
          },
        },
        {
          name: 'deliveryCity',
          type: 'text',
          label: { en: 'Delivery city', uk: 'Місто доставки' },
        },
        {
          name: 'priceRange',
          type: 'text',
          label: { en: 'Price range', uk: 'Ціновий діапазон' },
        },
        { name: 'addons', type: 'textarea', label: { en: 'Add-ons', uk: 'Додаткові опції' } },
        {
          name: 'expectedPrice',
          type: 'text',
          label: { en: 'Expected price', uk: 'Орієнтовна вартість' },
        },
      ],
    },
    {
      name: 'source',
      label: { en: 'Source URL', uk: 'URL джерела' },
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'consent',
      label: { en: 'Consent', uk: 'Згода' },
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
