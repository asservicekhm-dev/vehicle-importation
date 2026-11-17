import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionConfig,
} from 'payload';

import { notifyBotAuthDecision } from '@/lib/botNotify';

const setDecidedAt: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  if (!data) return data;

  const nextStatus = data.status ?? originalDoc?.status;
  const prevStatus = originalDoc?.status;

  if (
    typeof nextStatus === 'string' &&
    nextStatus !== 'pending' &&
    nextStatus !== prevStatus
  ) {
    data.decidedAt = new Date().toISOString();
  }

  return data;
};

/** Notify the Telegram user when Admin changes their access status. */
const notifyBotOnAuthChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
}) => {
  const nextStatus = doc.status;
  const prevStatus = previousDoc?.status ?? null;

  if (
    typeof nextStatus !== 'string' ||
    (operation === 'update' && nextStatus === prevStatus)
  ) {
    return doc;
  }

  // Skip create-as-pending (user already saw requestSent in the bot).
  if (operation === 'create' && nextStatus === 'pending') {
    return doc;
  }

  try {
    await notifyBotAuthDecision({
      telegramId: String(doc.telegramId),
      status: nextStatus as 'pending' | 'approved' | 'declined' | 'blocked',
      previousStatus: typeof prevStatus === 'string' ? prevStatus : null,
    });
  } catch (err) {
    console.error('[bot-users] auth notify failed', err);
  }

  return doc;
};

export const BotUsers: CollectionConfig = {
  slug: 'bot-users',
  labels: {
    singular: { en: 'Bot user', uk: 'Користувач бота' },
    plural: { en: 'Bot users', uk: 'Користувачі бота' },
  },
  admin: {
    group: { en: 'Telegram', uk: 'Телеграм' },
    useAsTitle: 'telegramId',
    defaultColumns: ['status', 'username', 'firstName', 'telegramId', 'requestedAt', 'updatedAt'],
    description: {
      en: 'Staff Telegram access requests. Approve operators before they can manage leads in the bot.',
      uk: 'Запити доступу до Telegram-бота. Схваліть операторів, щоб вони могли працювати із заявками.',
    },
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeChange: [setDecidedAt],
    afterChange: [notifyBotOnAuthChange],
  },
  fields: [
    {
      name: 'telegramId',
      label: { en: 'Telegram ID', uk: 'Telegram ID' },
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: {
          en: 'Telegram user id as a string.',
          uk: 'ID користувача Telegram (рядок).',
        },
      },
    },
    {
      name: 'username',
      label: { en: 'Username', uk: 'Username' },
      type: 'text',
      admin: {
        description: {
          en: 'Without @.',
          uk: 'Без @.',
        },
      },
    },
    {
      name: 'firstName',
      label: { en: 'First name', uk: "Імʼя" },
      type: 'text',
    },
    {
      name: 'lastName',
      label: { en: 'Last name', uk: 'Прізвище' },
      type: 'text',
    },
    {
      name: 'languageCode',
      label: { en: 'Language code', uk: 'Код мови' },
      type: 'text',
      admin: {
        description: {
          en: 'Stored for diagnostics; bot UI stays Ukrainian.',
          uk: 'Лише для діагностики; інтерфейс бота українською.',
        },
      },
    },
    {
      name: 'status',
      label: { en: 'Status', uk: 'Статус' },
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: { en: 'Pending', uk: 'На розгляді' }, value: 'pending' },
        { label: { en: 'Approved', uk: 'Схвалено' }, value: 'approved' },
        { label: { en: 'Declined', uk: 'Відхилено' }, value: 'declined' },
        { label: { en: 'Blocked', uk: 'Заблоковано' }, value: 'blocked' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'requestedAt',
      label: { en: 'Requested at', uk: 'Запит надіслано' },
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        readOnly: true,
      },
    },
    {
      name: 'decidedAt',
      label: { en: 'Decided at', uk: 'Рішення прийнято' },
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        readOnly: true,
        condition: (_data, siblingData) => Boolean(siblingData?.decidedAt),
      },
    },
    {
      name: 'note',
      label: { en: 'Admin note', uk: 'Нотатка адміна' },
      type: 'textarea',
      admin: {
        description: {
          en: 'Internal only — not shown in the bot.',
          uk: 'Лише для адмінів — у боті не показується.',
        },
      },
    },
  ],
};
