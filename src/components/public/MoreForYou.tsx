import Link from 'next/link';
import { Post } from '@/types';

type MoreForYouProps = {
  posts: Post[];
  variant?: 'sidebar' | 'inline';
};

export function MoreForYou({ posts, variant = 'sidebar' }: MoreForYouProps) {
  if (posts.length === 0) return null;

  return (
    <section className={`more-for-you more-for-you--${variant}`} aria-labelledby={`${variant}-more-for-you-title`}>
      <h2 id={`${variant}-more-for-you-title`} className="more-for-you__title">More for You</h2>
      <div className="more-for-you__list">
        {posts.map((post) => (
          <Link key={post.id} href={`/${post.subCategory?.slug || 'uncategorized'}/${post.slug}`} className="more-for-you__item">
            <img
              src={post.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80'}
              alt=""
              className="more-for-you__image"
            />
            <div className="more-for-you__copy">
              <span className="more-for-you__category">{post.category?.name || 'Lifestyle'}</span>
              <h3>{post.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}