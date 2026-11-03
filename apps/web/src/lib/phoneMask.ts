/** Ukrainian mobile mask: +380 (XX) XXX XX XX (12 digits with country code). */

export const UA_PHONE_DIGIT_COUNT = 12;
export const UA_PHONE_PLACEHOLDER = '+380 (__) ___ __ __';

export function phoneDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/** Keep/force 380 prefix and cap at 12 digits for the UA national format. */
export function normalizeUaPhoneDigits(raw: string): string {
  const digits = phoneDigits(raw);

  if (!digits) return '';

  if (digits.startsWith('380')) {
    return digits.slice(0, UA_PHONE_DIGIT_COUNT);
  }

  if (digits.startsWith('0')) {
    return `380${digits.slice(1)}`.slice(0, UA_PHONE_DIGIT_COUNT);
  }

  return `380${digits}`.slice(0, UA_PHONE_DIGIT_COUNT);
}

export function formatUaPhoneMask(digitsOrRaw: string): string {
  const digits = normalizeUaPhoneDigits(digitsOrRaw);
  if (!digits) return '';

  const national = digits.slice(3);
  let out = '+380';

  if (national.length === 0) return out;

  out += ` (${national.slice(0, 2)}`;
  if (national.length <= 2) return out;

  out += `) ${national.slice(2, 5)}`;
  if (national.length <= 5) return out;

  out += ` ${national.slice(5, 7)}`;
  if (national.length <= 7) return out;

  out += ` ${national.slice(7, 9)}`;
  return out;
}

export function isCompleteUaPhone(raw: string): boolean {
  const digits = normalizeUaPhoneDigits(raw);
  return digits.length === UA_PHONE_DIGIT_COUNT && digits.startsWith('380');
}
