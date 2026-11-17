/** Ukrainian copy for the staff bot. */
export const ua = {
  botName: 'AS Autosearch — заявки',
  privateOnly: 'Цей бот працює лише в особистих чатах.',

  requestAccess: '🔐 Запросити доступ',
  menuLeads: '📋 Заявки',
  menuSearch: '🔍 Пошук',
  menuFilters: '🎛 Фільтри',
  menuHelp: '❓ Допомога',
  menuHome: '🏠 Меню',

  welcomeUnknown:
    'Вітаю! Це бот заявок AS Autosearch для співробітників.\n\nЩоб користуватися ботом, надішліть запит на доступ. Адміністратор підтвердить його в CMS.',
  pending: '⏳ Ваш запит на доступ уже на розгляді. Очікуйте рішення адміністратора.',
  declined:
    '❌ Ваш попередній запит відхилено. Ви можете надіслати запит ще раз кнопкою нижче.',
  blocked: '🚫 Доступ заблоковано. Зверніться до адміністратора сайту.',
  requestSent: '📨 Запит надіслано. Очікуйте рішення адміністратора в CMS.',
  approved:
    '✅ Доступ надано. Користуйтеся меню нижче, щоб переглядати та оновлювати заявки.',
  cmsError: '⚠️ Не вдалося звʼязатися з CMS. Спробуйте пізніше.',
  helpUnauthorized:
    'Натисніть «🔐 Запросити доступ», щоб надіслати заявку адміністратору. Після схвалення зʼявиться робота із заявками.',
  helpApproved:
    'Меню:\n• 📋 Заявки — список і деталі\n• 🔍 Пошук — імʼя або телефон\n• 🎛 Фільтри — статус, тип, регіон, марка, дата\n• ❓ Допомога — ця підказка\n\nУ деталях заявки можна змінити статус кнопками.\n\nСтатуси: 🆕 нова · ⏳ в роботі · ✅ успішна · ❌ відхилена',

  searchPrompt:
    '🔍 Введіть імʼя або телефон для пошуку.\nНадішліть наступним повідомленням.',
  filtersTitle: '🎛 Фільтри заявок',
  filtersHint:
    'Можна обрати кілька статусів, типів, регіонів і марок. Дата — одна. Потім «Показати».',
  filterApply: '✅ Показати',
  filterReset: '🧹 Скинути',
  filterAny: 'Будь-який',
  filterAnyStatus: 'Будь-який статус',
  filterAnyType: 'Будь-який тип',
  filterAnyOrigin: 'Будь-який регіон',
  filterAnyBrand: 'Будь-яка марка',
  filtersResetDone: 'Фільтри скинуто.',

  leadsListTitle: '📋 Заявки',
  leadsEmpty: '📭 Заявок поки немає.',
  leadsEmptyFiltered: '📭 Нічого не знайдено за цими умовами.',
  backToMenu: '🏠 Головне меню',
  pageIndicator: (page: number, totalPages: number) =>
    `📄 Сторінка ${page} з ${totalPages}`,
  /** Reply-keyboard middle button: current page / total pages · total leads. */
  listPosition: (page: number, totalPages: number, totalDocs: number) =>
    `📄 ${page}/${Math.max(totalPages, 1)} · ${totalDocs}`,
  prevPage: '◀️ Назад',
  nextPage: 'Далі ▶️',
  alreadyFirstPage: 'Це перша сторінка.',
  alreadyLastPage: 'Це остання сторінка.',

  leadDetailTitle: 'Заявка',
  openLead: 'Відкрити',
  unnamed: 'Без імені',
  statusUpdated: '✅ Статус оновлено.',
  openFailed: '⚠️ Не вдалося відкрити заявку.',
  statusFailed: '⚠️ Не вдалося змінити статус.',
  listFailed: '⚠️ Не вдалося завантажити заявки.',
  forbidden: '🚫 Немає доступу. Зверніться до адміністратора.',

  statusNew: 'Нова',
  statusInProgress: 'В роботі',
  statusWon: 'Успішна',
  statusLost: 'Відхилена',

  fieldStatus: '📊 Статус',
  fieldType: '🏷 Тип',
  fieldName: "👤 Імʼя",
  fieldPhone: '📱 Телефон',
  fieldEmail: '✉️ Email',
  fieldMessage: '💬 Повідомлення',
  fieldBudget: '💰 Бюджет',
  fieldOrigin: '🌍 Регіон авто',
  fieldCarType: '🚙 Тип авто',
  fieldCarBrand: '🚘 Марка',
  fieldDeliveryCity: '🚚 Доставка',
  fieldPriceRange: '💵 Ціновий діапазон',
  fieldAddons: '➕ Додаткові опції',
  fieldExpectedPrice: '💸 Орієнтовна вартість',
  fieldSource: '🔗 Джерело',
  fieldConsent: '☑️ Згода',
  fieldCreatedAt: '📅 Створено',
  fieldReadAt: '👁 Відкрито',
  yes: 'Так',
  no: 'Ні',
} as const;

export type UaCopy = typeof ua;
