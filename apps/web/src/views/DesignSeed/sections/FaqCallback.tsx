'use client';

import { Accordion } from '@/components/Accordion';
import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';

import type { DesignSeedContent } from '../content';

import styles from './FaqCallback.module.scss';

type Props = {
  faq: DesignSeedContent['faq'];
  callback: DesignSeedContent['callback'];
};

export function FaqCallback({ faq, callback }: Props) {
  return (
    <section className={styles.section} id='callback'>
      <Container>
        <div className={styles.layout}>
          <div>
            <h2 className={styles.heading}>{faq.title}</h2>
            <Accordion
              items={faq.items.map((item, index) => ({
                value: `faq-${index}`,
                title: item.question,
                content: <p>{item.answer}</p>,
              }))}
            />
          </div>
          <aside className={styles.formPanel} aria-labelledby='callback-title'>
            <h2 className={styles.formTitle} id='callback-title'>
              {callback.title}
            </h2>
            <p className={styles.formBody}>{callback.body}</p>
            <form
              className={styles.fields}
              onSubmit={(event) => {
                event.preventDefault();
              }}
            >
              <Input
                name='name'
                label={callback.nameLabel}
                placeholder={callback.namePlaceholder}
                autoComplete='name'
              />
              <Input
                name='phone'
                type='tel'
                label={callback.phoneLabel}
                placeholder={callback.phonePlaceholder}
                autoComplete='tel'
              />
              <Textarea
                name='message'
                label={callback.messageLabel}
                placeholder={callback.messagePlaceholder}
                rows={4}
              />
              <Button type='submit'>{callback.submit}</Button>
            </form>
            <p className={styles.note}>{callback.note}</p>
          </aside>
        </div>
      </Container>
    </section>
  );
}
