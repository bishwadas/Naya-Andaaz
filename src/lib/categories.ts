import { Category, Post } from '@/types';

/**
 * Recursively collect all descendant category IDs for a given category ID.
 * Supports unlimited category nesting depth (Parent -> Child -> Grandchild -> Great Grandchild, etc.).
 */
export function getDescendantCategoryIds(
  categoryId: string,
  categories: { id: string; parentId?: string | null }[]
): string[] {
  const descendants: string[] = [];
  const visited = new Set<string>([categoryId]);

  function collect(parentCatId: string) {
    for (const cat of categories) {
      if (cat.parentId === parentCatId && !visited.has(cat.id)) {
        visited.add(cat.id);
        descendants.push(cat.id);
        collect(cat.id);
      }
    }
  }

  collect(categoryId);
  return descendants;
}

/**
 * Get all category IDs in a category hierarchy branch (current category ID + all descendant category IDs).
 */
export function getCategoryTreeIds(
  categoryId: string,
  categories: { id: string; parentId?: string | null }[]
): string[] {
  return [categoryId, ...getDescendantCategoryIds(categoryId, categories)];
}

/**
 * Filter and deduplicate posts belonging to a category or any of its descendant categories.
 * Works dynamically for any parent/main category without hard-coding category names.
 */
export function filterPostsForCategoryTree(
  currentCategory: Category | { id: string; slug?: string },
  categories: Category[],
  allPosts: Post[]
): Post[] {
  const treeIds = new Set(getCategoryTreeIds(currentCategory.id, categories));

  // Collect all category slugs in this hierarchy branch for robust slug-based matching
  const treeSlugs = new Set<string>();
  if (currentCategory.slug) {
    treeSlugs.add(currentCategory.slug.toLowerCase().trim());
  }
  for (const catId of treeIds) {
    const found = categories.find((c) => c.id === catId);
    if (found?.slug) {
      treeSlugs.add(found.slug.toLowerCase().trim());
    }
  }

  const seenPostIds = new Set<string>();
  const result: Post[] = [];

  for (const post of allPosts) {
    if (seenPostIds.has(post.id)) continue;

    const matchesId =
      (post.categoryId && treeIds.has(post.categoryId)) ||
      (post.subCategoryId && treeIds.has(post.subCategoryId)) ||
      (post.category?.id && treeIds.has(post.category.id)) ||
      (post.subCategory?.id && treeIds.has(post.subCategory.id));

    const pCatSlug = post.category?.slug?.toLowerCase().trim();
    const pSubCatSlug = post.subCategory?.slug?.toLowerCase().trim();

    const matchesSlug =
      (pCatSlug && treeSlugs.has(pCatSlug)) ||
      (pSubCatSlug && treeSlugs.has(pSubCatSlug));

    if (matchesId || matchesSlug) {
      seenPostIds.add(post.id);
      result.push(post);
    }
  }

  return result;
}
