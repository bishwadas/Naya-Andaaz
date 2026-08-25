import React from 'react';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { Block, sanitizeHtml } from '@/lib/blocks';
import {
  getCategories,
  getPostBySlug,
  getPosts,
  getTags,
  getPageBySlug,
  getSettings,
  getPrimaryMenuItems,
  incrementPostViews,
  getMostSearchedTerms
} from '@/db/repository';
import { filterPostsForCategoryTree } from '@/lib/categories';
import { DEFAULT_SITE_SETTINGS, INITIAL_CATEGORIES, INITIAL_TAGS } from '@/lib/constants';
import { INITIAL_POSTS } from '@/lib/mockData';
import { Category, Post, SiteSettings, Tag as TagType } from '@/types';
import { Tag } from 'lucide-react';
import ParentCategoryView from '@/components/public/ParentCategoryView';
import SubCategoryArchiveView from '@/components/public/SubCategoryArchiveView';
import { TagArchiveView } from '@/components/public/TagArchiveView';
import { MoreForYou } from '@/components/public/MoreForYou';
import { ArticleView } from '@/components/public/ArticleView';

export const dynamic = 'force-dynamic';

const RESERVED_ROUTES = [
  'admin',
  'api',
  'sitemap',
  'sitemap.xml',
  'robots.txt',
  'ads.txt',
  'page',
  'privacy-policy',
  'login',
  'register',
  'sign-in',
  'sign-up',
  'forgot-password',
  'reset-password',
  'verify-email',
  'search',
  'category',
  'article',
  'tags',
  'author',
  'editor',
  'subscribers',
  'profile',
  'account',
];

export default async function CleanUrlResolverPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: segments } = await params;
  const cleanSegments = segments.map((segment) => segment.toLowerCase().trim());
  const cleanSlug = cleanSegments[0];

  // The catch-all route supports both the existing one-segment URLs and the
  // canonical two-segment parent/subcategory archive URLs.
  if (cleanSegments.length > 2 || !cleanSlug) {
    notFound();
  }

  if (RESERVED_ROUTES.includes(cleanSlug)) {
    notFound();
  }

  // 1. Check if it's an Article (Post)
  let post: any = null;
  if (cleanSegments.length === 1) {
    try {
      post = await getPostBySlug(segments[0]);
    } catch {
      post = null;
    }
  }

  if (post) {
    incrementPostViews(segments[0]).catch(() => {});
    const [categories, settings, recentPosts, primaryMenuItems] = await Promise.all([
      getCategories().catch(() => INITIAL_CATEGORIES),
      getSettings().then((s) => (s ? (s as unknown as SiteSettings) : DEFAULT_SITE_SETTINGS)).catch(() => DEFAULT_SITE_SETTINGS),
      getPosts({ status: 'published', limit: 12 }).catch(() => INITIAL_POSTS.slice(0, 12)),
      getPrimaryMenuItems().catch(() => []),
    ]);
    const otherPosts = Array.from(
      new Map(recentPosts.filter((p) => p.id !== post.id && p.slug !== post.slug).map((p) => [p.id, p])).values()
    ).slice(0, 4);

    return (
      <ArticleView
        post={post}
        recommendations={otherPosts}
        settings={settings}
        categories={categories}
        primaryMenuItems={primaryMenuItems}
      />
    );
  }

  // 2. Check if it's a Category or Sub-category
  const [categories, settings, allPosts, primaryMenuItems, tagsList, mostSearchedTerms] = await Promise.all([
    getCategories().catch(() => INITIAL_CATEGORIES),
    getSettings().then((s) => (s ? (s as unknown as SiteSettings) : DEFAULT_SITE_SETTINGS)).catch(() => DEFAULT_SITE_SETTINGS),
    getPosts({ status: 'published', limit: 250 }).catch(() => INITIAL_POSTS),
    getPrimaryMenuItems().catch(() => []),
    getTags().catch(() => INITIAL_TAGS),
    getMostSearchedTerms().catch(() => []),
  ]);

  // Canonical nested subcategory archive: /{parent-slug}/{subcategory-slug}.
  if (cleanSegments.length === 2) {
    const parentCategory = categories.find(
      (category) => !category.parentId && category.slug.toLowerCase().trim() === cleanSegments[0]
    );
    const currentCategory = categories.find(
      (category) => category.parentId === parentCategory?.id && category.slug.toLowerCase().trim() === cleanSegments[1]
    );

    if (!parentCategory || !currentCategory) notFound();

    return (
      <SubCategoryArchiveView
        currentCategory={currentCategory}
        parentCategory={parentCategory}
        categoryPosts={filterPostsForCategoryTree(currentCategory, categories, allPosts)}
        categories={categories}
        settings={settings}
        primaryMenuItems={primaryMenuItems}
        initialMostSearchedTerms={mostSearchedTerms}
      />
    );
  }

  const currentCategory = categories.find(
    (category) => category.slug.trim().toLowerCase() === cleanSlug
  );

  if (currentCategory) {
    const childCategories = categories.filter((c) => c.parentId === currentCategory?.id);
    const isParent = !currentCategory.parentId || childCategories.length > 0;
    const parentCat = currentCategory.parentId
      ? categories.find((c) => c.id === currentCategory?.parentId)
      : undefined;

    // Subcategories now live below their parent category. Preserve old
    // one-segment URLs as permanent redirects, without changing parent URLs.
    if (currentCategory.parentId && parentCat) {
      permanentRedirect(`/${parentCat.slug}/${currentCategory.slug}`);
    }

    // Filter posts for current category AND all descendant categories in its tree
    const categoryPosts = filterPostsForCategoryTree(currentCategory, categories, allPosts);

    if (isParent) {
      return (
        <ParentCategoryView
          currentCategory={currentCategory}
          childCategories={childCategories}
          categoryPosts={categoryPosts}
          categories={categories}
          settings={settings}
          primaryMenuItems={primaryMenuItems}
        />
      );
    } else {
      return (
        <SubCategoryArchiveView
          currentCategory={currentCategory}
          parentCategory={parentCat}
          categoryPosts={categoryPosts}
          categories={categories}
          settings={settings}
          primaryMenuItems={primaryMenuItems}
          initialMostSearchedTerms={mostSearchedTerms}
        />
      );
    }
  }

  // 3. Check if it's a Tag -> Redirect permanently to /tags/{slug}
  const matchedTag = tagsList.find((t) => t.slug.toLowerCase() === cleanSlug);
  if (matchedTag) {
    permanentRedirect(`/tags/${matchedTag.slug}`);
  }

  // 4. Check if it's a dynamic Page -> Redirect to /page/{slug} or /privacy-policy
  if (cleanSlug === 'privacy-policy') {
    permanentRedirect('/privacy-policy');
  }
  const matchedPage = await getPageBySlug(cleanSlug).catch(() => null);
  if (matchedPage) {
    permanentRedirect(`/page/${matchedPage.slug}`);
  }

  notFound();
}

