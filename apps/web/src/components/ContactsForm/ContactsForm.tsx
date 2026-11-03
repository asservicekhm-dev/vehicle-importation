'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import { sendForm } from '@/actions/sendForm';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import {
  formatUaPhoneMask,
  isCompleteUaPhone,
  normalizeUaPhoneDigits,
  phoneDigits,
  UA_PHONE_PLACEHOLDER,
} from '@/lib/phoneMask';
import type { Form } from '@autosearch/cms/payload-types';

import styles from './ContactsForm.module.scss';

export type FormLayout = {
  emailField?: string | null;
  messageField?: string | null;
  nameField?: string | null;
  phoneField?: string | null;
} | null;

type FieldSlot = 'email' | 'message' | 'name' | 'other' | 'phone';

const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 50;

function slotFor(name: string, layout: FormLayout): FieldSlot {
  const n = name.trim();
  if (!n) return 'other';
  if (layout?.nameField?.trim() === n) return 'name';
  if (layout?.phoneField?.trim() === n) return 'phone';
  if (layout?.emailField?.trim() === n) return 'email';
  if (layout?.messageField?.trim() === n) return 'message';

  const lower = n.toLowerCase();
  if (lower === 'name' || lower === "ім'я" || lower === 'імʼя') return 'name';
  if (lower === 'phone' || lower === 'телефон' || lower === 'tel') return 'phone';
  if (lower === 'email') return 'email';
  if (lower === 'message' || lower === 'повідомлення' || lower === 'запит') return 'message';
  return 'other';
}

function resolveFieldCopy(
  slot: FieldSlot,
  field: { label?: string | null; placeholder?: string | null; name: string },
  t: ReturnType<typeof useTranslations<'Form'>>,
): { label: string; placeholder: string } {
  const cmsLabel = field.label?.trim() ?? '';
  const cmsPlaceholder = field.placeholder?.trim() ?? '';
  const fieldName = field.name.trim().toLowerCase();
  const looksLikeFieldName = !cmsLabel || cmsLabel.toLowerCase() === fieldName;

  if (slot === 'name') {
    return {
      label: looksLikeFieldName ? t('labelName') : cmsLabel,
      placeholder: cmsPlaceholder || t('placeholderName'),
    };
  }
  if (slot === 'phone') {
    return {
      label: looksLikeFieldName ? t('labelPhone') : cmsLabel,
      placeholder: cmsPlaceholder || t('placeholderPhone'),
    };
  }
  if (slot === 'message') {
    return {
      label: looksLikeFieldName ? t('labelMessage') : cmsLabel,
      placeholder: cmsPlaceholder || t('placeholderMessage'),
    };
  }
  if (slot === 'email') {
    return {
      label: looksLikeFieldName ? t('labelEmail') : cmsLabel,
      placeholder: cmsPlaceholder || t('placeholderEmail'),
    };
  }

  return {
    label: cmsLabel || field.name,
    placeholder: cmsPlaceholder,
  };
}

function valueToSubmissionString(value: unknown): string {
  if (value == null) return '';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
}

type Props = {
  className?: string;
  form: Form;
  layout?: FormLayout;
  /** Hide message/textarea fields (compact pitch forms). */
  hideMessage?: boolean;
  /** Side-by-side name/phone on tablet+ (pitch). */
  compact?: boolean;
};

export function ContactsForm({
  className,
  form,
  layout = null,
  hideMessage = false,
  compact = false,
}: Props) {
  const t = useTranslations('Form');
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const fields = form.fields ?? [];

  const {
    control,
    formState: { isSubmitting },
    handleSubmit,
    reset,
  } = useForm<Record<string, string>>({
    mode: 'onChange',
    defaultValues: fields.reduce<Record<string, string>>((acc, field) => {
      if ('name' in field && typeof field.name === 'string') {
        acc[field.name] = '';
      }
      return acc;
    }, {}),
  });

  const onSubmit = handleSubmit(async (data) => {
    setStatus(null);

    const formId = form.id;
    if (!formId) {
      setStatus({ kind: 'error', text: t('notConfigured') });
      return;
    }

    const submissionData = Object.entries(data)
      .filter(([fieldName]) => !(hideMessage && slotFor(fieldName, layout) === 'message'))
      .map(([fieldName, value]) => {
        const slot = slotFor(fieldName, layout);
        const raw = valueToSubmissionString(value);
        const normalized =
          slot === 'phone' ? normalizeUaPhoneDigits(raw) || phoneDigits(raw) : raw;
        return { field: fieldName, value: normalized };
      });

    const result = await sendForm({ form: formId, submissionData });

    if (!result.ok) {
      setStatus({
        kind: 'error',
        text: result.message?.trim() || result.title || t('errorGeneric'),
      });
      return;
    }

    reset();
    setStatus({
      kind: 'success',
      text: form.successMessage?.trim() || t('successFallback'),
    });
  });

  if (fields.length === 0) return null;

  return (
    <form className={clsx(styles.root, className)} noValidate onSubmit={onSubmit}>
      <div className={clsx(styles.fields, compact && styles.fieldsCompact)}>
        {fields.map((field) => {
          if (!('name' in field) || typeof field.name !== 'string') return null;

          const slot = slotFor(field.name, layout);
          const copy = resolveFieldCopy(slot, field, t);
          const isRequired = Boolean('isRequired' in field && field.isRequired);
          const key = 'id' in field && field.id ? String(field.id) : field.name;
          const isPhone = field.blockType === 'phone-number' || slot === 'phone';

          if (field.blockType === 'message') {
            if (hideMessage) return null;
            return (
              <Controller
                key={key}
                control={control}
                name={field.name}
                rules={{
                  required: isRequired ? t('required') : false,
                }}
                render={({ field: f, fieldState: { error } }) => (
                  <Textarea
                    {...f}
                    label={
                      <>
                        {isRequired ? '* ' : null}
                        {copy.label}
                      </>
                    }
                    placeholder={copy.placeholder}
                    rows={5}
                    error={error?.message}
                  />
                )}
              />
            );
          }

          if (
            field.blockType === 'text' ||
            field.blockType === 'email' ||
            field.blockType === 'phone-number'
          ) {
            const inputType =
              field.blockType === 'email' ? 'email' : isPhone ? 'tel' : 'text';

            return (
              <Controller
                key={key}
                control={control}
                name={field.name}
                rules={{
                  required: isRequired ? t('required') : false,
                  validate: (raw) => {
                    const value = String(raw ?? '').trim();
                    if (!value) return true;
                    if (slot === 'name') {
                      if (value.length < MIN_NAME_LENGTH) {
                        return t('nameMin', { min: MIN_NAME_LENGTH });
                      }
                      if (value.length > MAX_NAME_LENGTH) {
                        return t('nameMax', { max: MAX_NAME_LENGTH });
                      }
                    }
                    if (isPhone) {
                      return isCompleteUaPhone(value) || t('phoneInvalid');
                    }
                    if (field.blockType === 'email' || slot === 'email') {
                      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value) || t('emailInvalid');
                    }
                    return true;
                  },
                }}
                render={({ field: f, fieldState: { error } }) => (
                  <Input
                    name={f.name}
                    ref={f.ref}
                    onBlur={f.onBlur}
                    value={f.value}
                    onChange={(e) => {
                      if (isPhone) {
                        f.onChange(formatUaPhoneMask(e.target.value));
                        return;
                      }
                      f.onChange(e.target.value);
                    }}
                    type={inputType}
                    inputMode={isPhone ? 'tel' : undefined}
                    autoComplete={
                      slot === 'name'
                        ? 'name'
                        : slot === 'phone'
                          ? 'tel'
                          : slot === 'email'
                            ? 'email'
                            : undefined
                    }
                    label={
                      <>
                        {isRequired ? '* ' : null}
                        {copy.label}
                      </>
                    }
                    placeholder={isPhone ? copy.placeholder || UA_PHONE_PLACEHOLDER : copy.placeholder}
                    error={error?.message}
                  />
                )}
              />
            );
          }

          return null;
        })}
      </div>

      {status ? (
        <p
          className={clsx(
            styles.status,
            status.kind === 'success' ? styles.statusSuccess : styles.statusError,
          )}
          role='status'
        >
          {status.text}
        </p>
      ) : null}

      <Button className={styles.submit} type='submit' disabled={isSubmitting}>
        {isSubmitting ? t('submitting') : form.submitButtonLabel?.trim() || t('submitFallback')}
      </Button>
    </form>
  );
}
