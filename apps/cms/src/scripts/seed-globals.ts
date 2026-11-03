import { getPayload } from 'payload';

import config from '../payload.config';
import { updateGlobalLocale } from './lib/upsert';

async function main(): Promise<void> {
  const payload = await getPayload({ config });

  payload.logger.info('Seeding globals (ua + en)…');

  await updateGlobalLocale(payload, 'site-settings', 'ua', {
    siteName: 'AS Autosearch',
    defaultMetaTitle: 'AS Autosearch — Автопідбір',
    defaultMetaDescription: 'Професійний автопідбір під ваш запит.',
    defaultTheme: 'system',
    enableThemeToggle: true,
  });

  await updateGlobalLocale(payload, 'site-settings', 'en', {
    siteName: 'AS Autosearch',
    defaultMetaTitle: 'AS Autosearch — Car search',
    defaultMetaDescription: 'Professional car search tailored to your request.',
    defaultTheme: 'system',
    enableThemeToggle: true,
  });

  await updateGlobalLocale(payload, 'header', 'ua', {
    phone: '+380 (00) 000 00 00',
    navItems: [
      {
        link: {
          type: 'custom',
          label: 'Про нас',
          url: '/about',
        },
      },
      {
        link: {
          type: 'custom',
          label: 'Послуги',
          url: '/services',
        },
      },
      {
        link: {
          type: 'custom',
          label: 'Контакти',
          url: '/contacts',
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
    phone: '+380 (00) 000 00 00',
    navItems: [
      {
        id: navIds[0],
        link: { type: 'custom', label: 'About', url: '/about' },
      },
      {
        id: navIds[1],
        link: { type: 'custom', label: 'Services', url: '/services' },
      },
      {
        id: navIds[2],
        link: { type: 'custom', label: 'Contacts', url: '/contacts' },
      },
    ],
    ctaLink: {
      type: 'custom',
      label: 'Leave a request',
      url: '/contacts',
    },
  });

  await updateGlobalLocale(payload, 'footer', 'ua', {
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

  payload.logger.info('Globals seeded.');
}

try {
  await main();
  process.exit(0);
} catch (err) {
  console.error('[seed-globals] failed:', err);
  process.exit(1);
}
