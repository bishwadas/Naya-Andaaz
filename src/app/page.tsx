import React from 'react';
import type { Metadata } from 'next';
import { getCategories, getPosts, getSettings, getPrimaryMenuItems } from '@/db/repository';
import { Category, Post, SiteSettings } from '@/types';
import { DEFAULT_SITE_SETTINGS, INITIAL_CATEGORIES } from '@/lib/constants';
import { INITIAL_POSTS } from '@/lib/mockData';
import {
  resolveSiteUrl,
  resolveSiteName,
  resolveSiteDescription,
  resolveSiteTitle,
  generateWebSiteJsonLd,
  generateOrganizationJsonLd,
} from '@/lib/seo';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import FeaturedHero from '@/components/public/FeaturedHero';
import { CategorySection } from '@/components/public/CategorySection';
import { getOptimizedImageUrl, getResponsiveImageSrcSet } from '@/lib/images';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings().catch(() => DEFAULT_SITE_SETTINGS);
  const siteName = resolveSiteName(settings);
  const siteDesc = resolveSiteDescription(settings);
  const siteTitle = resolveSiteTitle(settings);
  const baseUrl = resolveSiteUrl(settings);
  const ogImage = settings?.defaultOgImage;

  return {
    title: {
      absolute: siteTitle,
    },
    description: siteDesc,
    openGraph: {
      title: siteTitle,
      description: siteDesc,
      url: baseUrl,
      siteName: siteName,
      type: 'website',
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: siteName,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: siteTitle,
      description: siteDesc,
      images: ogImage ? [ogImage] : undefined,
    },
    alternates: {
      canonical: baseUrl,
    },
  };
}

/**
 * Filter posts belonging to a parent category or any of its subcategories.
 * Matches categoryId, subCategoryId, or category slugs.
 */
function getCategoryPosts(
  targetSlug: string,
  categories: Category[],
  allPosts: Post[],
  limit: number = 5
): Post[] {
  const normalizedTarget = targetSlug.trim().toLowerCase();
  const isFood = normalizedTarget === 'food' || normalizedTarget === 'food-wine';

  // 1. Locate the category in database categories
  const targetCat = categories.find((c) => {
    const s = c.slug.trim().toLowerCase();
    if (isFood) {
      return (
        s === 'food' ||
        s === 'food-wine' ||
        c.id === 'cat_food' ||
        (c.name.toLowerCase().includes('food') && !c.parentId)
      );
    }
    return s === normalizedTarget;
  });

  // 2. Build the branch category IDs and slugs
  const branchCategoryIds = new Set<string>();
  const branchCategorySlugs = new Set<string>([normalizedTarget]);
  if (isFood) {
    branchCategorySlugs.add('food');
    branchCategorySlugs.add('food-wine');
  }

  if (targetCat) {
    branchCategoryIds.add(targetCat.id);
    branchCategorySlugs.add(targetCat.slug.toLowerCase());

    // Recursively add all child subcategories
    const collectDescendants = (parentId: string) => {
      for (const cat of categories) {
        if (cat.parentId === parentId) {
          branchCategoryIds.add(cat.id);
          branchCategorySlugs.add(cat.slug.toLowerCase());
          collectDescendants(cat.id);
        }
      }
    };
    collectDescendants(targetCat.id);
  }

  // 3. Filter published posts matching the parent category or any of its subcategories
  const matched = allPosts.filter((post) => {
    const pCatId = post.categoryId;
    const pSubCatId = post.subCategoryId;
    const pCatSlug = post.category?.slug?.toLowerCase();
    const pSubCatSlug = post.subCategory?.slug?.toLowerCase();

    const matchesId =
      (pCatId && branchCategoryIds.has(pCatId)) ||
      (pSubCatId && branchCategoryIds.has(pSubCatId));

    const matchesSlug =
      (pCatSlug && branchCategorySlugs.has(pCatSlug)) ||
      (pSubCatSlug && branchCategorySlugs.has(pSubCatSlug));

    return matchesId || matchesSlug;
  });

  // 4. Return deduplicated list up to limit
  const result: Post[] = [];
  const seenIds = new Set<string>();
  for (const post of matched) {
    if (!seenIds.has(post.id)) {
      seenIds.add(post.id);
      result.push(post);
      if (result.length >= limit) break;
    }
  }

  return result;
}

export default async function HomePage() {
  let categories: any[] = [];
  let settings: SiteSettings = DEFAULT_SITE_SETTINGS;
  let allPublishedPosts: any[] = [];
  let primaryMenuItems: any[] = [];

  try {
    const [fetchedCats, fetchedSettings, fetchedPosts, fetchedMenuItems] = await Promise.all([
      getCategories().catch(() => []),
      getSettings()
        .then((s) => (s ? (s as unknown as SiteSettings) : DEFAULT_SITE_SETTINGS))
        .catch(() => DEFAULT_SITE_SETTINGS),
      getPosts({ status: 'published' }).catch(() => []),
      getPrimaryMenuItems().catch(() => []),
    ]);

    categories = Array.isArray(fetchedCats) ? fetchedCats : [];
    settings = fetchedSettings || DEFAULT_SITE_SETTINGS;
    allPublishedPosts = Array.isArray(fetchedPosts) ? fetchedPosts : [];
    primaryMenuItems = Array.isArray(fetchedMenuItems) ? fetchedMenuItems : [];
  } catch (err) {
    console.warn('Error loading HomePage data:', err);
    categories = [];
    settings = DEFAULT_SITE_SETTINGS;
    allPublishedPosts = [];
    primaryMenuItems = [];
  }

  // Category Sections (2 through 9): Dynamic filtering using parent/subcategory hierarchy
  const entertainmentPosts = getCategoryPosts('entertainment', categories, allPublishedPosts, 5);
  const womenLifestylePosts = getCategoryPosts('women-lifestyle', categories, allPublishedPosts, 5);
  const stylePosts = getCategoryPosts('style', categories, allPublishedPosts, 5);
  const wellnessPosts = getCategoryPosts('wellness', categories, allPublishedPosts, 5);
  const travelPosts = getCategoryPosts('travel', categories, allPublishedPosts, 5);
  const foodPosts = getCategoryPosts('food-wine', categories, allPublishedPosts, 5);
  const careerFinancePosts = getCategoryPosts('career-finance', categories, allPublishedPosts, 5);
  const relationshipPosts = getCategoryPosts('relationship', categories, allPublishedPosts, 5);

  // Derive exact LCP image for the primary featured hero post
  const firstHeroPost = allPublishedPosts[0];
  const firstHeroRawImage =
    firstHeroPost?.featuredImage ||
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80';
  const lcpOptimizedUrl = getOptimizedImageUrl(firstHeroRawImage, 720);
  const lcpSrcSet = getResponsiveImageSrcSet(firstHeroRawImage, [360, 480, 640, 800, 1024]);
  const lcpSizes = '(max-width: 640px) 100vw, (max-width: 1024px) 55vw, 720px';
  const websiteSchema = generateWebSiteJsonLd(settings);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">
      {/* Google WebSite structured data specifically for Homepage site name */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      {/* Speculative Preload for exact LCP Hero image */}
      <link
        rel="preload"
        as="image"
        href={lcpOptimizedUrl}
        imageSrcSet={lcpSrcSet}
        imageSizes={lcpSizes}
        // @ts-ignore
        fetchPriority="high"
      />
      {/* Header/Navbar */}
      <Navbar categories={categories} settings={settings} primaryMenuItems={primaryMenuItems} />

      {/* Main Homepage Layout */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8" id="homepage-main-content">
        {/* SECTION 1: Shared Hero Section */}
        <FeaturedHero posts={allPublishedPosts} categories={categories} />

        {/* SECTION 2: Entertainment (Parent category + Subcategories: Movies News & Updates, Television & OTT, Celebrities) */}
        <CategorySection
          title="Entertainment"
          categorySlug="entertainment"
          posts={entertainmentPosts}
          categories={categories}
        />

        {/* SECTION 3: Women Lifestyle (Parent category + Subcategories: Style, Beauty, Wellness, Relationship) */}
        <CategorySection
          title="Women Lifestyle"
          categorySlug="women-lifestyle"
          posts={womenLifestylePosts}
          categories={categories}
        />

        {/* SECTION 4: Style (Parent Category Section) */}
        <CategorySection
          title="Style"
          categorySlug="style"
          posts={stylePosts}
          categories={categories}
        />

        {/* SECTION 5: Wellness (Parent Category Section) */}
        <CategorySection
          title="Wellness"
          categorySlug="wellness"
          posts={wellnessPosts}
          categories={categories}
        />

        {/* SECTION 6: Travel (Parent Category Section) */}
        <CategorySection
          title="Travel"
          categorySlug="travel"
          posts={travelPosts}
          categories={categories}
        />

        {/* SECTION 7: Food & Wine (Parent Category Section) */}
        <CategorySection
          title="Food & Wine"
          categorySlug="food-wine"
          posts={foodPosts}
          categories={categories}
        />

        {/* SECTION 8: Career & Finance (Parent Category Section) */}
        <CategorySection
          title="Career & Finance"
          categorySlug="career-finance"
          posts={careerFinancePosts}
          categories={categories}
        />

        {/* SECTION 9: Relationship (Parent Category Section) */}
        <CategorySection
          title="Relationship"
          categorySlug="relationship"
          posts={relationshipPosts}
          categories={categories}
        />
      </main>

      {/* Existing Footer - Unchanged */}
      <Footer settings={settings} categories={categories} />
    </div>
  );
}

