'use client';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';

import type { DesignSeedContent, OriginId } from '../content';

import styles from './Hero.module.scss';

type Props = {
  content: DesignSeedContent['hero'];
  origin: OriginId;
  onOriginChange: (id: OriginId) => void;
};

export function Hero({ content, origin, onOriginChange }: Props) {
  const active = content.origins.find((item) => item.id === origin) ?? content.origins[0];

  return (
    <section className={styles.section} id='hero'>
      <Container>
        <div className={styles.frame}>
          <div className={styles.photo} aria-hidden />
          <div className={styles.content}>
            <h1 className={styles.title}>{content.title}</h1>
            <p className={styles.subtitle}>{content.subtitle}</p>
            <div className={styles.actions}>
              <Button asChild>
                <a href='#callback'>{content.primaryCta}</a>
              </Button>
              <Button asChild variant='outline' className={styles.secondaryCta}>
                <a href='#route'>{content.secondaryCta}</a>
              </Button>
            </div>
          </div>
          <div className={styles.originPanel}>
            <div className={styles.switcher} role='group' aria-label='Origin'>
              {content.origins.map((item) => (
                <button
                  key={item.id}
                  type='button'
                  className={styles.originBtn}
                  aria-pressed={item.id === active.id}
                  onClick={() => onOriginChange(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className={styles.meta}>
              <span className={styles.metaTerm}>{active.term}</span>
              <span>{active.check}</span>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
