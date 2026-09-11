import { and, asc, count, desc, eq, gte, ilike, inArray, lte, ne, or, sql } from 'drizzle-orm';
import { db } from './index';
import {
  activityLogs,
  advertisements,
  categories,
  comments,
  media,
  menuItems,
  menus,
  newsletters,
  notifications,
  pages,
  posts,
  postRevisions,
  postTags,
  siteSettings,
  tags,
  users,
  videos,
} from './schema';
import { Category, Post, Tag, User } from '@/types';
import { getCategoryTreeIds } from '@/lib/categories';
import {
  DEFAULT_SITE_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_TAGS,
  INITIAL_USERS,
} from '@/lib/constants';
import {
  INITIAL_ACTIVITY_LOGS,
  INITIAL_MEDIA,
  INITIAL_PAGES,
  INITIAL_POSTS,
} from '@/lib/mockData';

// ----------------------------------------------------
// VALIDATION HELPERS
// ----------------------------------------------------
export function validatePostPayload(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Title is required');
  }
  if (!data.slug || typeof data.slug !== 'string' || data.slug.trim().length === 0) {
    errors.push('Slug is required');
  }
  if (!data.categoryId || typeof data.categoryId !== 'string' || data.categoryId.trim().length === 0) {
    errors.push('Category is required');
  }
  return { valid: errors.length === 0, errors };
}

export function validateCategoryPayload(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Category name is required');
  }
  if (!data.slug || typeof data.slug !== 'string' || data.slug.trim().length === 0) {
    errors.push('Category slug is required');
  } else if (!/^[a-z0-9-_]+$/i.test(data.slug.trim())) {
    errors.push('Category slug must contain only letters, numbers, hyphens, and underscores');
  }
  if (data.parentId && data.id && data.parentId === data.id) {
    errors.push('A category cannot be its own parent');
  }
  return { valid: errors.length === 0, errors };
}

export function validateTagPayload(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Tag name is required');
  }
  if (!data.slug || typeof data.slug !== 'string' || data.slug.trim().length === 0) {
    errors.push('Tag slug is required');
  }
  return { valid: errors.length === 0, errors };
}

export function validateUserPayload(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.email || typeof data.email !== 'string' || !data.email.includes('@')) {
    errors.push('Valid email is required');
  }
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Name is required');
  }
  return { valid: errors.length === 0, errors };
}

function parseDateOrNull(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return null;
    const parsed = new Date(trimmed);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof val === 'number') {
    const parsed = new Date(val);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

function parseStringOrNull(val: any): string | null {
  if (val === undefined || val === null) return null;
  const trimmed = String(val).trim();
  return trimmed.length > 0 ? trimmed : null;
}

// ----------------------------------------------------
// POSTS REPOSITORY
// ----------------------------------------------------
export {
  getDescendantCategoryIds,
  getCategoryTreeIds,
  filterPostsForCategoryTree,
} from '@/lib/categories';

export interface GetPostsParams {
  status?: string;
  categoryId?: string;
  subCategoryId?: string;
  categoryIds?: string[];
  categorySlug?: string;
  tagSlug?: string;
  authorId?: string;
  search?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  isEditorPick?: boolean;
  limit?: number;
  offset?: number;
  page?: number;
  sortBy?: 'publishedAt' | 'views' | 'likes' | 'createdAt' | 'updatedAt' | 'title' | 'status';
  sortOrder?: 'asc' | 'desc';
  dateFilter?: 'all' | 'today' | 'yesterday' | 'this_week' | 'this_month' | 'previous_month' | 'custom';
  dateFrom?: string;
  dateTo?: string;
  includeTrashed?: boolean;
}

export interface PostCounts {
  all: number;
  published: number;
  draft: number;
  scheduled: number;
  pending: number;
  trash: number;
}

export interface PaginatedPostsResult {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  counts: PostCounts;
}

async function buildPostQueryConditions(params: GetPostsParams) {
  const conditions: any[] = [];

  // Status & Trash handling
  if (params.status === 'trash') {
    conditions.push(eq(posts.isTrashed, true));
  } else if (!params.includeTrashed) {
    conditions.push(eq(posts.isTrashed, false));
    if (params.status && params.status !== 'all') {
      conditions.push(eq(posts.status, params.status));
    }
  } else if (params.status && params.status !== 'all') {
    conditions.push(eq(posts.status, params.status));
  }

  // Category handling
  if (params.categoryIds && params.categoryIds.length > 0) {
    conditions.push(
      or(
        inArray(posts.categoryId, params.categoryIds),
        inArray(posts.subCategoryId, params.categoryIds)
      )
    );
  } else if (params.categoryId) {
    try {
      const categoryTree = await db.query.categories.findMany({
        where: eq(categories.isTrashed, false),
        columns: { id: true, parentId: true },
      });
      const categoryIds = getCategoryTreeIds(params.categoryId, categoryTree);
      conditions.push(
        or(
          inArray(posts.categoryId, categoryIds),
          inArray(posts.subCategoryId, categoryIds)
        )
      );
    } catch {
      conditions.push(
        or(
          eq(posts.categoryId, params.categoryId),
          eq(posts.subCategoryId, params.categoryId)
        )
      );
    }
  } else if (params.subCategoryId) {
    conditions.push(eq(posts.subCategoryId, params.subCategoryId));
  } else if (params.categorySlug) {
    const rawTargetSlug = params.categorySlug.trim().toLowerCase();
    const isFood = rawTargetSlug === 'food' || rawTargetSlug === 'food-wine';
    const category = await db.query.categories.findFirst({
      where: and(
        isFood
          ? or(eq(categories.slug, 'food'), eq(categories.slug, 'food-wine'), eq(categories.id, 'cat_food'))
          : eq(categories.slug, rawTargetSlug),
        eq(categories.isTrashed, false)
      ),
      columns: { id: true },
    });

    if (category) {
      const categoryTree = await db.query.categories.findMany({
        where: eq(categories.isTrashed, false),
        columns: { id: true, parentId: true },
      });
      const categoryIds = getCategoryTreeIds(category.id, categoryTree);
      conditions.push(
        or(
          inArray(posts.categoryId, categoryIds),
          inArray(posts.subCategoryId, categoryIds)
        )
      );
    } else {
      conditions.push(sql`1 = 0`);
    }
  }

  // Tag handling
  if (params.tagSlug) {
    const cleanTagSlug = params.tagSlug.trim().toLowerCase().replace(/^#+/, '');
    const cleanTagWithHyphen = cleanTagSlug.replace(/[\s_]+/g, '-');
    const tag = await db.query.tags.findFirst({
      where: and(
        or(
          eq(tags.slug, cleanTagSlug),
          eq(tags.slug, cleanTagWithHyphen),
          ilike(tags.slug, cleanTagSlug),
          ilike(tags.name, cleanTagSlug)
        ),
        eq(tags.isTrashed, false)
      ),
      columns: { id: true },
    });
    if (tag) {
      const ptRows = await db
        .select({ postId: postTags.postId })
        .from(postTags)
        .where(eq(postTags.tagId, tag.id));
      const postIds = ptRows.map((r) => r.postId);
      if (postIds.length > 0) {
        conditions.push(inArray(posts.id, postIds));
      } else {
        conditions.push(sql`1 = 0`);
      }
    } else {
      conditions.push(sql`1 = 0`);
    }
  }

  if (params.authorId) {
    conditions.push(eq(posts.authorId, params.authorId));
  }
  if (params.isFeatured !== undefined) {
    conditions.push(eq(posts.isFeatured, params.isFeatured));
  }
  if (params.isTrending !== undefined) {
    conditions.push(eq(posts.isTrending, params.isTrending));
  }
  if (params.isEditorPick !== undefined) {
    conditions.push(eq(posts.isEditorPick, params.isEditorPick));
  }

  // Date filters
  const now = new Date();
  if (params.dateFilter === 'today') {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    conditions.push(gte(posts.createdAt, startOfToday));
  } else if (params.dateFilter === 'yesterday') {
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
    const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
    conditions.push(and(gte(posts.createdAt, startOfYesterday), lte(posts.createdAt, endOfYesterday)));
  } else if (params.dateFilter === 'this_week') {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    conditions.push(gte(posts.createdAt, sevenDaysAgo));
  } else if (params.dateFilter === 'this_month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    conditions.push(gte(posts.createdAt, startOfMonth));
  } else if (params.dateFilter === 'previous_month') {
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    conditions.push(and(gte(posts.createdAt, startOfPrevMonth), lte(posts.createdAt, endOfPrevMonth)));
  } else if (params.dateFilter === 'custom' || params.dateFrom || params.dateTo) {
    if (params.dateFrom) {
      const fromDate = new Date(params.dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      conditions.push(gte(posts.createdAt, fromDate));
    }
    if (params.dateTo) {
      const toDate = new Date(params.dateTo);
      toDate.setHours(23, 59, 59, 999);
      conditions.push(lte(posts.createdAt, toDate));
    }
  }

  // Search filter
  if (params.search && params.search.trim()) {
    const searchTerm = params.search.trim();

    // Find matching category IDs
    const matchingCats = await db
      .select({ id: categories.id })
      .from(categories)
      .where(
        or(
          ilike(categories.name, `%${searchTerm}%`),
          ilike(categories.slug, `%${searchTerm}%`)
        )
      );
    const catIds = matchingCats.map((c) => c.id);

    // Find matching tag IDs
    const matchingTags = await db
      .select({ id: tags.id })
      .from(tags)
      .where(
        or(
          ilike(tags.name, `%${searchTerm}%`),
          ilike(tags.slug, `%${searchTerm}%`)
        )
      );
    const tagIds = matchingTags.map((t) => t.id);

    let matchingPostIdsFromTags: string[] = [];
    if (tagIds.length > 0) {
      const ptRows = await db
        .select({ postId: postTags.postId })
        .from(postTags)
        .where(inArray(postTags.tagId, tagIds));
      matchingPostIdsFromTags = ptRows.map((pt) => pt.postId);
    }

    const searchConditions = [
      ilike(posts.title, `%${searchTerm}%`),
      ilike(posts.slug, `%${searchTerm}%`),
      ilike(posts.excerpt, `%${searchTerm}%`),
      ilike(posts.content, `%${searchTerm}%`),
      ilike(posts.focusKeyword, `%${searchTerm}%`),
      ilike(posts.seoTitle, `%${searchTerm}%`),
      ilike(posts.metaDescription, `%${searchTerm}%`),
    ];

    if (catIds.length > 0) {
      searchConditions.push(
        inArray(posts.categoryId, catIds),
        inArray(posts.subCategoryId, catIds)
      );
    }

    if (matchingPostIdsFromTags.length > 0) {
      searchConditions.push(inArray(posts.id, matchingPostIdsFromTags));
    }

    conditions.push(or(...searchConditions));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

export async function getPostCounts(): Promise<PostCounts> {
  try {
    const [allRes, pubRes, draftRes, schedRes, pendRes, trashRes] = await Promise.all([
      db.select({ value: count() }).from(posts).where(eq(posts.isTrashed, false)),
      db.select({ value: count() }).from(posts).where(and(eq(posts.status, 'published'), eq(posts.isTrashed, false))),
      db.select({ value: count() }).from(posts).where(and(eq(posts.status, 'draft'), eq(posts.isTrashed, false))),
      db.select({ value: count() }).from(posts).where(and(eq(posts.status, 'scheduled'), eq(posts.isTrashed, false))),
      db.select({ value: count() }).from(posts).where(and(eq(posts.status, 'pending'), eq(posts.isTrashed, false))),
      db.select({ value: count() }).from(posts).where(eq(posts.isTrashed, true)),
    ]);

    return {
      all: Number(allRes[0]?.value || 0),
      published: Number(pubRes[0]?.value || 0),
      draft: Number(draftRes[0]?.value || 0),
      scheduled: Number(schedRes[0]?.value || 0),
      pending: Number(pendRes[0]?.value || 0),
      trash: Number(trashRes[0]?.value || 0),
    };
  } catch (error) {
    console.error('Failed to query post counts:', error);
    return {
      all: INITIAL_POSTS.length,
      published: INITIAL_POSTS.filter((p) => p.status === 'published').length,
      draft: INITIAL_POSTS.filter((p) => p.status === 'draft').length,
      scheduled: INITIAL_POSTS.filter((p) => p.status === 'scheduled').length,
      pending: INITIAL_POSTS.filter((p) => p.status === 'pending').length,
      trash: 0,
    };
  }
}

export async function getPosts(params: GetPostsParams = {}): Promise<Post[]> {
  try {
    const whereClause = await buildPostQueryConditions(params);

    // Query posts with relations
    const rawPosts = await db.query.posts.findMany({
      where: whereClause,
      with: {
        author: true,
        category: true,
        subCategory: true,
        postTags: {
          with: {
            tag: true,
          },
        },
      },
      orderBy: (p, { asc, desc }) => {
        if (params.sortBy === 'createdAt') {
          return params.sortOrder === 'asc' ? asc(p.createdAt) : desc(p.createdAt);
        }
        if (params.sortBy === 'updatedAt') {
          return params.sortOrder === 'asc' ? asc(p.updatedAt) : desc(p.updatedAt);
        }
        if (params.sortBy === 'title') {
          return params.sortOrder === 'asc' ? asc(p.title) : desc(p.title);
        }
        if (params.sortBy === 'views') {
          return params.sortOrder === 'asc' ? asc(p.views) : desc(p.views);
        }
        if (params.sortBy === 'likes') {
          return params.sortOrder === 'asc' ? asc(p.likes) : desc(p.likes);
        }
        if (params.sortBy === 'status') {
          return params.sortOrder === 'asc' ? asc(p.status) : desc(p.status);
        }
        return params.sortOrder === 'asc' ? asc(p.publishedAt) : desc(p.publishedAt);
      },
      limit: params.limit || 50,
      offset: params.offset || 0,
    });

    // Transform to frontend Post domain format
    return rawPosts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      content: p.content,
      excerpt: p.excerpt,
      featuredImage: p.featuredImage,
      featuredImageCaption: p.featuredImageCaption || undefined,
      authorId: p.authorId,
      author: {
        id: p.author?.id || p.authorId,
        name: p.author?.name || 'Editorial Team',
        username: p.author?.username || 'editor',
        avatar: p.author?.avatar || '',
        bio: p.author?.bio || undefined,
      },
      categoryId: p.categoryId,
      category: {
        id: p.category?.id || p.categoryId,
        name: p.category?.name || 'Lifestyle',
        slug: p.category?.slug || 'lifestyle',
        color: p.category?.color || '#E11D48',
      },
      subCategoryId: p.subCategoryId,
      subCategory: p.subCategory
        ? {
            id: p.subCategory.id,
            name: p.subCategory.name,
            slug: p.subCategory.slug,
          }
        : null,
      tagIds: p.postTags.map((pt) => pt.tagId),
      tags: p.postTags.map((pt) => ({
        id: pt.tag.id,
        name: pt.tag.name,
        slug: pt.tag.slug,
        description: pt.tag.description || undefined,
        createdAt: pt.tag.createdAt.toISOString(),
      })),
      status: p.status as any,
      isFeatured: p.isFeatured,
      isTrending: p.isTrending,
      isEditorPick: p.isEditorPick,
      views: p.views,
      likes: p.likes,
      readingTime: p.readingTime,
      publishedAt: p.publishedAt ? p.publishedAt.toISOString() : p.createdAt.toISOString(),
      scheduledAt: p.scheduledAt ? p.scheduledAt.toISOString() : undefined,
      seoTitle: p.seoTitle || undefined,
      metaDescription: p.metaDescription || undefined,
      focusKeyword: p.focusKeyword || undefined,
      canonicalUrl: p.canonicalUrl || undefined,
      ogImage: p.ogImage || undefined,
      faqs: p.faqs || [],
      relatedPostIds: p.relatedPostIds || [],
      allowComments: p.allowComments,
      blocks: p.blocks || [],
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.warn('getPosts query failed, falling back to INITIAL_POSTS:', error);
    let filtered = [...INITIAL_POSTS];
    if (params.status && params.status !== 'all') {
      filtered = filtered.filter((p) => p.status === params.status);
    }
    if (params.categoryId) {
      filtered = filtered.filter(
        (p) => p.categoryId === params.categoryId || p.category?.id === params.categoryId
      );
    }
    if (params.categorySlug) {
      const slugLower = params.categorySlug.toLowerCase().trim();
      const isFood = slugLower === 'food' || slugLower === 'food-wine';
      filtered = filtered.filter((p) => {
        const pCatSlug = p.category?.slug?.toLowerCase()?.trim();
        const pSubCatSlug = p.subCategory?.slug?.toLowerCase()?.trim();
        if (isFood) {
          return (
            pCatSlug === 'food' ||
            pCatSlug === 'food-wine' ||
            pSubCatSlug === 'food' ||
            pSubCatSlug === 'food-wine' ||
            p.categoryId === 'cat_food'
          );
        }
        return pCatSlug === slugLower || pSubCatSlug === slugLower;
      });
    }
    if (params.authorId) {
      filtered = filtered.filter(
        (p) => p.authorId === params.authorId || p.author?.id === params.authorId
      );
    }
    if (params.isFeatured !== undefined) {
      filtered = filtered.filter((p) => p.isFeatured === params.isFeatured);
    }
    if (params.isTrending !== undefined) {
      filtered = filtered.filter((p) => p.isTrending === params.isTrending);
    }
    if (params.isEditorPick !== undefined) {
      filtered = filtered.filter((p) => p.isEditorPick === params.isEditorPick);
    }
    if (params.search && params.search.trim()) {
      const term = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.content.toLowerCase().includes(term) ||
          (p.excerpt && p.excerpt.toLowerCase().includes(term))
      );
    }
    if (params.limit) {
      const offset = params.offset || 0;
      filtered = filtered.slice(offset, offset + params.limit);
    }
    return filtered;
  }
}

export async function getPostsPaginated(params: GetPostsParams = {}): Promise<PaginatedPostsResult> {
  try {
    const limit = Math.max(1, Math.min(params.limit || 20, 100));
    const page = Math.max(1, params.page || 1);
    const offset = params.offset !== undefined ? params.offset : (page - 1) * limit;

    const whereClause = await buildPostQueryConditions(params);

    const [totalRows, counts] = await Promise.all([
      db.select({ value: count() }).from(posts).where(whereClause),
      getPostCounts(),
    ]);

    const total = Number(totalRows[0]?.value || 0);

    const postList = await getPosts({
      ...params,
      limit,
      offset,
    });

    return {
      posts: postList,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      counts,
    };
  } catch (error) {
    console.error('getPostsPaginated failed:', error);
    const counts = await getPostCounts();
    return {
      posts: INITIAL_POSTS.slice(0, 20),
      total: INITIAL_POSTS.length,
      page: 1,
      limit: 20,
      totalPages: Math.ceil(INITIAL_POSTS.length / 20),
      counts,
    };
  }
}

export async function duplicatePost(id: string, authorId?: string): Promise<Post | null> {
  const original = await getPostById(id);
  if (!original) return null;

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const newSlug = `${original.slug}-copy-${randomSuffix}`;
  const newTitle = `${original.title} (Copy)`;

  const newPostData = {
    title: newTitle,
    slug: newSlug,
    content: original.content,
    excerpt: original.excerpt,
    featuredImage: original.featuredImage,
    featuredImageCaption: original.featuredImageCaption,
    authorId: authorId || original.authorId,
    categoryId: original.categoryId,
    subCategoryId: original.subCategoryId,
    status: 'draft',
    isFeatured: false,
    isTrending: false,
    isEditorPick: false,
    seoTitle: original.seoTitle,
    metaDescription: original.metaDescription,
    focusKeyword: original.focusKeyword,
    canonicalUrl: original.canonicalUrl,
    ogImage: original.ogImage,
    blocks: original.blocks,
    faqs: original.faqs,
    relatedPostIds: original.relatedPostIds,
    allowComments: original.allowComments,
    tagNames: original.tags?.map((t) => t.name) || [],
  };

  return await createPost(newPostData);
}

export async function bulkUpdatePosts(params: {
  action: 'trash' | 'restore' | 'delete' | 'publish' | 'draft' | 'pending' | 'scheduled' | 'category';
  postIds: string[];
  categoryId?: string;
  scheduledAt?: string;
}): Promise<{ count: number; success: boolean }> {
  const { action, postIds, categoryId, scheduledAt } = params;
  if (!postIds || postIds.length === 0) return { count: 0, success: true };

  try {
    if (action === 'trash') {
      await db
        .update(posts)
        .set({ isTrashed: true, trashedAt: new Date(), updatedAt: new Date() })
        .where(inArray(posts.id, postIds));
      return { count: postIds.length, success: true };
    }

    if (action === 'restore') {
      await db
        .update(posts)
        .set({ isTrashed: false, trashedAt: null, updatedAt: new Date() })
        .where(inArray(posts.id, postIds));
      return { count: postIds.length, success: true };
    }

    if (action === 'delete') {
      for (const id of postIds) {
        await permanentDeletePost(id);
      }
      return { count: postIds.length, success: true };
    }

    if (action === 'publish') {
      await db
        .update(posts)
        .set({ status: 'published', publishedAt: new Date(), updatedAt: new Date() })
        .where(inArray(posts.id, postIds));
      return { count: postIds.length, success: true };
    }

    if (action === 'draft') {
      await db
        .update(posts)
        .set({ status: 'draft', updatedAt: new Date() })
        .where(inArray(posts.id, postIds));
      return { count: postIds.length, success: true };
    }

    if (action === 'pending') {
      await db
        .update(posts)
        .set({ status: 'pending', updatedAt: new Date() })
        .where(inArray(posts.id, postIds));
      return { count: postIds.length, success: true };
    }

    if (action === 'scheduled') {
      await db
        .update(posts)
        .set({
          status: 'scheduled',
          scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(Date.now() + 86400000),
          updatedAt: new Date(),
        })
        .where(inArray(posts.id, postIds));
      return { count: postIds.length, success: true };
    }

    if (action === 'category' && categoryId) {
      await db
        .update(posts)
        .set({ categoryId, subCategoryId: null, updatedAt: new Date() })
        .where(inArray(posts.id, postIds));
      return { count: postIds.length, success: true };
    }

    return { count: 0, success: false };
  } catch (error) {
    console.error('bulkUpdatePosts error:', error);
    throw error;
  }
}

export async function getPostBySlug(slugOrId: string) {
  try {
    const p = await db.query.posts.findFirst({
      where: or(eq(posts.slug, slugOrId), eq(posts.id, slugOrId)),
      with: {
        author: true,
        category: true,
        subCategory: true,
        postTags: {
          with: {
            tag: true,
          },
        },
      },
    });

    if (!p) return null;

    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      content: p.content,
      excerpt: p.excerpt,
      featuredImage: p.featuredImage,
      featuredImageCaption: p.featuredImageCaption || undefined,
      authorId: p.authorId,
      author: {
        id: p.author?.id || p.authorId,
        name: p.author?.name || 'Editorial Team',
        username: p.author?.username || 'editor',
        avatar: p.author?.avatar || '',
        bio: p.author?.bio || undefined,
      },
      categoryId: p.categoryId,
      category: {
        id: p.category?.id || p.categoryId,
        name: p.category?.name || 'Lifestyle',
        slug: p.category?.slug || 'lifestyle',
        color: p.category?.color || '#E11D48',
      },
      subCategoryId: p.subCategoryId,
      subCategory: p.subCategory
        ? {
            id: p.subCategory.id,
            name: p.subCategory.name,
            slug: p.subCategory.slug,
          }
        : null,
      tagIds: p.postTags.map((pt) => pt.tagId),
      tags: p.postTags.map((pt) => ({
        id: pt.tag.id,
        name: pt.tag.name,
        slug: pt.tag.slug,
        description: pt.tag.description || undefined,
        createdAt: pt.tag.createdAt.toISOString(),
      })),
      status: p.status as any,
      isFeatured: p.isFeatured,
      isTrending: p.isTrending,
      isEditorPick: p.isEditorPick,
      views: p.views,
      likes: p.likes,
      readingTime: p.readingTime,
      publishedAt: p.publishedAt ? p.publishedAt.toISOString() : p.createdAt.toISOString(),
      scheduledAt: p.scheduledAt ? p.scheduledAt.toISOString() : undefined,
      seoTitle: p.seoTitle || undefined,
      metaDescription: p.metaDescription || undefined,
      focusKeyword: p.focusKeyword || undefined,
      canonicalUrl: p.canonicalUrl || undefined,
      ogImage: p.ogImage || undefined,
      faqs: p.faqs || [],
      relatedPostIds: p.relatedPostIds || [],
      allowComments: p.allowComments,
      blocks: p.blocks || [],
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  } catch (error) {
    console.warn('getPostBySlug failed, falling back to INITIAL_POSTS:', error);
    const matched = INITIAL_POSTS.find(
      (p) => p.slug === slugOrId || p.id === slugOrId
    );
    return matched || null;
  }
}

export async function createPost(data: any) {
  const validation = validatePostPayload(data);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  // 1. Resolve Author ID to a valid user in the users table
  let resolvedAuthorId = data.authorId;
  let resolvedAuthorName = data.authorName || 'Elena Rostova';
  let resolvedAuthorAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

  const allUsers = await db.select().from(users);
  let matchedUser = allUsers.find(
    (u) =>
      u.id === data.authorId ||
      (data.authorId && u.username?.toLowerCase() === String(data.authorId).toLowerCase()) ||
      (data.authorId && u.email?.toLowerCase() === String(data.authorId).toLowerCase()) ||
      (data.authorName && u.name?.toLowerCase() === String(data.authorName).toLowerCase())
  );

  if (!matchedUser && allUsers.length > 0) {
    matchedUser = allUsers[0];
  }

  if (matchedUser) {
    resolvedAuthorId = matchedUser.id;
    resolvedAuthorName = matchedUser.name;
    if (matchedUser.avatar) {
      resolvedAuthorAvatar = matchedUser.avatar;
    }
  } else {
    // Create default fallback admin user if table was empty
    const defaultUser = {
      id: 'usr_admin_01',
      name: 'Elena Rostova',
      username: 'elena.rostova',
      email: 'hello@nayaandaaz.com',
      role: 'admin' as const,
      avatar: resolvedAuthorAvatar,
    };
    await db.insert(users).values(defaultUser).onConflictDoNothing();
    resolvedAuthorId = 'usr_admin_01';
    resolvedAuthorName = 'Elena Rostova';
  }

  // 2. Resolve Category ID to a valid category in categories table
  let resolvedCategoryId = data.categoryId;
  const allCategories = await db.select().from(categories);
  let matchedCat = allCategories.find(
    (c) =>
      c.id === data.categoryId ||
      (data.categoryId && c.slug?.toLowerCase() === String(data.categoryId).toLowerCase()) ||
      (data.categoryId && c.name?.toLowerCase() === String(data.categoryId).toLowerCase())
  );

  if (!matchedCat && allCategories.length > 0) {
    matchedCat = allCategories.find((c) => !c.parentId) || allCategories[0];
  }

  if (matchedCat) {
    resolvedCategoryId = matchedCat.id;
  } else {
    const defaultCat = {
      id: 'cat_entertainment',
      name: 'Entertainment',
      slug: 'entertainment',
      color: '#E11D48',
    };
    await db.insert(categories).values(defaultCat).onConflictDoNothing();
    resolvedCategoryId = 'cat_entertainment';
  }

  // 3. Resolve SubCategory ID if provided
  let resolvedSubCategoryId: string | null = null;
  if (data.subCategoryId && typeof data.subCategoryId === 'string') {
    const cleanSub = data.subCategoryId.trim();
    if (cleanSub !== '' && cleanSub !== 'null' && cleanSub !== 'none' && cleanSub !== 'undefined') {
      const matchedSub = allCategories.find(
        (c) =>
          (c.id === cleanSub ||
            c.slug?.toLowerCase() === cleanSub.toLowerCase() ||
            c.name?.toLowerCase() === cleanSub.toLowerCase()) &&
          c.id !== resolvedCategoryId
      );
      if (matchedSub) {
        resolvedSubCategoryId = matchedSub.id;
      }
    }
  }

  // 4. Resolve unique Slug
  let rawSlug = (data.slug || data.title || 'article')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  if (!rawSlug) rawSlug = `article-${Date.now()}`;

  const existingSlugPost = await db.query.posts.findFirst({
    where: eq(posts.slug, rawSlug),
    columns: { id: true },
  });
  if (existingSlugPost) {
    rawSlug = `${rawSlug}-${Math.random().toString(36).substring(2, 6)}`;
  }
  const resolvedSlug = rawSlug;

  const postId = data.id || `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const readingTime = typeof data.readingTime === 'number'
    ? data.readingTime
    : Math.max(1, Math.ceil((data.content || '').split(/\s+/).length / 200));

  const featuredImage =
    data.featuredImage && typeof data.featuredImage === 'string' && data.featuredImage.trim() !== ''
      ? data.featuredImage.trim()
      : 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80';

  const validStatuses = ['published', 'draft', 'pending', 'scheduled', 'trash'];
  const resolvedStatus = validStatuses.includes(String(data.status).toLowerCase())
    ? String(data.status).toLowerCase()
    : 'published';

  const publishedAt =
    resolvedStatus === 'published'
      ? data.publishedAt
        ? new Date(data.publishedAt)
        : new Date()
      : data.publishedAt
      ? new Date(data.publishedAt)
      : null;

  const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;

  try {
    // Run in a database transaction
    await db.transaction(async (tx) => {
      // 1. Insert Post
      await tx.insert(posts).values({
        id: postId,
        title: data.title.trim(),
        slug: resolvedSlug,
        content: data.content || '',
        excerpt: data.excerpt || (data.content ? data.content.slice(0, 180) : ''),
        featuredImage,
        featuredImageCaption: data.featuredImageCaption?.trim() || null,
        authorId: resolvedAuthorId,
        categoryId: resolvedCategoryId,
        subCategoryId: resolvedSubCategoryId,
        status: resolvedStatus,
        isFeatured: Boolean(data.isFeatured),
        isTrending: Boolean(data.isTrending),
        isEditorPick: Boolean(data.isEditorPick),
        views: typeof data.views === 'number' ? data.views : 0,
        likes: typeof data.likes === 'number' ? data.likes : 0,
        readingTime,
        publishedAt,
        scheduledAt,
        seoTitle: data.seoTitle?.trim() || data.title.trim(),
        metaDescription: data.metaDescription?.trim() || data.excerpt || null,
        focusKeyword: data.focusKeyword?.trim() || null,
        canonicalUrl: data.canonicalUrl?.trim() || null,
        ogImage: data.ogImage?.trim() || featuredImage,
        blocks: Array.isArray(data.blocks) ? data.blocks : [],
        faqs: Array.isArray(data.faqs) ? data.faqs : [],
        relatedPostIds: Array.isArray(data.relatedPostIds) ? data.relatedPostIds : [],
        allowComments: data.allowComments !== false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 2. Link Tags (support tagIds, tagNames array, tags array of strings/objects, or comma-separated string)
      const tagsToLink: string[] = [];
      if (Array.isArray(data.tagIds)) {
        tagsToLink.push(...data.tagIds);
      }
      if (Array.isArray(data.tagNames)) {
        tagsToLink.push(...data.tagNames);
      }
      if (Array.isArray(data.tags)) {
        for (const t of data.tags) {
          if (typeof t === 'string') {
            tagsToLink.push(t);
          } else if (t && typeof t === 'object') {
            if (t.name) tagsToLink.push(t.name);
            else if (t.slug) tagsToLink.push(t.slug);
            else if (t.id) tagsToLink.push(t.id);
          }
        }
      }
      if (typeof data.tags === 'string') {
        tagsToLink.push(...data.tags.split(',').map((t: string) => t.trim()));
      }

      if (tagsToLink.length > 0) {
        const uniqueTagStrings = Array.from(
          new Set(
            tagsToLink
              .map((t) => (typeof t === 'string' ? t.trim().replace(/^#+/, '').trim() : ''))
              .filter((t) => t.length > 0)
          )
        );
        const allDbTags = await tx.select().from(tags);

        for (const cleanTag of uniqueTagStrings) {
          const tagSlug =
            cleanTag
              .toLowerCase()
              .replace(/[^a-z0-9-_]+/g, '-')
              .replace(/(^-|-$)+/g, '') || `tag-${Date.now()}`;

          let matchedTag = allDbTags.find(
            (t) =>
              t.id === cleanTag ||
              t.name.toLowerCase() === cleanTag.toLowerCase() ||
              t.slug.toLowerCase() === cleanTag.toLowerCase() ||
              t.slug.toLowerCase() === tagSlug
          );

          if (!matchedTag) {
            const tagId = `tag_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            try {
              const [createdTag] = await tx
                .insert(tags)
                .values({
                  id: tagId,
                  name: cleanTag,
                  slug: tagSlug,
                  createdAt: new Date(),
                })
                .onConflictDoNothing()
                .returning();

              matchedTag = createdTag || (await tx.query.tags.findFirst({ where: eq(tags.slug, tagSlug) })) || undefined;
            } catch (err) {
              matchedTag = (await tx.query.tags.findFirst({ where: eq(tags.slug, tagSlug) })) || undefined;
            }

            if (matchedTag) {
              allDbTags.push(matchedTag);
            }
          }

          if (matchedTag) {
            await tx
              .insert(postTags)
              .values({
                id: `${postId}_${matchedTag.id}`,
                postId,
                tagId: matchedTag.id,
              })
              .onConflictDoNothing();
          }
        }
      }

      // 3. Create initial revision
      await tx.insert(postRevisions).values({
        id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        postId,
        title: data.title.trim(),
        content: data.content || '',
        excerpt: data.excerpt || '',
        authorId: resolvedAuthorId,
        authorName: resolvedAuthorName,
        createdAt: new Date(),
      });

      // 4. Log Activity
      await tx.insert(activityLogs).values({
        id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: resolvedAuthorId,
        userName: resolvedAuthorName,
        userAvatar: resolvedAuthorAvatar,
        action: 'create',
        targetType: 'post',
        targetId: postId,
        targetTitle: data.title.trim(),
        timestamp: new Date(),
      });
    });

    const fullPost = await getPostBySlug(resolvedSlug);
    return fullPost;
  } catch (error: any) {
    console.error('createPost failed:', error);
    const detail = error?.cause?.message || error?.detail || error?.message || 'Database query for post creation failed';
    throw new Error(`Failed to create post: ${detail}`, { cause: error });
  }
}

export async function updatePost(id: string, data: any) {
  try {
    return await db.transaction(async (tx) => {
      const existingPost = await tx.query.posts.findFirst({
        where: eq(posts.id, id),
      });

      if (!existingPost) {
        throw new Error(`Post with id ${id} not found`);
      }

      const readingTime = data.content
        ? Math.max(1, Math.ceil(data.content.split(/\s+/).length / 200))
        : undefined;

      const updateFields: any = {
        updatedAt: new Date(),
      };

      if (data.title !== undefined) updateFields.title = data.title.trim();
      if (data.slug !== undefined) {
        const cleanSlug = data.slug.trim().toLowerCase().replace(/[^a-z0-9-_]+/g, '-');
        updateFields.slug = cleanSlug;
      }
      if (data.content !== undefined) updateFields.content = data.content;
      if (data.excerpt !== undefined) updateFields.excerpt = data.excerpt;
      if (data.featuredImage !== undefined) updateFields.featuredImage = data.featuredImage;
      if (data.featuredImageCaption !== undefined) updateFields.featuredImageCaption = data.featuredImageCaption;

      // Author resolution if updated
      if (data.authorId !== undefined) {
        const allUsers = await tx.select().from(users);
        const matchedUser = allUsers.find(
          (u) =>
            u.id === data.authorId ||
            u.username?.toLowerCase() === String(data.authorId).toLowerCase() ||
            u.email?.toLowerCase() === String(data.authorId).toLowerCase()
        );
        if (matchedUser) {
          updateFields.authorId = matchedUser.id;
        }
      }

      // Category resolution if updated
      if (data.categoryId !== undefined) {
        const allCategories = await tx.select().from(categories);
        const matchedCat = allCategories.find(
          (c) =>
            c.id === data.categoryId ||
            c.slug?.toLowerCase() === String(data.categoryId).toLowerCase() ||
            c.name?.toLowerCase() === String(data.categoryId).toLowerCase()
        );
        if (matchedCat) {
          updateFields.categoryId = matchedCat.id;
        }
      }

      // SubCategory resolution if updated
      if (data.subCategoryId !== undefined) {
        if (!data.subCategoryId || data.subCategoryId === 'null' || data.subCategoryId === 'none') {
          updateFields.subCategoryId = null;
        } else {
          const allCategories = await tx.select().from(categories);
          const matchedSub = allCategories.find(
            (c) =>
              c.id === data.subCategoryId ||
              c.slug?.toLowerCase() === String(data.subCategoryId).toLowerCase() ||
              c.name?.toLowerCase() === String(data.subCategoryId).toLowerCase()
          );
          updateFields.subCategoryId = matchedSub ? matchedSub.id : null;
        }
      }

      if (data.status !== undefined) {
        const validStatuses = ['published', 'draft', 'pending', 'scheduled', 'trash'];
        const resolvedStatus = validStatuses.includes(String(data.status).toLowerCase())
          ? String(data.status).toLowerCase()
          : 'published';
        updateFields.status = resolvedStatus;

        if (resolvedStatus === 'published' && !existingPost.publishedAt) {
          updateFields.publishedAt = new Date();
        }
      }

      if (data.publishedAt !== undefined) updateFields.publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;
      if (data.scheduledAt !== undefined) updateFields.scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;
      if (data.isFeatured !== undefined) updateFields.isFeatured = Boolean(data.isFeatured);
      if (data.isTrending !== undefined) updateFields.isTrending = Boolean(data.isTrending);
      if (data.isEditorPick !== undefined) updateFields.isEditorPick = Boolean(data.isEditorPick);
      if (readingTime) updateFields.readingTime = readingTime;
      if (data.seoTitle !== undefined) updateFields.seoTitle = data.seoTitle;
      if (data.metaDescription !== undefined) updateFields.metaDescription = data.metaDescription;
      if (data.focusKeyword !== undefined) updateFields.focusKeyword = data.focusKeyword;
      if (data.canonicalUrl !== undefined) updateFields.canonicalUrl = data.canonicalUrl;
      if (data.ogImage !== undefined) updateFields.ogImage = data.ogImage;
      if (data.blocks !== undefined) updateFields.blocks = Array.isArray(data.blocks) ? data.blocks : [];
      if (data.faqs !== undefined) updateFields.faqs = Array.isArray(data.faqs) ? data.faqs : [];
      if (data.relatedPostIds !== undefined) updateFields.relatedPostIds = Array.isArray(data.relatedPostIds) ? data.relatedPostIds : [];
      if (data.allowComments !== undefined) updateFields.allowComments = Boolean(data.allowComments);

      await tx
        .update(posts)
        .set(updateFields)
        .where(eq(posts.id, id));

      // Update tags if provided
      const tagsToLink: string[] = [];
      if (Array.isArray(data.tagIds)) tagsToLink.push(...data.tagIds);
      if (Array.isArray(data.tagNames)) tagsToLink.push(...data.tagNames);
      if (Array.isArray(data.tags)) {
        for (const t of data.tags) {
          if (typeof t === 'string') {
            tagsToLink.push(t);
          } else if (t && typeof t === 'object') {
            if (t.name) tagsToLink.push(t.name);
            else if (t.slug) tagsToLink.push(t.slug);
            else if (t.id) tagsToLink.push(t.id);
          }
        }
      }
      if (typeof data.tags === 'string') tagsToLink.push(...data.tags.split(',').map((t: string) => t.trim()));

      const tagsProvided =
        Array.isArray(data.tagIds) ||
        Array.isArray(data.tagNames) ||
        Array.isArray(data.tags) ||
        typeof data.tags === 'string';

      if (tagsProvided) {
        await tx.delete(postTags).where(eq(postTags.postId, id));

        if (tagsToLink.length > 0) {
          const uniqueTagStrings = Array.from(
            new Set(
              tagsToLink
                .map((t) => (typeof t === 'string' ? t.trim().replace(/^#+/, '').trim() : ''))
                .filter((t) => t.length > 0)
            )
          );
          const allDbTags = await tx.select().from(tags);

          for (const cleanTag of uniqueTagStrings) {
            const tagSlug =
              cleanTag
                .toLowerCase()
                .replace(/[^a-z0-9-_]+/g, '-')
                .replace(/(^-|-$)+/g, '') || `tag-${Date.now()}`;

            let matchedTag = allDbTags.find(
              (t) =>
                t.id === cleanTag ||
                t.name.toLowerCase() === cleanTag.toLowerCase() ||
                t.slug.toLowerCase() === cleanTag.toLowerCase() ||
                t.slug.toLowerCase() === tagSlug
            );

            if (!matchedTag) {
              const tagId = `tag_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
              try {
                const [createdTag] = await tx
                  .insert(tags)
                  .values({
                    id: tagId,
                    name: cleanTag,
                    slug: tagSlug,
                    createdAt: new Date(),
                  })
                  .onConflictDoNothing()
                  .returning();

                matchedTag = createdTag || (await tx.query.tags.findFirst({ where: eq(tags.slug, tagSlug) })) || undefined;
              } catch (err) {
                matchedTag = (await tx.query.tags.findFirst({ where: eq(tags.slug, tagSlug) })) || undefined;
              }

              if (matchedTag) {
                allDbTags.push(matchedTag);
              }
            }

            if (matchedTag) {
              await tx
                .insert(postTags)
                .values({
                  id: `${id}_${matchedTag.id}`,
                  postId: id,
                  tagId: matchedTag.id,
                })
                .onConflictDoNothing();
            }
          }
        }
      }

      // Save revision
      if (data.content || data.title) {
        await tx.insert(postRevisions).values({
          id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          postId: id,
          title: updateFields.title || existingPost.title,
          content: updateFields.content || existingPost.content,
          excerpt: updateFields.excerpt || existingPost.excerpt,
          authorId: updateFields.authorId || existingPost.authorId,
          authorName: data.authorName || 'Author',
          createdAt: new Date(),
        });
      }

      const updatedFullPost = await getPostBySlug(updateFields.slug || existingPost.slug);
      return updatedFullPost;
    });
  } catch (error: any) {
    console.error('updatePost failed:', error);
    const detail = error?.cause?.message || error?.detail || error?.message || 'Database query for post update failed';
    throw new Error(`Failed to update post: ${detail}`, { cause: error });
  }
}

export async function deletePost(id: string, permanent: boolean = false) {
  if (permanent) {
    return await permanentDeletePost(id);
  } else {
    return await trashPost(id);
  }
}

export async function incrementPostViews(slugOrId: string) {
  try {
    await db
      .update(posts)
      .set({ views: sql`${posts.views} + 1` })
      .where(or(eq(posts.slug, slugOrId), eq(posts.id, slugOrId)));
  } catch (error) {
    console.error('Failed to increment views:', error);
  }
}

export async function incrementPostLikes(slugOrId: string) {
  try {
    const [updated] = await db
      .update(posts)
      .set({ likes: sql`${posts.likes} + 1` })
      .where(or(eq(posts.slug, slugOrId), eq(posts.id, slugOrId)))
      .returning();
    return updated;
  } catch (error) {
    console.error('Failed to increment likes:', error);
    return null;
  }
}

export async function getPostById(id: string) {
  return await getPostBySlug(id);
}

// ----------------------------------------------------
// CATEGORIES REPOSITORY
// ----------------------------------------------------
export async function getCategories() {
  try {
    const rawCategories = await db.query.categories.findMany({
      where: eq(categories.isTrashed, false),
      orderBy: (c) => c.order,
      with: {
        parent: true,
        posts: {
          columns: { id: true },
        },
      },
    });

    return rawCategories.map((c) => {
      const isFoodWine =
        c.id === 'cat_food' ||
        c.slug.trim().toLowerCase() === 'food' ||
        c.slug.trim().toLowerCase() === 'food-wine' ||
        (c.name && c.name.toLowerCase().includes('food') && !c.parentId);
      const canonicalSlug = isFoodWine ? 'food-wine' : c.slug;

      return {
        id: c.id,
        name: c.name,
        slug: canonicalSlug,
        description: c.description || undefined,
        parentId: c.parentId || null,
        parentName: c.parent?.name || undefined,
        color: c.color || '#E11D48',
        image: c.image || undefined,
        seoTitle: c.seoTitle || undefined,
        metaDescription: c.metaDescription || undefined,
        order: c.order ?? 0,
        postCount: c.posts?.length || 0,
        createdAt: c.createdAt.toISOString(),
      };
    });
  } catch (error) {
    console.warn('getCategories query failed, falling back to INITIAL_CATEGORIES:', error);
    return INITIAL_CATEGORIES;
  }
}

export async function getTrendingSubcategories(): Promise<Record<string, any[]>> {
  try {
    const allCategories = await db.query.categories.findMany({
      where: eq(categories.isTrashed, false),
      orderBy: (c) => c.order,
    });

    const parentCategories = allCategories.filter((c) => !c.parentId);
    const subCategories = allCategories.filter((c) => Boolean(c.parentId));

    const allPosts = await db.query.posts.findMany({
      where: and(eq(posts.status, 'published'), eq(posts.isTrashed, false)),
      columns: {
        id: true,
        categoryId: true,
        subCategoryId: true,
        views: true,
        likes: true,
        publishedAt: true,
        createdAt: true,
      },
    });

    const result: Record<string, any[]> = {};
    const now = Date.now();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    for (const parent of parentCategories) {
      const children = subCategories.filter((c) => c.parentId === parent.id);

      if (children.length === 0) {
        result[parent.id] = [];
        if (parent.slug) result[parent.slug] = [];
        continue;
      }

      const scoredChildren = children.map((sub) => {
        const subPosts = allPosts.filter(
          (p) => p.subCategoryId === sub.id || p.categoryId === sub.id
        );

        let totalViews = 0;
        let totalLikes = 0;
        let recentPostCount = 0;
        let latestPublishedAtMs = 0;

        for (const post of subPosts) {
          totalViews += post.views || 0;
          totalLikes += post.likes || 0;
          const pubDate = post.publishedAt || post.createdAt;
          if (pubDate && new Date(pubDate) >= thirtyDaysAgo) {
            recentPostCount++;
          }
          if (pubDate) {
            const ms = new Date(pubDate).getTime();
            if (ms > latestPublishedAtMs) {
              latestPublishedAtMs = ms;
            }
          }
        }

        let recencyScore = 0;
        if (latestPublishedAtMs > 0) {
          const daysOld = (now - latestPublishedAtMs) / (1000 * 60 * 60 * 24);
          recencyScore = Math.max(0, 100 - daysOld * 2);
        }

        const postCount = subPosts.length;
        const trendingScore =
          totalViews * 1.5 +
          totalLikes * 3.0 +
          postCount * 20.0 +
          recentPostCount * 50.0 +
          recencyScore;

        return {
          id: sub.id,
          name: sub.name,
          slug: sub.slug,
          description: sub.description || undefined,
          parentId: sub.parentId || null,
          color: sub.color || '#E11D48',
          order: sub.order ?? 0,
          postCount,
          trendingScore,
          createdAt: sub.createdAt ? sub.createdAt.toISOString() : new Date().toISOString(),
        };
      });

      scoredChildren.sort((a, b) => {
        if (b.trendingScore !== a.trendingScore) {
          return b.trendingScore - a.trendingScore;
        }
        if (a.order !== b.order) {
          return a.order - b.order;
        }
        return a.name.localeCompare(b.name);
      });

      const top5 = scoredChildren.slice(0, 5);
      result[parent.id] = top5;
      if (parent.slug) {
        result[parent.slug] = top5;
      }
    }

    return result;
  } catch (error) {
    console.error('getTrendingSubcategories query failed:', error);
    return {};
  }
}

export async function createCategory(data: any) {
  const validation = validateCategoryPayload(data);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  const cleanName = data.name.trim();
  const cleanSlug = data.slug.trim().toLowerCase();

  // Fetch ALL categories from database (including trashed ones)
  const allDbCategories = await db.select().from(categories);

  // Check if a category with the same slug or name already exists
  const existingCategoryBySlugOrName = allDbCategories.find((c) => {
    const isSameSlug = c.slug.toLowerCase() === cleanSlug;
    const isSameName = c.name.toLowerCase() === cleanName.toLowerCase();
    return isSameSlug || isSameName;
  });

  if (existingCategoryBySlugOrName) {
    if (existingCategoryBySlugOrName.isTrashed) {
      throw new Error(
        `A category named "${existingCategoryBySlugOrName.name}" (slug: ${existingCategoryBySlugOrName.slug}) already exists in Trash. Please restore it from Trash or choose a different name/slug.`
      );
    } else {
      throw new Error(
        `A category named "${existingCategoryBySlugOrName.name}" with slug "${existingCategoryBySlugOrName.slug}" already exists.`
      );
    }
  }

  // Generate a safe unique ID
  let categoryId = data.id || `cat_${cleanSlug.replace(/[^a-z0-9]/g, '_')}`;
  const existingCategoryById = allDbCategories.find((c) => c.id === categoryId);
  if (existingCategoryById) {
    categoryId = `${categoryId}_${Date.now().toString(36)}`;
  }

  // Resolve parentId safely if provided
  let resolvedParentId: string | null = null;
  if (data.parentId && data.parentId !== 'none' && data.parentId !== 'null') {
    const parentCat = allDbCategories.find(
      (c) =>
        !c.isTrashed &&
        (c.id === data.parentId ||
          c.slug.toLowerCase() === String(data.parentId).toLowerCase() ||
          c.name.toLowerCase() === String(data.parentId).toLowerCase())
    );
    if (parentCat) {
      resolvedParentId = parentCat.id;
    }
  }

  try {
    const [newCat] = await db
      .insert(categories)
      .values({
        id: categoryId,
        name: cleanName,
        slug: cleanSlug,
        description: data.description ? String(data.description).trim() : null,
        parentId: resolvedParentId,
        color: data.color || '#E11D48',
        image: data.image ? String(data.image).trim() : null,
        seoTitle: data.seoTitle ? String(data.seoTitle).trim() : null,
        metaDescription: data.metaDescription ? String(data.metaDescription).trim() : null,
        order: Number(data.order) || 0,
        isTrashed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return newCat;
  } catch (error: any) {
    console.error('Error inserting category into database:', error);
    if (error?.code === '23505' || error?.message?.includes('unique constraint') || error?.cause?.code === '23505') {
      throw new Error(`A category with this name, slug, or ID already exists.`);
    }
    const detail = error?.cause?.message || error?.detail || error?.message || 'Failed to insert category';
    throw new Error(`Category creation failed: ${detail}`);
  }
}

export async function updateCategory(id: string, data: any) {
  if (data.parentId === id) {
    throw new Error('A category cannot be its own parent');
  }

  const allCats = await db.select().from(categories);
  const existingCat = allCats.find((c) => c.id === id);
  if (!existingCat) {
    throw new Error(`Category with ID ${id} not found`);
  }

  if (data.slug || data.name) {
    const newSlug = data.slug ? data.slug.trim().toLowerCase() : existingCat.slug;
    const newName = data.name ? data.name.trim() : existingCat.name;

    const duplicate = allCats.find(
      (c) =>
        c.id !== id &&
        (c.slug.toLowerCase() === newSlug || c.name.toLowerCase() === newName.toLowerCase())
    );

    if (duplicate) {
      if (duplicate.isTrashed) {
        throw new Error(
          `A category named "${duplicate.name}" (slug: ${duplicate.slug}) already exists in Trash. Please restore it or choose a different name/slug.`
        );
      } else {
        throw new Error(`A category named "${duplicate.name}" with slug "${duplicate.slug}" already exists.`);
      }
    }
  }

  // Circular dependency check
  let resolvedParentId: string | null = existingCat.parentId;
  if (data.parentId !== undefined) {
    if (!data.parentId || data.parentId === 'none' || data.parentId === 'null') {
      resolvedParentId = null;
    } else {
      const parentCat = allCats.find(
        (c) =>
          c.id === data.parentId ||
          c.slug.toLowerCase() === String(data.parentId).toLowerCase() ||
          c.name.toLowerCase() === String(data.parentId).toLowerCase()
      );
      if (parentCat) {
        resolvedParentId = parentCat.id;
      } else {
        resolvedParentId = null;
      }
    }
  }

  if (resolvedParentId) {
    let currentParentId: string | null = resolvedParentId;
    const visited = new Set<string>();
    while (currentParentId) {
      if (currentParentId === id) {
        throw new Error('Circular category parent relationship detected');
      }
      if (visited.has(currentParentId)) break;
      visited.add(currentParentId);
      const parentCat = allCats.find((c) => c.id === currentParentId);
      currentParentId = parentCat?.parentId || null;
    }
  }

  const updateFields: any = {
    updatedAt: new Date(),
  };

  if (data.name !== undefined) updateFields.name = data.name.trim();
  if (data.slug !== undefined) updateFields.slug = data.slug.trim().toLowerCase();
  if (data.description !== undefined) {
    updateFields.description = data.description && String(data.description).trim() ? String(data.description).trim() : null;
  }
  updateFields.parentId = resolvedParentId;
  if (data.color !== undefined) updateFields.color = data.color || '#E11D48';
  if (data.image !== undefined) {
    updateFields.image = data.image && String(data.image).trim() ? String(data.image).trim() : null;
  }
  if (data.seoTitle !== undefined) {
    updateFields.seoTitle = data.seoTitle && String(data.seoTitle).trim() ? String(data.seoTitle).trim() : null;
  }
  if (data.metaDescription !== undefined) {
    updateFields.metaDescription = data.metaDescription && String(data.metaDescription).trim() ? String(data.metaDescription).trim() : null;
  }
  if (data.order !== undefined) updateFields.order = Number(data.order) || 0;

  try {
    const [updatedCat] = await db
      .update(categories)
      .set(updateFields)
      .where(eq(categories.id, id))
      .returning();

    return updatedCat;
  } catch (error: any) {
    console.error('Error updating category:', error);
    if (error?.code === '23505' || error?.cause?.code === '23505') {
      throw new Error(`A category with this name or slug already exists.`);
    }
    const detail = error?.cause?.message || error?.detail || error?.message || 'Failed to update category';
    throw new Error(`Category update failed: ${detail}`);
  }
}

export async function deleteCategory(id: string) {
  return await trashCategory(id);
}

// ----------------------------------------------------
// TAGS REPOSITORY
// ----------------------------------------------------
export async function getTags() {
  try {
    const rawTags = await db.query.tags.findMany({
      where: eq(tags.isTrashed, false),
      orderBy: [desc(tags.createdAt)],
      with: {
        postTags: {
          with: {
            post: true,
          },
        },
      },
    });

    return rawTags.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      description: t.description || undefined,
      postCount: Array.isArray(t.postTags)
        ? t.postTags.filter((pt) => pt.post && !pt.post.isTrashed).length
        : 0,
      createdAt: t.createdAt.toISOString(),
    }));
  } catch (error) {
    console.warn('getTags failed, falling back to INITIAL_TAGS:', error);
    return INITIAL_TAGS;
  }
}

export async function createTag(data: any) {
  const validation = validateTagPayload(data);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  const cleanName = data.name.trim().replace(/^#+/, '').trim();
  const cleanSlug =
    data.slug
      .trim()
      .toLowerCase()
      .replace(/^#+/, '')
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/(^-|-$)+/g, '') || `tag-${Date.now()}`;

  // Check if tag with this slug already exists
  const existing = await db.query.tags.findFirst({
    where: eq(tags.slug, cleanSlug),
  });

  if (existing) {
    if (existing.isTrashed) {
      const [restored] = await db
        .update(tags)
        .set({
          name: cleanName,
          description: data.description !== undefined ? (data.description ? data.description.trim() : null) : existing.description,
          isTrashed: false,
          trashedAt: null,
        })
        .where(eq(tags.id, existing.id))
        .returning();
      return restored;
    }
    throw new Error(`A tag with slug "${cleanSlug}" already exists.`);
  }

  const tagId = data.id || `tag_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const [newTag] = await db
    .insert(tags)
    .values({
      id: tagId,
      name: cleanName,
      slug: cleanSlug,
      description: data.description ? data.description.trim() : null,
      isTrashed: false,
      createdAt: new Date(),
    })
    .returning();

  return newTag;
}

export async function updateTag(id: string, data: any) {
  const cleanName = data.name !== undefined ? data.name.trim().replace(/^#+/, '').trim() : undefined;
  const cleanSlug = data.slug !== undefined
    ? data.slug
        .trim()
        .toLowerCase()
        .replace(/^#+/, '')
        .replace(/[^a-z0-9-_]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    : undefined;

  if (cleanName !== undefined && cleanName.length === 0) {
    throw new Error('Tag name is required');
  }

  if (cleanSlug) {
    const conflicting = await db.query.tags.findFirst({
      where: and(eq(tags.slug, cleanSlug), ne(tags.id, id), eq(tags.isTrashed, false)),
    });
    if (conflicting) {
      throw new Error(`A tag with slug "${cleanSlug}" already exists.`);
    }
  }

  const updateFields: any = {};
  if (cleanName !== undefined) updateFields.name = cleanName;
  if (cleanSlug !== undefined) updateFields.slug = cleanSlug;
  if (data.description !== undefined) {
    updateFields.description = data.description ? data.description.trim() : null;
  }

  const [updatedTag] = await db
    .update(tags)
    .set(updateFields)
    .where(eq(tags.id, id))
    .returning();

  return updatedTag;
}

export async function deleteTag(id: string) {
  return await trashTag(id);
}

// ----------------------------------------------------
// MEDIA REPOSITORY
// ----------------------------------------------------
export async function getMedia() {
  try {
    const rawMedia = await db.query.media.findMany({
      orderBy: (m) => desc(m.createdAt),
      with: {
        uploader: true,
      },
    });

    return rawMedia.map((m) => ({
      id: m.id,
      title: m.title,
      fileName: m.fileName,
      url: m.url,
      thumbnailUrl: m.thumbnailUrl || m.url,
      mimeType: m.mimeType,
      fileSize: m.fileSize,
      width: m.width || undefined,
      height: m.height || undefined,
      altText: m.altText || undefined,
      caption: m.caption || undefined,
      uploadedBy: m.uploadedBy,
      uploadedByName: m.uploadedByName || m.uploader?.name || 'Staff',
      createdAt: m.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('getMedia failed:', error);
    throw new Error('Database query for media failed', { cause: error });
  }
}

export async function createMedia(data: any) {
  if (!data.url || !data.title || !data.uploadedBy) {
    throw new Error('Title, URL, and uploadedBy are required for media');
  }

  const mediaId = data.id || `med_${Date.now()}`;
  const [newMedia] = await db
    .insert(media)
    .values({
      id: mediaId,
      title: data.title,
      fileName: data.fileName || 'upload.jpg',
      url: data.url,
      thumbnailUrl: data.thumbnailUrl || data.url,
      mimeType: data.mimeType || 'image/jpeg',
      fileSize: data.fileSize || 1024000,
      width: data.width || 1200,
      height: data.height || 800,
      altText: data.altText || null,
      caption: data.caption || null,
      uploadedBy: data.uploadedBy,
      uploadedByName: data.uploadedByName || null,
      createdAt: new Date(),
    })
    .returning();

  return newMedia;
}

export async function getMediaById(id: string) {
  try {
    const item = await db.query.media.findFirst({
      where: eq(media.id, id),
    });
    return item || null;
  } catch (error) {
    console.error('getMediaById failed:', error);
    return null;
  }
}

export async function deleteMedia(id: string) {
  return await db.delete(media).where(eq(media.id, id)).returning();
}

export const createMediaItem = createMedia;
export const deleteMediaItem = deleteMedia;

// ----------------------------------------------------
// PAGES REPOSITORY
// ----------------------------------------------------
export async function getPages() {
  try {
    let rawPages = await db.query.pages.findMany({
      where: eq(pages.isTrashed, false),
      orderBy: (p) => desc(p.createdAt),
      with: {
        author: true,
      },
    });

    if (rawPages.length === 0) {
      // Resolve a valid author from the users table
      const allUsers = await db.select().from(users);
      let defaultAuthorId = allUsers[0]?.id;
      let defaultAuthorName = allUsers[0]?.name || 'Editorial Staff';

      if (!defaultAuthorId) {
        const adminUser = {
          id: 'usr_admin_01',
          name: 'Elena Rostova',
          username: 'elena.rostova',
          email: 'hello@nayaandaaz.com',
          role: 'admin' as const,
        };
        await db.insert(users).values(adminUser).onConflictDoNothing();
        defaultAuthorId = 'usr_admin_01';
        defaultAuthorName = 'Elena Rostova';
      }

      const defaultPages = [
        {
          id: 'page_privacy',
          title: 'Privacy Policy',
          slug: 'privacy-policy',
          content: 'At Naya Andaaz, accessible from https://www.nayaandaaz.com, your privacy is one of our top priorities. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.',
          status: 'published',
          authorId: defaultAuthorId,
          authorName: defaultAuthorName,
          seoTitle: 'Privacy Policy | Naya Andaaz',
          metaDescription: 'Read the official Naya Andaaz Privacy Policy covering data protection, cookies, and user rights.',
          publishedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'page_about',
          title: 'About Us',
          slug: 'about-us',
          content: 'Naya Andaaz is an independent digital publication dedicated to modern culture, lifestyle, wellness, fashion, entertainment, and insightful perspectives.',
          status: 'published',
          authorId: defaultAuthorId,
          authorName: defaultAuthorName,
          seoTitle: 'About Us | Naya Andaaz',
          metaDescription: 'Learn about Naya Andaaz, our mission, editorial vision, and story.',
          publishedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'page_terms',
          title: 'Terms of Service',
          slug: 'terms-and-conditions',
          content: 'By accessing and utilizing Naya Andaaz, you agree to comply with and be bound by the following terms and conditions of use.',
          status: 'published',
          authorId: defaultAuthorId,
          authorName: defaultAuthorName,
          seoTitle: 'Terms of Service | Naya Andaaz',
          metaDescription: 'Official terms and conditions for readers and contributors of Naya Andaaz.',
          publishedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'page_contact',
          title: 'Contact Us',
          slug: 'contact-us',
          content: 'Reach out to our editorial desk, advertising collaborations, and reader inquiry desk at hello@nayaandaaz.com.',
          status: 'published',
          authorId: defaultAuthorId,
          authorName: defaultAuthorName,
          seoTitle: 'Contact Us | Naya Andaaz',
          metaDescription: 'Get in touch with Naya Andaaz editorial desk and press inquiries at hello@nayaandaaz.com.',
          publishedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      for (const p of defaultPages) {
        await db.insert(pages).values(p).onConflictDoNothing();
      }

      rawPages = await db.query.pages.findMany({
        where: eq(pages.isTrashed, false),
        orderBy: (p) => desc(p.createdAt),
        with: {
          author: true,
        },
      });
    }

    return rawPages.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      content: p.content,
      featuredImage: p.featuredImage || undefined,
      status: p.status as any,
      authorId: p.authorId,
      authorName: p.authorName || p.author?.name || 'Administrator',
      seoTitle: p.seoTitle || undefined,
      metaDescription: p.metaDescription || undefined,
      publishedAt: p.publishedAt ? p.publishedAt.toISOString() : p.createdAt.toISOString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.warn('getPages failed, falling back to INITIAL_PAGES:', error);
    return INITIAL_PAGES;
  }
}

export async function getPageById(id: string) {
  try {
    const p = await db.query.pages.findFirst({
      where: and(eq(pages.id, id), eq(pages.isTrashed, false)),
      with: {
        author: true,
      },
    });

    if (!p) return null;

    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      content: p.content,
      featuredImage: p.featuredImage || undefined,
      status: p.status as any,
      authorId: p.authorId,
      authorName: p.authorName || p.author?.name || 'Administrator',
      seoTitle: p.seoTitle || undefined,
      metaDescription: p.metaDescription || undefined,
      publishedAt: p.publishedAt ? p.publishedAt.toISOString() : p.createdAt.toISOString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  } catch (error) {
    console.warn('getPageById failed, falling back to INITIAL_PAGES:', error);
    const matched = INITIAL_PAGES.find((page) => page.id === id);
    return matched || null;
  }
}

export async function getPageBySlug(slug: string) {
  try {
    const p = await db.query.pages.findFirst({
      where: and(eq(pages.slug, slug.toLowerCase().trim()), eq(pages.isTrashed, false)),
      with: {
        author: true,
      },
    });

    if (!p) return null;

    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      content: p.content,
      featuredImage: p.featuredImage || undefined,
      status: p.status as any,
      authorId: p.authorId,
      authorName: p.authorName || p.author?.name || 'Administrator',
      seoTitle: p.seoTitle || undefined,
      metaDescription: p.metaDescription || undefined,
      publishedAt: p.publishedAt ? p.publishedAt.toISOString() : p.createdAt.toISOString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  } catch (error) {
    console.warn('getPageBySlug failed, falling back to INITIAL_PAGES:', error);
    const matched = INITIAL_PAGES.find(
      (page) => page.slug.toLowerCase() === slug.toLowerCase().trim()
    );
    return matched || null;
  }
}

export async function createPage(data: any) {
  if (!data.title || !data.slug) {
    throw new Error('Title and slug are required for page');
  }

  // 1. Resolve valid author from the users table
  let resolvedAuthorId = data.authorId;
  let resolvedAuthorName = data.authorName;

  const allUsers = await db.select().from(users);
  let matchedUser = allUsers.find(
    (u) =>
      u.id === data.authorId ||
      (data.authorId && u.username?.toLowerCase() === String(data.authorId).toLowerCase()) ||
      (data.authorId && u.email?.toLowerCase() === String(data.authorId).toLowerCase()) ||
      (data.authorName && u.name?.toLowerCase() === String(data.authorName).toLowerCase())
  );

  if (!matchedUser && allUsers.length > 0) {
    matchedUser = allUsers[0];
  }

  if (matchedUser) {
    resolvedAuthorId = matchedUser.id;
    resolvedAuthorName = matchedUser.name;
  } else {
    const defaultUser = {
      id: 'usr_admin_01',
      name: 'Elena Rostova',
      username: 'elena.rostova',
      email: 'hello@nayaandaaz.com',
      role: 'admin' as const,
    };
    await db.insert(users).values(defaultUser).onConflictDoNothing();
    resolvedAuthorId = 'usr_admin_01';
    resolvedAuthorName = 'Elena Rostova';
  }

  // 2. Resolve Unique Slug
  let cleanSlug = data.slug
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  if (!cleanSlug) cleanSlug = `page-${Date.now()}`;

  const existingSlugPage = await db.query.pages.findFirst({
    where: and(eq(pages.slug, cleanSlug), eq(pages.isTrashed, false)),
    columns: { id: true },
  });
  if (existingSlugPage && (!data.id || existingSlugPage.id !== data.id)) {
    cleanSlug = `${cleanSlug}-${Math.random().toString(36).substring(2, 6)}`;
  }

  const pageId = data.id || `page_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const validStatus = ['published', 'draft', 'trash'].includes(data.status) ? data.status : 'published';

  const [newPage] = await db
    .insert(pages)
    .values({
      id: pageId,
      title: data.title.trim(),
      slug: cleanSlug,
      content: typeof data.content === 'string' ? data.content : '',
      featuredImage: data.featuredImage?.trim() || null,
      status: validStatus,
      authorId: resolvedAuthorId,
      authorName: resolvedAuthorName || 'Editorial Staff',
      seoTitle: data.seoTitle?.trim() || (data.title ? `${data.title.trim()} — Naya Andaaz` : null),
      metaDescription: data.metaDescription?.trim() || null,
      isTrashed: false,
      trashedAt: null,
      publishedAt: validStatus === 'published' ? (data.publishedAt ? new Date(data.publishedAt) : new Date()) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return newPage;
}

export async function updatePage(id: string, data: any) {
  const updateData: any = {
    updatedAt: new Date(),
  };

  if (data.title !== undefined) updateData.title = data.title.trim();
  if (data.slug !== undefined) {
    updateData.slug = data.slug
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  if (data.content !== undefined) updateData.content = data.content;
  if (data.featuredImage !== undefined) updateData.featuredImage = data.featuredImage?.trim() || null;
  if (data.status !== undefined) {
    updateData.status = data.status;
    if (data.status === 'published' && !data.publishedAt) {
      updateData.publishedAt = new Date();
    }
  }
  if (data.authorId !== undefined) {
    const allUsers = await db.select().from(users);
    const matchedUser = allUsers.find((u) => u.id === data.authorId);
    if (matchedUser) {
      updateData.authorId = matchedUser.id;
      updateData.authorName = matchedUser.name;
    }
  }
  if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle?.trim() || null;
  if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription?.trim() || null;

  const [updatedPage] = await db
    .update(pages)
    .set(updateData)
    .where(eq(pages.id, id))
    .returning();

  return updatedPage;
}

export async function deletePage(id: string) {
  return await trashPage(id);
}

// ----------------------------------------------------
// USERS REPOSITORY
// ----------------------------------------------------
export async function getUsers() {
  try {
    const rawUsers = await db.query.users.findMany({
      where: eq(users.isTrashed, false),
      with: {
        posts: {
          columns: { id: true },
        },
      },
    });

    return rawUsers.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      role: u.role as any,
      avatar: u.avatar,
      bio: u.bio || undefined,
      website: u.website || undefined,
      twitter: u.twitter || undefined,
      facebook: u.facebook || undefined,
      instagram: u.instagram || undefined,
      linkedin: u.linkedin || undefined,
      isActive: u.isActive,
      postsCount: u.posts?.length || 0,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.warn('getUsers failed, falling back to INITIAL_USERS:', error);
    return INITIAL_USERS;
  }
}

export async function getUserById(id: string) {
  try {
    const u = await db.query.users.findFirst({
      where: and(eq(users.id, id), eq(users.isTrashed, false)),
    });
    if (!u) {
      const fallbackUser = INITIAL_USERS.find((usr) => usr.id === id);
      if (fallbackUser) return fallbackUser;
      if (id === 'usr_admin_01') {
        return {
          id: 'usr_admin_01',
          name: 'Elena Rostova',
          username: 'elena.rostova',
          email: 'hello@nayaandaaz.com',
          role: 'admin' as any,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          isActive: true,
          emailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      return null;
    }
    return {
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      role: u.role as any,
      avatar: u.avatar,
      bio: u.bio || undefined,
      website: u.website || undefined,
      twitter: u.twitter || undefined,
      facebook: u.facebook || undefined,
      instagram: u.instagram || undefined,
      linkedin: u.linkedin || undefined,
      isActive: u.isActive,
      emailVerified: u.emailVerified,
      passwordHash: u.passwordHash,
      verificationToken: u.verificationToken,
      verificationTokenExpires: u.verificationTokenExpires ? u.verificationTokenExpires.toISOString() : undefined,
      passwordResetToken: u.passwordResetToken,
      passwordResetTokenExpires: u.passwordResetTokenExpires ? u.passwordResetTokenExpires.toISOString() : undefined,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    };
  } catch (error) {
    console.warn('getUserById failed, falling back to INITIAL_USERS:', error);
    const fallbackUser = INITIAL_USERS.find((usr) => usr.id === id);
    if (fallbackUser) return fallbackUser;
    if (id === 'usr_admin_01') {
      return {
        id: 'usr_admin_01',
        name: 'Elena Rostova',
        username: 'elena.rostova',
        email: 'hello@nayaandaaz.com',
        role: 'admin' as any,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        isActive: true,
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    return null;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const u = await db.query.users.findFirst({
      where: and(sql`lower(${users.email}) = ${cleanEmail}`, eq(users.isTrashed, false)),
    });
    if (!u) return null;
    return {
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      role: u.role as any,
      avatar: u.avatar,
      bio: u.bio || undefined,
      website: u.website || undefined,
      twitter: u.twitter || undefined,
      facebook: u.facebook || undefined,
      instagram: u.instagram || undefined,
      linkedin: u.linkedin || undefined,
      isActive: u.isActive,
      emailVerified: u.emailVerified,
      passwordHash: u.passwordHash,
      verificationToken: u.verificationToken,
      verificationTokenExpires: u.verificationTokenExpires ? u.verificationTokenExpires.toISOString() : undefined,
      passwordResetToken: u.passwordResetToken,
      passwordResetTokenExpires: u.passwordResetTokenExpires ? u.passwordResetTokenExpires.toISOString() : undefined,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('getUserByEmail failed:', error);
    return null;
  }
}

export async function getUserByUsername(username: string) {
  try {
    const cleanUsername = username.toLowerCase().trim();
    const u = await db.query.users.findFirst({
      where: and(sql`lower(${users.username}) = ${cleanUsername}`, eq(users.isTrashed, false)),
    });
    if (!u) return null;
    return {
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      role: u.role as any,
      avatar: u.avatar,
      bio: u.bio || undefined,
      website: u.website || undefined,
      twitter: u.twitter || undefined,
      facebook: u.facebook || undefined,
      instagram: u.instagram || undefined,
      linkedin: u.linkedin || undefined,
      isActive: u.isActive,
      emailVerified: u.emailVerified,
      passwordHash: u.passwordHash,
      verificationToken: u.verificationToken,
      verificationTokenExpires: u.verificationTokenExpires ? u.verificationTokenExpires.toISOString() : undefined,
      passwordResetToken: u.passwordResetToken,
      passwordResetTokenExpires: u.passwordResetTokenExpires ? u.passwordResetTokenExpires.toISOString() : undefined,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('getUserByUsername failed:', error);
    return null;
  }
}

export async function getUserByVerificationToken(token: string) {
  try {
    const u = await db.query.users.findFirst({
      where: and(eq(users.verificationToken, token), eq(users.isTrashed, false)),
    });
    if (!u) return null;
    return {
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      role: u.role as any,
      avatar: u.avatar,
      isActive: u.isActive,
      emailVerified: u.emailVerified,
      verificationToken: u.verificationToken,
      verificationTokenExpires: u.verificationTokenExpires,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('getUserByVerificationToken failed:', error);
    return null;
  }
}

export async function getUserByResetToken(token: string) {
  try {
    const u = await db.query.users.findFirst({
      where: and(eq(users.passwordResetToken, token), eq(users.isTrashed, false)),
    });
    if (!u) return null;
    return {
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      role: u.role as any,
      avatar: u.avatar,
      isActive: u.isActive,
      emailVerified: u.emailVerified,
      passwordResetToken: u.passwordResetToken,
      passwordResetTokenExpires: u.passwordResetTokenExpires,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('getUserByResetToken failed:', error);
    return null;
  }
}

export async function verifyUserEmail(userId: string) {
  const [updated] = await db
    .update(users)
    .set({
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();
  return updated;
}

export async function setUserVerificationToken(userId: string, token: string, expires: Date) {
  const [updated] = await db
    .update(users)
    .set({
      verificationToken: token,
      verificationTokenExpires: expires,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();
  return updated;
}

export async function setUserPasswordResetToken(email: string, token: string, expires: Date) {
  const [updated] = await db
    .update(users)
    .set({
      passwordResetToken: token,
      passwordResetTokenExpires: expires,
      updatedAt: new Date(),
    })
    .where(eq(users.email, email.toLowerCase().trim()))
    .returning();
  return updated;
}

export async function resetUserPassword(userId: string, newPasswordHash: string) {
  const [updated] = await db
    .update(users)
    .set({
      passwordHash: newPasswordHash,
      passwordResetToken: null,
      passwordResetTokenExpires: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();
  return updated;
}

export async function deleteUser(id: string) {
  return await trashUser(id);
}

export async function createUser(data: any) {
  const userId = data.id || `usr_${Date.now()}`;
  const userUid = data.uid || userId;

  const cleanEmail = (data.email || '').toLowerCase().trim();
  const cleanUsername = (data.username || cleanEmail.split('@')[0] || userId).toLowerCase().trim();

  if (!cleanEmail) {
    throw new Error('Valid email address is required');
  }
  if (!data.name || !data.name.trim()) {
    throw new Error('Full name is required');
  }

  // Pre-check for duplicate email / username
  const existingEmail = await getUserByEmail(cleanEmail);
  if (existingEmail && existingEmail.id !== userId) {
    throw new Error(`A user with email "${cleanEmail}" already exists.`);
  }

  const existingUsername = await getUserByUsername(cleanUsername);
  if (existingUsername && existingUsername.id !== userId) {
    throw new Error(`A user with username "${cleanUsername}" already exists.`);
  }

  const hashedPassword = data.passwordHash || data.password || null;

  try {
    const [newUser] = await db
      .insert(users)
      .values({
        id: userId,
        uid: userUid,
        name: data.name.trim(),
        username: cleanUsername,
        email: cleanEmail,
        passwordHash: hashedPassword,
        role: data.role ? String(data.role).toUpperCase() : 'SUBSCRIBER',
        status: data.status || 'active',
        avatar: data.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
        bio: parseStringOrNull(data.bio),
        website: parseStringOrNull(data.website),
        twitter: parseStringOrNull(data.twitter),
        facebook: parseStringOrNull(data.facebook),
        instagram: parseStringOrNull(data.instagram),
        linkedin: parseStringOrNull(data.linkedin),
        isActive: data.isActive ?? true,
        emailVerified: data.emailVerified ?? false,
        verificationToken: parseStringOrNull(data.verificationToken),
        verificationTokenExpires: parseDateOrNull(data.verificationTokenExpires),
        passwordResetToken: parseStringOrNull(data.passwordResetToken),
        passwordResetTokenExpires: parseDateOrNull(data.passwordResetTokenExpires),
        isTrashed: data.isTrashed ?? false,
        trashedAt: parseDateOrNull(data.trashedAt),
        lastLogin: parseDateOrNull(data.lastLogin),
        createdAt: parseDateOrNull(data.createdAt) || new Date(),
        updatedAt: parseDateOrNull(data.updatedAt) || new Date(),
      })
      .returning();

    return newUser;
  } catch (error: any) {
    console.error('Error inserting user into database:', error);
    if (
      error?.code === '23505' ||
      error?.message?.includes('unique constraint') ||
      error?.cause?.code === '23505'
    ) {
      const detail = error?.detail || error?.cause?.detail || '';
      if (detail.includes('email')) {
        throw new Error(`A user with email "${cleanEmail}" already exists.`);
      }
      if (detail.includes('username')) {
        throw new Error(`A user with username "${cleanUsername}" already exists.`);
      }
      throw new Error(`A user with this email or username already exists.`);
    }
    const msg = error?.cause?.message || error?.detail || error?.message || 'Failed to create user account';
    throw new Error(`User creation failed: ${msg}`);
  }
}

export async function updateUser(id: string, data: any) {
  try {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.username !== undefined) updateData.username = data.username.toLowerCase().trim();
    if (data.email !== undefined) updateData.email = data.email.toLowerCase().trim();
    if (data.role !== undefined) updateData.role = String(data.role).toUpperCase();
    if (data.passwordHash || data.password) {
      updateData.passwordHash = data.passwordHash || data.password;
    }
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.bio !== undefined) updateData.bio = parseStringOrNull(data.bio);
    if (data.website !== undefined) updateData.website = parseStringOrNull(data.website);
    if (data.twitter !== undefined) updateData.twitter = parseStringOrNull(data.twitter);
    if (data.facebook !== undefined) updateData.facebook = parseStringOrNull(data.facebook);
    if (data.instagram !== undefined) updateData.instagram = parseStringOrNull(data.instagram);
    if (data.linkedin !== undefined) updateData.linkedin = parseStringOrNull(data.linkedin);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.emailVerified !== undefined) updateData.emailVerified = data.emailVerified;

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    return updated;
  } catch (error: any) {
    console.error('Error updating user in database:', error);
    if (
      error?.code === '23505' ||
      error?.message?.includes('unique constraint') ||
      error?.cause?.code === '23505'
    ) {
      throw new Error(`A user with this email or username already exists.`);
    }
    const msg = error?.cause?.message || error?.detail || error?.message || 'Failed to update user account';
    throw new Error(`User update failed: ${msg}`);
  }
}

// ----------------------------------------------------
// COMMENTS REPOSITORY
// ----------------------------------------------------
export async function getComments(params: { postId?: string; status?: string } = {}) {
  try {
    const conditions = [];
    if (params.postId) conditions.push(eq(comments.postId, params.postId));
    if (params.status) conditions.push(eq(comments.status, params.status));

    const raw = await db.query.comments.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: (c) => desc(c.createdAt),
    });

    return raw.map((c) => ({
      id: c.id,
      postId: c.postId,
      authorName: c.authorName,
      authorEmail: c.authorEmail,
      authorAvatar: c.authorAvatar || undefined,
      userId: c.userId || undefined,
      content: c.content,
      status: c.status as any,
      parentId: c.parentId || null,
      createdAt: c.createdAt.toISOString(),
    }));
  } catch (error) {
    console.warn('getComments notice (using empty fallback):', error);
    return [];
  }
}

export async function createComment(data: any) {
  if (!data.postId || !data.authorName || !data.content) {
    throw new Error('Post ID, author name, and content are required');
  }

  const commentId = data.id || `comment_${Date.now()}`;
  const [newComment] = await db
    .insert(comments)
    .values({
      id: commentId,
      postId: data.postId,
      authorName: data.authorName,
      authorEmail: data.authorEmail || 'reader@example.com',
      authorAvatar: data.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      userId: data.userId || null,
      content: data.content,
      status: data.status || 'approved',
      parentId: data.parentId || null,
      createdAt: new Date(),
    })
    .returning();

  return newComment;
}

export async function updateCommentStatus(id: string, status: string) {
  const [updated] = await db
    .update(comments)
    .set({ status })
    .where(eq(comments.id, id))
    .returning();
  return updated;
}

export async function deleteComment(id: string) {
  return await db.delete(comments).where(eq(comments.id, id)).returning();
}

// ----------------------------------------------------
// SITE SETTINGS REPOSITORY
// ----------------------------------------------------
export async function getSettings() {
  try {
    const rows = await db.select().from(siteSettings);
    const settingsObj: Record<string, any> = { ...DEFAULT_SITE_SETTINGS };
    for (const r of rows) {
      try {
        settingsObj[r.key] = JSON.parse(r.value);
      } catch {
        settingsObj[r.key] = r.value;
      }
    }
    return settingsObj;
  } catch (error) {
    console.warn('getSettings failed, falling back to DEFAULT_SITE_SETTINGS:', error);
    return { ...DEFAULT_SITE_SETTINGS };
  }
}

export async function updateSettings(data: Record<string, any>) {
  for (const [key, value] of Object.entries(data)) {
    const valString = typeof value === 'object' ? JSON.stringify(value) : String(value);
    await db
      .insert(siteSettings)
      .values({
        key,
        value: valString,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value: valString,
          updatedAt: new Date(),
        },
      });
  }
  return await getSettings();
}

export const getSiteSettings = getSettings;
export const updateSiteSettings = updateSettings;

// ----------------------------------------------------
// MENUS REPOSITORY
// ----------------------------------------------------
export async function ensureDefaultMenus() {
  try {
    const defaultMenus = [
      { id: 'menu_primary', name: 'Primary Navigation', location: 'primary' },
      { id: 'menu_footer', name: 'Footer Links', location: 'footer' },
      { id: 'menu_mobile', name: 'Mobile Navigation', location: 'mobile' },
    ];
    for (const menu of defaultMenus) {
      await db
        .insert(menus)
        .values({
          id: menu.id,
          name: menu.name,
          location: menu.location,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoNothing();
    }
  } catch (error) {
    console.warn('ensureDefaultMenus notice:', error);
  }
}

export async function resolveMenuId(menuIdOrLocation: string): Promise<string> {
  const trimmed = (menuIdOrLocation || 'primary').trim();

  // 1. Check if an existing menu has this exact ID
  const menuById = await db.query.menus.findFirst({
    where: eq(menus.id, trimmed),
  });
  if (menuById) return menuById.id;

  // 2. Check if an existing menu has this location
  const menuByLoc = await db.query.menus.findFirst({
    where: eq(menus.location, trimmed),
  });
  if (menuByLoc) return menuByLoc.id;

  // 3. If neither exists, insert a menu for this location/id and return its ID
  const newId = trimmed.startsWith('menu_') ? trimmed : `menu_${trimmed}`;
  const location = ['primary', 'footer', 'mobile'].includes(trimmed) ? trimmed : 'primary';
  const name =
    location === 'primary'
      ? 'Primary Navigation'
      : location === 'footer'
      ? 'Footer Links'
      : 'Mobile Navigation';

  try {
    const [created] = await db
      .insert(menus)
      .values({
        id: newId,
        name,
        location,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: menus.location,
        set: { updatedAt: new Date() },
      })
      .returning();
    return created.id;
  } catch {
    // If conflict or already exists, refetch
    const fallback = await db.query.menus.findFirst({
      where: or(eq(menus.id, newId), eq(menus.location, location)),
    });
    return fallback ? fallback.id : 'menu_primary';
  }
}

export async function getMenus() {
  try {
    await ensureDefaultMenus();

    const rawMenus = await db.query.menus.findMany({
      with: {
        items: {
          orderBy: (i) => i.order,
        },
      },
    });

    return rawMenus.map((m) => ({
      id: m.id,
      name: m.name,
      location: m.location as any,
      items: (m.items || []).map((i) => ({
        id: i.id,
        menuId: i.menuId,
        label: i.label,
        url: i.url,
        categorySlug: i.categorySlug || undefined,
        parentId: i.parentId || null,
        order: i.order,
        target: i.target || '_self',
        createdAt: i.createdAt.toISOString(),
      })),
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.warn('getMenus notice (fallback to empty array):', error);
    return [];
  }
}

export async function getPrimaryMenuItems() {
  try {
    const primaryMenu = await db.query.menus.findFirst({
      where: eq(menus.location, 'primary'),
      with: {
        items: {
          orderBy: (i) => i.order,
        },
      },
    });

    if (primaryMenu && primaryMenu.items && primaryMenu.items.length > 0) {
      return primaryMenu.items.map((i) => {
        const rawCatSlug = (i.categorySlug || '').toLowerCase().trim();
        const isFood =
          rawCatSlug === 'food' ||
          rawCatSlug === 'food-wine' ||
          i.url === '/food' ||
          i.url === '/food-wine' ||
          (i.label && i.label.toLowerCase().includes('food'));
        const canonicalUrl = isFood ? '/food-wine' : i.url;
        const canonicalCatSlug = isFood ? 'food-wine' : (i.categorySlug || undefined);

        return {
          id: i.id,
          menuId: i.menuId,
          label: i.label,
          url: canonicalUrl,
          categorySlug: canonicalCatSlug,
          parentId: i.parentId || null,
          order: i.order,
          target: i.target || '_self',
          createdAt: i.createdAt.toISOString(),
        };
      });
    }

    return [];
  } catch (error) {
    console.error('getPrimaryMenuItems failed:', error);
    return [];
  }
}

export async function createMenuItem(data: {
  menuIdOrLocation: string;
  label: string;
  url: string;
  categorySlug?: string | null;
  parentId?: string | null;
  order?: number;
  target?: string;
}) {
  const resolvedMenuId = await resolveMenuId(data.menuIdOrLocation);

  // Fetch current items for this menu to calculate order and check for duplicates
  const existingItems = await db.query.menuItems.findMany({
    where: eq(menuItems.menuId, resolvedMenuId),
    orderBy: (i) => i.order,
  });

  const cleanLabel = (data.label || '').trim();
  const cleanUrl = (data.url || '').trim();
  const cleanCategorySlug = data.categorySlug ? data.categorySlug.trim().toLowerCase() : null;
  const parentId = data.parentId ? data.parentId.trim() : null;

  if (!cleanLabel) {
    throw new Error('Menu item label is required.');
  }
  if (!cleanUrl) {
    throw new Error('Menu item URL is required.');
  }

  // Duplicate prevention check:
  // 1. If adding a category, check if this categorySlug already exists in this menu
  if (cleanCategorySlug) {
    const isDuplicateCat = existingItems.some(
      (item) => item.categorySlug && item.categorySlug.toLowerCase() === cleanCategorySlug
    );
    if (isDuplicateCat) {
      const err = new Error('This category is already added to the menu.');
      (err as any).statusCode = 409;
      throw err;
    }
  }

  // 2. Check if identical URL + parent exists
  const isDuplicateUrl = existingItems.some(
    (item) =>
      item.url.trim().toLowerCase() === cleanUrl.toLowerCase() &&
      (item.parentId || null) === parentId &&
      item.label.trim().toLowerCase() === cleanLabel.toLowerCase()
  );
  if (isDuplicateUrl) {
    const err = new Error('This item is already added to the menu.');
    (err as any).statusCode = 409;
    throw err;
  }

  // Calculate order: next valid sequential order
  let assignedOrder: number;
  if (typeof data.order === 'number' && data.order !== 99 && !isNaN(data.order)) {
    assignedOrder = data.order;
  } else {
    const maxOrder = existingItems.reduce((max, item) => Math.max(max, item.order ?? 0), -1);
    assignedOrder = maxOrder + 1;
  }

  const itemId = crypto.randomUUID();
  const [created] = await db
    .insert(menuItems)
    .values({
      id: itemId,
      menuId: resolvedMenuId,
      label: cleanLabel,
      url: cleanUrl,
      categorySlug: cleanCategorySlug,
      parentId,
      order: assignedOrder,
      target: data.target || '_self',
      createdAt: new Date(),
    })
    .returning();

  return {
    id: created.id,
    menuId: created.menuId,
    label: created.label,
    url: created.url,
    categorySlug: created.categorySlug || undefined,
    parentId: created.parentId || null,
    order: created.order,
    target: created.target || '_self',
    createdAt: created.createdAt.toISOString(),
  };
}

export async function updateMenuItem(
  id: string,
  data: {
    label?: string;
    url?: string;
    categorySlug?: string | null;
    parentId?: string | null;
    order?: number;
    target?: string;
  }
) {
  const updateData: Record<string, any> = {};
  if (data.label !== undefined) updateData.label = data.label.trim();
  if (data.url !== undefined) updateData.url = data.url.trim();
  if (data.categorySlug !== undefined) updateData.categorySlug = data.categorySlug ? data.categorySlug.trim() : null;
  if (data.parentId !== undefined) updateData.parentId = data.parentId ? data.parentId.trim() : null;
  if (data.order !== undefined) updateData.order = Number(data.order);
  if (data.target !== undefined) updateData.target = data.target;

  const [updated] = await db
    .update(menuItems)
    .set(updateData)
    .where(eq(menuItems.id, id))
    .returning();

  if (!updated) {
    throw new Error('Menu item not found');
  }

  return {
    id: updated.id,
    menuId: updated.menuId,
    label: updated.label,
    url: updated.url,
    categorySlug: updated.categorySlug || undefined,
    parentId: updated.parentId || null,
    order: updated.order,
    target: updated.target || '_self',
    createdAt: updated.createdAt.toISOString(),
  };
}

export async function deleteMenuItem(id: string) {
  return await db.transaction(async (tx) => {
    // Set children's parentId to null so they don't break hierarchy
    await tx
      .update(menuItems)
      .set({ parentId: null })
      .where(eq(menuItems.parentId, id));

    // Delete the menu item
    await tx.delete(menuItems).where(eq(menuItems.id, id));
  });
}

export async function updateMenuItems(menuIdOrLocation: string, items: any[]) {
  const resolvedMenuId = await resolveMenuId(menuIdOrLocation);

  return await db.transaction(async (tx) => {
    await tx.delete(menuItems).where(eq(menuItems.menuId, resolvedMenuId));
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      await tx.insert(menuItems).values({
        id: item.id || crypto.randomUUID(),
        menuId: resolvedMenuId,
        label: item.label,
        url: item.url,
        categorySlug: item.categorySlug || null,
        parentId: item.parentId || null,
        order: typeof item.order === 'number' ? item.order : index,
        target: item.target || '_self',
        createdAt: new Date(),
      });
    }
  });
}

export const updateMenu = updateMenuItems;

// ----------------------------------------------------
// ACTIVITY LOGS & NOTIFICATIONS
// ----------------------------------------------------
export async function getActivityLogs(limit = 20) {
  try {
    const logs = await db.query.activityLogs.findMany({
      orderBy: (l) => desc(l.timestamp),
      limit,
    });
    return logs.map((l) => ({
      id: l.id,
      userId: l.userId,
      userName: l.userName,
      userAvatar: l.userAvatar,
      action: l.action as any,
      targetType: l.targetType as any,
      targetId: l.targetId || undefined,
      targetTitle: l.targetTitle,
      timestamp: l.timestamp.toISOString(),
    }));
  } catch (error) {
    console.warn('getActivityLogs notice (fallback to empty logs):', error);
    return [];
  }
}

export async function getNotifications() {
  try {
    const rawNotifs = await db.query.notifications.findMany({
      orderBy: (n) => desc(n.createdAt),
      limit: 30,
    });
    return rawNotifs.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type as any,
      isRead: n.isRead,
      link: n.link || undefined,
      createdAt: n.createdAt.toISOString(),
    }));
  } catch (error) {
    console.warn('getNotifications notice (fallback to empty notifications):', error);
    return [];
  }
}

// ----------------------------------------------------
// DASHBOARD METRICS
// ----------------------------------------------------
export async function getDashboardMetrics() {
  try {
    const [allPosts, allCategories, allTags, allMedia, allPages, allUsers, allComments, allLogs] =
      await Promise.all([
        getPosts({ limit: 500 }),
        getCategories(),
        getTags(),
        getMedia(),
        getPages(),
        getUsers(),
        getComments(),
        getActivityLogs(10),
      ]);

    const totalViews = allPosts.reduce((acc, p) => acc + (p.views || 0), 0);
    const publishedPosts = allPosts.filter((p) => p.status === 'published');
    const draftPosts = allPosts.filter((p) => p.status === 'draft');
    const pendingPosts = allPosts.filter((p) => p.status === 'pending');
    const scheduledPosts = allPosts.filter((p) => p.status === 'scheduled');
    const trashPosts = allPosts.filter((p) => p.status === 'trash' || p.isTrashed);

    // Top performing articles by real views
    const topPerformingPosts = [...publishedPosts]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);

    // Category distribution from real posts
    const categoryCounts: Record<string, { id: string; name: string; count: number; color?: string }> = {};
    for (const cat of allCategories) {
      categoryCounts[cat.id] = { id: cat.id, name: cat.name, count: 0, color: cat.color || undefined };
    }
    for (const post of publishedPosts) {
      if (post.category?.id && categoryCounts[post.category.id]) {
        categoryCounts[post.category.id].count += 1;
      }
    }

    const categoryDistribution = Object.values(categoryCounts)
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count);

    return {
      totalPosts: allPosts.length,
      publishedPosts: publishedPosts.length,
      draftPosts: draftPosts.length,
      pendingPosts: pendingPosts.length,
      scheduledPosts: scheduledPosts.length,
      trashPosts: trashPosts.length,
      totalCategories: allCategories.length,
      totalTags: allTags.length,
      totalMedia: allMedia.length,
      totalPages: allPages.length,
      totalUsers: allUsers.length,
      totalComments: allComments.length,
      pendingComments: allComments.filter((c) => c.status === 'pending').length,
      totalViews,
      topPerformingPosts,
      categoryDistribution,
      allPosts,
      allCategories,
      allComments,
      recentPosts: allPosts.slice(0, 6),
      recentUsers: allUsers.slice(0, 5),
      recentActivity: allLogs,
    };
  } catch (error) {
    console.error('getDashboardMetrics failed:', error);
    return {
      totalPosts: 0,
      publishedPosts: 0,
      draftPosts: 0,
      pendingPosts: 0,
      scheduledPosts: 0,
      trashPosts: 0,
      totalCategories: 0,
      totalTags: 0,
      totalMedia: 0,
      totalPages: 0,
      totalUsers: 0,
      totalComments: 0,
      pendingComments: 0,
      totalViews: 0,
      topPerformingPosts: [],
      categoryDistribution: [],
      allPosts: [],
      allCategories: [],
      allComments: [],
      recentPosts: [],
      recentUsers: [],
      recentActivity: [],
    };
  }
}

// ----------------------------------------------------
// ADVERTISEMENTS, NEWSLETTERS & VIDEOS
// ----------------------------------------------------
export async function getAdvertisements(location?: string) {
  try {
    const conditions = [];
    if (location) {
      conditions.push(eq(advertisements.location, location));
    }
    const rawAds = await db.query.advertisements.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: (a) => desc(a.createdAt),
    });
    return rawAds.map((a) => ({
      id: a.id,
      title: a.title,
      location: a.location as any,
      type: a.type as any,
      code: a.code || undefined,
      imageUrl: a.imageUrl || undefined,
      targetUrl: a.targetUrl || undefined,
      status: a.status as any,
      startDate: a.startDate?.toISOString(),
      endDate: a.endDate?.toISOString(),
      impressions: a.impressions,
      clicks: a.clicks,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error('getAdvertisements failed:', error);
    return [];
  }
}

export async function createAdvertisement(data: any) {
  const newId = data.id || `ad_${Date.now()}`;
  await db.insert(advertisements).values({
    id: newId,
    title: data.title,
    location: data.location || 'sidebar',
    type: data.type || 'image',
    code: data.code || null,
    imageUrl: data.imageUrl || null,
    targetUrl: data.targetUrl || null,
    status: data.status || 'active',
    impressions: 0,
    clicks: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return (await getAdvertisements()).find((a) => a.id === newId);
}

export async function updateAdvertisement(id: string, data: any) {
  await db
    .update(advertisements)
    .set({
      title: data.title,
      location: data.location,
      type: data.type,
      code: data.code,
      imageUrl: data.imageUrl,
      targetUrl: data.targetUrl,
      status: data.status,
      updatedAt: new Date(),
    })
    .where(eq(advertisements.id, id));
  return (await getAdvertisements()).find((a) => a.id === id);
}

export async function deleteAdvertisement(id: string) {
  await db.delete(advertisements).where(eq(advertisements.id, id));
  return { success: true };
}

export async function getNewsletters() {
  try {
    const list = await db.query.newsletters.findMany({
      orderBy: (n) => desc(n.subscribedAt),
    });
    return list.map((n) => ({
      id: n.id,
      email: n.email,
      name: n.name || undefined,
      status: n.status as any,
      source: n.source || undefined,
      subscribedAt: n.subscribedAt.toISOString(),
      unsubscribedAt: n.unsubscribedAt?.toISOString(),
    }));
  } catch (error) {
    console.error('getNewsletters failed:', error);
    return [];
  }
}

export async function subscribeNewsletter(email: string, name?: string, source?: string) {
  const newId = `nl_${Date.now()}`;
  await db.insert(newsletters).values({
    id: newId,
    email,
    name: name || null,
    status: 'subscribed',
    source: source || 'website',
    subscribedAt: new Date(),
  }).onConflictDoUpdate({
    target: newsletters.email,
    set: {
      status: 'subscribed',
      unsubscribedAt: null,
    },
  });
  return { success: true, message: 'Subscribed successfully' };
}

export async function deleteNewsletter(id: string) {
  await db.delete(newsletters).where(eq(newsletters.id, id));
  return { success: true };
}

export async function getVideos() {
  try {
    const list = await db.query.videos.findMany({
      orderBy: (v) => desc(v.createdAt),
    });
    return list.map((v) => ({
      id: v.id,
      title: v.title,
      slug: v.slug,
      videoUrl: v.videoUrl,
      provider: v.provider as any,
      thumbnail: v.thumbnail,
      duration: v.duration || undefined,
      description: v.description || undefined,
      categoryId: v.categoryId || undefined,
      authorId: v.authorId || undefined,
      views: v.views,
      isFeatured: v.isFeatured,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error('getVideos failed:', error);
    return [];
  }
}

export async function createVideo(data: any) {
  const newId = data.id || `vid_${Date.now()}`;
  await db.insert(videos).values({
    id: newId,
    title: data.title,
    slug: data.slug,
    videoUrl: data.videoUrl,
    provider: data.provider || 'youtube',
    thumbnail: data.thumbnail,
    duration: data.duration || '05:00',
    description: data.description || null,
    categoryId: data.categoryId || null,
    authorId: data.authorId || 'usr_admin_01',
    views: 0,
    isFeatured: data.isFeatured || false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return (await getVideos()).find((v) => v.id === newId);
}

export async function updateVideo(id: string, data: any) {
  await db
    .update(videos)
    .set({
      title: data.title,
      slug: data.slug,
      videoUrl: data.videoUrl,
      provider: data.provider,
      thumbnail: data.thumbnail,
      duration: data.duration,
      description: data.description,
      categoryId: data.categoryId,
      isFeatured: data.isFeatured,
      updatedAt: new Date(),
    })
    .where(eq(videos.id, id));
  return (await getVideos()).find((v) => v.id === id);
}

export async function deleteVideo(id: string) {
  await db.delete(videos).where(eq(videos.id, id));
  return { success: true };
}

export async function markNotificationAsRead(id: string) {
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  return { success: true };
}

// ----------------------------------------------------
// TRASH MANAGEMENT REPOSITORY FUNCTIONS
// ----------------------------------------------------
export async function trashPost(id: string) {
  return await db.update(posts).set({ isTrashed: true, trashedAt: new Date(), updatedAt: new Date() }).where(eq(posts.id, id)).returning();
}
export async function restorePost(id: string) {
  return await db.update(posts).set({ isTrashed: false, trashedAt: null, updatedAt: new Date() }).where(eq(posts.id, id)).returning();
}
export async function permanentDeletePost(id: string) {
  await db.delete(postTags).where(eq(postTags.postId, id));
  await db.delete(postRevisions).where(eq(postRevisions.postId, id));
  return await db.delete(posts).where(eq(posts.id, id)).returning();
}

export async function trashCategory(id: string) {
  return await db.update(categories).set({ isTrashed: true, trashedAt: new Date(), updatedAt: new Date() }).where(eq(categories.id, id)).returning();
}
export async function restoreCategory(id: string) {
  return await db.update(categories).set({ isTrashed: false, trashedAt: null, updatedAt: new Date() }).where(eq(categories.id, id)).returning();
}
export async function permanentDeleteCategory(id: string) {
  await db.update(categories).set({ parentId: null }).where(eq(categories.parentId, id));
  await db.update(posts).set({ subCategoryId: null }).where(eq(posts.subCategoryId, id));
  const fallbackCat = await db.query.categories.findFirst({ where: and(ne(categories.id, id), eq(categories.isTrashed, false)) });
  if (fallbackCat) {
    await db.update(posts).set({ categoryId: fallbackCat.id }).where(eq(posts.categoryId, id));
    await db.update(videos).set({ categoryId: fallbackCat.id }).where(eq(videos.categoryId, id));
  }
  return await db.delete(categories).where(eq(categories.id, id)).returning();
}

export async function trashTag(id: string) {
  return await db.update(tags).set({ isTrashed: true, trashedAt: new Date() }).where(eq(tags.id, id)).returning();
}
export async function restoreTag(id: string) {
  return await db.update(tags).set({ isTrashed: false, trashedAt: null }).where(eq(tags.id, id)).returning();
}
export async function permanentDeleteTag(id: string) {
  await db.delete(postTags).where(eq(postTags.tagId, id));
  return await db.delete(tags).where(eq(tags.id, id)).returning();
}

export async function trashPage(id: string) {
  return await db.update(pages).set({ isTrashed: true, trashedAt: new Date(), updatedAt: new Date() }).where(eq(pages.id, id)).returning();
}
export async function restorePage(id: string) {
  return await db.update(pages).set({ isTrashed: false, trashedAt: null, updatedAt: new Date() }).where(eq(pages.id, id)).returning();
}
export async function permanentDeletePage(id: string) {
  return await db.delete(pages).where(eq(pages.id, id)).returning();
}

export async function trashUser(id: string) {
  return await db.update(users).set({ isTrashed: true, trashedAt: new Date(), updatedAt: new Date() }).where(eq(users.id, id)).returning();
}
export async function restoreUser(id: string) {
  return await db.update(users).set({ isTrashed: false, trashedAt: null, updatedAt: new Date() }).where(eq(users.id, id)).returning();
}
export async function permanentDeleteUser(id: string) {
  return await db.delete(users).where(eq(users.id, id)).returning();
}

export async function getTrashedItems() {
  const [trashedPosts, trashedPages, trashedCategories, trashedTags, trashedUsers] = await Promise.all([
    db.query.posts.findMany({
      where: eq(posts.isTrashed, true),
      with: { author: true, category: true },
      orderBy: desc(posts.trashedAt),
    }),
    db.query.pages.findMany({
      where: eq(pages.isTrashed, true),
      with: { author: true },
      orderBy: desc(pages.trashedAt),
    }),
    db.query.categories.findMany({
      where: eq(categories.isTrashed, true),
      with: { parent: true },
      orderBy: desc(categories.trashedAt),
    }),
    db.query.tags.findMany({
      where: eq(tags.isTrashed, true),
      orderBy: desc(tags.createdAt),
    }),
    db.query.users.findMany({
      where: eq(users.isTrashed, true),
      orderBy: desc(users.createdAt),
    }),
  ]);

  const items: any[] = [];

  for (const p of trashedPosts) {
    items.push({
      id: p.id,
      type: 'post',
      title: p.title,
      slug: p.slug,
      authorName: p.author?.name || 'Staff',
      categoryName: p.category?.name,
      deletedAt: (p.trashedAt || p.updatedAt || p.createdAt).toISOString(),
      status: p.status,
    });
  }

  for (const pg of trashedPages) {
    items.push({
      id: pg.id,
      type: 'page',
      title: pg.title,
      slug: pg.slug,
      authorName: pg.authorName || pg.author?.name || 'Administrator',
      deletedAt: (pg.trashedAt || pg.updatedAt || pg.createdAt).toISOString(),
      status: pg.status,
    });
  }

  for (const c of trashedCategories) {
    items.push({
      id: c.id,
      type: 'category',
      title: c.name,
      slug: c.slug,
      parentName: c.parent?.name,
      deletedAt: (c.trashedAt || c.updatedAt || c.createdAt).toISOString(),
    });
  }

  for (const t of trashedTags) {
    items.push({
      id: t.id,
      type: 'tag',
      title: t.name,
      slug: t.slug,
      deletedAt: (t.trashedAt || t.createdAt).toISOString(),
    });
  }

  for (const u of trashedUsers) {
    items.push({
      id: u.id,
      type: 'user',
      title: u.name,
      slug: u.username,
      authorName: u.email,
      deletedAt: (u.trashedAt || u.updatedAt || u.createdAt).toISOString(),
      status: u.role,
    });
  }

  return items.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
}

export async function restoreAllTrash() {
  await Promise.all([
    db.update(posts).set({ isTrashed: false, trashedAt: null }).where(eq(posts.isTrashed, true)),
    db.update(pages).set({ isTrashed: false, trashedAt: null }).where(eq(pages.isTrashed, true)),
    db.update(categories).set({ isTrashed: false, trashedAt: null }).where(eq(categories.isTrashed, true)),
    db.update(tags).set({ isTrashed: false, trashedAt: null }).where(eq(tags.isTrashed, true)),
    db.update(users).set({ isTrashed: false, trashedAt: null }).where(eq(users.isTrashed, true)),
  ]);
  return { success: true };
}

export async function emptyTrash() {
  const trashedPosts = await db.query.posts.findMany({ where: eq(posts.isTrashed, true), columns: { id: true } });
  for (const p of trashedPosts) {
    await permanentDeletePost(p.id);
  }

  const trashedCategories = await db.query.categories.findMany({ where: eq(categories.isTrashed, true), columns: { id: true } });
  for (const c of trashedCategories) {
    await permanentDeleteCategory(c.id);
  }

  const trashedTags = await db.query.tags.findMany({ where: eq(tags.isTrashed, true), columns: { id: true } });
  for (const t of trashedTags) {
    await permanentDeleteTag(t.id);
  }

  await Promise.all([
    db.delete(pages).where(eq(pages.isTrashed, true)),
    db.delete(users).where(eq(users.isTrashed, true)),
  ]);

  return { success: true };
}

// ----------------------------------------------------
// SEARCH ANALYTICS REPOSITORY
// ----------------------------------------------------
/**
 * Validates search terms to ensure only clean, relevant search topics are displayed.
 * Disallows raw URLs, image URLs, random text, filler words, or invalid symbols.
 */
export function isValidSearchTerm(rawTerm: any): boolean {
  if (typeof rawTerm !== 'string') return false;
  const term = rawTerm.trim();

  // Length constraint: must be a legitimate search phrase (between 3 and 55 characters)
  if (term.length < 3 || term.length > 55) return false;

  // Reject URLs, protocols, web domains, and query strings
  if (
    /^https?:\/\//i.test(term) ||
    /^(www\.)/i.test(term) ||
    /\.(com|org|net|io|in|co|gov|edu|ai|app|xyz|site|online|me|info|biz)\b/i.test(term) ||
    term.includes('://') ||
    term.includes('cloudinary') ||
    term.includes('/upload/') ||
    term.includes('data:image') ||
    term.includes('?_a=') ||
    term.includes('?') ||
    term.includes('&') ||
    term.includes('=')
  ) {
    return false;
  }

  // Reject image or media file extensions
  if (/\.(png|jpe?g|gif|webp|svg|avif|bmp|tiff|pdf|exe|zip|mp4|mp3|json|xml|html?)$/i.test(term)) {
    return false;
  }

  // Reject raw code, HTML tags, scripts, JSON brackets, slashes
  if (/[<>{}[\]\\\/^~`$@%*]/.test(term)) {
    return false;
  }

  // Must contain letters (not pure numbers or pure punctuation)
  if (!/[a-zA-Z]/.test(term)) {
    return false;
  }

  // Reject keyboard mashing or excessive repeated characters (e.g. "aaaaa", "asdfgh")
  if (/([a-zA-Z])\1{3,}/.test(term)) {
    return false;
  }

  // Reject generic filler / test words with no search context
  const bannedKeywords = new Set([
    'hi', 'hello', 'hey', 'test', 'testing', 'asdf', 'qwerty', 'good', 'bad', 'ok', 'okay',
    'yes', 'no', 'null', 'undefined', 'nan', 'true', 'false', 'admin', 'hire', 'sample', 'image', 'photo'
  ]);
  if (bannedKeywords.has(term.toLowerCase())) {
    return false;
  }

  return true;
}

export async function getMostSearchedTerms(): Promise<string[]> {
  const curatedFallbackTerms: [string, number][] = [
    ['Friday OTT Releases', 1520],
    ['XO Kitty Season 3 Twitter Review', 1480],
    ['Crime 101', 1390],
    ['Sitaare Zameen Par OTT Release', 1350],
    ['OTT Releases This Week', 1290],
    ['Punjabi Movie Download Website', 1210],
    ['Hollywood Series Download', 1150],
    ['Websites To Watch Bollywood Movies', 1080],
    ['Websites To Download South Indian Movies', 990],
    ['Websites To Download Tamil Dubbed Movies', 920],
  ];

  try {
    const setting = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.key, 'most_searched_analytics'),
    });

    let termsMap: Record<string, number> = {};

    if (setting && setting.value) {
      try {
        termsMap = JSON.parse(setting.value);
      } catch (e) {
        termsMap = {};
      }
    }

    let hadInvalidTerms = false;
    const validTermsMap: Record<string, number> = {};

    // Filter and sanitize every search term from analytics
    for (const [term, count] of Object.entries(termsMap)) {
      if (isValidSearchTerm(term)) {
        validTermsMap[term] = count;
      } else {
        hadInvalidTerms = true;
      }
    }

    // Persist cleaned map to database if invalid items were purged
    if (hadInvalidTerms && setting) {
      try {
        await db
          .update(siteSettings)
          .set({ value: JSON.stringify(validTermsMap), updatedAt: new Date() })
          .where(eq(siteSettings.key, 'most_searched_analytics'));
      } catch (e) {
        // silent fallback
      }
    }

    // Supplement with curated terms if fewer than 10
    for (const [term, count] of curatedFallbackTerms) {
      const alreadyHas = Object.keys(validTermsMap).some(
        (k) => k.toLowerCase() === term.toLowerCase()
      );
      if (!alreadyHas) {
        validTermsMap[term] = count;
      }
    }

    // Sort terms by search popularity/frequency descending, strictly limit to 10
    const sortedTerms = Object.entries(validTermsMap)
      .sort((a, b) => b[1] - a[1])
      .map(([term]) => term)
      .filter((t) => isValidSearchTerm(t))
      .slice(0, 10);

    return sortedTerms;
  } catch (error) {
    console.error('Error in getMostSearchedTerms:', error);
    return curatedFallbackTerms.map(([t]) => t);
  }
}

export async function recordSearchQuery(query: string): Promise<void> {
  const clean = query.trim().replace(/\s+/g, ' ');
  if (!isValidSearchTerm(clean)) return;

  try {
    const setting = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.key, 'most_searched_analytics'),
    });

    let termsMap: Record<string, number> = {};
    if (setting && setting.value) {
      try {
        termsMap = JSON.parse(setting.value);
      } catch (e) {
        termsMap = {};
      }
    }

    // Standardize capitalization key check
    const existingKey = Object.keys(termsMap).find(
      (k) => k.toLowerCase() === clean.toLowerCase()
    );

    if (existingKey) {
      termsMap[existingKey] += 1;
    } else {
      termsMap[clean] = 1;
    }

    // Sanitize before saving
    const cleanedMap: Record<string, number> = {};
    for (const [k, v] of Object.entries(termsMap)) {
      if (isValidSearchTerm(k)) {
        cleanedMap[k] = v;
      }
    }

    const payload = JSON.stringify(cleanedMap);

    if (setting) {
      await db
        .update(siteSettings)
        .set({ value: payload, updatedAt: new Date() })
        .where(eq(siteSettings.key, 'most_searched_analytics'));
    } else {
      await db.insert(siteSettings).values({
        key: 'most_searched_analytics',
        value: payload,
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error recording search query:', error);
  }
}

// ----------------------------------------------------
// AUTHOR & EDITOR DOMAIN HELPERS
// ----------------------------------------------------
export async function getAuthorBySlug(authorSlug: string): Promise<{
  author: User;
  posts: Post[];
  totalPublished: number;
} | null> {
  try {
    const cleanSlug = authorSlug.toLowerCase().trim();
    const allUsers = await getUsers();
    
    // Find matching user by username, id, or normalized name slug
    const matchedUser = allUsers.find((u) => {
      const uId = (u.id || '').toLowerCase();
      const uUsername = (u.username || '').toLowerCase();
      const uUsernameHyphen = uUsername.replace(/[\._\s]+/g, '-');
      const uNameSlug = (u.name || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      return (
        uId === cleanSlug ||
        uUsername === cleanSlug ||
        uUsernameHyphen === cleanSlug ||
        uNameSlug === cleanSlug
      );
    });

    if (!matchedUser) {
      return null;
    }

    const authorPosts = await getPosts({
      authorId: matchedUser.id,
      status: 'published',
      limit: 1000,
    });

    return {
      author: matchedUser,
      posts: authorPosts,
      totalPublished: authorPosts.length,
    };
  } catch (error) {
    console.error('getAuthorBySlug failed:', error);
    return null;
  }
}

export async function getAuthorStats(authorId: string) {
  try {
    const authorPosts = await getPosts({ authorId, limit: 500 });
    const draftCount = authorPosts.filter((p) => p.status === 'draft').length;
    const pendingCount = authorPosts.filter((p) => p.status === 'pending').length;
    const publishedCount = authorPosts.filter((p) => p.status === 'published').length;
    const totalViews = authorPosts.reduce((acc, p) => acc + (p.views || 0), 0);
    const totalLikes = authorPosts.reduce((acc, p) => acc + (p.likes || 0), 0);

    return {
      totalPosts: authorPosts.length,
      draftCount,
      pendingCount,
      publishedCount,
      totalViews,
      totalLikes,
      recentPosts: authorPosts.slice(0, 10),
    };
  } catch (error) {
    console.error('getAuthorStats failed:', error);
    return {
      totalPosts: 0,
      draftCount: 0,
      pendingCount: 0,
      publishedCount: 0,
      totalViews: 0,
      totalLikes: 0,
      recentPosts: [],
    };
  }
}

export async function getEditorStats() {
  try {
    const [allPostsList, allCategories, allTags] = await Promise.all([
      getPosts({ limit: 1000 }),
      getCategories(),
      getTags(),
    ]);

    const publishedCount = allPostsList.filter((p) => p.status === 'published').length;
    const pendingCount = allPostsList.filter((p) => p.status === 'pending').length;
    const draftCount = allPostsList.filter((p) => p.status === 'draft').length;
    const pendingReviewPosts = allPostsList.filter((p) => p.status === 'pending');

    return {
      totalPosts: allPostsList.length,
      publishedCount,
      pendingCount,
      draftCount,
      totalCategories: allCategories.length,
      totalTags: allTags.length,
      pendingReviewPosts: pendingReviewPosts.slice(0, 15),
      recentPosts: allPostsList.slice(0, 10),
    };
  } catch (error) {
    console.error('getEditorStats failed:', error);
    return {
      totalPosts: 0,
      publishedCount: 0,
      pendingCount: 0,
      draftCount: 0,
      totalCategories: 0,
      totalTags: 0,
      pendingReviewPosts: [],
      recentPosts: [],
    };
  }
}


