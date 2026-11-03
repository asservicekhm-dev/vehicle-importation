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

type MarketingMedia = {
  heroUsa: string;
  heroEurope: string;
  heroKorea: string;
  about1: string;
  about2: string;
  about3: string;
  about4: string;
  svcTurnkey: string;
  svcInspection: string;
  svcExpert: string;
  svcDiagnostics: string;
  svcTravel: string;
  bookingPitch: string;
  bookingCallback: string;
  review1: string;
  review2: string;
  review3: string;
  review4: string;
  review5: string;
  review6: string;
  review7: string;
  review8: string;
};

function customLink(label: string, url: string) {
  return {
    type: 'custom' as const,
    label,
    url,
  };
}

async function seedMarketingMedia(payload: Payload): Promise<MarketingMedia> {
  payload.logger.info('Seeding marketing media (WebP)…');

  const heroUsa = await upsertMediaByFilename(payload, {
    filePath: path.join(marketingDir, 'hero/origin-usa.webp'),
    filename: 'origin-usa.webp',
    altUa: 'Авто зі США',
    altEn: 'Car from the USA',
  });
  const heroEurope = await upsertMediaByFilename(payload, {
    filePath: path.join(marketingDir, 'hero/origin-europe.webp'),
    filename: 'origin-europe.webp',
    altUa: 'Авто з Європи',
    altEn: 'Car from Europe',
  });
  const heroKorea = await upsertMediaByFilename(payload, {
    filePath: path.join(marketingDir, 'hero/origin-korea.webp'),
    filename: 'origin-korea.webp',
    altUa: 'Авто з Кореї',
    altEn: 'Car from Korea',
  });

  const about1 = await upsertMediaByFilename(payload, {
    filePath: path.join(marketingDir, 'about/stat-1.webp'),
    filename: 'about-stat-1.webp',
    altUa: 'Робота з авто',
    altEn: 'Working on a car',
  });
  const about2 = await upsertMediaByFilename(payload, {
    filePath: path.join(marketingDir, 'about/stat-2.webp'),
    filename: 'about-stat-2.webp',
    altUa: 'Авто на дорозі',
    altEn: 'Car on the road',
  });
  const about3 = await upsertMediaByFilename(payload, {
    filePath: path.join(marketingDir, 'about/stat-3.webp'),
    filename: 'about-stat-3.webp',
    altUa: 'Водій за кермом',
    altEn: 'Driver behind the wheel',
  });
  const about4 = await upsertMediaByFilename(payload, {
    filePath: path.join(marketingDir, 'about/stat-4.webp'),
    filename: 'about-stat-4.webp',
    altUa: 'Огляд авто',
    altEn: 'Car inspection',
  });

  const svcTurnkey = await upsertMediaByFilename(payload, {
    filePath: path.join(marketingDir, 'services/turnkey.webp'),
    filename: 'service-turnkey.webp',
    altUa: 'Підбір авто під ключ',
    altEn: 'Turnkey car search',
  });
  const svcInspection = await upsertMediaByFilename(payload, {
    filePath: path.join(marketingDir, 'services/inspection.webp'),
    filename: 'service-inspection.webp',
    altUa: 'Перевірка авто',
    altEn: 'Vehicle inspection',
  });
  const svcExpert = await upsertMediaByFilename(payload, {
    filePath: path.join(marketingDir, 'services/expert.webp'),
    filename: 'service-expert.webp',
    altUa: 'Експерт на день',
    altEn: 'Expert for a day',
  });
  const svcDiagnostics = await upsertMediaByFilename(payload, {
    filePath: path.join(marketingDir, 'services/diagnostics.webp'),
    filename: 'service-diagnostics.webp',
    altUa: 'Компʼютерна діагностика',
    altEn: 'Computer diagnostics',
  });
  const svcTravel = await upsertMediaByFilename(payload, {
    filePath: path.join(marketingDir, 'services/travel.webp'),
    filename: 'service-travel.webp',
    altUa: 'Виїзд в інші міста',
    altEn: 'Travel to other cities',
  });

  const bookingPitch = await upsertMediaByFilename(payload, {
    filePath: path.join(marketingDir, 'booking/pitch.webp'),
    filename: 'booking-pitch.webp',
    altUa: 'За кермом на консультації з підбору',
    altEn: 'Driving during a car-search consult',
  });
  const bookingCallback = await upsertMediaByFilename(payload, {
    filePath: path.join(marketingDir, 'booking/callback.webp'),
    filename: 'booking-callback.webp',
    altUa: 'Авто під ключ',
    altEn: 'Turnkey car',
  });

  const reviewAvatars = await Promise.all(
    ([1, 2, 3, 4, 5, 6, 7, 8] as const).map((n) =>
      upsertMediaByFilename(payload, {
        filePath: path.join(marketingDir, `reviews/avatar-${n}.webp`),
        filename: `review-avatar-${n}.webp`,
        altUa: `Фото клієнта ${n}`,
        altEn: `Client photo ${n}`,
      }),
    ),
  );

  return {
    heroUsa,
    heroEurope,
    heroKorea,
    about1,
    about2,
    about3,
    about4,
    svcTurnkey,
    svcInspection,
    svcExpert,
    svcDiagnostics,
    svcTravel,
    bookingPitch,
    bookingCallback,
    review1: reviewAvatars[0]!,
    review2: reviewAvatars[1]!,
    review3: reviewAvatars[2]!,
    review4: reviewAvatars[3]!,
    review5: reviewAvatars[4]!,
    review6: reviewAvatars[5]!,
    review7: reviewAvatars[6]!,
    review8: reviewAvatars[7]!,
  };
}

async function upsertBookingForm(payload: Payload): Promise<string> {
  const existing = await payload.find({
    collection: 'forms',
    where: { title: { equals: BOOKING_FORM_TITLE } },
    limit: 1,
    depth: 0,
  });

  const fieldsUa = [
    {
      blockType: 'text' as const,
      name: 'name',
      label: 'Імʼя',
      placeholder: 'Як до вас звертатися?',
      isRequired: true,
    },
    {
      blockType: 'phone-number' as const,
      name: 'phone',
      label: 'Телефон',
      placeholder: '+380 (__) ___ __ __',
      isRequired: true,
    },
    {
      blockType: 'message' as const,
      name: 'message',
      label: 'Запит',
      placeholder: 'Бюджет, модель або посилання на оголошення',
      isRequired: false,
    },
  ];

  const dataUa = {
    title: BOOKING_FORM_TITLE,
    submissionKind: 'lead' as const,
    submitButtonLabel: 'Надіслати заявку',
    successMessage: 'Дякуємо! Ми звʼяжемося з вами протягом години в робочий час.',
    fields: fieldsUa,
  };

  let id: string;
  if (existing.docs[0]?.id) {
    id = String(existing.docs[0].id);
    await payload.update({
      collection: 'forms',
      id,
      locale: 'ua',
      data: dataUa,
      context: skip,
    });
  } else {
    const created = await payload.create({
      collection: 'forms',
      locale: 'ua',
      data: dataUa,
      context: skip,
    });
    id = String(created.id);
  }

  const uaForm = await payload.findByID({
    collection: 'forms',
    id,
    locale: 'ua',
    depth: 0,
  });
  const fieldIds = (uaForm.fields ?? []).map((field) =>
    field && typeof field === 'object' && 'id' in field ? field.id : undefined,
  );

  await payload.update({
    collection: 'forms',
    id,
    locale: 'en',
    data: {
      submitButtonLabel: 'Send request',
      successMessage: 'Thank you! We’ll get back to you within an hour during business hours.',
      fields: [
        {
          id: fieldIds[0],
          blockType: 'text',
          name: 'name',
          label: 'Name',
          placeholder: 'How should we address you?',
          isRequired: true,
        },
        {
          id: fieldIds[1],
          blockType: 'phone-number',
          name: 'phone',
          label: 'Phone',
          placeholder: '+380 (__) ___ __ __',
          isRequired: true,
        },
        {
          id: fieldIds[2],
          blockType: 'message',
          name: 'message',
          label: 'Request',
          placeholder: 'Budget, model, or listing link',
          isRequired: false,
        },
      ],
    },
    context: skip,
  });

  return id;
}

function buildHomeLayoutUa(formId: string, media: MarketingMedia) {
  return [
    {
      blockType: 'auto-hero-block' as const,
      blockName: 'hero',
      backgroundImage: media.heroUsa,
      title: 'Авто [[під ключ]] з [[США]], [[Європи]] та [[Кореї]]',
      subtitle:
        'Підбираємо, перевіряємо і доставляємо авто з документами — [[без прихованих витрат]] і з розумінням кожного етапу.',
      buttons: [
        { style: 'primary' as const, link: customLink('Отримати консультацію', '#callback') },
        { style: 'outline' as const, link: customLink('Як ми працюємо', '#route') },
      ],
      highlights: [],
      origins: [
        {
          originId: 'usa' as const,
          label: 'США',
          term: 'Типовий термін [[1–3 місяці]]',
          check: 'Аукціонна історія, VIN, страховка в дорозі',
          image: media.heroUsa,
        },
        {
          originId: 'europe' as const,
          label: 'Європа',
          term: 'Типовий термін [[від кількох тижнів]]',
          check: 'Історія пробігу, сервісні записи, кузов',
          image: media.heroEurope,
        },
        {
          originId: 'korea' as const,
          label: 'Корея',
          term: 'Типовий термін [[за маршрутом]]',
          check: 'Комплектація, пробіг, стан кузова',
          image: media.heroKorea,
        },
      ],
    },
    {
      blockType: 'booking-form-block' as const,
      blockName: 'pitch',
      variant: 'pitch' as const,
      title: 'Підберемо авто під ваш бюджет',
      description:
        'Залиште телефон — підкажемо варіанти з США, Європи чи Кореї і зорієнтуємо щодо вартості під ключ.',
      note: 'Відповімо протягом години в робочий час.',
      image: media.bookingPitch,
      form: formId,
      layout: {
        nameField: 'name',
        phoneField: 'phone',
        messageField: 'message',
      },
    },
    {
      blockType: 'about-intro-block' as const,
      blockName: 'about',
      eyebrow: 'Про нас',
      title: 'Автопідбір під ваш запит з',
      titleAccent: 'AS Autosearch',
      description:
        'AS Autosearch допомагає знайти й привезти авто зі США, Європи та Кореї — з перевіркою, прозорим кошторисом і супроводом до реєстрації в сервісному центрі МВС.\nПрацюємо в Хмельницькому та виїжджаємо в інші міста: разова перевірка, підбір під ключ, експерт на день і діагностика.',
      cta: customLink('Дізнатись більше', '#services'),
      stats: [
        { value: '5+', label: 'років\nдосвіду', image: media.about1 },
        { value: '3', label: 'ринки\nімпорту' },
        { value: '8', label: 'етапів\nпід ключ', image: media.about3 },
        { value: '20+', label: 'експертів\nз вами' },
      ],
    },
    {
      blockType: 'why-choose-us-block' as const,
      blockName: 'why-us',
      eyebrow: 'Переваги',
      title: 'Чому клієнти обирають',
      titleAccent: 'AS Autosearch',
      intro:
        'Купівля авто з-за кордону лякає невизначеністю ціни, стану й термінів. Ми будуємо процес так, щоб ви розуміли кожен етап і фінальну суму.',
      items: [
        {
          iconKey: 'contract' as const,
          title: 'Фіксуємо вартість у договорі',
          body: 'Після прорахунку погоджуємо умови й фіксуємо кошторис — без «сюрпризів» у процесі.',
        },
        {
          iconKey: 'search' as const,
          title: 'Чесна перевірка до покупки',
          body: 'Разова перевірка й діагностика допомагають відсіяти ризикові варіанти ще до угоди.',
        },
        {
          iconKey: 'globe' as const,
          title: 'Три ринки імпорту',
          body: 'США, Європа та Корея — підбираємо під бюджет, комплектацію й терміни.',
        },
        {
          iconKey: 'route' as const,
          title: 'Зрозумілий шлях під ключ',
          body: 'Від бюджету до реєстрації МВС пояснюємо, що відбувається з авто на кожному кроці.',
        },
        {
          iconKey: 'shield' as const,
          title: 'Доставка по Україні',
          body: 'Офіс у Хмельницькому, супровід клієнтів з різних міст і передача авто на місці.',
        },
      ],
    },
    {
      blockType: 'directions-block' as const,
      blockName: 'services',
      eyebrow: 'Що ми робимо',
      title: 'Послуги',
      titleAccent: 'автопідбору',
      featured: {
        title: 'Підбір авто під ключ',
        body: 'Шукаємо авто під ваш запит і ведемо процес до кінця: поїздки в інші міста, авторинки, реєстрація в сервісному центрі МВС і передача вам.',
        cta: customLink('Замовити', '?service=turnkey#callback'),
        image: media.svcTurnkey,
      },
      items: [
        {
          title: 'Перевірка авто перед покупкою',
          scope: 'Одне авто, яке ви обрали — пробіг, ДТП, ЛКП, ходова, документи.',
          link: customLink('Замовити', '?service=inspection#callback'),
          image: media.svcInspection,
        },
        {
          title: 'Експерт на день',
          scope: 'З 9:00 до 18:00 оглядаємо орієнтовно 5–8 авто разом з вами.',
          link: customLink('Замовити', '?service=expert#callback'),
          image: media.svcExpert,
        },
        {
          title: "Комп'ютерна діагностика",
          scope: 'Зчитування кодів ЕБУ та даних авто для точної оцінки стану.',
          link: customLink('Замовити', '?service=consultation#callback'),
          image: media.svcDiagnostics,
        },
        {
          title: 'Виїзд в інші міста',
          scope: 'Огляд, купівля та організація доставки авто до вас.',
          link: customLink('Замовити', '?service=consultation#callback'),
          image: media.svcTravel,
        },
      ],
    },
    {
      blockType: 'comparison-block' as const,
      blockName: 'comparison',
      eyebrow: 'Порівняння',
      title: 'Самостійно чи з AS Autosearch',
      intro: 'Різниця — у контролі ціни, стану авто й супроводі до отримання ключів.',
      leftColumn: {
        heading: 'Без перевіреного партнера',
        items: [
          { text: 'Складно зрозуміти фінальну суму під ключ' },
          { text: 'Ризик купити авто з прихованими проблемами' },
          { text: 'Логістика, митниця й МВС — окремі «чорні скриньки»' },
          { text: 'Немає єдиної відповідальної сторони' },
        ],
      },
      rightColumn: {
        heading: 'З AS Autosearch',
        items: [
          { text: 'Погоджений кошторис і фіксація в договорі' },
          { text: 'Перевірка та діагностика до покупки' },
          { text: 'Зрозумілі етапи: від пошуку до реєстрації МВС' },
          { text: 'Супровід менеджера до передачі авто' },
        ],
      },
    },
    {
      blockType: 'price-list-block' as const,
      blockName: 'prices',
      addonsHeading: 'Додатково',
      fromPrefix: 'від',
    },
    {
      blockType: 'inspection-checklist-block' as const,
      blockName: 'inspection',
      title: 'Що входить у перевірку',
      items: [
        { title: 'Реальний пробіг', detail: 'Звіряємо показання з історією та документами.' },
        { title: 'Історія ДТП', detail: 'Шукаємо сліди аварій і кузовних ремонтів.' },
        { title: 'ЛКП і кузов', detail: 'Товщиномір, геометрія, сліди фарбування.' },
        {
          title: 'Ходова частина',
          detail: 'Підвіска, гальма, люфти — те, що відчуваєте в дорозі.',
        },
        { title: 'Документи', detail: 'Власність, обмеження, відповідність VIN.' },
      ],
    },
    {
      blockType: 'turnkey-route-block' as const,
      blockName: 'route',
      title: 'Як ми працюємо під ключ',
      steps: [
        { title: 'Бюджет', body: 'Узгоджуємо бюджет, тип авто і місто доставки.' },
        { title: 'Пошук', body: 'Підбираємо варіанти під критерії та економіку.' },
        { title: 'Перевірка', body: 'Оцінюємо стан до покупки — фото, історія, діагностика.' },
        { title: 'Купівля', body: 'Викуп за погодженими умовами.' },
        {
          title: 'Доставка',
          body: 'Організовуємо логістику до України.',
          bodyUsa: 'Контейнер і морська доставка з аукціону США.',
          bodyEurope: 'Наземна доставка з Європи за узгодженим маршрутом.',
          bodyKorea: 'Морська / змішана логістика з Кореї.',
        },
        {
          title: 'Митниця',
          body: 'Супроводжуємо митне оформлення.',
          bodyUsa: 'Митні платежі після прибуття в порт.',
          bodyEurope: 'Митне оформлення на кордоні / у пункті призначення.',
          bodyKorea: 'Митні платежі за маршрутом прибуття.',
        },
        { title: 'Реєстрація МВС', body: 'Оформлення в сервісному центрі МВС.' },
        { title: 'Передача', body: 'Авто у вашому місті з документами.' },
      ],
    },
    {
      blockType: 'ukraine-coverage-block' as const,
      blockName: 'coverage',
      eyebrow: 'Покриття',
      title: 'Офіс у Хмельницькому,',
      titleAccent: 'доставка по Україні',
      body: 'Працюємо з клієнтами з різних міст онлайн: консультація, підбір, перевірка й супровід до передачі авто у погодженому місті.',
      officeLabel: 'Офіс',
      officeCity: 'Хмельницький',
      latitude: 49.3881223,
      longitude: 27.0551946,
      routeUrl: 'https://maps.app.goo.gl/vApS5bRgUxh1iuDK8',
      routeLabel: 'Маршрут',
      cities: [
        { name: 'Хмельницький' },
        { name: 'Київ' },
        { name: 'Львів' },
        { name: 'Одеса' },
        { name: 'Дніпро' },
        { name: 'Харків' },
      ],
      cta: customLink('Залишити заявку', '#callback'),
    },
    {
      blockType: 'testimonials-block' as const,
      blockName: 'testimonials',
      eyebrow: 'Відгуки клієнтів',
      titleAccent: 'Нам довіряють',
      title: 'свої авто',
      items: [
        {
          quote: 'Підібрали авто зі США без сюрпризів на митниці — усе пояснили наперед.',
          authorName: 'Олена К.',
          authorRole: 'Hyundai Tucson, США',
          avatar: media.review1,
        },
        {
          quote: 'Разова перевірка врятувала від битої машини. Дякую за чесність.',
          authorName: 'Андрій М.',
          authorRole: 'Перевірка перед покупкою',
          avatar: media.review2,
        },
        {
          quote: 'Експерт на день — встигли оглянути шість варіантів і купили ввечері.',
          authorName: 'Марія С.',
          authorRole: 'Експерт на день',
          avatar: media.review3,
        },
        {
          quote: 'Під ключ з Кореї вийшло дешевше за місцевий ринок, логістика прозора.',
          authorName: 'Ігор П.',
          authorRole: 'Kia Sportage, Корея',
          avatar: media.review4,
        },
        {
          quote: 'Діагностика перед покупкою виявила проблеми з АКПП — відмовились вчасно.',
          authorName: 'Наталія В.',
          authorRole: 'Компʼютерна діагностика',
          avatar: media.review5,
        },
        {
          quote: 'Виїзд у Львів: за день закрили питання з трьома оголошеннями. Рекомендую.',
          authorName: 'Сергій Л.',
          authorRole: 'Виїзд в інше місто',
          avatar: media.review6,
        },
        {
          quote: 'Європа під ключ — чіткі етапи, фіксована вартість у договорі, без сюрпризів.',
          authorName: 'Катерина Д.',
          authorRole: 'VW Tiguan, Європа',
          avatar: media.review7,
        },
        {
          quote: 'Супровід до реєстрації МВС був спокійний: документи зібрані, терміни витримані.',
          authorName: 'Богдан Р.',
          authorRole: 'Підбір під ключ',
          avatar: media.review8,
        },
      ],
    },
    {
      blockType: 'service-faq-block' as const,
      blockName: 'faq',
      title: 'Часті запитання',
      items: [
        {
          question: 'Звідки ви привозите авто?',
          answer: 'Зі США, Європи та Південної Кореї — залежно від бюджету і моделі.',
        },
        {
          question: 'Що входить у підбір під ключ?',
          answer:
            'Пошук, перевірка, купівля, логістика, митниця, реєстрація в МВС і передача авто вам.',
        },
        {
          question: 'Чи можна перевірити лише одне авто?',
          answer: 'Так. Разова перевірка — для авто, яке ви вже обрали самі.',
        },
        {
          question: 'Скільки авто можна оглянути за день?',
          answer:
            'Експерт на день: з 9:00 до 18:00, орієнтовно 5–8 авто. За межами Хмельницького — пальне окремо.',
        },
      ],
      contactTitle: 'Потрібна консультація?',
      contactText: 'Зателефонуйте або залиште заявку нижче — відповімо в робочий час.',
    },
    {
      blockType: 'booking-form-block' as const,
      blockName: 'callback',
      variant: 'callback' as const,
      title: 'Залишити заявку',
      description:
        'Напишіть, яке авто шукаєте або яка послуга потрібна — відповімо протягом години в робочий час.',
      note: 'Можна додати бюджет, модель або посилання на оголошення.',
      image: media.bookingCallback,
      form: formId,
      layout: {
        nameField: 'name',
        phoneField: 'phone',
        messageField: 'message',
      },
    },
  ];
}

function buildHomeLayoutEn(
  formId: string,
  uaLayout: Array<{ id?: string | null; blockType: string; [key: string]: unknown }>,
  media: MarketingMedia,
) {
  const idAt = (index: number) => uaLayout[index]?.id;

  return [
    {
      id: idAt(0),
      blockType: 'auto-hero-block' as const,
      blockName: 'hero',
      backgroundImage: media.heroUsa,
      title: '[[Turnkey]] cars from the [[USA]], [[Europe]] and [[Korea]]',
      subtitle:
        'We search, inspect and deliver cars with documents — [[no hidden costs]], with a clear view of every step.',
      buttons: [
        { style: 'primary' as const, link: customLink('Get a consultation', '#callback') },
        { style: 'outline' as const, link: customLink('How we work', '#route') },
      ],
      highlights: [],
      origins: [
        {
          originId: 'usa' as const,
          label: 'USA',
          term: 'Typical term [[1–3 months]]',
          check: 'Auction history, VIN, insurance in transit',
          image: media.heroUsa,
        },
        {
          originId: 'europe' as const,
          label: 'Europe',
          term: 'Typical term [[from a few weeks]]',
          check: 'Mileage history, service records, body',
          image: media.heroEurope,
        },
        {
          originId: 'korea' as const,
          label: 'Korea',
          term: 'Typical term [[by route]]',
          check: 'Spec, mileage, body condition',
          image: media.heroKorea,
        },
      ],
    },
    {
      id: idAt(1),
      blockType: 'booking-form-block' as const,
      blockName: 'pitch',
      variant: 'pitch' as const,
      title: 'We’ll find a car for your budget',
      description:
        'Leave your phone — we’ll suggest options from the USA, Europe or Korea and outline turnkey cost.',
      note: 'We reply within an hour during business hours.',
      image: media.bookingPitch,
      form: formId,
      layout: {
        nameField: 'name',
        phoneField: 'phone',
        messageField: 'message',
      },
    },
    {
      id: idAt(2),
      blockType: 'about-intro-block' as const,
      blockName: 'about',
      eyebrow: 'About',
      title: 'Car search tailored to you with',
      titleAccent: 'AS Autosearch',
      description:
        'AS Autosearch helps find and import cars from the USA, Europe and Korea — with inspection, a clear estimate, and support through MVS registration.\nBased in Khmelnytskyi with travel to other cities: one-off inspection, turnkey search, expert for a day, and diagnostics.',
      cta: customLink('Learn more', '#services'),
      stats: [
        { value: '5+', label: 'years of\nexperience', image: media.about1 },
        { value: '3', label: 'import\nmarkets' },
        { value: '8', label: 'turnkey\nsteps', image: media.about3 },
        { value: '20+', label: 'experts\nwith you' },
      ],
    },
    {
      id: idAt(3),
      blockType: 'why-choose-us-block' as const,
      blockName: 'why-us',
      eyebrow: 'Advantages',
      title: 'Why clients choose',
      titleAccent: 'AS Autosearch',
      intro:
        'Buying a car abroad is stressful when price, condition and timelines are unclear. We build a process where you understand every stage and the final amount.',
      items: [
        {
          iconKey: 'contract' as const,
          title: 'Price fixed in the contract',
          body: 'After the estimate we agree terms and lock the budget — no mid-process surprises.',
        },
        {
          iconKey: 'search' as const,
          title: 'Honest pre-purchase checks',
          body: 'One-time inspection and diagnostics help filter risky cars before you buy.',
        },
        {
          iconKey: 'globe' as const,
          title: 'Three import markets',
          body: 'USA, Europe and Korea — matched to budget, trim and timing.',
        },
        {
          iconKey: 'route' as const,
          title: 'Clear turnkey path',
          body: 'From budget to MVS registration we explain what happens to the car at each step.',
        },
        {
          iconKey: 'shield' as const,
          title: 'Delivery across Ukraine',
          body: 'Office in Khmelnytskyi, clients nationwide, handover in the agreed city.',
        },
      ],
    },
    {
      id: idAt(4),
      blockType: 'directions-block' as const,
      blockName: 'services',
      eyebrow: 'What we do',
      title: 'Car search',
      titleAccent: 'services',
      featured: {
        title: 'Turnkey car search',
        body: 'We search from your preferences and support the full process: trips to other cities, car markets, registration at the MVS service centre, and handover.',
        cta: customLink('Order', '?service=turnkey#callback'),
        image: media.svcTurnkey,
      },
      items: [
        {
          title: 'Pre-purchase vehicle inspection',
          scope: 'One vehicle you chose — mileage, accidents, paint, chassis, documents.',
          link: customLink('Order', '?service=inspection#callback'),
          image: media.svcInspection,
        },
        {
          title: 'Expert for a day',
          scope: 'From 9:00 to 18:00 we inspect about 5–8 vehicles with you.',
          link: customLink('Order', '?service=expert#callback'),
          image: media.svcExpert,
        },
        {
          title: 'Computer diagnostics',
          scope: 'ECU error codes and vehicle data for an accurate condition read.',
          link: customLink('Order', '?service=consultation#callback'),
          image: media.svcDiagnostics,
        },
        {
          title: 'Travel to other cities',
          scope: 'Inspect, buy, and arrange delivery of the car to you.',
          link: customLink('Order', '?service=consultation#callback'),
          image: media.svcTravel,
        },
      ],
    },
    {
      id: idAt(5),
      blockType: 'comparison-block' as const,
      blockName: 'comparison',
      eyebrow: 'Comparison',
      title: 'On your own or with AS Autosearch',
      intro: 'The difference is control over price, vehicle condition and support through handover.',
      leftColumn: {
        heading: 'Without a trusted partner',
        items: [
          { text: 'Hard to know the true turnkey total' },
          { text: 'Risk of buying a car with hidden issues' },
          { text: 'Logistics, customs and MVS feel like black boxes' },
          { text: 'No single party accountable end to end' },
        ],
      },
      rightColumn: {
        heading: 'With AS Autosearch',
        items: [
          { text: 'Agreed estimate fixed in the contract' },
          { text: 'Inspection and diagnostics before purchase' },
          { text: 'Clear stages from search to MVS registration' },
          { text: 'Manager support through car handover' },
        ],
      },
    },
    {
      id: idAt(6),
      blockType: 'price-list-block' as const,
      blockName: 'prices',
      addonsHeading: 'Additional',
      fromPrefix: 'From',
    },
    {
      id: idAt(7),
      blockType: 'inspection-checklist-block' as const,
      blockName: 'inspection',
      title: 'What an inspection covers',
      items: [
        {
          title: 'Real mileage',
          detail: 'We cross-check the odometer with history and documents.',
        },
        { title: 'Crash history', detail: 'We look for accident and body-repair traces.' },
        { title: 'Paint and body', detail: 'Thickness gauge, geometry, repaint signs.' },
        {
          title: 'Chassis',
          detail: 'Suspension, brakes, play — what you feel on the road.',
        },
        { title: 'Documents', detail: 'Ownership, restrictions, VIN match.' },
      ],
    },
    {
      id: idAt(8),
      blockType: 'turnkey-route-block' as const,
      blockName: 'route',
      title: 'How turnkey works',
      steps: [
        { title: 'Budget', body: 'We agree budget, car type and delivery city.' },
        { title: 'Search', body: 'We shortlist options that fit criteria and economics.' },
        {
          title: 'Check',
          body: 'We assess condition before purchase — photos, history, diagnostics.',
        },
        { title: 'Purchase', body: 'Buy under agreed terms.' },
        {
          title: 'Shipping',
          body: 'We arrange logistics to Ukraine.',
          bodyUsa: 'Container and ocean freight from a US auction.',
          bodyEurope: 'Overland delivery from Europe on an agreed route.',
          bodyKorea: 'Ocean / mixed logistics from Korea.',
        },
        {
          title: 'Customs',
          body: 'We support customs clearance.',
          bodyUsa: 'Customs payments after arrival at the port.',
          bodyEurope: 'Customs at the border / destination point.',
          bodyKorea: 'Customs payments along the arrival route.',
        },
        { title: 'MVS registration', body: 'Registration at the MVS service centre.' },
        { title: 'Handover', body: 'The car in your city with documents.' },
      ],
    },
    {
      id: idAt(9),
      blockType: 'ukraine-coverage-block' as const,
      blockName: 'coverage',
      eyebrow: 'Coverage',
      title: 'Office in Khmelnytskyi,',
      titleAccent: 'delivery across Ukraine',
      body: 'We work with clients in different cities online: consultation, search, inspection and support through handover in the agreed city.',
      officeLabel: 'Office',
      officeCity: 'Khmelnytskyi',
      latitude: 49.3881223,
      longitude: 27.0551946,
      routeUrl: 'https://maps.app.goo.gl/vApS5bRgUxh1iuDK8',
      routeLabel: 'Route',
      cities: [
        { name: 'Khmelnytskyi' },
        { name: 'Kyiv' },
        { name: 'Lviv' },
        { name: 'Odesa' },
        { name: 'Dnipro' },
        { name: 'Kharkiv' },
      ],
      cta: customLink('Leave a request', '#callback'),
    },
    {
      id: idAt(10),
      blockType: 'testimonials-block' as const,
      blockName: 'testimonials',
      eyebrow: 'Client reviews',
      titleAccent: 'They trust us',
      title: 'with their cars',
      items: [
        {
          quote:
            'They found a US car with no customs surprises — everything was explained upfront.',
          authorName: 'Olena K.',
          authorRole: 'Hyundai Tucson, USA',
          avatar: media.review1,
        },
        {
          quote: 'A one-time inspection saved me from a wrecked car. Thank you for the honesty.',
          authorName: 'Andrii M.',
          authorRole: 'Pre-purchase inspection',
          avatar: media.review2,
        },
        {
          quote: 'Expert for a day — we checked six options and bought the same evening.',
          authorName: 'Maria S.',
          authorRole: 'Expert for a day',
          avatar: media.review3,
        },
        {
          quote: 'Turnkey from Korea came in under the local market, logistics were transparent.',
          authorName: 'Ihor P.',
          authorRole: 'Kia Sportage, Korea',
          avatar: media.review4,
        },
        {
          quote: 'Pre-purchase diagnostics caught an AT issue — we walked away in time.',
          authorName: 'Nataliia V.',
          authorRole: 'Computer diagnostics',
          avatar: media.review5,
        },
        {
          quote: 'Trip to Lviv: three listings sorted in a day. Highly recommend.',
          authorName: 'Serhii L.',
          authorRole: 'Travel to another city',
          avatar: media.review6,
        },
        {
          quote: 'Europe turnkey — clear stages, fixed contract price, no surprises.',
          authorName: 'Kateryna D.',
          authorRole: 'VW Tiguan, Europe',
          avatar: media.review7,
        },
        {
          quote: 'Support through MVS registration was calm: docs ready, deadlines met.',
          authorName: 'Bohdan R.',
          authorRole: 'Turnkey search',
          avatar: media.review8,
        },
      ],
    },
    {
      id: idAt(11),
      blockType: 'service-faq-block' as const,
      blockName: 'faq',
      title: 'FAQ',
      items: [
        {
          question: 'Where do the cars come from?',
          answer: 'From the USA, Europe and South Korea — depending on budget and model.',
        },
        {
          question: 'What does turnkey search include?',
          answer:
            'Search, inspection, purchase, logistics, customs, MVS registration and handover.',
        },
        {
          question: 'Can you inspect just one car?',
          answer: 'Yes. One-time inspection is for a vehicle you already chose yourself.',
        },
        {
          question: 'How many cars can you check in a day?',
          answer:
            'Expert for a day: 9:00–18:00, about 5–8 cars. Outside Khmelnytskyi fuel is extra.',
        },
      ],
      contactTitle: 'Need a consultation?',
      contactText: 'Call us or leave a request below — we reply during business hours.',
    },
    {
      id: idAt(12),
      blockType: 'booking-form-block' as const,
      blockName: 'callback',
      variant: 'callback' as const,
      title: 'Leave a request',
      description:
        'Tell us what car you are looking for or which service you need — we reply within an hour during business hours.',
      note: 'You can add a budget, model, or listing link.',
      image: media.bookingCallback,
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

  const media = await seedMarketingMedia(payload);

  payload.logger.info('Seeding booking form…');
  const formId = await upsertBookingForm(payload);

  payload.logger.info('Seeding home page (ua + en)…');

  await upsertPageBySlug(payload, {
    slug: 'home',
    locale: 'ua',
    data: {
      title: 'Головна',
      viewType: 'home',
      _status: 'published',
      layout: buildHomeLayoutUa(formId, media),
      meta: {
        title: 'AS Autosearch — Автопідбір',
        description: 'Професійний автопідбір під ваш запит.',
      },
    },
  });

  const homeUa = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    locale: 'ua',
    limit: 1,
    depth: 0,
  });
  const uaLayout = (homeUa.docs[0]?.layout ?? []) as Array<{
    id?: string | null;
    blockType: string;
  }>;

  await upsertPageBySlug(payload, {
    slug: 'home',
    locale: 'en',
    data: {
      title: 'Home',
      viewType: 'home',
      _status: 'published',
      layout: buildHomeLayoutEn(formId, uaLayout, media),
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
