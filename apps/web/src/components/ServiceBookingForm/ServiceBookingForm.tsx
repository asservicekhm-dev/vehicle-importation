'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import * as Checkbox from '@radix-ui/react-checkbox';

import { sendForm } from '@/actions/sendForm';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Textarea } from '@/components/Textarea';
import { useGlobals } from '@/contexts/GlobalsContext';
import {
  estimateInspectionTotal,
  estimateTurnkeyFee,
  expertAddon,
  formatBudgetInput,
  formatMoney,
  inspectionAddonOptions,
  inspectionRangeOptions,
  parseBudgetInput,
} from '@/lib/booking/priceEstimate';
import { subscribeBookingServiceDeepLink } from '@/lib/booking/serviceDeepLink';
import {
  formatUaPhoneMask,
  isCompleteUaPhone,
  normalizeUaPhoneDigits,
  phoneDigits,
  UA_PHONE_PLACEHOLDER,
} from '@/lib/phoneMask';
import { prefersReducedMotion } from '@/lib/smoothScrollTo';
import type { Form } from '@autosearch/cms/payload-types';
import {
  type BookingServiceMode,
  budgetCurrencies,
  type BudgetCurrency,
  budgetCurrencyLabels,
  carBrands,
  carOrigins,
  carTypes,
  deliveryCities,
  isBookingServiceMode,
  localizeOptions,
} from '@autosearch/config';

import styles from './ServiceBookingForm.module.scss';

const MIN_NAME = 3;
const MAX_NAME = 50;
const MAX_MESSAGE = 500;

type FormValues = {
  service: BookingServiceMode;
  name: string;
  phone: string;
  message: string;
  budget: string;
  budgetCurrency: BudgetCurrency;
  origin: string;
  carType: string;
  carBrand: string;
  otherCity: boolean;
  deliveryCity: string;
  priceRange: string;
  addons: string[];
};

type Props = {
  form: Form;
  initialMode?: BookingServiceMode;
  /** Pitch: only service + name + phone; compact service control. */
  compact?: boolean;
  className?: string;
};

const modeMotion = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto' },
  exit: { opacity: 0, height: 0 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
};

const priceMotion = {
  initial: { opacity: 0, y: 12, height: 0 },
  animate: { opacity: 1, y: 0, height: 'auto' },
  exit: { opacity: 0, y: -6, height: 0 },
  transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] as const },
};

const priceValueMotion = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
};

function CheckIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox='0 0 12 12' fill='none' aria-hidden>
      <path
        d='M2.5 6.2 4.8 8.5 9.5 3.5'
        stroke='currentColor'
        strokeWidth='1.75'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

export function ServiceBookingForm({
  form,
  initialMode = 'consultation',
  compact = false,
  className,
}: Props) {
  const t = useTranslations('Form');
  const locale = useLocale() === 'en' ? 'en' : 'ua';
  const { priceList } = useGlobals();
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (status?.kind !== 'success') return;
    const node = successRef.current;
    if (!node) return;

    const scrollToSuccess = () => {
      const headerRaw = getComputedStyle(document.documentElement)
        .getPropertyValue('--header-offset')
        .trim();
      const headerPx = Number.parseFloat(headerRaw) || 96;
      const breathingRoom = 24;
      const top =
        window.scrollY + node.getBoundingClientRect().top - headerPx - breathingRoom;
      window.scrollTo({
        top: Math.max(0, top),
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
    };

    // Wait for the tall form to unmount and success layout to settle.
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(scrollToSuccess);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [status?.kind]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      service: initialMode,
      name: '',
      phone: '',
      message: '',
      budget: '',
      budgetCurrency: 'usd',
      origin: '',
      carType: '',
      carBrand: '',
      otherCity: false,
      deliveryCity: '',
      priceRange: '',
      addons: [],
    },
  });

  useEffect(() => {
    if (isBookingServiceMode(initialMode)) {
      setValue('service', initialMode);
    }
  }, [initialMode, setValue]);

  useEffect(() => {
    return subscribeBookingServiceDeepLink((mode) => {
      setValue('service', mode);
    });
  }, [setValue]);

  const service = watch('service');
  const budget = watch('budget');
  const budgetCurrency = watch('budgetCurrency');
  const otherCity = watch('otherCity');
  const priceRange = watch('priceRange');
  const addons = watch('addons');

  const serviceOptions = useMemo(
    () => [
      { value: 'consultation', label: t('modeConsultation') },
      { value: 'turnkey', label: t('modeTurnkey') },
      { value: 'inspection', label: t('modeInspection') },
      { value: 'expert', label: t('modeExpert') },
    ],
    [t],
  );

  const originOptions = useMemo(() => localizeOptions(carOrigins, locale), [locale]);
  const typeOptions = useMemo(() => localizeOptions(carTypes, locale), [locale]);
  const brandOptions = useMemo(() => localizeOptions(carBrands, locale), [locale]);
  const cityOptions = useMemo(() => localizeOptions(deliveryCities, locale), [locale]);

  const rangeOptions = useMemo(
    () =>
      inspectionRangeOptions(priceList).map((row) => ({
        value: row.id || row.label,
        label: `${row.label} — ${formatMoney(row.amount, row.currency, Boolean(row.from))}`,
      })),
    [priceList],
  );

  const addonOptions = useMemo(
    () =>
      inspectionAddonOptions(priceList).map((row) => ({
        value: row.id || row.label,
        label: `${row.label} — ${formatMoney(row.amount, row.currency, Boolean(row.from))}`,
      })),
    [priceList],
  );

  const turnkeyEstimate = useMemo(() => {
    if (service !== 'turnkey') return null;
    return estimateTurnkeyFee(priceList, parseBudgetInput(budget), budgetCurrency);
  }, [budget, budgetCurrency, priceList, service]);

  const inspectionLines = useMemo(() => {
    if (service !== 'inspection') return [];
    return estimateInspectionTotal(priceList, priceRange, addons);
  }, [addons, priceList, priceRange, service]);

  const expertPrice = useMemo(() => {
    if (service !== 'expert') return null;
    return expertAddon(priceList);
  }, [priceList, service]);

  const onSubmit = handleSubmit(async (data) => {
    setStatus(null);
    const formId = form.id;
    if (!formId) {
      setStatus({ kind: 'error', text: t('notConfigured') });
      return;
    }

    const rows: { field: string; value: string }[] = [
      { field: 'service', value: data.service },
      { field: 'type', value: data.service },
      { field: 'name', value: data.name.trim() },
      {
        field: 'phone',
        value: normalizeUaPhoneDigits(data.phone) || phoneDigits(data.phone),
      },
    ];

    if (!compact && data.message.trim()) {
      rows.push({ field: 'message', value: data.message.trim().slice(0, MAX_MESSAGE) });
    }

    if (!compact && data.service === 'turnkey') {
      if (data.budget.trim()) {
        rows.push({ field: 'budget', value: String(parseBudgetInput(data.budget)) });
        rows.push({ field: 'budgetCurrency', value: data.budgetCurrency });
      }
      if (data.origin) rows.push({ field: 'origin', value: data.origin });
      if (data.carType) rows.push({ field: 'carType', value: data.carType });
      if (data.carBrand) rows.push({ field: 'carBrand', value: data.carBrand });
      rows.push({ field: 'otherCity', value: data.otherCity ? 'true' : 'false' });
      if (data.otherCity && data.deliveryCity) {
        rows.push({ field: 'deliveryCity', value: data.deliveryCity });
      }
      if (turnkeyEstimate) {
        rows.push({
          field: 'expectedPrice',
          value: formatMoney(
            turnkeyEstimate.amount,
            turnkeyEstimate.currency,
            turnkeyEstimate.from,
          ),
        });
      }
    }

    if (!compact && data.service === 'inspection') {
      if (data.priceRange) rows.push({ field: 'priceRange', value: data.priceRange });
      if (data.addons.length) rows.push({ field: 'addons', value: data.addons.join(',') });
      if (inspectionLines.length) {
        rows.push({
          field: 'expectedPrice',
          value: inspectionLines
            .map((line) => formatMoney(line.amount, line.currency, line.from))
            .join(' + '),
        });
      }
    }

    if (!compact && data.service === 'expert' && expertPrice) {
      rows.push({
        field: 'expectedPrice',
        value: formatMoney(expertPrice.amount, expertPrice.currency, expertPrice.from),
      });
    }

    if (typeof window !== 'undefined' && window.location.href) {
      rows.push({ field: 'source', value: window.location.href });
    }

    const result = await sendForm({ form: formId, submissionData: rows });
    if (!result.ok) {
      setStatus({
        kind: 'error',
        text: result.message?.trim() || result.title || t('errorGeneric'),
      });
      return;
    }

    reset({
      service: data.service,
      name: '',
      phone: '',
      message: '',
      budget: '',
      budgetCurrency: 'usd',
      origin: '',
      carType: '',
      carBrand: '',
      otherCity: false,
      deliveryCity: '',
      priceRange: '',
      addons: [],
    });
    setStatus({
      kind: 'success',
      text: form.successMessage?.trim() || t('successFallback'),
    });
  });

  if (status?.kind === 'success') {
    return (
      <motion.div
        ref={successRef}
        className={styles.success}
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      >
        <motion.span
          className={styles.successIcon}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 420, damping: 16, delay: 0.05 }}
        >
          <CheckIcon />
        </motion.span>
        <h3 className={styles.successTitle}>{t('successTitle')}</h3>
        <p className={styles.successText}>{status.text}</p>
        <Button
          type='button'
          variant='outline'
          className={styles.successReset}
          onClick={() => setStatus(null)}
        >
          {t('successAgain')}
        </Button>
      </motion.div>
    );
  }

  return (
    <form
      className={[styles.root, compact ? styles.rootCompact : '', className].filter(Boolean).join(' ')}
      noValidate
      onSubmit={onSubmit}
    >
      <div className={styles.fields}>
        <Controller
          control={control}
          name='service'
          render={({ field }) => (
            <Select
              label={compact ? undefined : t('labelService')}
              options={serviceOptions}
              value={field.value}
              onChange={(value) => field.onChange(value as BookingServiceMode)}
              searchable={false}
              creatable={false}
              size={compact ? 'sm' : 'md'}
              placeholder={t('placeholderService')}
              className={compact ? styles.serviceCompact : undefined}
            />
          )}
        />

        <div className={compact ? styles.rowCompact : styles.row}>
          <Controller
            control={control}
            name='name'
            rules={{
              required: t('required'),
              validate: (raw) => {
                const value = String(raw ?? '').trim();
                if (value.length < MIN_NAME) return t('nameMin', { min: MIN_NAME });
                if (value.length > MAX_NAME) return t('nameMax', { max: MAX_NAME });
                return true;
              },
            }}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                label={`* ${t('labelName')}`}
                placeholder={t('placeholderName')}
                autoComplete='name'
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name='phone'
            rules={{
              required: t('required'),
              validate: (raw) => isCompleteUaPhone(String(raw ?? '')) || t('phoneInvalid'),
            }}
            render={({ field, fieldState }) => (
              <Input
                name={field.name}
                ref={field.ref}
                onBlur={field.onBlur}
                value={field.value}
                onChange={(e) => field.onChange(formatUaPhoneMask(e.target.value))}
                type='tel'
                inputMode='tel'
                autoComplete='tel'
                label={`* ${t('labelPhone')}`}
                placeholder={t('placeholderPhone') || UA_PHONE_PLACEHOLDER}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>

        {!compact ? (
          <>
            <AnimatePresence mode='wait' initial={false}>
          {service === 'turnkey' ? (
            <motion.div key='turnkey' className={styles.modeFields} {...modeMotion}>
              <div className={styles.budgetRow}>
                <Controller
                  control={control}
                  name='budget'
                  rules={{
                    validate: (raw) => {
                      if (!String(raw ?? '').trim()) return true;
                      const n = parseBudgetInput(String(raw));
                      return (Number.isFinite(n) && n > 0) || t('budgetInvalid');
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <Input
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={field.value}
                      onChange={(e) => field.onChange(formatBudgetInput(e.target.value))}
                      inputMode='numeric'
                      label={t('labelBudget')}
                      placeholder={t('placeholderBudget')}
                      error={fieldState.error?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name='budgetCurrency'
                  render={({ field }) => (
                    <div className={styles.currency} role='group' aria-label={t('labelCurrency')}>
                      {budgetCurrencies.map((code) => (
                        <button
                          key={code}
                          type='button'
                          className={styles.currencyBtn}
                          aria-pressed={field.value === code}
                          onClick={() => field.onChange(code)}
                        >
                          {budgetCurrencyLabels[code]}
                        </button>
                      ))}
                    </div>
                  )}
                />
              </div>

              <Controller
                control={control}
                name='origin'
                render={({ field }) => (
                  <Select
                    label={t('labelOrigin')}
                    options={originOptions}
                    value={field.value}
                    onChange={field.onChange}
                    searchable={false}
                    creatable={false}
                    placeholder={t('placeholderOrigin')}
                  />
                )}
              />

              <div className={styles.row}>
                <Controller
                  control={control}
                  name='carType'
                  render={({ field }) => (
                    <Select
                      label={t('labelCarType')}
                      options={typeOptions}
                      value={field.value}
                      onChange={field.onChange}
                      searchable
                      creatable
                      placeholder={t('placeholderCarType')}
                      searchPlaceholder={t('searchPlaceholder')}
                      createLabel={(q) => t('useCustom', { value: q })}
                      emptyLabel={t('emptyOptions')}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name='carBrand'
                  render={({ field }) => (
                    <Select
                      label={t('labelCarBrand')}
                      options={brandOptions}
                      value={field.value}
                      onChange={field.onChange}
                      searchable
                      creatable
                      placeholder={t('placeholderCarBrand')}
                      searchPlaceholder={t('searchPlaceholder')}
                      createLabel={(q) => t('useCustom', { value: q })}
                      emptyLabel={t('emptyOptions')}
                    />
                  )}
                />
              </div>

              <Controller
                control={control}
                name='otherCity'
                render={({ field }) => (
                  <label className={styles.checkbox}>
                    <Checkbox.Root
                      className={styles.checkboxBox}
                      checked={field.value}
                      onCheckedChange={(state) => field.onChange(state === true)}
                    >
                      <Checkbox.Indicator className={styles.checkboxIndicator}>
                        <CheckIcon size={12} />
                      </Checkbox.Indicator>
                    </Checkbox.Root>
                    <span className={styles.checkboxLabel}>{t('labelOtherCity')}</span>
                  </label>
                )}
              />

              <AnimatePresence initial={false}>
                {otherCity ? (
                  <motion.div key='city' {...modeMotion}>
                    <Controller
                      control={control}
                      name='deliveryCity'
                      rules={{
                        validate: (raw) =>
                          !otherCity || Boolean(String(raw ?? '').trim()) || t('required'),
                      }}
                      render={({ field, fieldState }) => (
                        <Select
                          label={t('labelDeliveryCity')}
                          options={cityOptions}
                          value={field.value}
                          onChange={field.onChange}
                          searchable
                          creatable
                          placeholder={t('placeholderDeliveryCity')}
                          searchPlaceholder={t('searchPlaceholder')}
                          createLabel={(q) => t('useCustom', { value: q })}
                          emptyLabel={t('emptyOptions')}
                          error={fieldState.error?.message}
                        />
                      )}
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <AnimatePresence initial={false}>
                {turnkeyEstimate ? (
                  <motion.div key='turnkey-price' className={styles.price} {...priceMotion}>
                    <p className={styles.priceTitle}>{t('expectedPrice')}</p>
                    <div className={styles.priceValueSwap}>
                      <AnimatePresence mode='wait' initial={false}>
                        <motion.p
                          key={`${turnkeyEstimate.amount}-${turnkeyEstimate.currency}-${turnkeyEstimate.from}`}
                          className={styles.priceValue}
                          {...priceValueMotion}
                        >
                          {formatMoney(
                            turnkeyEstimate.amount,
                            turnkeyEstimate.currency,
                            turnkeyEstimate.from,
                          )}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          ) : null}

          {service === 'inspection' ? (
            <motion.div key='inspection' className={styles.modeFields} {...modeMotion}>
              <Controller
                control={control}
                name='priceRange'
                render={({ field }) => (
                  <Select
                    label={t('labelPriceRange')}
                    options={rangeOptions}
                    value={field.value}
                    onChange={field.onChange}
                    searchable={false}
                    creatable={false}
                    placeholder={t('placeholderPriceRange')}
                  />
                )}
              />
              <Controller
                control={control}
                name='addons'
                render={({ field }) => (
                  <Select
                    multiple
                    label={t('labelAddons')}
                    options={addonOptions}
                    value={field.value}
                    onChange={field.onChange}
                    searchable={false}
                    creatable={false}
                    placeholder={t('placeholderAddons')}
                    removeChipLabel={(label) => t('removeChip', { label })}
                  />
                )}
              />
              <AnimatePresence initial={false}>
                {inspectionLines.length ? (
                  <motion.div key='inspection-price' className={styles.price} {...priceMotion}>
                    <p className={styles.priceTitle}>{t('expectedPrice')}</p>
                    <ul className={styles.priceLines}>
                      {inspectionLines.map((line) => (
                        <li key={`${line.label}-${line.amount}`} className={styles.priceLine}>
                          <span>{line.label}</span>
                          <span>{formatMoney(line.amount, line.currency, line.from)}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          ) : null}

          {service === 'expert' && expertPrice ? (
            <motion.div key='expert' className={styles.modeFields} {...modeMotion}>
              <div className={styles.price}>
                <p className={styles.priceTitle}>{t('expectedPrice')}</p>
                <p className={styles.priceValue}>
                  {formatMoney(expertPrice.amount, expertPrice.currency, expertPrice.from)}
                </p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <Controller
          control={control}
          name='message'
          rules={{
            validate: (raw) =>
              String(raw ?? '').length <= MAX_MESSAGE || t('messageMax', { max: MAX_MESSAGE }),
          }}
          render={({ field, fieldState }) => (
            <Textarea
              {...field}
              label={t('labelMessage')}
              placeholder={t('placeholderMessage')}
              rows={service === 'consultation' || service === 'expert' ? 4 : 3}
              error={fieldState.error?.message}
            />
          )}
        />
          </>
        ) : null}
      </div>

      {status?.kind === 'error' ? (
        <p className={`${styles.status} ${styles.statusError}`} role='status'>
          {status.text}
        </p>
      ) : null}

      <Button className={styles.submit} type='submit' disabled={isSubmitting}>
        {isSubmitting ? t('submitting') : form.submitButtonLabel?.trim() || t('submitFallback')}
      </Button>
    </form>
  );
}
