import type { Locale } from '@autosearch/config';

export type OriginId = 'usa' | 'europe' | 'korea';

export type DesignSeedContent = {
  hero: {
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    origins: Array<{
      id: OriginId;
      label: string;
      term: string;
      check: string;
    }>;
  };
  services: {
    title: string;
    featured: {
      title: string;
      body: string;
      cta: string;
    };
    rows: Array<{
      title: string;
      scope: string;
    }>;
  };
  prices: {
    title: string;
    addonsHeading: string;
    fromPrefix: string;
  };
  inspection: {
    title: string;
    items: Array<{
      title: string;
      detail: string;
    }>;
  };
  route: {
    title: string;
    steps: Array<{
      title: string;
      body: string;
      /** When set, body is replaced per origin */
      byOrigin?: Partial<Record<OriginId, string>>;
    }>;
  };
  faq: {
    title: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
  callback: {
    title: string;
    body: string;
    nameLabel: string;
    namePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    submit: string;
    note: string;
  };
  system: {
    title: string;
    swatches: string;
    type: string;
    controls: string;
  };
};

/** Ukrainian service names are drafts for client confirm. */
const ua: DesignSeedContent = {
  hero: {
    title: 'Авто під ключ зі США, Європи та Кореї',
    subtitle:
      'Підбираємо, перевіряємо і доставляємо авто з документами — без прихованих витрат і з розумінням кожного етапу.',
    primaryCta: 'Отримати консультацію',
    secondaryCta: 'Як ми працюємо',
    origins: [
      {
        id: 'usa',
        label: 'США',
        term: 'Типовий термін 1–3 місяці',
        check: 'Аукціонна історія, VIN, страховка в дорозі',
      },
      {
        id: 'europe',
        label: 'Європа',
        term: 'Типовий термін від кількох тижнів',
        check: 'Історія пробігу, сервісні записи, кузов',
      },
      {
        id: 'korea',
        label: 'Корея',
        term: 'Типовий термін за маршрутом',
        check: 'Комплектація, пробіг, стан кузова',
      },
    ],
  },
  services: {
    title: 'Послуги',
    featured: {
      title: 'Підбір авто під ключ',
      body: 'Шукаємо авто під ваш запит і ведемо процес до кінця: поїздки в інші міста, авторинки, реєстрація в сервісному центрі МВС і передача вам.',
      cta: 'Залишити заявку',
    },
    rows: [
      {
        title: 'Перевірка авто перед покупкою',
        scope: 'Одне авто, яке ви обрали',
      },
      {
        title: 'Експерт на день',
        scope: '9:00–18:00, 5–8 авто',
      },
      {
        title: "Комп'ютерна діагностика",
        scope: 'Коди ЕБУ і дані авто',
      },
      {
        title: 'Виїзд в інші міста',
        scope: 'Огляд, купівля, доставка вам',
      },
    ],
  },
  prices: {
    title: 'Ціни',
    addonsHeading: 'Додатково',
    fromPrefix: 'від',
  },
  inspection: {
    title: 'Що входить у перевірку',
    items: [
      {
        title: 'Реальний пробіг',
        detail: 'Звіряємо показання з історією та документами.',
      },
      {
        title: 'Історія ДТП',
        detail: 'Шукаємо сліди аварій і кузовних ремонтів.',
      },
      {
        title: 'ЛКП і кузов',
        detail: 'Товщиномір, геометрія, сліди фарбування.',
      },
      {
        title: 'Ходова частина',
        detail: 'Підвіска, гальма, люфти — те, що відчуваєте в дорозі.',
      },
      {
        title: 'Документи',
        detail: 'Власність, обмеження, відповідність VIN.',
      },
    ],
  },
  route: {
    title: 'Як ми працюємо під ключ',
    steps: [
      { title: 'Бюджет', body: 'Узгоджуємо бюджет, тип авто і місто доставки.' },
      { title: 'Пошук', body: 'Підбираємо варіанти під критерії та економіку.' },
      { title: 'Перевірка', body: 'Оцінюємо стан до покупки — фото, історія, діагностика.' },
      { title: 'Купівля', body: 'Викуп за погодженими умовами.' },
      {
        title: 'Доставка',
        body: 'Організовуємо логістику до України.',
        byOrigin: {
          usa: 'Контейнер і морська доставка з аукціону США.',
          europe: 'Наземна доставка з Європи за узгодженим маршрутом.',
          korea: 'Морська / змішана логістика з Кореї.',
        },
      },
      {
        title: 'Митниця',
        body: 'Супроводжуємо митне оформлення.',
        byOrigin: {
          usa: 'Митні платежі після прибуття в порт.',
          europe: 'Митне оформлення на кордоні / у пункті призначення.',
          korea: 'Митні платежі за маршрутом прибуття.',
        },
      },
      { title: 'Реєстрація МВС', body: 'Оформлення в сервісному центрі МВС.' },
      { title: 'Передача', body: 'Авто у вашому місті з документами.' },
    ],
  },
  faq: {
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
  },
  callback: {
    title: 'Залишити заявку',
    body: 'Напишіть, яке авто шукаєте або яку послугу потрібна — відповімо протягом години в робочий час.',
    nameLabel: "Ім'я",
    namePlaceholder: 'Як до вас звертатися?',
    phoneLabel: 'Телефон',
    phonePlaceholder: '+380',
    messageLabel: 'Запит',
    messagePlaceholder: 'Бюджет, модель або посилання на оголошення',
    submit: 'Надіслати заявку',
    note: 'Форма на цьому екрані лише для макета — відправка зʼявиться в Milestone 4.',
  },
  system: {
    title: 'Системний аркуш',
    swatches: 'Кольори',
    type: 'Типографіка',
    controls: 'Елементи керування',
  },
};

const en: DesignSeedContent = {
  hero: {
    title: 'Turnkey cars from the USA, Europe and Korea',
    subtitle:
      'We search, inspect and deliver cars with documents — no hidden costs, with a clear view of every step.',
    primaryCta: 'Get a consultation',
    secondaryCta: 'How we work',
    origins: [
      {
        id: 'usa',
        label: 'USA',
        term: 'Typical term 1–3 months',
        check: 'Auction history, VIN, insurance in transit',
      },
      {
        id: 'europe',
        label: 'Europe',
        term: 'Typical term from a few weeks',
        check: 'Mileage history, service records, body',
      },
      {
        id: 'korea',
        label: 'Korea',
        term: 'Typical term by route',
        check: 'Spec, mileage, body condition',
      },
    ],
  },
  services: {
    title: 'Services',
    featured: {
      title: 'Turnkey car search',
      body: 'We search from your preferences and support the full process: trips to other cities, car markets, registration at the MVS service centre, and handover.',
      cta: 'Leave a request',
    },
    rows: [
      {
        title: 'Pre-purchase vehicle inspection',
        scope: 'One vehicle you have already chosen',
      },
      {
        title: 'Expert for a day',
        scope: '9:00–18:00, 5–8 vehicles',
      },
      {
        title: 'Computer diagnostics',
        scope: 'ECU error codes and vehicle data',
      },
      {
        title: 'Travel to other cities',
        scope: 'Inspect, buy, deliver to you',
      },
    ],
  },
  prices: {
    title: 'Prices',
    addonsHeading: 'Additional',
    fromPrefix: 'From',
  },
  inspection: {
    title: 'What an inspection covers',
    items: [
      {
        title: 'Real mileage',
        detail: 'We cross-check the odometer with history and documents.',
      },
      {
        title: 'Crash history',
        detail: 'We look for accident and body-repair traces.',
      },
      {
        title: 'Paint and body',
        detail: 'Thickness gauge, geometry, repaint signs.',
      },
      {
        title: 'Chassis',
        detail: 'Suspension, brakes, play — what you feel on the road.',
      },
      {
        title: 'Documents',
        detail: 'Ownership, restrictions, VIN match.',
      },
    ],
  },
  route: {
    title: 'How turnkey works',
    steps: [
      { title: 'Budget', body: 'We agree budget, car type and delivery city.' },
      { title: 'Search', body: 'We shortlist options that fit criteria and economics.' },
      {
        title: 'Check',
        body: 'We assess condition before purchase — photos, history, diagnostics.',
      },
      { title: 'Buy', body: 'Purchase on agreed terms.' },
      {
        title: 'Shipping',
        body: 'We organise logistics to Ukraine.',
        byOrigin: {
          usa: 'Container and ocean shipping from the US auction.',
          europe: 'Overland delivery from Europe on the agreed route.',
          korea: 'Ocean / mixed logistics from Korea.',
        },
      },
      {
        title: 'Customs',
        body: 'We support customs clearance.',
        byOrigin: {
          usa: 'Customs payments after arrival at the port.',
          europe: 'Customs at the border / destination point.',
          korea: 'Customs payments on the arrival route.',
        },
      },
      { title: 'MVS registration', body: 'Registration at the MVS service centre.' },
      { title: 'Handover', body: 'The car in your city with documents.' },
    ],
  },
  faq: {
    title: 'FAQ',
    items: [
      {
        question: 'Where do the cars come from?',
        answer: 'From the USA, Europe and South Korea — depending on budget and model.',
      },
      {
        question: 'What does turnkey include?',
        answer:
          'Search, inspection, purchase, logistics, customs, MVS registration and handover to you.',
      },
      {
        question: 'Can you inspect only one car?',
        answer: 'Yes. One-time inspection is for a vehicle you have already chosen yourself.',
      },
      {
        question: 'How many cars in a day?',
        answer:
          'Expert for a day: 9:00–18:00, about 5–8 vehicles. Outside Khmelnytskyi, fuel is extra.',
      },
    ],
  },
  callback: {
    title: 'Leave a request',
    body: 'Tell us which car you want or which service you need — we reply within an hour during working hours.',
    nameLabel: 'Name',
    namePlaceholder: 'How should we address you?',
    phoneLabel: 'Phone',
    phonePlaceholder: '+380',
    messageLabel: 'Request',
    messagePlaceholder: 'Budget, model or listing link',
    submit: 'Send request',
    note: 'This form is visual only — submission lands in Milestone 4.',
  },
  system: {
    title: 'System sheet',
    swatches: 'Colours',
    type: 'Typography',
    controls: 'Controls',
  },
};

export const designSeedContent: Record<Locale, DesignSeedContent> = { ua, en };
