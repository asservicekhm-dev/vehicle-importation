import type { LeadDetail, LeadListResult, LeadStatus, LeadSummary } from '../cms/leads.js';
import { ua } from '../i18n/ua.js';
import { type ChatSession,hasActiveFilters } from '../session.js';
import {
  brandFilterLabel,
  dateFilterLabel,
  originFilterLabel,
  typeFilterLabel,
} from './filterOptions.js';

/** Status cue (Telegram buttons can't use real colors). */
const STATUS_EMOJI: Record<LeadStatus, string> = {
  new: '🆕',
  'in-progress': '⏳',
  won: '✅',
  lost: '❌',
};

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: ua.statusNew,
  'in-progress': ua.statusInProgress,
  won: ua.statusWon,
  lost: ua.statusLost,
};

const TYPE_EMOJI: Record<string, string> = {
  consultation: '💬',
  turnkey: '🔑',
  inspection: '🔍',
  expert: '🧑‍💼',
  callback: '📞',
  'test-drive': '🚗',
  'trade-in': '🔄',
  finance: '💰',
  general: '📝',
};

const TYPE_LABEL: Record<string, string> = {
  consultation: 'Консультація',
  turnkey: 'Підбір під ключ',
  inspection: 'Перевірка',
  expert: 'Експерт на день',
  callback: 'Зворотний дзвінок',
  'test-drive': 'Тест-драйв',
  'trade-in': 'Trade-in',
  finance: 'Фінансування',
  general: 'Загальна',
};

/** Mirrors `@autosearch/config` booking options (UA labels). Kept local for Node bot runtime. */
const ORIGIN_LABEL: Record<string, string> = {
  usa: '🇺🇸 США',
  europe: '🇪🇺 Європа',
  korea: '🇰🇷 Корея',
};

const CAR_TYPE_LABEL: Record<string, string> = {
  sedan: 'Седан',
  suv: 'Позашляховик / SUV',
  hatchback: 'Хетчбек',
  wagon: 'Універсал',
  coupe: 'Купе',
  pickup: 'Пікап',
  minivan: 'Мінівен',
  electric: 'Електро',
};

const CAR_BRAND_LABEL: Record<string, string> = {
  toyota: 'Toyota',
  bmw: 'BMW',
  mercedes: 'Mercedes-Benz',
  audi: 'Audi',
  volkswagen: 'Volkswagen',
  hyundai: 'Hyundai',
  kia: 'Kia',
  honda: 'Honda',
  ford: 'Ford',
  chevrolet: 'Chevrolet',
  nissan: 'Nissan',
  lexus: 'Lexus',
  mazda: 'Mazda',
  tesla: 'Tesla',
  skoda: 'Škoda',
  volvo: 'Volvo',
};

const DELIVERY_CITY_LABEL: Record<string, string> = {
  kyiv: 'Київ',
  lviv: 'Львів',
  odesa: 'Одеса',
  dnipro: 'Дніпро',
  kharkiv: 'Харків',
  vinnytsia: 'Вінниця',
  zhytomyr: 'Житомир',
  rivne: 'Рівне',
  ternopil: 'Тернопіль',
  chernivtsi: 'Чернівці',
  'ivano-frankivsk': 'Івано-Франківськ',
  lutsk: 'Луцьк',
  uzhhorod: 'Ужгород',
  poltava: 'Полтава',
  cherkasy: 'Черкаси',
  sumy: 'Суми',
  mykolaiv: 'Миколаїв',
  zaporizhzhia: 'Запоріжжя',
};

const CURRENCY_DISPLAY: Record<string, string> = {
  uah: 'грн',
  usd: '$',
  eur: '€',
  грн: 'грн',
  $: '$',
  '€': '€',
  '₴': 'грн',
};

const INDEX_EMOJI = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'] as const;

export function statusEmoji(status: LeadStatus): string {
  return STATUS_EMOJI[status] ?? '⚪';
}

export function statusLabel(status: LeadStatus): string {
  return STATUS_LABEL[status] ?? status;
}

/** e.g. `🆕 Нова` */
export function statusLabelWithEmoji(status: LeadStatus): string {
  return `${statusEmoji(status)} ${statusLabel(status)}`;
}

export function typeEmoji(type: string): string {
  return TYPE_EMOJI[type] ?? '📌';
}

export function typeLabel(type: string | null | undefined): string | null {
  if (!type) return null;
  const label = TYPE_LABEL[type] ?? type;
  return `${typeEmoji(type)} ${label}`;
}

export function formatKyiv(iso: string): string {
  return new Intl.DateTimeFormat('uk-UA', {
    timeZone: 'Europe/Kyiv',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(iso));
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Digits for `tel:` href, e.g. `+380123123121`. */
export function phoneTelHref(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const digits = raw.replace(/\D/g, '');

  if (digits.length === 12 && digits.startsWith('380')) return `+${digits}`;
  if (digits.length === 10 && digits.startsWith('0')) return `+380${digits.slice(1)}`;
  if (digits.length === 9) return `+380${digits}`;
  if (digits.length >= 10) return `+${digits}`;
  return null;
}

/** UA-friendly mask; falls back gracefully for other numbers. */
export function formatPhone(raw: string | null | undefined): string {
  if (!raw?.trim()) return '—';
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, '');

  const asUa12 = (d: string) =>
    `+380 ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10, 12)}`;

  if (digits.length === 12 && digits.startsWith('380')) {
    return asUa12(digits);
  }
  if (digits.length === 10 && digits.startsWith('0')) {
    return asUa12(`380${digits.slice(1)}`);
  }
  if (digits.length === 9) {
    return asUa12(`380${digits}`);
  }

  if (trimmed.startsWith('+') && digits.length >= 10) {
    return `+${digits}`;
  }
  if (digits.length >= 10) {
    return `+${digits}`;
  }

  return trimmed;
}

/** Clickable phone via Telegram HTML `tel:` link (works best on mobile). */
export function formatPhoneHtml(raw: string | null | undefined): string {
  const display = formatPhone(raw);
  if (display === '—') return escapeHtml(display);
  const href = phoneTelHref(raw);
  if (!href) return escapeHtml(display);
  return `<a href="tel:${href}">${escapeHtml(display)}</a>`;
}

function truncate(value: string, max: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

/** Per-item open button (card already shows index/status). */
export function leadOpenButtonText(doc: LeadSummary): string {
  return truncate(`${statusEmoji(doc.status)} ${ua.openLead}`, 64);
}

function labeled(label: string, valueHtml: string): string {
  return `<b>${escapeHtml(label)}:</b> ${valueHtml}`;
}

/** Title-case unknown free-text (e.g. custom brand). */
function capitalizeWords(value: string): string {
  return value
    .trim()
    .split(/([\s-]+)/)
    .map((part) => {
      if (!part || /^[\s-]+$/.test(part)) return part;
      return part.charAt(0).toLocaleUpperCase('uk-UA') + part.slice(1);
    })
    .join('');
}

function mapOrCapitalize(
  map: Record<string, string>,
  value: string | null | undefined,
): string | null {
  if (!value?.trim()) return null;
  const key = value.trim().toLowerCase();
  return map[key] ?? capitalizeWords(value);
}

export function formatOriginLabel(value: string | null | undefined): string | null {
  return mapOrCapitalize(ORIGIN_LABEL, value);
}

export function formatCarTypeLabel(value: string | null | undefined): string | null {
  return mapOrCapitalize(CAR_TYPE_LABEL, value);
}

export function formatCarBrandLabel(value: string | null | undefined): string | null {
  return mapOrCapitalize(CAR_BRAND_LABEL, value);
}

export function formatDeliveryCityLabel(value: string | null | undefined): string | null {
  return mapOrCapitalize(DELIVERY_CITY_LABEL, value);
}

function normalizeCurrencyCode(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const key = raw.trim().toLowerCase();
  if (CURRENCY_DISPLAY[key]) return CURRENCY_DISPLAY[key]!;
  const upper = raw.trim().toUpperCase();
  if (upper === 'UAH' || upper === 'USD' || upper === 'EUR') {
    return CURRENCY_DISPLAY[upper.toLowerCase()] ?? upper;
  }
  return upper;
}

function formatAmountDigits(digits: string): string {
  return new Intl.NumberFormat('uk-UA', {
    maximumFractionDigits: 0,
  }).format(Number(digits));
}

/** `$` / `€` before the amount; `грн` and other codes after. */
function withCurrency(formattedAmount: string, currency: string | null): string {
  if (!currency) return formattedAmount;
  if (currency === '$' || currency === '€') {
    return `${currency}${formattedAmount}`;
  }
  return `${formattedAmount} ${currency}`;
}

/**
 * Money display: `1231211` + `eur` → `€1 231 211`; `usd` → `$1 231 211`.
 * Also accepts combined strings like `700 USD` / `від 100 USD`.
 */
export function formatMoneyDisplay(
  amountRaw: string | null | undefined,
  currencyRaw?: string | null,
): string | null {
  if (!amountRaw?.trim()) return null;
  let trimmed = amountRaw.trim();

  const fromMatch = trimmed.match(/^(від|from)\s+/i);
  const fromPrefix = fromMatch ? 'від ' : '';
  if (fromMatch) {
    trimmed = trimmed.slice(fromMatch[0].length).trim();
  }

  let amountPart = trimmed;
  let currencyPart = currencyRaw?.trim() ?? '';

  const combined = trimmed.match(
    /^([\d\s.,]+)\s*(грн|uah|usd|eur|₴|\$|€|[A-Za-z]{3})$/i,
  );
  if (combined) {
    amountPart = combined[1]!.trim();
    if (!currencyPart) currencyPart = combined[2]!;
  }

  const digits = amountPart.replace(/\D/g, '');
  if (!digits) return amountRaw.trim();

  return `${fromPrefix}${withCurrency(formatAmountDigits(digits), normalizeCurrencyCode(currencyPart))}`;
}

/**
 * Service estimate may be several lines joined with `+`
 * (`2 000 UAH + 700 UAH + від 100 USD`). Format each segment; never mash digits.
 */
export function formatExpectedPriceDisplay(
  amountRaw: string | null | undefined,
  currencyRaw?: string | null,
): string | null {
  if (!amountRaw?.trim()) return null;
  const trimmed = amountRaw.trim();

  if (trimmed.includes('+')) {
    return trimmed
      .split(/\s*\+\s*/)
      .map((part) => formatMoneyDisplay(part.trim()) ?? part.trim())
      .join(' + ');
  }

  return formatMoneyDisplay(trimmed, currencyRaw) ?? trimmed;
}

/** 24-char hex → Payload row/addon id stored by older form submits. */
function looksLikeDocumentId(value: string): boolean {
  return /^[a-f0-9]{24}$/i.test(value.trim());
}

/**
 * Vehicle price range (always USD in this product): `22000-32000` → `$22 000 – $32 000`.
 * Human labels from the price list (e.g. `До $10 000`) pass through unchanged.
 * Bare document ids are omitted (legacy form bug).
 */
export function formatPriceRangeDisplay(
  rangeRaw: string | null | undefined,
): string | null {
  if (!rangeRaw?.trim()) return null;
  const trimmed = rangeRaw.trim();
  if (looksLikeDocumentId(trimmed)) return null;

  const match = trimmed.match(
    /^([\d\s.,]+)\s*[-–—]\s*([\d\s.,]+)(?:\s*(грн|uah|usd|eur|₴|\$|€|[A-Za-z]{3}))?$/i,
  );
  if (!match) {
    return trimmed;
  }

  const lowDigits = match[1]!.replace(/\D/g, '');
  const highDigits = match[2]!.replace(/\D/g, '');
  if (!lowDigits || !highDigits) return trimmed;

  const currency = normalizeCurrencyCode(match[3] ?? 'usd');
  const low = withCurrency(formatAmountDigits(lowDigits), currency);
  const high = withCurrency(formatAmountDigits(highDigits), currency);
  return `${low} – ${high}`;
}

/** Addon labels; drop legacy comma-separated document ids. */
export function formatAddonsDisplay(addonsRaw: string | null | undefined): string | null {
  if (!addonsRaw?.trim()) return null;
  const parts = addonsRaw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (!parts.length) return null;
  if (parts.every(looksLikeDocumentId)) return null;
  return parts.filter((part) => !looksLikeDocumentId(part)).join(', ') || null;
}

export function formatActiveFiltersLine(session: ChatSession): string | null {
  const parts: string[] = [];
  if (session.q) parts.push(`🔍 «${session.q}»`);
  for (const status of session.statuses) {
    parts.push(statusLabelWithEmoji(status));
  }
  for (const type of session.types) {
    parts.push(typeFilterLabel(type));
  }
  for (const origin of session.origins) {
    parts.push(originFilterLabel(origin));
  }
  for (const brand of session.carBrands) {
    parts.push(brandFilterLabel(brand));
  }
  if (session.datePreset && session.datePreset !== 'all') {
    parts.push(dateFilterLabel(session.datePreset));
  }
  if (parts.length === 0) return null;
  return parts.join(' · ');
}

export function formatFiltersPanelHtml(session: ChatSession): string {
  const active = formatActiveFiltersLine(session);
  return [
    escapeHtml(ua.filtersTitle),
    escapeHtml(ua.filtersHint),
    active ? escapeHtml(active) : escapeHtml(ua.filterAny),
  ].join('\n');
}

export function formatListHeaderHtml(
  result: LeadListResult,
  session: ChatSession,
): string {
  const lines = [escapeHtml(ua.leadsListTitle)];
  const active = formatActiveFiltersLine(session);
  if (active) lines.push(escapeHtml(active));

  if (result.totalDocs === 0) {
    lines.push(
      escapeHtml(hasActiveFilters(session) ? ua.leadsEmptyFiltered : ua.leadsEmpty),
    );
    return lines.join('\n');
  }

  lines.push(
    escapeHtml(ua.pageIndicator(result.page, Math.max(result.totalPages, 1))),
  );
  return lines.join('\n');
}

export function formatLeadListCardHtml(doc: LeadSummary, indexOnPage: number): string {
  const n = INDEX_EMOJI[indexOnPage] ?? `${indexOnPage + 1}.`;
  const name = escapeHtml(doc.name?.trim() || ua.unnamed);
  const type = typeLabel(doc.type);

  const lines = [
    `${n} ${statusEmoji(doc.status)}`,
    labeled(ua.fieldName, name),
    labeled(ua.fieldPhone, formatPhoneHtml(doc.phone)),
    labeled(ua.fieldStatus, escapeHtml(statusLabelWithEmoji(doc.status))),
  ];
  if (type) {
    lines.push(labeled(ua.fieldType, escapeHtml(type)));
  }
  lines.push(labeled(ua.fieldCreatedAt, escapeHtml(formatKyiv(doc.createdAt))));
  return lines.join('\n');
}

export function formatLeadNotifyHtml(doc: LeadDetail): string {
  return formatLeadDetailHtml(doc, ua.leadNotifyTitle);
}

export function formatLeadDetailHtml(
  doc: LeadDetail,
  title: string = ua.leadDetailTitle,
): string {
  const req = doc.request;
  const priceRange = formatPriceRangeDisplay(req?.priceRange);
  const addons = formatAddonsDisplay(req?.addons);
  const expectedPrice = formatExpectedPriceDisplay(
    req?.expectedPrice,
    req?.budgetCurrency,
  );
  const origin = formatOriginLabel(req?.origin);
  const carType = formatCarTypeLabel(req?.carType);
  const carBrand = formatCarBrandLabel(req?.carBrand);
  const deliveryCity = formatDeliveryCityLabel(req?.deliveryCity);

  const lines: Array<string | null> = [
    `📋 <b>${escapeHtml(title)}</b>`,
    labeled(ua.fieldStatus, escapeHtml(statusLabelWithEmoji(doc.status))),
    typeLabel(doc.type)
      ? labeled(ua.fieldType, escapeHtml(typeLabel(doc.type)!))
      : null,
    doc.name?.trim() ? labeled(ua.fieldName, escapeHtml(doc.name.trim())) : null,
    labeled(ua.fieldPhone, formatPhoneHtml(doc.phone)),
    doc.email?.trim() ? labeled(ua.fieldEmail, escapeHtml(doc.email.trim())) : null,
    doc.message?.trim() ? labeled(ua.fieldMessage, escapeHtml(doc.message.trim())) : null,
    req?.budget
      ? labeled(
          ua.fieldBudget,
          escapeHtml(
            formatMoneyDisplay(req.budget, req.budgetCurrency) ?? req.budget,
          ),
        )
      : null,
    origin ? labeled(ua.fieldOrigin, escapeHtml(origin)) : null,
    carType ? labeled(ua.fieldCarType, escapeHtml(carType)) : null,
    carBrand ? labeled(ua.fieldCarBrand, escapeHtml(carBrand)) : null,
    req?.otherCity
      ? labeled(ua.fieldDeliveryCity, escapeHtml(deliveryCity || ua.yes))
      : deliveryCity
        ? labeled(ua.fieldDeliveryCity, escapeHtml(deliveryCity))
        : null,
    priceRange ? labeled(ua.fieldPriceRange, escapeHtml(priceRange)) : null,
    addons ? labeled(ua.fieldAddons, escapeHtml(addons)) : null,
    expectedPrice ? labeled(ua.fieldExpectedPrice, escapeHtml(expectedPrice)) : null,
    doc.source?.trim() ? labeled(ua.fieldSource, escapeHtml(doc.source.trim())) : null,
    labeled(ua.fieldCreatedAt, escapeHtml(formatKyiv(doc.createdAt))),
    doc.readAt ? labeled(ua.fieldReadAt, escapeHtml(formatKyiv(doc.readAt))) : null,
  ];

  let text = lines.filter(Boolean).join('\n');
  if (text.length > 4000) {
    text = `${text.slice(0, 3999)}…`;
  }
  return text;
}
