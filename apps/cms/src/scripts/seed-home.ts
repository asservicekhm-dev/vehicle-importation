import { getPayload } from 'payload';

import config from '../payload.config';
import { upsertPageBySlug } from './lib/upsert';

const uaLayout = [
  {
    blockType: 'dummy-section' as const,
    blockName: 'intro',
    eyebrow: 'Автопідбір',
    title: 'Знайдемо авто під ваш запит',
    description:
      'Статичний превʼю секції Milestone 3 — контент зʼявиться з CMS у наступних етапах.',
    ctaLabel: 'Залишити заявку',
  },
];

const enLayout = [
  {
    blockType: 'dummy-section' as const,
    blockName: 'intro',
    eyebrow: 'Car search',
    title: 'We will find a car for your request',
    description: 'Milestone 3 skeleton section — richer CMS content arrives in later milestones.',
    ctaLabel: 'Leave a request',
  },
];

async function main(): Promise<void> {
  const payload = await getPayload({ config });

  payload.logger.info('Seeding home page (ua + en)…');

  // Always write default locale first so EN updates the same document.
  await upsertPageBySlug(payload, {
    slug: 'home',
    locale: 'ua',
    data: {
      title: 'Головна',
      viewType: 'home',
      _status: 'published',
      layout: uaLayout,
      meta: {
        title: 'AS Autosearch — Автопідбір',
        description: 'Професійний автопідбір під ваш запит.',
      },
    },
  });

  await upsertPageBySlug(payload, {
    slug: 'home',
    locale: 'en',
    data: {
      title: 'Home',
      viewType: 'home',
      _status: 'published',
      layout: enLayout,
      meta: {
        title: 'AS Autosearch — Car search',
        description: 'Professional car search tailored to your request.',
      },
    },
  });

  payload.logger.info('Home page seeded.');
}

try {
  await main();
  process.exit(0);
} catch (err) {
  console.error('[seed-home] failed:', err);
  process.exit(1);
}
