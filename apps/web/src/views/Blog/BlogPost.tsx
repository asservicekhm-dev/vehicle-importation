import { AnimatedContent } from '@/components/AnimatedContent';
import { CMSMedia } from '@/components/CMSMedia';
import { Container } from '@/components/Container';
import { RichText } from '@/components/RichText';
import { Link } from '@/i18n/navigation';
import type { Blog } from '@autosearch/cms/payload-types';

import styles from './Blog.module.scss';

type Props = {
  post: Blog;
  backLabel: string;
};

export function BlogPost({ post, backLabel }: Props) {
  const author =
    post.author && typeof post.author === 'object' && 'name' in post.author
      ? post.author.name
      : null;
  const hasImage = Boolean(post.thumbnail && typeof post.thumbnail !== 'string');
  const body = <RichText data={post.body} className={styles.content} />;

  return (
    <article className={styles.post}>
      <Container>
        <AnimatedContent distance={72} duration={0.9}>
          <Link className={styles.back} href='/blog'>
            {backLabel}
          </Link>
        </AnimatedContent>
        {hasImage ? (
          <div className={styles.postMedia}>
            <CMSMedia
              media={post.thumbnail}
              className={styles.postImg}
              fill
              sizes='(min-width: 1200px) 720px, 100vw'
              priority
            />
          </div>
        ) : null}
        <AnimatedContent distance={72} duration={0.9}>
          <h1 className={styles.postTitle}>{post.title}</h1>
          {author ? <p className={styles.meta}>{author}</p> : null}
          {body ??
            (post.excerpt?.trim() ? (
              <div className={styles.content}>
                <p>{post.excerpt.trim()}</p>
              </div>
            ) : null)}
        </AnimatedContent>
      </Container>
    </article>
  );
}
