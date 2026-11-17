import type { LeadStatus } from '../cms/leads.js';
import type { DatePreset } from '../session.js';

/** Labels sized for 2-column inline rows (readable on mobile). */
export const FILTER_STATUSES: Array<{ value: LeadStatus; label: string }> = [
  { value: 'new', label: '🆕 Нова' },
  { value: 'in-progress', label: '⏳ В роботі' },
  { value: 'won', label: '✅ Успішна' },
  { value: 'lost', label: '❌ Відхилена' },
];

export const FILTER_TYPES: Array<{ value: string; label: string }> = [
  { value: 'consultation', label: '💬 Консультація' },
  { value: 'turnkey', label: '🔑 Під ключ' },
  { value: 'inspection', label: '🔍 Перевірка' },
  { value: 'expert', label: '🧑‍💼 Експерт' },
  { value: 'callback', label: '📞 Дзвінок' },
  { value: 'test-drive', label: '🚗 Тест-драйв' },
  { value: 'trade-in', label: '🔄 Trade-in' },
  { value: 'finance', label: '💰 Фінанси' },
  { value: 'general', label: '📝 Загальна' },
];

export const FILTER_ORIGINS: Array<{ value: string; label: string }> = [
  { value: 'usa', label: '🇺🇸 США' },
  { value: 'europe', label: '🇪🇺 Європа' },
  { value: 'korea', label: '🇰🇷 Корея' },
];

export const FILTER_BRANDS: Array<{ value: string; label: string }> = [
  { value: 'toyota', label: 'Toyota' },
  { value: 'bmw', label: 'BMW' },
  { value: 'mercedes', label: 'Mercedes' },
  { value: 'audi', label: 'Audi' },
  { value: 'volkswagen', label: 'Volkswagen' },
  { value: 'hyundai', label: 'Hyundai' },
  { value: 'kia', label: 'Kia' },
  { value: 'honda', label: 'Honda' },
  { value: 'ford', label: 'Ford' },
  { value: 'chevrolet', label: 'Chevrolet' },
  { value: 'nissan', label: 'Nissan' },
  { value: 'lexus', label: 'Lexus' },
  { value: 'mazda', label: 'Mazda' },
  { value: 'tesla', label: 'Tesla' },
  { value: 'skoda', label: 'Škoda' },
  { value: 'volvo', label: 'Volvo' },
];

export const FILTER_DATES: Array<{ value: DatePreset; label: string }> = [
  { value: 'today', label: '📅 Сьогодні' },
  { value: '7d', label: '📅 7 днів' },
  { value: '30d', label: '📅 30 днів' },
  { value: 'all', label: '📅 Увесь час' },
];

export function typeFilterLabel(value: string): string {
  return FILTER_TYPES.find((t) => t.value === value)?.label ?? value;
}

export function originFilterLabel(value: string): string {
  return FILTER_ORIGINS.find((o) => o.value === value)?.label ?? value;
}

export function brandFilterLabel(value: string): string {
  return FILTER_BRANDS.find((b) => b.value === value)?.label ?? value;
}

export function dateFilterLabel(value: DatePreset): string {
  return FILTER_DATES.find((d) => d.value === value)?.label ?? value;
}
