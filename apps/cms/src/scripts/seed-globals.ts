import path from 'path';
import { getPayload } from 'payload';
import { fileURLToPath } from 'url';

import config from '../payload.config';
import { updateGlobalLocale } from './lib/upsert';
import { upsertMediaByFilename } from './lib/upsertMedia';

const brandDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../seed-assets/brand');

async function main(): Promise<void> {
  const payload = await getPayload({ config });

  payload.logger.info('Seeding brand media (WebP)…');

  const logoLightId = await upsertMediaByFilename(payload, {
    filePath: path.join(brandDir, 'logo-light.webp'),
    filename: 'logo-light.webp',
    altUa: 'AS Autosearch',
    altEn: 'AS Autosearch',
  });
  const logoDarkId = await upsertMediaByFilename(payload, {
    filePath: path.join(brandDir, 'logo-dark.webp'),
    filename: 'logo-dark.webp',
    altUa: 'AS Autosearch',
    altEn: 'AS Autosearch',
  });
  const faviconLightId = await upsertMediaByFilename(payload, {
    filePath: path.join(brandDir, 'favicon-light.webp'),
    filename: 'favicon-light.webp',
    altUa: 'Іконка AS Autosearch',
    altEn: 'AS Autosearch icon',
  });
  const faviconDarkId = await upsertMediaByFilename(payload, {
    filePath: path.join(brandDir, 'favicon-dark.webp'),
    filename: 'favicon-dark.webp',
    altUa: 'Іконка AS Autosearch',
    altEn: 'AS Autosearch icon',
  });
  const appleTouchLightId = await upsertMediaByFilename(payload, {
    filePath: path.join(brandDir, 'apple-touch-icon-light.webp'),
    filename: 'apple-touch-icon-light.webp',
    altUa: 'AS Autosearch',
    altEn: 'AS Autosearch',
  });
  const appleTouchDarkId = await upsertMediaByFilename(payload, {
    filePath: path.join(brandDir, 'apple-touch-icon-dark.webp'),
    filename: 'apple-touch-icon-dark.webp',
    altUa: 'AS Autosearch',
    altEn: 'AS Autosearch',
  });

  payload.logger.info('Seeding globals (ua + en)…');

  await updateGlobalLocale(payload, 'site-settings', 'ua', {
    siteName: 'AS Autosearch',
    defaultMetaTitle: 'AS Autosearch — Автопідбір',
    defaultMetaDescription: 'Професійний автопідбір під ваш запит.',
    defaultTheme: 'system',
    enableThemeToggle: true,
    faviconLight: faviconLightId,
    faviconDark: faviconDarkId,
    appleTouchIconLight: appleTouchLightId,
    appleTouchIconDark: appleTouchDarkId,
  });

  await updateGlobalLocale(payload, 'site-settings', 'en', {
    siteName: 'AS Autosearch',
    defaultMetaTitle: 'AS Autosearch — Car search',
    defaultMetaDescription: 'Professional car search tailored to your request.',
    defaultTheme: 'system',
    enableThemeToggle: true,
    faviconLight: faviconLightId,
    faviconDark: faviconDarkId,
    appleTouchIconLight: appleTouchLightId,
    appleTouchIconDark: appleTouchDarkId,
  });

  await updateGlobalLocale(payload, 'header', 'ua', {
    logoLight: logoLightId,
    logoDark: logoDarkId,
    logoText: 'Autosearch',
    phone: '+380 (00) 000 00 00',
    navItems: [
      {
        link: {
          type: 'custom',
          label: 'Послуги',
          url: '#services',
        },
      },
      {
        link: {
          type: 'custom',
          label: 'Як ми працюємо',
          url: '#route',
        },
      },
      {
        link: {
          type: 'custom',
          label: 'Контакти',
          url: '#callback',
        },
      },
    ],
    ctaLink: {
      type: 'custom',
      label: 'Залишити заявку',
      url: '/contacts',
    },
  });

  const headerUa = await payload.findGlobal({ slug: 'header', locale: 'ua', depth: 0 });
  const navIds = headerUa.navItems?.map((item) => item.id) ?? [];

  await updateGlobalLocale(payload, 'header', 'en', {
    logoLight: logoLightId,
    logoDark: logoDarkId,
    logoText: 'Autosearch',
    phone: '+380 (00) 000 00 00',
    navItems: [
      {
        id: navIds[0],
        link: { type: 'custom', label: 'Services', url: '#services' },
      },
      {
        id: navIds[1],
        link: { type: 'custom', label: 'How we work', url: '#route' },
      },
      {
        id: navIds[2],
        link: { type: 'custom', label: 'Contacts', url: '#callback' },
      },
    ],
    ctaLink: {
      type: 'custom',
      label: 'Leave a request',
      url: '/contacts',
    },
  });

  await updateGlobalLocale(payload, 'footer', 'ua', {
    logoLight: logoLightId,
    logoDark: logoDarkId,
    logoText: 'Autosearch',
    description: 'Автопідбір під ваш запит.',
    copyrightText: '© AS Autosearch. Усі права захищено.',
    navItems: [
      { link: { type: 'custom', label: 'Про нас', url: '/about' } },
      { link: { type: 'custom', label: 'Послуги', url: '/services' } },
      { link: { type: 'custom', label: 'Контакти', url: '/contacts' } },
    ],
  });

  const footerUa = await payload.findGlobal({ slug: 'footer', locale: 'ua', depth: 0 });
  const footerNavIds = footerUa.navItems?.map((item) => item.id) ?? [];

  await updateGlobalLocale(payload, 'footer', 'en', {
    logoLight: logoLightId,
    logoDark: logoDarkId,
    logoText: 'Autosearch',
    description: 'Car search tailored to your request.',
    copyrightText: '© AS Autosearch. All rights reserved.',
    navItems: [
      { id: footerNavIds[0], link: { type: 'custom', label: 'About', url: '/about' } },
      { id: footerNavIds[1], link: { type: 'custom', label: 'Services', url: '/services' } },
      { id: footerNavIds[2], link: { type: 'custom', label: 'Contacts', url: '/contacts' } },
    ],
  });

  await updateGlobalLocale(payload, 'contacts', 'ua', {
    phones: [{ label: 'Основний', number: '+380 (00) 000 00 00' }],
    email: 'hello@autosearch.example',
    address: 'Київ, Україна',
    hours: 'Пн–Пт: 09:00–18:00',
  });

  await updateGlobalLocale(payload, 'contacts', 'en', {
    phones: [{ label: 'Main', number: '+380 (00) 000 00 00' }],
    email: 'hello@autosearch.example',
    address: 'Kyiv, Ukraine',
    hours: 'Mon–Fri: 09:00–18:00',
  });

  await updateGlobalLocale(payload, 'price-list', 'ua', {
    title: 'Ціни',
    groups: [
      {
        title: 'Разова перевірка авто',
        basisLabel: 'Ціна авто',
        rows: [
          { label: 'До $10 000', amount: 1500, currency: 'uah', from: false },
          { label: 'До $20 000', amount: 2000, currency: 'uah', from: false },
          { label: 'Понад $20 000', amount: 3000, currency: 'uah', from: false },
          { label: 'Понад $40 000', amount: 100, currency: 'usd', from: false },
        ],
        addons: [
          { label: 'Огляд на СТО', amount: 700, currency: 'uah', from: false },
          { label: 'Перевірка історії обслуговування', amount: 700, currency: 'uah', from: false },
          { label: 'Комплексна перевірка авто', amount: 100, currency: 'usd', from: true },
          { label: 'Експерт на день', amount: 100, currency: 'usd', from: true },
        ],
        notes: [
          {
            text: 'Комплексна перевірка включає стандартну перевірку, повну діагностику на СТО та перевірку авто по дилерських базах на ремонти, серйозні ДТП і кузовні роботи.',
          },
          {
            text: 'Експерт на день: витрати на пальне додатково для поїздок за межі Хмельницького.',
          },
        ],
      },
      {
        title: 'Підбір авто під ключ',
        basisLabel: 'Бюджет авто',
        rows: [
          { label: 'До $10 000', amount: 400, currency: 'usd', from: false },
          { label: 'До $15 000', amount: 500, currency: 'usd', from: false },
          { label: 'До $20 000', amount: 600, currency: 'usd', from: false },
          { label: 'До $30 000', amount: 700, currency: 'usd', from: false },
        ],
        addons: [{ label: 'Виїзд в інше місто', amount: 2000, currency: 'uah', from: true }],
        notes: [],
      },
    ],
  });

  const priceListUa = await payload.findGlobal({ slug: 'price-list', locale: 'ua', depth: 0 });
  const groupIds = priceListUa.groups?.map((g) => g.id) ?? [];
  const rowIds = (gi: number) => priceListUa.groups?.[gi]?.rows?.map((r) => r.id) ?? [];
  const addonIds = (gi: number) => priceListUa.groups?.[gi]?.addons?.map((a) => a.id) ?? [];
  const noteIds = (gi: number) => priceListUa.groups?.[gi]?.notes?.map((n) => n.id) ?? [];

  await updateGlobalLocale(payload, 'price-list', 'en', {
    title: 'Prices',
    groups: [
      {
        id: groupIds[0],
        title: 'One-time vehicle inspection',
        basisLabel: 'Vehicle price',
        rows: [
          { id: rowIds(0)[0], label: 'Up to $10,000', amount: 1500, currency: 'uah', from: false },
          { id: rowIds(0)[1], label: 'Up to $20,000', amount: 2000, currency: 'uah', from: false },
          { id: rowIds(0)[2], label: 'Over $20,000', amount: 3000, currency: 'uah', from: false },
          { id: rowIds(0)[3], label: 'Over $40,000', amount: 100, currency: 'usd', from: false },
        ],
        addons: [
          {
            id: addonIds(0)[0],
            label: 'Inspection at a service station',
            amount: 700,
            currency: 'uah',
            from: false,
          },
          {
            id: addonIds(0)[1],
            label: 'Service history check',
            amount: 700,
            currency: 'uah',
            from: false,
          },
          {
            id: addonIds(0)[2],
            label: 'Comprehensive vehicle inspection',
            amount: 100,
            currency: 'usd',
            from: true,
          },
          {
            id: addonIds(0)[3],
            label: 'Expert for a day',
            amount: 100,
            currency: 'usd',
            from: true,
          },
        ],
        notes: [
          {
            id: noteIds(0)[0],
            text: 'Comprehensive vehicle inspection includes a standard vehicle inspection, full diagnostics at a service station, and checking the vehicle against dealer databases for repairs, major accidents, and body repairs.',
          },
          {
            id: noteIds(0)[1],
            text: 'Expert for a day: fuel costs are additional for trips outside Khmelnytskyi.',
          },
        ],
      },
      {
        id: groupIds[1],
        title: 'Turnkey car search',
        basisLabel: 'Vehicle budget',
        rows: [
          { id: rowIds(1)[0], label: 'Up to $10,000', amount: 400, currency: 'usd', from: false },
          { id: rowIds(1)[1], label: 'Up to $15,000', amount: 500, currency: 'usd', from: false },
          { id: rowIds(1)[2], label: 'Up to $20,000', amount: 600, currency: 'usd', from: false },
          { id: rowIds(1)[3], label: 'Up to $30,000', amount: 700, currency: 'usd', from: false },
        ],
        addons: [
          {
            id: addonIds(1)[0],
            label: 'Travel to another city',
            amount: 2000,
            currency: 'uah',
            from: true,
          },
        ],
        notes: [],
      },
    ],
  });

  payload.logger.info('Globals seeded.');
}

try {
  await main();
  process.exit(0);
} catch (err) {
  console.error('[seed-globals] failed:', err);
  process.exit(1);
}
