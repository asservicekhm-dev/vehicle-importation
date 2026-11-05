import { AnimatedContent } from '@/components/AnimatedContent';
import { CMSMedia } from '@/components/CMSMedia';
import { Container } from '@/components/Container';
import { Link } from '@/i18n/navigation';
import type { Blog, Page } from '@autosearch/cms/payload-types';

import styles from './Blog.module.scss';

type Props = {
  page: Page;
  posts: Blog[];
  readMoreLabel: string;
  emptyLabel: string;
};

export function BlogList({ page, posts, readMoreLabel, emptyLabel }: Props) {
  const title = page.title?.trim() || 'Blog';

  return (
    <section className={styles.section}>
      <Container>
        <AnimatedContent distance={88} duration={0.95} stagger={0.08}>
          <header className={styles.header}>
            <h1 className={styles.title}>{title}</h1>
          </header>

          {posts.length === 0 ? (
            <p className={styles.empty}>{emptyLabel}</p>
          ) : (
            <ul className={styles.grid}>
              {posts.map((post) => {
                const hasImage = Boolean(post.thumbnail && typeof post.thumbnail !== 'string');
                const href = post.slug ? `/blog/${post.slug}` : null;

                const content = (
                  <>
                    {hasImage ? (
                      <div className={styles.media}>
                        <CMSMedia
                          media={post.thumbnail}
                          className={styles.img}
                          fill
                          sizes='(min-width: 1200px) 30vw, (min-width: 768px) 45vw, 100vw'
                        />
                      </div>
                    ) : null}
                    <div className={styles.body}>
                      <h2 className={styles.cardTitle}>{post.title}</h2>
                      {post.excerpt?.trim() ? (
                        <p className={styles.excerpt}>{post.excerpt.trim()}</p>
                      ) : null}
                      {href ? <span className={styles.link}>{readMoreLabel}</span> : null}
                    </div>
                  </>
                );

                return (
                  <li key={post.id}>
                    <article className={styles.card}>
                      {href ? (
                        <Link className={styles.cardLink} href={href}>
                          {content}
                        </Link>
                      ) : (
                        content
                      )}
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </AnimatedContent>
      </Container>
    </section>
  );
}
