import path from 'path';
import { getPayload, type Payload } from 'payload';
import { fileURLToPath } from 'url';

import config from '../payload.config';
import { upsertPageBySlug } from './lib/upsert';
import { upsertMediaByFilename } from './lib/upsertMedia';

const BOOKING_FORM_TITLE = 'AS Autosearch — Booking';
const skip = { skipRevalidate: true } as const;

const marketingDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../seed-assets/marketing',
);

function customLink(label: string, url: string) {
  return { type: 'custom' as const, label, url };
}

type ServiceDef = {
  slug: string;
  mode: string;
  imageKey: 'turnkey' | 'inspection' | 'expert' | 'diagnostics' | 'travel';
  ua: {
    title: string;
    heroTitle: string;
    heroDesc: string;
    infoTitle: string;
    infoBody: string;
    featuresTitle: string;
    features: { title: string; body: string }[];
    benefitsTitle: string;
    benefits: { title: string; body: string }[];
  };
  en: {
    title: string;
    heroTitle: string;
    heroDesc: string;
    infoTitle: string;
    infoBody: string;
    featuresTitle: string;
    features: { title: string; body: string }[];
    benefitsTitle: string;
    benefits: { title: string; body: string }[];
  };
};

const SERVICES: ServiceDef[] = [
  {
    slug: 'services/perevirka',
    mode: 'inspection',
    imageKey: 'inspection',
    ua: {
      title: 'Перевірка авто',
      heroTitle: 'Перевірка авто перед покупкою',
      heroDesc: 'Одне авто, яке ви обрали — перевіряємо стан до угоди.',
      infoTitle: 'Що входить у перевірку',
      infoBody:
        'Оглядаємо пробіг, історію ДТП, ЛКП і кузов, ходову та документи. Після перевірки ви отримуєте зрозумілий висновок: купувати, торгуватися чи відмовитися.',
      featuresTitle: 'Обсяг послуги',
      features: [
        { title: 'Пробіг', body: 'Звіряємо показання з історією та документами.' },
        { title: 'ДТП і кузов', body: 'Шукаємо сліди аварій, фарбування, геометрію.' },
        { title: 'Ходова', body: 'Підвіска, гальма, люфти — те, що відчуваєте в дорозі.' },
        { title: 'Документи', body: 'Власність, обмеження, відповідність VIN.' },
      ],
      benefitsTitle: 'Навіщо перевірка',
      benefits: [
        { title: 'Менше ризику', body: 'Відсіюємо проблемні варіанти до оплати.' },
        { title: 'Аргументи для торгу', body: 'Факти по стану допомагають домовитись про ціну.' },
      ],
    },
    en: {
      title: 'Vehicle inspection',
      heroTitle: 'Pre-purchase vehicle inspection',
      heroDesc: 'One car you chose — we check condition before you buy.',
      infoTitle: 'What’s included',
      infoBody:
        'We review mileage, accident history, paint and body, chassis, and documents. You get a clear call: buy, negotiate, or walk away.',
      featuresTitle: 'Service scope',
      features: [
        { title: 'Mileage', body: 'We cross-check odometer readings with history and papers.' },
        { title: 'Accidents & body', body: 'Accident traces, respray, and geometry.' },
        { title: 'Chassis', body: 'Suspension, brakes, play — what you feel on the road.' },
        { title: 'Documents', body: 'Ownership, restrictions, VIN match.' },
      ],
      benefitsTitle: 'Why inspect',
      benefits: [
        { title: 'Lower risk', body: 'Filter problem cars before you pay.' },
        { title: 'Negotiation leverage', body: 'Facts on condition help you agree a fair price.' },
      ],
    },
  },
  {
    slug: 'services/pid-kliuch',
    mode: 'turnkey',
    imageKey: 'turnkey',
    ua: {
      title: 'Під ключ',
      heroTitle: 'Підбір авто під ключ',
      heroDesc: 'Від бюджету до реєстрації МВС і передачі авто у вашому місті.',
      infoTitle: 'Повний супровід',
      infoBody:
        'Шукаємо авто під ваш запит на ринках США, Європи чи Кореї, перевіряємо, купуємо, веземо, оформлюємо митницю й реєстрацію в сервісному центрі МВС.',
      featuresTitle: 'Етапи під ключ',
      features: [
        { title: 'Бюджет і критерії', body: 'Узгоджуємо бюджет, тип авто і місто доставки.' },
        { title: 'Пошук і перевірка', body: 'Підбір варіантів і оцінка стану до покупки.' },
        { title: 'Логістика й митниця', body: 'Доставка та митне оформлення за маршрутом.' },
        { title: 'МВС і передача', body: 'Реєстрація та видача авто з документами.' },
      ],
      benefitsTitle: 'Чому під ключ',
      benefits: [
        { title: 'Один відповідальний', body: 'Не потрібно збирати процес по шматках.' },
        { title: 'Прозорий кошторис', body: 'Фіксуємо умови в договорі після прорахунку.' },
      ],
    },
    en: {
      title: 'Turnkey',
      heroTitle: 'Turnkey car search',
      heroDesc: 'From budget to MVS registration and handover in your city.',
      infoTitle: 'Full support',
      infoBody:
        'We source cars for your brief in the USA, Europe or Korea, inspect, buy, ship, clear customs, and register at the MVS service centre.',
      featuresTitle: 'Turnkey stages',
      features: [
        { title: 'Budget & criteria', body: 'Align budget, car type, and delivery city.' },
        {
          title: 'Search & checks',
          body: 'Shortlist options and assess condition before purchase.',
        },
        { title: 'Logistics & customs', body: 'Shipping and customs along the agreed route.' },
        { title: 'MVS & handover', body: 'Registration and delivery with documents.' },
      ],
      benefitsTitle: 'Why turnkey',
      benefits: [
        { title: 'One owner', body: 'You don’t assemble the process piece by piece.' },
        { title: 'Clear estimate', body: 'Terms locked in the contract after the quote.' },
      ],
    },
  },
  {
    slug: 'services/ekspert-na-den',
    mode: 'expert',
    imageKey: 'expert',
    ua: {
      title: 'Експерт на день',
      heroTitle: 'Експерт на день',
      heroDesc: 'З 9:00 до 18:00 оглядаємо кілька авто разом з вами.',
      infoTitle: 'Як проходить день',
      infoBody:
        'Експерт виїжджає з вами на огляд орієнтовно 5–8 авто: допомагає швидко відсіювати ризикові варіанти й фіксувати факти по стану.',
      featuresTitle: 'У день з експертом',
      features: [
        { title: 'Маршрут оглядів', body: 'Плануємо список авто й логістику по місту.' },
        { title: 'Швидкий скринінг', body: 'Кузов, салон, базові ознаки ДТП і зносу.' },
        { title: 'Рекомендації', body: 'Що варто купувати, торгувати чи пропускати.' },
      ],
      benefitsTitle: 'Користь',
      benefits: [
        { title: 'Економія часу', body: 'Не витрачаєте день на сумнівні варіанти.' },
        { title: 'Друга думка', body: 'Рішення з опорою на досвід оглядів.' },
      ],
    },
    en: {
      title: 'Expert for a day',
      heroTitle: 'Expert for a day',
      heroDesc: 'From 9:00 to 18:00 we inspect several cars with you.',
      infoTitle: 'How the day works',
      infoBody:
        'An expert joins you to inspect about 5–8 cars: filter risky options fast and capture condition facts.',
      featuresTitle: 'On the day',
      features: [
        { title: 'Inspection route', body: 'We plan the list and city logistics.' },
        { title: 'Quick screen', body: 'Body, cabin, basic accident and wear signs.' },
        { title: 'Recommendations', body: 'What to buy, negotiate, or skip.' },
      ],
      benefitsTitle: 'Benefits',
      benefits: [
        { title: 'Time saved', body: 'Don’t spend a day on doubtful cars.' },
        { title: 'Second opinion', body: 'Decisions backed by inspection experience.' },
      ],
    },
  },
  {
    slug: 'services/diagnostyka',
    mode: 'consultation',
    imageKey: 'diagnostics',
    ua: {
      title: 'Діагностика',
      heroTitle: "Комп'ютерна діагностика",
      heroDesc: 'Зчитування кодів ЕБУ та даних авто для точної оцінки стану.',
      infoTitle: 'Що перевіряємо',
      infoBody:
        'Підключаємо діагностичне обладнання, знімаємо коди помилок і live-дані систем. Пояснюємо, що критично, а що можна відкласти.',
      featuresTitle: 'Обсяг діагностики',
      features: [
        { title: 'Коди помилок', body: 'Активні та збережені DTC по блоках.' },
        { title: 'Live data', body: 'Параметри роботи двигуна та систем.' },
        { title: 'Висновок', body: 'Що впливає на покупку й подальший сервіс.' },
      ],
      benefitsTitle: 'Навіщо',
      benefits: [
        { title: 'Точніша оцінка', body: 'Не лише візуальний огляд — дані з електроніки.' },
        { title: 'Менше сюрпризів', body: 'Приховані несправності видно до угоди.' },
      ],
    },
    en: {
      title: 'Diagnostics',
      heroTitle: 'Computer diagnostics',
      heroDesc: 'ECU codes and vehicle data for an accurate condition read.',
      infoTitle: 'What we check',
      infoBody:
        'We connect diagnostic tools, pull fault codes and live data, and explain what is critical vs deferrable.',
      featuresTitle: 'Diagnostics scope',
      features: [
        { title: 'Fault codes', body: 'Active and stored DTCs across modules.' },
        { title: 'Live data', body: 'Engine and system operating parameters.' },
        { title: 'Conclusion', body: 'What affects the purchase and later service.' },
      ],
      benefitsTitle: 'Why it matters',
      benefits: [
        { title: 'Clearer picture', body: 'More than a visual check — electronics data.' },
        { title: 'Fewer surprises', body: 'Hidden faults show up before you buy.' },
      ],
    },
  },
  {
    slug: 'services/vyizd',
    mode: 'consultation',
    imageKey: 'travel',
    ua: {
      title: 'Виїзд',
      heroTitle: 'Виїзд в інші міста',
      heroDesc: 'Огляд, купівля та організація доставки авто до вас.',
      infoTitle: 'Працюємо не лише в Хмельницькому',
      infoBody:
        'Виїжджаємо на огляд і супровід угод в інші міста України. Можемо організувати доставку підібраного авто до узгодженої локації.',
      featuresTitle: 'Що покриваємо',
      features: [
        { title: 'Виїзд на огляд', body: 'Експерт на місці продавця / ринку.' },
        { title: 'Супровід угоди', body: 'Допомога на етапі купівлі.' },
        { title: 'Доставка', body: 'Організація перевезення до вас.' },
      ],
      benefitsTitle: 'Переваги',
      benefits: [
        { title: 'Без привʼязки до офісу', body: 'Працюємо там, де знаходиться авто.' },
        { title: 'Єдиний процес', body: 'Огляд і логістика в одній команді.' },
      ],
    },
    en: {
      title: 'Travel',
      heroTitle: 'Travel to other cities',
      heroDesc: 'Inspect, buy, and arrange delivery of the car to you.',
      infoTitle: 'Beyond Khmelnytskyi',
      infoBody:
        'We travel for inspections and deal support across Ukraine, and can arrange delivery of the sourced car to the agreed location.',
      featuresTitle: 'What we cover',
      features: [
        { title: 'On-site inspection', body: 'Expert at the seller / market location.' },
        { title: 'Deal support', body: 'Help through the purchase step.' },
        { title: 'Delivery', body: 'Arrange transport to you.' },
      ],
      benefitsTitle: 'Benefits',
      benefits: [
        { title: 'Not office-bound', body: 'We work where the car is.' },
        { title: 'One process', body: 'Inspection and logistics in one team.' },
      ],
    },
  },
];

async function findBookingFormId(payload: Payload): Promise<string> {
  const existing = await payload.find({
    collection: 'forms',
    where: { title: { equals: BOOKING_FORM_TITLE } },
    limit: 1,
    depth: 0,
  });
  if (!existing.docs[0]?.id) {
    throw new Error(`Booking form "${BOOKING_FORM_TITLE}" not found. Run seed:home first.`);
  }
  return existing.docs[0].id;
}

async function seedServiceMedia(payload: Payload) {
  const turnkey = await upsertMediaByFilename(payload, {
    filePath: path.join(marketingDir, 'services/turnkey.webp'),
    filename: 'service-turnkey.webp',
    altUa: 'Підбір авто під ключ',
    altEn: 'Turnkey car search',
  });
  const inspection = await upsertMediaByFilename(payload, {
    filePath: path.join(marketingDir, 'services/inspection.webp'),
    filename: 'service-inspection.webp',
    altUa: 'Перевірка авто',
    altEn: 'Vehicle inspection',
  });
  const expert = await upsertMediaByFilename(payload, {
    filePath: path.join(marketingDir, 'services/expert.webp'),
    filename: 'service-expert.webp',
    altUa: 'Експерт на день',
    altEn: 'Expert for a day',
  });
  const diagnostics = await upsertMediaByFilename(payload, {
    filePath: path.join(marketingDir, 'services/diagnostics.webp'),
    filename: 'service-diagnostics.webp',
    altUa: 'Компʼютерна діагностика',
    altEn: 'Computer diagnostics',
  });
  const travel = await upsertMediaByFilename(payload, {
    filePath: path.join(marketingDir, 'services/travel.webp'),
    filename: 'service-travel.webp',
    altUa: 'Виїзд в інші міста',
    altEn: 'Travel to other cities',
  });

  return { turnkey, inspection, expert, diagnostics, travel } as const;
}

function relatedItems(
  currentSlug: string,
  locale: 'ua' | 'en',
): Array<{ title: string; body: string; link: ReturnType<typeof customLink> }> {
  return SERVICES.filter((s) => s.slug !== currentSlug).map((s) => ({
    title: locale === 'ua' ? s.ua.title : s.en.title,
    body: locale === 'ua' ? s.ua.heroDesc : s.en.heroDesc,
    link: customLink(locale === 'ua' ? 'Детальніше' : 'Learn more', `/${s.slug}`),
  }));
}

function buildLayout(
  service: ServiceDef,
  locale: 'ua' | 'en',
  formId: string,
  imageId: string,
  blockIds?: Array<{ id?: string | null; blockType: string }>,
) {
  const copy = locale === 'ua' ? service.ua : service.en;
  const orderLabel = locale === 'ua' ? 'Замовити' : 'Order';
  const relatedTitle = locale === 'ua' ? 'Інші послуги' : 'Other services';
  const bookingTitle = locale === 'ua' ? 'Залишити заявку' : 'Leave a request';
  const bookingDesc =
    locale === 'ua'
      ? 'Напишіть, яке авто шукаєте або яку послугу потрібно — відповімо в робочий час.'
      : 'Tell us which car or service you need — we reply during business hours.';
  const idAt = (index: number) => blockIds?.[index]?.id;

  return [
    {
      id: idAt(0),
      blockType: 'page-breadcrumbs-block' as const,
      blockName: 'breadcrumbs',
      currentLabel: copy.title,
      ancestors: [
        {
          label: locale === 'ua' ? 'Послуги' : 'Services',
          url: '/#services',
        },
      ],
    },
    {
      id: idAt(1),
      blockType: 'service-hero-block' as const,
      blockName: 'hero',
      eyebrow: locale === 'ua' ? 'Послуга' : 'Service',
      title: copy.heroTitle,
      description: copy.heroDesc,
      image: imageId,
    },
    {
      id: idAt(2),
      blockType: 'service-info-block' as const,
      blockName: 'info',
      title: copy.infoTitle,
      body: copy.infoBody,
      primaryCta: customLink(orderLabel, `/?service=${service.mode}#callback`),
      secondaryCta: customLink(locale === 'ua' ? 'Усі послуги' : 'All services', '/#services'),
    },
    {
      id: idAt(3),
      blockType: 'service-feature-cards-block' as const,
      blockName: 'features',
      title: copy.featuresTitle,
      items: copy.features,
    },
    {
      id: idAt(4),
      blockType: 'service-benefits-block' as const,
      blockName: 'benefits',
      title: copy.benefitsTitle,
      items: copy.benefits,
    },
    {
      id: idAt(5),
      blockType: 'related-services-block' as const,
      blockName: 'related',
      title: relatedTitle,
      items: relatedItems(service.slug, locale),
    },
    {
      id: idAt(6),
      blockType: 'booking-form-block' as const,
      blockName: 'callback',
      variant: 'callback' as const,
      title: bookingTitle,
      description: bookingDesc,
      form: formId,
      layout: {
        nameField: 'name',
        phoneField: 'phone',
        messageField: 'message',
      },
    },
  ];
}

async function main(): Promise<void> {
  const payload = await getPayload({ config });
  payload.logger.info('Seeding service landing media…');
  const media = await seedServiceMedia(payload);
  const formId = await findBookingFormId(payload);

  for (const service of SERVICES) {
    const imageId = media[service.imageKey];
    payload.logger.info(`Seeding ${service.slug}…`);

    await upsertPageBySlug(payload, {
      slug: service.slug,
      locale: 'ua',
      data: {
        title: service.ua.title,
        viewType: 'information',
        _status: 'published',
        layout: buildLayout(service, 'ua', formId, imageId),
        meta: {
          title: `${service.ua.heroTitle} — AS Autosearch`,
          description: service.ua.heroDesc,
        },
      },
    });

    const uaPage = await payload.find({
      collection: 'pages',
      where: { slug: { equals: service.slug } },
      locale: 'ua',
      limit: 1,
      depth: 0,
      context: skip,
    });
    const uaLayout = (uaPage.docs[0]?.layout ?? []) as Array<{
      id?: string | null;
      blockType: string;
    }>;

    await upsertPageBySlug(payload, {
      slug: service.slug,
      locale: 'en',
      data: {
        title: service.en.title,
        viewType: 'information',
        _status: 'published',
        layout: buildLayout(service, 'en', formId, imageId, uaLayout),
        meta: {
          title: `${service.en.heroTitle} — AS Autosearch`,
          description: service.en.heroDesc,
        },
      },
    });
  }

  payload.logger.info('Service landings seeded.');
}

try {
  await main();
  process.exit(0);
} catch (err) {
  console.error('[seed-services] failed:', err);
  process.exit(1);
}
