import { forwardRef, type ReactNode, type TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';

import styles from './Textarea.module.scss';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: ReactNode;
  error?: ReactNode;
};

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea(
  { label, error, className, id, ...props },
  ref,
) {
  const textareaId = id ?? props.name;

  return (
    <label className={styles.field} htmlFor={textareaId}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <textarea ref={ref} id={textareaId} className={clsx(styles.textarea, className)} {...props} />
      {error ? <p className={styles.error}>{error}</p> : null}
    </label>
  );
});
