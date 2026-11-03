import type { CollectionBeforeChangeHook } from 'payload';
import { APIError } from 'payload';

/** Minimal duplicate-email guard. Full lead inbox fan-out is Milestone 4. */
export const preventDuplicateFormEmail: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create' || !data?.form) return data;

  const formId = typeof data.form === 'object' && data.form !== null ? data.form.id : data.form;

  const form = await req.payload.findByID({
    collection: 'forms',
    id: formId,
    depth: 0,
  });

  if (!form?.preventDuplicateEmail) return data;

  const emailEntry = (
    data.submissionData as { field?: string; value?: string }[] | undefined
  )?.find((row) => row.field === 'email' && row.value);

  if (!emailEntry?.value) return data;

  const existing = await req.payload.find({
    collection: 'form-submissions',
    where: {
      and: [
        { form: { equals: formId } },
        { 'submissionData.value': { equals: emailEntry.value } },
        { 'submissionData.field': { equals: 'email' } },
      ],
    },
    limit: 1,
    depth: 0,
  });

  if (existing.docs.length > 0) {
    throw new APIError(form.duplicateEmailMessage || 'This email was already submitted.', 400);
  }

  return data;
};
