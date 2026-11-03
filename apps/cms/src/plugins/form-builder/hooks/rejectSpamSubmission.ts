import type { CollectionBeforeChangeHook } from 'payload';
import { APIError } from 'payload';

const HONEYPOT_FIELD = 'companyWebsite';

type SubmissionRow = { field?: string; value?: string | null };

/** Reject creates that fill the honeypot (bots). Silent 400 — no lead fan-out. */
export const rejectSpamSubmission: CollectionBeforeChangeHook = ({ data, operation }) => {
  if (operation !== 'create' || !data) return data;

  const rows = data.submissionData as SubmissionRow[] | undefined;
  const trap = rows?.find((row) => row.field === HONEYPOT_FIELD);
  if (trap?.value?.toString().trim()) {
    throw new APIError('Invalid submission.', 400);
  }

  return data;
};
