import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { Input } from '@/components/Input';

import type { DesignSeedContent } from '../content';

import styles from './SystemSheet.module.scss';

type Props = {
  content: DesignSeedContent['system'];
};

const SWATCHES = [
  { name: 'bg', varName: '--color-bg' },
  { name: 'surface-1', varName: '--color-surface-1' },
  { name: 'surface-2', varName: '--color-surface-2' },
  { name: 'brand', varName: '--color-surface-brand' },
  { name: 'primary', varName: '--color-primary' },
  { name: 'accent', varName: '--color-accent' },
  { name: 'text', varName: '--color-text' },
  { name: 'muted', varName: '--color-text-muted' },
] as const;

const TYPE_SAMPLES = [
  { label: 'display', size: 'var(--text-display)' },
  { label: '4xl', size: 'var(--text-4xl)' },
  { label: '3xl', size: 'var(--text-3xl)' },
  { label: '2xl', size: 'var(--text-2xl)' },
  { label: 'xl', size: 'var(--text-xl)' },
] as const;

export function SystemSheet({ content }: Props) {
  return (
    <section className={styles.section} id='system'>
      <Container>
        <h2 className={styles.heading}>{content.title}</h2>

        <div className={styles.block}>
          <p className={styles.blockTitle}>{content.swatches}</p>
          <ul className={styles.swatches}>
            {SWATCHES.map((swatch) => (
              <li key={swatch.name} className={styles.swatch}>
                <div
                  className={styles.chip}
                  style={{ backgroundColor: `var(${swatch.varName})` }}
                />
                <span className={styles.blockTitle}>{swatch.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.block}>
          <p className={styles.blockTitle}>{content.type}</p>
          <div className={styles.typeScale}>
            {TYPE_SAMPLES.map((sample) => (
              <p key={sample.label} className={styles.typeItem} style={{ fontSize: sample.size }}>
                {sample.label} — AS Autosearch
              </p>
            ))}
          </div>
        </div>

        <div className={styles.block}>
          <p className={styles.blockTitle}>{content.controls}</p>
          <div className={styles.controls}>
            <Button type='button'>Primary</Button>
            <Button type='button' variant='outline'>
              Outline
            </Button>
            <Button type='button' variant='ghost'>
              Ghost
            </Button>
          </div>
          <div className={styles.fieldRow}>
            <Input name='system-demo' label='Input' placeholder='Placeholder' />
          </div>
        </div>
      </Container>
    </section>
  );
}
