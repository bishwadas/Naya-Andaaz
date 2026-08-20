import React from 'react';
import { getCategories, getPosts, getSettings, getPrimaryMenuItems } from '@/db/repository';
import { Category, Post, SiteSettings } from '@/types';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import FeaturedHero from '@/components/public/FeaturedHero';
import { CategorySection } from '@/components/public/CategorySection';

export const dynamic = 'force-dynamic';

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

  // 1. Locate the category in database categories
  const targetCat = categories.find(
    (c) => c.slug.trim().toLowerCase() === normalizedTarget
  );

  // 2. Build the branch category IDs and slugs
  const branchCategoryIds = new Set<string>();
  const branchCategorySlugs = new Set<string>([normalizedTarget]);

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
  const [categories, settings, allPublishedPosts, primaryMenuItems] = await Promise.all([
    getCategories(),
    getSettings().then((s) => s as unknown as SiteSettings),
    getPosts({ status: 'published' }),
    getPrimaryMenuItems(),
  ]);

  // Category Sections (2 through 9): Dynamic filtering using parent/subcategory hierarchy
  const entertainmentPosts = getCategoryPosts('entertainment', categories, allPublishedPosts, 5);
  const womenLifestylePosts = getCategoryPosts('women-lifestyle', categories, allPublishedPosts, 5);
  const stylePosts = getCategoryPosts('style', categories, allPublishedPosts, 5);
  const wellnessPosts = getCategoryPosts('wellness', categories, allPublishedPosts, 5);
  const travelPosts = getCategoryPosts('travel', categories, allPublishedPosts, 5);
  const foodPosts = getCategoryPosts('food-wine', categories, allPublishedPosts, 5);
  const careerFinancePosts = getCategoryPosts('career-finance', categories, allPublishedPosts, 5);
  const relationshipPosts = getCategoryPosts('relationships', categories, allPublishedPosts, 5);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">
      {/* Sereia Header/Navbar */}
      <Navbar categories={categories} settings={settings} primaryMenuItems={primaryMenuItems} />

      {/* Main Homepage Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8" id="homepage-main-content">
        {/* SECTION 1: Shared Hero Section */}
        <FeaturedHero posts={allPublishedPosts} categories={categories} />

        {/* SECTION 2: Entertainment (Parent category + Subcategories: Movies News & Updates, Television & OTT, Celebrities) */}
        <CategorySection
          title="Entertainment"
          categorySlug="entertainment"
          posts={entertainmentPosts}
        />

        {/* SECTION 3: Women Lifestyle (Parent category + Subcategories: Style, Beauty, Wellness, Relationship) */}
        <CategorySection
          title="Women Lifestyle"
          categorySlug="women-lifestyle"
          posts={womenLifestylePosts}
        />

        {/* SECTION 4: Style (Parent Category Section) */}
        <CategorySection
          title="Style"
          categorySlug="style"
          posts={stylePosts}
        />

        {/* SECTION 5: Wellness (Parent Category Section) */}
        <CategorySection
          title="Wellness"
          categorySlug="wellness"
          posts={wellnessPosts}
        />

        {/* SECTION 6: Travel (Parent Category Section) */}
        <CategorySection
          title="Travel"
          categorySlug="travel"
          posts={travelPosts}
        />

        {/* SECTION 7: Food (Parent Category Section) */}
        <CategorySection
          title="Food"
          categorySlug="food-wine"
          posts={foodPosts}
        />

        {/* SECTION 8: Career & Finance (Parent Category Section) */}
        <CategorySection
          title="Career & Finance"
          categorySlug="career-finance"
          posts={careerFinancePosts}
        />

        {/* SECTION 9: Relationship (Parent Category Section) */}
        <CategorySection
          title="Relationship"
          categorySlug="relationships"
          posts={relationshipPosts}
        />
      </main>

      {/* Existing Footer - Unchanged */}
      <Footer settings={settings} categories={categories} />
    </div>
  );
}

