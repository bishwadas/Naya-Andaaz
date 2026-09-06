import React from 'react';
import type { Metadata } from 'next';
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
import {
  resolveSiteUrl,
  resolveSiteName,
  resolveSiteDescription,
  resolveSiteTitle,
} from '@/lib/seo';
import { formatCanonicalUrl, cleanImageUrl } from '@/lib/sitemap-utils';
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug: segments } = await params;
  const cleanSegments = segments.map((segment) => segment.toLowerCase().trim());
  const cleanSlug = cleanSegments[0];

  if (!cleanSlug || cleanSegments.length > 2 || RESERVED_ROUTES.includes(cleanSlug)) {
    return {};
  }

  const [settings, categories] = await Promise.all([
    getSettings()
      .then((s) => (s ? (s as unknown as SiteSettings) : DEFAULT_SITE_SETTINGS))
      .catch(() => DEFAULT_SITE_SETTINGS),
    getCategories().catch(() => INITIAL_CATEGORIES),
  ]);

  const siteName = resolveSiteName(settings);
  const baseUrl = resolveSiteUrl(settings);

  // 1. Check if it's an Article (Post)
  let post: any = null;
  if (cleanSegments.length === 1) {
    post = await getPostBySlug(segments[0]).catch(() => null);
  } else if (cleanSegments.length === 2) {
    post = await getPostBySlug(segments[1]).catch(() => null);
  }

  if (post) {
    const subCatSlug = post.subCategory?.slug || post.category?.slug || 'uncategorized';
    const canonicalUrl = formatCanonicalUrl(`/${subCatSlug}/${post.slug}`, baseUrl);
    const title = post.seoTitle || post.title;
    const fallbackDesc = resolveSiteDescription(settings);
    const description = (post.metaDescription && post.metaDescription.trim())
      ? post.metaDescription.trim()
      : (post.excerpt && post.excerpt.trim())
      ? post.excerpt.trim()
      : fallbackDesc;
    const ogImage = cleanImageUrl(post.featuredImage, baseUrl) || settings.defaultOgImage;

    return {
      title,
      description,
      openGraph: {
        type: 'article',
        siteName,
        title,
        description,
        url: canonicalUrl,
        publishedTime: post.publishedAt || post.createdAt,
        modifiedTime: post.publishedAt || post.createdAt,
        authors: post.author?.name ? [post.author.name] : undefined,
        section: post.category?.name || post.subCategory?.name || undefined,
        images: ogImage ? [{ url: ogImage, alt: post.title }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ogImage ? [ogImage] : undefined,
      },
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  // 2. Subcategory Archive (2 segments)
  if (cleanSegments.length === 2) {
    const parentCategory = categories.find((category) => {
      if (category.parentId) return false;
      const s = category.slug.toLowerCase().trim();
      if (cleanSegments[0] === 'food' || cleanSegments[0] === 'food-wine') {
        return (
          s === 'food' ||
          s === 'food-wine' ||
          category.id === 'cat_food' ||
          (category.name.toLowerCase().includes('food') && !category.parentId)
        );
      }
      return s === cleanSegments[0];
    });
    const currentCategory = categories.find(
      (category) => category.parentId === parentCategory?.id && category.slug.toLowerCase().trim() === cleanSegments[1]
    );

    if (currentCategory && parentCategory) {
      const parentSlug =
        parentCategory.slug === 'food' ||
        parentCategory.slug === 'food-wine' ||
        parentCategory.id === 'cat_food' ||
        cleanSegments[0] === 'food' ||
        cleanSegments[0] === 'food-wine'
          ? 'food-wine'
          : parentCategory.slug;
      const canonicalUrl = formatCanonicalUrl(`/${parentSlug}/${currentCategory.slug}`, baseUrl);
      
      // Strict Title Priority:
      // 1. Specific category SEO title (absolute to prevent unwanted double brand suffixes)
      // 2. Contextual generated title
      // 3. Global default title
      const contextualTitle = `${currentCategory.name} — ${parentCategory.name}`;
      const title = currentCategory.seoTitle?.trim()
        ? { absolute: currentCategory.seoTitle.trim() }
        : contextualTitle;
      const displayTitle = currentCategory.seoTitle?.trim() || `${contextualTitle} | ${siteName}`;

      // Strict Description Priority:
      // 1. Page/category-specific SEO description
      // 2. Category description
      // 3. Automatically generated contextual description
      // 4. Global default meta description as final fallback
      const contextualDesc = `Explore the latest stories, news, and updates in ${currentCategory.name} under ${parentCategory.name} on ${siteName}.`;
      const fallbackDesc = resolveSiteDescription(settings);
      const description =
        currentCategory.metaDescription?.trim() ||
        currentCategory.description?.trim() ||
        contextualDesc ||
        fallbackDesc;

      return {
        title,
        description,
        openGraph: {
          type: 'website',
          siteName,
          title: displayTitle,
          description,
          url: canonicalUrl,
        },
        twitter: {
          card: 'summary_large_image',
          title: displayTitle,
          description,
        },
        alternates: {
          canonical: canonicalUrl,
        },
      };
    }
  }

  // 3. Category Archive (1 segment)
  const currentCategory = categories.find((category) => {
    const s = category.slug.trim().toLowerCase();
    if (cleanSlug === 'food' || cleanSlug === 'food-wine') {
      return (
        s === 'food' ||
        s === 'food-wine' ||
        category.id === 'cat_food' ||
        (category.name.toLowerCase().includes('food') && !category.parentId)
      );
    }
    return s === cleanSlug;
  });
  if (currentCategory) {
    // If it's a subcategory requested with 1 segment, point canonical to its canonical parent path
    const parentCategory = currentCategory.parentId
      ? categories.find((c) => c.id === currentCategory.parentId)
      : undefined;

    const isFoodParent =
      !currentCategory.parentId &&
      (currentCategory.slug === 'food' || currentCategory.slug === 'food-wine' || currentCategory.id === 'cat_food' || cleanSlug === 'food' || cleanSlug === 'food-wine');
    const categorySlug = isFoodParent ? 'food-wine' : currentCategory.slug;
    const parentSlug =
      parentCategory && (parentCategory.slug === 'food' || parentCategory.slug === 'food-wine' || parentCategory.id === 'cat_food')
        ? 'food-wine'
        : parentCategory?.slug;

    const canonicalPath = parentCategory
      ? `/${parentSlug}/${currentCategory.slug}`
      : `/${categorySlug}`;
    const canonicalUrl = formatCanonicalUrl(canonicalPath, baseUrl);

    // Strict Title Priority:
    // 1. Specific category SEO title
    // 2. Contextual generated title
    // 3. Global default title
    const contextualTitle = parentCategory
      ? `${currentCategory.name} — ${parentCategory.name}`
      : currentCategory.name;
    const title = currentCategory.seoTitle?.trim()
      ? { absolute: currentCategory.seoTitle.trim() }
      : contextualTitle;
    const displayTitle = currentCategory.seoTitle?.trim() || `${contextualTitle} | ${siteName}`;

    // Strict Description Priority:
    // 1. Page/category-specific SEO description
    // 2. Category description
    // 3. Automatically generated contextual description
    // 4. Global default meta description as final fallback
    const contextualDesc = parentCategory
      ? `Explore the latest stories, news, and updates in ${currentCategory.name} under ${parentCategory.name} on ${siteName}.`
      : `Explore the latest ${currentCategory.name} news, stories, trends, and features on ${siteName}.`;
    const fallbackDesc = resolveSiteDescription(settings);
    const description =
      currentCategory.metaDescription?.trim() ||
      currentCategory.description?.trim() ||
      contextualDesc ||
      fallbackDesc;

    return {
      title,
      description,
      openGraph: {
        type: 'website',
        siteName,
        title: displayTitle,
        description,
        url: canonicalUrl,
      },
      twitter: {
        card: 'summary_large_image',
        title: displayTitle,
        description,
      },
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  return {};
}

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

  // Handle legacy /food URLs by permanently redirecting to canonical /food-wine
  if (cleanSegments[0] === 'food') {
    if (cleanSegments.length === 1) {
      permanentRedirect('/food-wine');
    } else if (cleanSegments.length === 2) {
      permanentRedirect(`/food-wine/${cleanSegments[1]}`);
    }
  }

  // Handle legacy /relationships URLs by permanently redirecting to canonical /relationship
  if (cleanSegments[0] === 'relationships') {
    if (cleanSegments.length === 1) {
      permanentRedirect('/relationship');
    } else if (cleanSegments.length === 2) {
      permanentRedirect(`/relationship/${cleanSegments[1]}`);
    }
  }

  // 1. Check if it's an Article (Post)
  let post: any = null;
  
  if (cleanSegments.length === 1) {
    try {
      post = await getPostBySlug(segments[0]);
    } catch {
      post = null;
    }
    
    if (post) {
      const catSlug = post.subCategory?.slug || 'uncategorized';
      permanentRedirect(`/${catSlug}/${post.slug}`);
    }
  } else if (cleanSegments.length === 2) {
    try {
      post = await getPostBySlug(segments[1]);
    } catch {
      post = null;
    }
    
    if (post) {
      const catSlug = post.subCategory?.slug || 'uncategorized';
      if (cleanSegments[0] !== catSlug) {
         permanentRedirect(`/${catSlug}/${post.slug}`);
      }
    }
  }

  if (post) {
    incrementPostViews(post.slug).catch(() => {});
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
    const parentCategory = categories.find((category) => {
      if (category.parentId) return false;
      const s = category.slug.toLowerCase().trim();
      if (cleanSegments[0] === 'food' || cleanSegments[0] === 'food-wine') {
        return (
          s === 'food' ||
          s === 'food-wine' ||
          category.id === 'cat_food' ||
          (category.name.toLowerCase().includes('food') && !category.parentId)
        );
      }
      return s === cleanSegments[0];
    });
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

  const currentCategory = categories.find((category) => {
    const s = category.slug.trim().toLowerCase();
    if (cleanSlug === 'food' || cleanSlug === 'food-wine') {
      return (
        s === 'food' ||
        s === 'food-wine' ||
        category.id === 'cat_food' ||
        (category.name.toLowerCase().includes('food') && !category.parentId)
      );
    }
    return s === cleanSlug;
  });

  if (currentCategory) {
    if (currentCategory.id === 'cat_food' || currentCategory.slug === 'food') {
      currentCategory.slug = 'food-wine';
    }
    const childCategories = categories.filter((c) => c.parentId === currentCategory?.id);
    const isParent = !currentCategory.parentId || childCategories.length > 0;
    const parentCat = currentCategory.parentId
      ? categories.find((c) => c.id === currentCategory?.parentId)
      : undefined;

    // Subcategories now live below their parent category. Preserve old
    // one-segment URLs as permanent redirects, without changing parent URLs.
    if (currentCategory.parentId && parentCat) {
      const parentSlug =
        parentCat.slug === 'food' || parentCat.slug === 'food-wine' || parentCat.id === 'cat_food' ? 'food-wine' : parentCat.slug;
      permanentRedirect(`/${parentSlug}/${currentCategory.slug}`);
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

  // 4. Check if it's a dynamic Page -> Redirect to canonical URLs
  if (cleanSlug === 'privacy-policy') {
    permanentRedirect('/privacy-policy');
  }
  if (cleanSlug === 'about-us' || cleanSlug === 'about') {
    permanentRedirect('/page/about-us');
  }
  if (
    cleanSlug === 'terms-and-conditions' ||
    cleanSlug === 'terms' ||
    cleanSlug === 'terms-of-service' ||
    cleanSlug === 'terms-conditions' ||
    cleanSlug === 'terms-and-condition'
  ) {
    permanentRedirect('/page/terms-and-conditions');
  }
  const matchedPage = await getPageBySlug(cleanSlug).catch(() => null);
  if (matchedPage) {
    permanentRedirect(`/page/${matchedPage.slug}`);
  }

  notFound();
}

