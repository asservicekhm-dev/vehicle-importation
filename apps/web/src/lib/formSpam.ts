/** Honeypot field name — must stay empty for humans. Bots often autofill it. */
export const FORM_HONEYPOT_FIELD = 'companyWebsite';

export function honeypotFilled(
  rows: { field: string; value?: string | null }[] | undefined,
): boolean {
  if (!rows?.length) return false;
  const hit = rows.find((row) => row.field === FORM_HONEYPOT_FIELD);
  return Boolean(hit?.value?.toString().trim());
}
