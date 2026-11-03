import type { CollectionAfterChangeHook, PayloadRequest } from 'payload';

import type { Form, FormSubmission } from '@/payload-types';

import { replaceDoubleCurlys } from '../utils/replaceDoubleCurlys';

type SubmissionRow = NonNullable<FormSubmission['submissionData']>[number];

function pickField(submissionData: FormSubmission['submissionData'], names: string[]): string {
  const lower = names.map((n) => n.toLowerCase());
  const row = submissionData?.find((item) =>
    lower.includes(
      String(item.field ?? '')
        .trim()
        .toLowerCase(),
    ),
  );
  return String(row?.value ?? '').trim();
}

function lexicalToPlain(
  message: Form['emails'] extends (infer E)[] | null | undefined
    ? E extends { message?: infer M }
      ? M
      : never
    : never,
): string {
  try {
    const root = (message as { root?: { children?: unknown[] } } | null)?.root;
    const children = root?.children ?? [];
    const walk = (nodes: unknown[]): string =>
      nodes
        .map((node) => {
          if (!node || typeof node !== 'object') return '';
          const n = node as { text?: string; children?: unknown[]; type?: string };
          if (typeof n.text === 'string') return n.text;
          if (Array.isArray(n.children)) return walk(n.children);
          return '';
        })
        .join('');
    return walk(children);
  } catch {
    return '';
  }
}

const sendEmails = (
  form: Form,
  req: PayloadRequest,
  submissionData: FormSubmission['submissionData'],
) => {
  const emails = form.emails;
  if (!emails?.length) return;

  for (const entry of emails) {
    const to = replaceDoubleCurlys(entry.emailTo, submissionData as SubmissionRow[]);
    const from = replaceDoubleCurlys(entry.emailFrom, submissionData as SubmissionRow[]);
    const subject = replaceDoubleCurlys(entry.subject, submissionData as SubmissionRow[]);
    const body = replaceDoubleCurlys(
      lexicalToPlain(entry.message),
      submissionData as SubmissionRow[],
    );

    void req.payload.sendEmail({
      from,
      html: `<div>${body}</div>`,
      subject,
      to,
    });
  }
};

function optionalText(value: string): string | undefined {
  return value || undefined;
}

export const onFormSubmissionCreate: CollectionAfterChangeHook<FormSubmission> = ({
  doc,
  operation,
  req,
}) => {
  if (operation === 'update') return doc;

  const { form, submissionData } = doc;
  const formID = typeof form === 'string' ? form : form?.id;
  if (!formID) return doc;

  void req.payload
    .findByID({ collection: 'forms', id: formID })
    .then(async (formDoc) => {
      sendEmails(formDoc, req, submissionData);

      const kind = String(formDoc.submissionKind ?? 'none');
      if (kind !== 'lead' && kind !== 'contact') return;

      const name = pickField(submissionData, ['name', 'firstName', 'імʼя', "ім'я"]);
      const email = pickField(submissionData, ['email']);
      const phone = pickField(submissionData, ['phone', 'tel']);
      const message = pickField(submissionData, ['message', 'comment']);
      const source = pickField(submissionData, ['source', 'pageUrl', 'page_url']);
      const consentRaw = pickField(submissionData, ['consent', 'acceptTerms', 'terms']);
      const service = pickField(submissionData, ['service']);
      const leadTypeRaw =
        pickField(submissionData, ['type', 'leadType', 'lead_type']) || service || 'general';
      const allowedTypes = [
        'consultation',
        'turnkey',
        'inspection',
        'expert',
        'callback',
        'test-drive',
        'trade-in',
        'finance',
        'general',
      ] as const;
      type LeadType = (typeof allowedTypes)[number];
      const leadType: LeadType = (allowedTypes as readonly string[]).includes(leadTypeRaw)
        ? (leadTypeRaw as LeadType)
        : 'general';

      const budget = pickField(submissionData, ['budget']);
      const budgetCurrencyRaw = pickField(submissionData, ['budgetCurrency']);
      const budgetCurrency = (['uah', 'usd', 'eur'] as const).includes(
        budgetCurrencyRaw as 'uah' | 'usd' | 'eur',
      )
        ? (budgetCurrencyRaw as 'uah' | 'usd' | 'eur')
        : undefined;
      const origin = pickField(submissionData, ['origin']);
      const carType = pickField(submissionData, ['carType']);
      const carBrand = pickField(submissionData, ['carBrand']);
      const otherCityRaw = pickField(submissionData, ['otherCity']);
      const deliveryCity = pickField(submissionData, ['deliveryCity']);
      const priceRange = pickField(submissionData, ['priceRange']);
      const addons = pickField(submissionData, ['addons']);
      const expectedPrice = pickField(submissionData, ['expectedPrice']);

      const hasOtherCityField = Boolean(
        submissionData?.some(
          (item) => String(item.field ?? '').trim().toLowerCase() === 'othercity',
        ),
      );

      const request = {
        budget: optionalText(budget),
        budgetCurrency,
        origin: optionalText(origin),
        carType: optionalText(carType),
        carBrand: optionalText(carBrand),
        ...(hasOtherCityField
          ? {
              otherCity:
                otherCityRaw === 'true' || otherCityRaw === '1' || otherCityRaw === 'yes',
            }
          : {}),
        deliveryCity: optionalText(deliveryCity),
        priceRange: optionalText(priceRange),
        addons: optionalText(addons),
        expectedPrice: optionalText(expectedPrice),
      };

      const hasRequestDetails = Object.values(request).some((value) => {
        if (typeof value === 'boolean') return true;
        return Boolean(value);
      });

      await req.payload.create({
        collection: 'leads',
        data: {
          status: 'new',
          type: leadType,
          form: formID,
          formSubmission: doc.id,
          name,
          email,
          phone,
          message: optionalText(message),
          ...(hasRequestDetails ? { request } : {}),
          source: optionalText(source),
          consent: consentRaw === 'true' || consentRaw === '1' || consentRaw === 'yes',
        },
        overrideAccess: true,
        req,
      });
    })
    .catch((err) => {
      req.payload.logger.error({ err, msg: '[onFormSubmissionCreate] lead fan-out failed' });
    });

  return doc;
};
