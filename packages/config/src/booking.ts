type Locale = 'ua' | 'en';

export const bookingServiceModes = [
  'consultation',
  'turnkey',
  'inspection',
  'expert',
] as const;

export type BookingServiceMode = (typeof bookingServiceModes)[number];

export const isBookingServiceMode = (value: unknown): value is BookingServiceMode =>
  typeof value === 'string' && (bookingServiceModes as readonly string[]).includes(value);

export type LocalizedOption = {
  value: string;
  label: Record<Locale, string>;
};

export const carOrigins: LocalizedOption[] = [
  { value: 'usa', label: { ua: 'США', en: 'USA' } },
  { value: 'europe', label: { ua: 'Європа', en: 'Europe' } },
  { value: 'korea', label: { ua: 'Корея', en: 'Korea' } },
];

export const carTypes: LocalizedOption[] = [
  { value: 'sedan', label: { ua: 'Седан', en: 'Sedan' } },
  { value: 'suv', label: { ua: 'Позашляховик / SUV', en: 'SUV' } },
  { value: 'hatchback', label: { ua: 'Хетчбек', en: 'Hatchback' } },
  { value: 'wagon', label: { ua: 'Універсал', en: 'Wagon' } },
  { value: 'coupe', label: { ua: 'Купе', en: 'Coupe' } },
  { value: 'pickup', label: { ua: 'Пікап', en: 'Pickup' } },
  { value: 'minivan', label: { ua: 'Мінівен', en: 'Minivan' } },
  { value: 'electric', label: { ua: 'Електро', en: 'Electric' } },
];

export const carBrands: LocalizedOption[] = [
  { value: 'toyota', label: { ua: 'Toyota', en: 'Toyota' } },
  { value: 'bmw', label: { ua: 'BMW', en: 'BMW' } },
  { value: 'mercedes', label: { ua: 'Mercedes-Benz', en: 'Mercedes-Benz' } },
  { value: 'audi', label: { ua: 'Audi', en: 'Audi' } },
  { value: 'volkswagen', label: { ua: 'Volkswagen', en: 'Volkswagen' } },
  { value: 'hyundai', label: { ua: 'Hyundai', en: 'Hyundai' } },
  { value: 'kia', label: { ua: 'Kia', en: 'Kia' } },
  { value: 'honda', label: { ua: 'Honda', en: 'Honda' } },
  { value: 'ford', label: { ua: 'Ford', en: 'Ford' } },
  { value: 'chevrolet', label: { ua: 'Chevrolet', en: 'Chevrolet' } },
  { value: 'nissan', label: { ua: 'Nissan', en: 'Nissan' } },
  { value: 'lexus', label: { ua: 'Lexus', en: 'Lexus' } },
  { value: 'mazda', label: { ua: 'Mazda', en: 'Mazda' } },
  { value: 'tesla', label: { ua: 'Tesla', en: 'Tesla' } },
  { value: 'skoda', label: { ua: 'Škoda', en: 'Škoda' } },
  { value: 'volvo', label: { ua: 'Volvo', en: 'Volvo' } },
];

/** Delivery cities outside Khmelnytskyi (office city). */
export const deliveryCities: LocalizedOption[] = [
  { value: 'kyiv', label: { ua: 'Київ', en: 'Kyiv' } },
  { value: 'lviv', label: { ua: 'Львів', en: 'Lviv' } },
  { value: 'odesa', label: { ua: 'Одеса', en: 'Odesa' } },
  { value: 'dnipro', label: { ua: 'Дніпро', en: 'Dnipro' } },
  { value: 'kharkiv', label: { ua: 'Харків', en: 'Kharkiv' } },
  { value: 'vinnytsia', label: { ua: 'Вінниця', en: 'Vinnytsia' } },
  { value: 'zhytomyr', label: { ua: 'Житомир', en: 'Zhytomyr' } },
  { value: 'rivne', label: { ua: 'Рівне', en: 'Rivne' } },
  { value: 'ternopil', label: { ua: 'Тернопіль', en: 'Ternopil' } },
  { value: 'chernivtsi', label: { ua: 'Чернівці', en: 'Chernivtsi' } },
  { value: 'ivano-frankivsk', label: { ua: 'Івано-Франківськ', en: 'Ivano-Frankivsk' } },
  { value: 'lutsk', label: { ua: 'Луцьк', en: 'Lutsk' } },
  { value: 'uzhhorod', label: { ua: 'Ужгород', en: 'Uzhhorod' } },
  { value: 'poltava', label: { ua: 'Полтава', en: 'Poltava' } },
  { value: 'cherkasy', label: { ua: 'Черкаси', en: 'Cherkasy' } },
  { value: 'sumy', label: { ua: 'Суми', en: 'Sumy' } },
  { value: 'mykolaiv', label: { ua: 'Миколаїв', en: 'Mykolaiv' } },
  { value: 'zaporizhzhia', label: { ua: 'Запоріжжя', en: 'Zaporizhzhia' } },
];

export const budgetCurrencies = ['uah', 'usd', 'eur'] as const;
export type BudgetCurrency = (typeof budgetCurrencies)[number];

export const budgetCurrencyLabels: Record<BudgetCurrency, string> = {
  uah: 'UAH',
  usd: 'USD',
  eur: 'EUR',
};

export function optionLabel(option: LocalizedOption, locale: Locale): string {
  return option.label[locale] ?? option.label.ua;
}

export function localizeOptions(
  options: LocalizedOption[],
  locale: Locale,
): { value: string; label: string }[] {
  return options.map((option) => ({
    value: option.value,
    label: optionLabel(option, locale),
  }));
}
