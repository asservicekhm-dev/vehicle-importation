'use client';

import { Container } from '@/components/Container';
import { LazyMount } from '@/components/LazyMount';
import type { TurnkeyRouteBlockFields } from '@autosearch/cms/payload-types';

import styles from './TurnkeyRoute.module.scss';

type Props = TurnkeyRouteBlockFields;

const loadTurnkeyRoute = () => import('./TurnkeyRoute').then((m) => m.TurnkeyRoute);

function TurnkeyRouteShell({ id, blockName, eyebrow, title, steps }: Props) {
  const heading = title?.trim() ?? '';
  const list = steps?.filter((step) => step?.title?.trim()) ?? [];
  const sectionId = (blockName || id || 'route').toString();

  if (!heading && !list.length) return null;

  return (
    <section className={styles.section} id={sectionId} data-ac-shell aria-busy>
      <Container>
        {eyebrow?.trim() ? <p className={styles.eyebrow}>{eyebrow.trim()}</p> : null}
        {heading ? <h2 className={styles.heading}>{heading}</h2> : null}
        {list.length ? (
          <ol className={styles.shellTrack}>
            {list.map((step, index) => (
              <li key={step.id ?? index} className={styles.shellStep}>
                <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span>
                <h3 className={styles.title}>{step.title}</h3>
              </li>
            ))}
          </ol>
        ) : null}
      </Container>
    </section>
  );
}

export function TurnkeyRouteDeferred(props: Props) {
  return (
    <LazyMount load={loadTurnkeyRoute} props={props} shell={<TurnkeyRouteShell {...props} />} />
  );
}
