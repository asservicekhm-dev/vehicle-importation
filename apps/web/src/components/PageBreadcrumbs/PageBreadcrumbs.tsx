'use client';

import { useTranslations } from 'next-intl';

import { Container } from '@/components/Container';
import { Link } from '@/i18n/navigation';
import type { PageBreadcrumbsBlockFields } from '@autosearch/cms/payload-types';

import styles from './PageBreadcrumbs.module.scss';

type Props = PageBreadcrumbsBlockFields;

export function PageBreadcrumbs({ id, blockName, currentLabel, ancestors }: Props) {
  const t = useTranslations('common');
  const current = currentLabel?.trim();
  if (!current) return null;

  const sectionId = (blockName || id || 'breadcrumbs').toString();
  const crumbs = ancestors?.filter((item) => item?.label?.trim() && item?.url?.trim()) ?? [];

  return (
    <nav className={styles.section} id={sectionId} aria-label='Breadcrumb'>
      <Container>
        <ol className={styles.list}>
          <li>
            <Link className={styles.link} href='/'>
              {t('home')}
            </Link>
          </li>
          {crumbs.map((item, index) => (
            <li key={item.id ?? index}>
              <span className={styles.sep} aria-hidden>
                /
              </span>{' '}
              <Link className={styles.link} href={item.url!}>
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <span className={styles.sep} aria-hidden>
              /
            </span>{' '}
            <span className={styles.current}>{current}</span>
          </li>
        </ol>
      </Container>
    </nav>
  );
}
