/**
 * Debug seed: 30 varied leads for Telegram bot list/pagination/display.
 * Idempotent: removes previous `https://seed.local/bot-debug/*` leads + their submissions, then recreates.
 *
 *   pnpm seed:bot-leads
 */
import { getPayload, type Payload } from 'payload';

import {
  budgetCurrencies,
  carBrands,
  carOrigins,
  carTypes,
  deliveryCities,
} from '@autosearch/config';

import config from '../payload.config';

const SEED_FORM_TITLE = 'AS Autosearch — Bot seed (no fan-out)';
const SOURCE_PREFIX = 'https://seed.local/bot-debug/';
const LEAD_COUNT = 30;

const STATUSES = ['new', 'in-progress', 'won', 'lost'] as const;
const LEAD_TYPES = [
  'consultation',
  'turnkey',
  'inspection',
  'expert',
  'callback',
  'test-drive',
  'trade-in',
  'finance',
  'general',
] as const;

const NAMES = [
  'Олена',
  'Андрій',
  'Марія',
  'Ігор',
  'Наталія',
  'Сергій',
  'Юлія',
  'Дмитро',
  'Катерина',
  'Тарас',
  'Вікторія',
  'Богдан',
  'Анна',
  'Максим',
  'Софія',
];

function pick<T>(items: readonly T[], index: number): T {
  return items[index % items.length]!;
}

function phoneFor(index: number): string {
  const n = String(100000000 + index).slice(0, 9);
  return `38067${n}`;
}

async function ensureSeedForm(payload: Payload): Promise<string> {
  const existing = await payload.find({
    collection: 'forms',
    where: { title: { equals: SEED_FORM_TITLE } },
    limit: 1,
    depth: 0,
  });

  if (existing.docs[0]?.id) {
    return String(existing.docs[0].id);
  }

  const created = await payload.create({
    collection: 'forms',
    data: {
      title: SEED_FORM_TITLE,
      submissionKind: 'none',
      submitButtonLabel: 'Seed',
      successMessage: 'Seed form — not for public use.',
      fields: [
        {
          blockType: 'text',
          name: 'name',
          label: 'Name',
          isRequired: true,
        },
      ],
    },
    overrideAccess: true,
  });

  return String(created.id);
}

async function clearPreviousSeed(payload: Payload): Promise<void> {
  const leads = await payload.find({
    collection: 'leads',
    where: { source: { contains: 'seed.local/bot-debug/' } },
    limit: 200,
    depth: 0,
    overrideAccess: true,
  });

  const submissionIds = new Set<string>();
  for (const lead of leads.docs) {
    const sub = lead.formSubmission;
    if (typeof sub === 'string') submissionIds.add(sub);
    else if (sub && typeof sub === 'object' && 'id' in sub) submissionIds.add(String(sub.id));

    await payload.delete({
      collection: 'leads',
      id: lead.id,
      overrideAccess: true,
    });
  }

  for (const id of submissionIds) {
    try {
      await payload.delete({
        collection: 'form-submissions',
        id,
        overrideAccess: true,
      });
    } catch {
      // already gone
    }
  }

  console.log(`[seed-bot-leads] cleared ${leads.docs.length} previous seed leads`);
}

function buildLeadData(index: number, formId: string, submissionId: string) {
  const n = index + 1;
  const status = pick(STATUSES, index);
  const type = pick(LEAD_TYPES, index);
  const origin = pick(carOrigins, index).value;
  const carType = pick(carTypes, index).value;
  const carBrand = pick(carBrands, index).value;
  const deliveryCity = pick(deliveryCities, index).value;
  const budgetCurrency = pick(budgetCurrencies, index);
  const otherCity = index % 3 !== 0;
  const budget = String(15000 + index * 1370);
  const expectedPrice = `${500 + index * 25} ${budgetCurrency.toUpperCase()}`;
  const name = `${pick(NAMES, index)} #${String(n).padStart(2, '0')}`;

  const request: Record<string, unknown> = {
    origin,
    carType,
    carBrand,
    otherCity,
    budget,
    budgetCurrency,
    expectedPrice,
  };

  if (otherCity) {
    request.deliveryCity = deliveryCity;
  }

  // Rotate optional extras so cards look different.
  if (index % 2 === 0) {
    request.priceRange = `${10000 + index * 500}-${20000 + index * 500}`;
  }
  if (index % 4 === 0) {
    request.addons = 'Компʼютерна діагностика, виїзд';
  }
  if (index % 5 === 0) {
    // free-text brand to exercise capitalize fallback
    request.carBrand = 'byd';
  }

  const data: Record<string, unknown> = {
    status,
    type,
    form: formId,
    formSubmission: submissionId,
    name,
    phone: phoneFor(n),
    request,
    source: `${SOURCE_PREFIX}${String(n).padStart(2, '0')}`,
    consent: false,
  };

  if (index % 3 === 0) {
    data.email = `lead${n}@example.com`;
  }
  if (index % 2 === 0) {
    data.message = `Тестова заявка #${n} для бота. Шукаємо авто з регіону ${origin}.`;
  }
  if (status !== 'new') {
    data.readAt = new Date(Date.now() - index * 3600_000).toISOString();
  }
  if (index % 4 === 1) {
    data.utm = {
      source: 'telegram-seed',
      medium: 'debug',
      campaign: `bot-page-${Math.ceil(n / 5)}`,
    };
  }

  return data;
}

async function main() {
  const payload = await getPayload({ config });
  const formId = await ensureSeedForm(payload);
  await clearPreviousSeed(payload);

  for (let i = 0; i < LEAD_COUNT; i++) {
    const n = i + 1;
    const source = `${SOURCE_PREFIX}${String(n).padStart(2, '0')}`;

    const submission = await payload.create({
      collection: 'form-submissions',
      data: {
        form: formId,
        submissionData: [
          { field: 'name', value: `seed-${n}` },
          { field: 'source', value: source },
        ],
      },
      overrideAccess: true,
    });

    const data = buildLeadData(i, formId, String(submission.id));
    await payload.create({
      collection: 'leads',
      // Payload create typing is strict; seed payload is shaped like Lead fields.
      data: data as never,
      overrideAccess: true,
    });
  }

  console.log(
    `[seed-bot-leads] created ${LEAD_COUNT} leads (statuses/types/origins/brands/cities rotated)`,
  );
}

try {
  await main();
  process.exit(0);
} catch (err) {
  console.error('[seed-bot-leads] failed:', err);
  process.exit(1);
}
