import { CMSMedia } from '@/components/CMSMedia';
import { Container } from '@/components/Container';
import type { CarBrandsBlockFields } from '@autosearch/cms/payload-types';

import styles from './CarBrands.module.scss';

type Props = CarBrandsBlockFields;

export function CarBrands({ id, blockName, eyebrow, title, titleAccent, rows }: Props) {
  const heading = title?.trim();
  const accent = titleAccent?.trim();
  const logoRows = rows?.filter((row) => row?.logos?.some((logo) => logo?.logo)) ?? [];

  if (!heading && !logoRows.length) return null;

  const sectionId = (blockName || id || 'brands').toString();

  return (
    <section className={styles.section} id={sectionId}>
      <Container>
        {eyebrow?.trim() ? <p className={styles.eyebrow}>{eyebrow.trim()}</p> : null}
        {heading || accent ? (
          <h2 className={styles.heading}>
            {heading ? <span>{heading} </span> : null}
            {accent ? <span className={styles.accent}>{accent}</span> : null}
          </h2>
        ) : null}
        {logoRows.map((row, rowIndex) => (
          <ul key={row.id ?? rowIndex} className={styles.row}>
            {row.logos
              ?.filter((item) => item?.logo && typeof item.logo === 'object')
              .map((item, logoIndex) => (
                <li key={item.id ?? logoIndex}>
                  <CMSMedia media={item.logo} className={styles.logo} sizes='120px' />
                </li>
              ))}
          </ul>
        ))}
      </Container>
    </section>
  );
}
