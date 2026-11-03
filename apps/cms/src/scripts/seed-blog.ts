import path from 'path';
import { getPayload, type Payload } from 'payload';
import { fileURLToPath } from 'url';

import config from '../payload.config';
import { upsertPageBySlug } from './lib/upsert';
import { upsertMediaByFilename } from './lib/upsertMedia';

const skip = { skipRevalidate: true } as const;

const blogAssetsDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../seed-assets/blog',
);

type LexicalDoc = {
  root: {
    type: 'root';
    format: '';
    indent: number;
    version: number;
    direction: 'ltr';
    children: Array<{
      type: 'paragraph';
      format: '';
      indent: number;
      version: number;
      direction: 'ltr';
      children: Array<{
        type: 'text';
        text: string;
        version: number;
        detail: number;
        format: number;
        mode: 'normal';
        style: string;
      }>;
    }>;
  };
};

function lexicalBody(paragraphs: string[]): LexicalDoc {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: paragraphs
        .map((text) => text.trim())
        .filter(Boolean)
        .map((text) => ({
          type: 'paragraph' as const,
          format: '' as const,
          indent: 0,
          version: 1,
          direction: 'ltr' as const,
          children: [
            {
              type: 'text' as const,
              text,
              version: 1,
              detail: 0,
              format: 0,
              mode: 'normal' as const,
              style: '',
            },
          ],
        })),
    },
  };
}

async function upsertCategory(payload: Payload): Promise<string> {
  const existing = await payload.find({
    collection: 'blog-categories',
    limit: 1,
    depth: 0,
  });
  if (existing.docs[0]?.id) {
    await payload.update({
      collection: 'blog-categories',
      id: existing.docs[0].id,
      locale: 'ua',
      data: { title: 'Поради' },
      context: skip,
    });
    await payload.update({
      collection: 'blog-categories',
      id: existing.docs[0].id,
      locale: 'en',
      data: { title: 'Tips' },
      context: skip,
    });
    return existing.docs[0].id;
  }

  const created = await payload.create({
    collection: 'blog-categories',
    locale: 'ua',
    data: { title: 'Поради' },
    context: skip,
  });
  await payload.update({
    collection: 'blog-categories',
    id: created.id,
    locale: 'en',
    data: { title: 'Tips' },
    context: skip,
  });
  return created.id;
}

async function upsertAuthor(payload: Payload): Promise<string> {
  const existing = await payload.find({
    collection: 'blog-authors',
    where: { slug: { equals: 'as-autosearch' } },
    limit: 1,
    depth: 0,
  });
  if (existing.docs[0]?.id) {
    await payload.update({
      collection: 'blog-authors',
      id: existing.docs[0].id,
      locale: 'ua',
      data: { name: 'AS Autosearch', role: 'Команда автопідбору', slug: 'as-autosearch' },
      context: skip,
    });
    await payload.update({
      collection: 'blog-authors',
      id: existing.docs[0].id,
      locale: 'en',
      data: { name: 'AS Autosearch', role: 'Car search team', slug: 'as-autosearch' },
      context: skip,
    });
    return existing.docs[0].id;
  }

  const created = await payload.create({
    collection: 'blog-authors',
    locale: 'ua',
    data: { name: 'AS Autosearch', role: 'Команда автопідбору', slug: 'as-autosearch' },
    context: skip,
  });
  await payload.update({
    collection: 'blog-authors',
    id: created.id,
    locale: 'en',
    data: { name: 'AS Autosearch', role: 'Car search team', slug: 'as-autosearch' },
    context: skip,
  });
  return created.id;
}

async function upsertPost(
  payload: Payload,
  args: {
    slug: string;
    categoryId: string;
    authorId: string;
    thumbnailId: string;
    ua: { title: string; excerpt: string; body: string[] };
    en: { title: string; excerpt: string; body: string[] };
  },
): Promise<void> {
  const existing = await payload.find({
    collection: 'blog',
    where: { slug: { equals: args.slug } },
    limit: 1,
    depth: 0,
  });

  const uaData = {
    title: args.ua.title,
    excerpt: args.ua.excerpt,
    body: lexicalBody(args.ua.body),
    slug: args.slug,
    thumbnail: args.thumbnailId,
    category: args.categoryId,
    author: args.authorId,
    _status: 'published' as const,
    meta: {
      title: `${args.ua.title} — AS Autosearch`,
      description: args.ua.excerpt,
      image: args.thumbnailId,
    },
  };

  const enData = {
    title: args.en.title,
    excerpt: args.en.excerpt,
    body: lexicalBody(args.en.body),
    slug: args.slug,
    thumbnail: args.thumbnailId,
    category: args.categoryId,
    author: args.authorId,
    _status: 'published' as const,
    meta: {
      title: `${args.en.title} — AS Autosearch`,
      description: args.en.excerpt,
      image: args.thumbnailId,
    },
  };

  if (existing.docs[0]?.id) {
    await payload.update({
      collection: 'blog',
      id: existing.docs[0].id,
      locale: 'ua',
      data: uaData,
      context: skip,
      draft: false,
    });
    await payload.update({
      collection: 'blog',
      id: existing.docs[0].id,
      locale: 'en',
      data: enData,
      context: skip,
      draft: false,
    });
    return;
  }

  const created = await payload.create({
    collection: 'blog',
    locale: 'ua',
    data: uaData,
    context: skip,
    draft: false,
  });
  await payload.update({
    collection: 'blog',
    id: created.id,
    locale: 'en',
    data: enData,
    context: skip,
    draft: false,
  });
}

async function main(): Promise<void> {
  const payload = await getPayload({ config });

  payload.logger.info('Seeding blog thumbnails…');
  const thumbUsaId = await upsertMediaByFilename(payload, {
    filePath: path.join(blogAssetsDir, 'thumb-usa.webp'),
    filename: 'thumb-usa.webp',
    altUa: 'Авто на дорозі — фото Unsplash (Campbell)',
    altEn: 'Car on the road — Unsplash photo (Campbell)',
  });
  const thumbInspectionId = await upsertMediaByFilename(payload, {
    filePath: path.join(blogAssetsDir, 'thumb-inspection.webp'),
    filename: 'thumb-inspection.webp',
    altUa: 'Механік оглядає двигун — фото Unsplash',
    altEn: 'Mechanic inspecting an engine — Unsplash photo',
  });
  const thumbTurnkeyId = await upsertMediaByFilename(payload, {
    filePath: path.join(blogAssetsDir, 'thumb-turnkey.webp'),
    filename: 'thumb-turnkey.webp',
    altUa: 'Автомобіль після підбору — фото Unsplash (Josh Berendes)',
    altEn: 'Car after turnkey search — Unsplash photo (Josh Berendes)',
  });

  payload.logger.info('Seeding blog category + author…');
  const categoryId = await upsertCategory(payload);
  const authorId = await upsertAuthor(payload);

  payload.logger.info('Seeding sample posts…');
  await upsertPost(payload, {
    slug: 'yak-obraty-avto-z-usa',
    categoryId,
    authorId,
    thumbnailId: thumbUsaId,
    ua: {
      title: 'Як обрати авто зі США',
      excerpt: 'На що звернути увагу в аукціонній історії, страховці та логістиці.',
      body: [
        'Авто зі США часто коштує вигідніше за європейський аналог, але економія зникає, якщо пропустити аукціонну історію. Copart і IAAI показують тип лота, оцінку збитків і фото після ДТП — саме з цього починаємо відбір.',
        'Перевірте primary / secondary damage, airbags, статус Run & Drive. «Clean title» не гарантує ідеальний кузов: багато машин відновлювали під страхову виплату. Ми звіряємо VIN у Carfax / AutoCheck і шукаємо розбіжності з аукціонними фото.',
        'Логістика й митниця — окремий бюджет: контейнер, брокер, розмитнення за формулою акцизу, розвантаження в порту. Закладайте резерв 10–15% на непередбачені витрати, щоб ціна «під ключ» не змінилася в дорозі.',
        'Якщо сумніваєтесь у лоті — краще пропустити. На ринку США щодня тисячі варіантів; наша роль — відфільтрувати ризикові й торгуватися лише за ті, що проходять перевірку документів і технічного стану.',
      ],
    },
    en: {
      title: 'How to choose a car from the USA',
      excerpt: 'What to check in auction history, insurance, and logistics.',
      body: [
        'US cars often undercut European prices — until auction history is ignored. Copart and IAAI show lot type, damage estimates, and post-accident photos; that is where shortlisting starts.',
        'Check primary / secondary damage, airbags, and Run & Drive status. A clean title does not mean perfect bodywork: many cars were repaired for an insurance payout. We cross-check the VIN in Carfax / AutoCheck against auction photos.',
        'Shipping and customs are a separate budget: container, broker, excise-based clearance, port unloading. Keep a 10–15% buffer so the turnkey price does not drift mid-route.',
        'If a lot looks doubtful, skip it. The US market lists thousands of cars daily; our job is to filter risk and bid only on units that clear documents and technical checks.',
      ],
    },
  });

  await upsertPost(payload, {
    slug: 'perevirka-pered-kupivleiu',
    categoryId,
    authorId,
    thumbnailId: thumbInspectionId,
    ua: {
      title: 'Чому важлива перевірка перед покупкою',
      excerpt: 'Пробіг, ДТП і ЛКП — що саме дивиться експерт на огляді.',
      body: [
        'Оголошення рідко показує реальний стан. Підкручений пробіг, шпаклівка після ДТП або «косметичний» ремонт ЛКП виявляються лише на місці — з товщиноміром, підйомником і діагностичним сканером.',
        'На огляді дивимось геометрію кузова, сліди зварювання, роботу підвіски й гальм, витоки, стан ременів і турбіни. Для електроніки — помилки ECU, адаптації КПП, історію сервісних втручань там, де вона доступна.',
        'Окремо фіксуємо комплектність: ключі, документи, сервісну книжку, рідне скло й фари. Дрібниці впливають на бюджет після покупки сильніше, ніж здається на фото.',
        'Результат — письмовий звіт із фото й рекомендацією: брати, торгуватися або відмовитися. Так ви купуєте не «на око», а з фактами, які можна показати сервісу чи страховику.',
      ],
    },
    en: {
      title: 'Why a pre-purchase inspection matters',
      excerpt: 'Mileage, accidents, and paint — what an expert checks on site.',
      body: [
        'Listings rarely show true condition. Rolled mileage, body filler after a crash, or cosmetic paintwork only show up on site — with a paint meter, lift, and diagnostic scanner.',
        'We check body geometry, weld marks, suspension and brakes, leaks, belts, and turbo health. On the electronics side: ECU faults, gearbox adaptations, and service history where available.',
        'We also log completeness: keys, paperwork, service book, original glass and lights. Small gaps hit the post-purchase budget harder than photos suggest.',
        'You get a written report with photos and a clear call: buy, renegotiate, or walk away — facts you can share with a workshop or insurer, not a gut feel.',
      ],
    },
  });

  await upsertPost(payload, {
    slug: 'etapy-pid-kliuch',
    categoryId,
    authorId,
    thumbnailId: thumbTurnkeyId,
    ua: {
      title: 'Етапи підбору під ключ',
      excerpt: 'Від бюджету до реєстрації в сервісному центрі МВС — коротко про процес.',
      body: [
        'Спочатку фіксуємо бюджет «під ключ», регіон пошуку (США / Європа / Корея), тип кузова й список «ніколи» — марки чи роки, які клієнт не розглядає. Без цього фільтр ринку розмитий.',
        'Далі формуємо shortlist, перевіряємо історію й торгуємося на аукціоні або з продавцем. Після виграшу — оплата, логістика, митниця й локальна доставка до міста клієнта.',
        'Паралельно готуємо документи: договір, калькуляцію розмитнення, акти приймання. На фініші допомагаємо з реєстрацією в сервісному центрі МВС і першим ТО, якщо це закладено в пакет.',
        'Ви отримуєте один відповідальний контакт на весь шлях — від заявки до ключів у руках. Саме тому формат «під ключ» знімає більшість хаосу самостійного імпорту.',
      ],
    },
    en: {
      title: 'Turnkey search stages',
      excerpt: 'From budget to MVS registration — a short process overview.',
      body: [
        'We start with a true turnkey budget, search region (USA / Europe / Korea), body style, and a hard “never” list — makes or years the client will not consider. Without that, market filtering stays vague.',
        'Next comes a shortlist, history checks, and bidding at auction or with a private seller. After the win: payment, logistics, customs, and local delivery to the client’s city.',
        'In parallel we prepare paperwork: contract, customs estimate, handover acts. At the end we help with MVS service-center registration and the first service visit when included in the package.',
        'You get one accountable contact end to end — from the request to keys in hand. That is why turnkey removes most of the chaos of DIY import.',
      ],
    },
  });

  payload.logger.info('Seeding blog index page…');
  await upsertPageBySlug(payload, {
    slug: 'blog',
    locale: 'ua',
    data: {
      title: 'Блог',
      viewType: 'blog',
      _status: 'published',
      layout: [],
      blogReadMoreLabel: 'Читати далі',
      meta: {
        title: 'Блог — AS Autosearch',
        description: 'Поради з автопідбору та імпорту.',
      },
    },
  });
  await upsertPageBySlug(payload, {
    slug: 'blog',
    locale: 'en',
    data: {
      title: 'Blog',
      viewType: 'blog',
      _status: 'published',
      layout: [],
      blogReadMoreLabel: 'Read more',
      meta: {
        title: 'Blog — AS Autosearch',
        description: 'Tips on car search and import.',
      },
    },
  });

  payload.logger.info('Blog seeded.');
}

try {
  await main();
  process.exit(0);
} catch (err) {
  console.error('[seed-blog] failed:', err);
  process.exit(1);
}
