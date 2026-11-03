'use client';

import type { ReactNode } from 'react';
import * as Checkbox from '@radix-ui/react-checkbox';

import styles from './CheckboxGroup.module.scss';

export type CheckboxOption = {
  value: string;
  label: ReactNode;
};

type Props = {
  legend?: ReactNode;
  options: CheckboxOption[];
  value?: string[];
  onChange?: (value: string[]) => void;
  name?: string;
};

export function CheckboxGroup({ legend, options, value = [], onChange, name }: Props) {
  const toggle = (optionValue: string, checked: boolean) => {
    if (!onChange) return;

    if (checked) {
      onChange([...value, optionValue]);
      return;
    }

    onChange(value.filter((item) => item !== optionValue));
  };

  return (
    <fieldset className={styles.root}>
      {legend ? <legend className={styles.legend}>{legend}</legend> : null}
      <div className={styles.list} role='group'>
        {options.map((option) => {
          const checked = value.includes(option.value);

          return (
            <label key={option.value} className={styles.item}>
              <Checkbox.Root
                className={styles.checkbox}
                checked={checked}
                name={name}
                value={option.value}
                onCheckedChange={(state) => toggle(option.value, state === true)}
              >
                <Checkbox.Indicator className={styles.indicator} />
              </Checkbox.Root>
              <span className={styles.label}>{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
