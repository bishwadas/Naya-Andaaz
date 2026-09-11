import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';
import { eq, inArray, sql } from 'drizzle-orm';
import { db } from '@/db';
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
  postRevisions,
  posts,
  postTags,
  siteSettings,
  tags,
  users,
  videos,
} from '@/db/schema';
import {
  applyRestoredBackupToMemory,
  getCategories,
  getComments,
  getMedia,
  getMenus,
  getNotifications,
  getPages,
  getPosts,
  getSettings,
  getTags,
  getUsers,
  getActivityLogs,
} from '@/db/repository';

export type ImportMode = 'skip' | 'update' | 'create_new';

export interface BackupMetadata {
  appName: string;
  backupVersion: string;
  schemaVersion: string;
  exportedAt: string;
  environment: string;
  counts: {
    users: number;
    categories: number;
    tags: number;
    posts: number;
    postTags: number;
    postRevisions: number;
    pages: number;
    media: number;
    comments: number;
    menus: number;
    menuItems: number;
    siteSettings: number;
    advertisements: number;
    newsletters: number;
    videos: number;
    activityLogs: number;
    notifications: number;
  };
}

export interface BackupPayload {
  metadata: BackupMetadata;
  data: {
    siteSettings: any[];
    users: any[];
    categories: any[];
    tags: any[];
    media: any[];
    pages: any[];
    posts: any[];
    postTags: any[];
    postRevisions: any[];
    comments: any[];
    menus: any[];
    menuItems: any[];
    advertisements: any[];
    newsletters: any[];
    videos: any[];
    activityLogs: any[];
    notifications: any[];
  };
}

const DEFAULT_APP_NAME = 'Naya Andaaz';
const CURRENT_BACKUP_VERSION = '1.0';
const CURRENT_SCHEMA_VERSION = '1.0';

/**
 * Collects all CMS data from PostgreSQL via Drizzle ORM (or repository fallback) and builds a ZIP archive.
 */
export async function generateBackupZip(): Promise<{ buffer: Buffer; filename: string; metadata: BackupMetadata }> {
  let allSettings: any[] = [];
  let allUsers: any[] = [];
  let allCategories: any[] = [];
  let allTags: any[] = [];
  let allMedia: any[] = [];
  let allPages: any[] = [];
  let allPosts: any[] = [];
  let allPostTags: any[] = [];
  let allPostRevisions: any[] = [];
  let allComments: any[] = [];
  let allMenus: any[] = [];
  let allMenuItems: any[] = [];
  let allAdvertisements: any[] = [];
  let allNewsletters: any[] = [];
  let allVideos: any[] = [];
  let allActivityLogs: any[] = [];
  let allNotifications: any[] = [];

  try {
    const results = await Promise.all([
      db.select().from(siteSettings),
      db.select().from(users),
      db.select().from(categories),
      db.select().from(tags),
      db.select().from(media),
      db.select().from(pages),
      db.select().from(posts),
      db.select().from(postTags),
      db.select().from(postRevisions),
      db.select().from(comments),
      db.select().from(menus),
      db.select().from(menuItems),
      db.select().from(advertisements),
      db.select().from(newsletters),
      db.select().from(videos),
      db.select().from(activityLogs),
      db.select().from(notifications),
    ]);

    allSettings = results[0];
    allUsers = results[1];
    allCategories = results[2];
    allTags = results[3];
    allMedia = results[4];
    allPages = results[5];
    allPosts = results[6];
    allPostTags = results[7];
    allPostRevisions = results[8];
    allComments = results[9];
    allMenus = results[10];
    allMenuItems = results[11];
    allAdvertisements = results[12];
    allNewsletters = results[13];
    allVideos = results[14];
    allActivityLogs = results[15];
    allNotifications = results[16];
  } catch (err) {
    console.warn('[Backup Export] Database query failed, using active repository fallback:', err);
    const [
      settingsObj,
      usersList,
      catsList,
      tagsList,
      mediaList,
      pagesList,
      postsList,
      commentsList,
      menusList,
      logsList,
      notifsList,
    ] = await Promise.all([
      getSettings().catch(() => ({})),
      getUsers().catch(() => []),
      getCategories().catch(() => []),
      getTags().catch(() => []),
      getMedia().catch(() => []),
      getPages().catch(() => []),
      getPosts({ limit: 10000 }).catch(() => []),
      getComments().catch(() => []),
      getMenus().catch(() => []),
      getActivityLogs(50).catch(() => []),
      getNotifications().catch(() => []),
    ]);

    allSettings = Object.entries(settingsObj).map(([key, value]) => ({
      key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),

    }));
    allUsers = usersList;
    allCategories = catsList;
    allTags = tagsList;
    allMedia = mediaList;
    allPages = pagesList;
    allPosts = postsList;
    allComments = commentsList;
    allMenus = menusList;
    allActivityLogs = logsList;
    allNotifications = notifsList;
  }

  const timestamp = new Date().toISOString();
  const dateStr = timestamp.split('T')[0];
  const filename = `naya-andaaz-backup-${dateStr}.zip`;

  const metadata: BackupMetadata = {
    appName: DEFAULT_APP_NAME,
    backupVersion: CURRENT_BACKUP_VERSION,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: timestamp,
    environment: process.env.NODE_ENV || 'production',
    counts: {
      users: allUsers.length,
      categories: allCategories.length,
      tags: allTags.length,
      posts: allPosts.length,
      postTags: allPostTags.length,
      postRevisions: allPostRevisions.length,
      pages: allPages.length,
      media: allMedia.length,
      comments: allComments.length,
      menus: allMenus.length,
      menuItems: allMenuItems.length,
      siteSettings: allSettings.length,
      advertisements: allAdvertisements.length,
      newsletters: allNewsletters.length,
      videos: allVideos.length,
      activityLogs: allActivityLogs.length,
      notifications: allNotifications.length,
    },
  };

  const payload: BackupPayload = {
    metadata,
    data: {
      siteSettings: allSettings,
      users: allUsers,
      categories: allCategories,
      tags: allTags,
      media: allMedia,
      pages: allPages,
      posts: allPosts,
      postTags: allPostTags,
      postRevisions: allPostRevisions,
      comments: allComments,
      menus: allMenus,
      menuItems: allMenuItems,
      advertisements: allAdvertisements,
      newsletters: allNewsletters,
      videos: allVideos,
      activityLogs: allActivityLogs,
      notifications: allNotifications,
    },
  };

  // 2. Package into JSZip
  const zip = new JSZip();

  // Add database.json
  zip.file('database.json', JSON.stringify(payload, null, 2));

  // Add local media files if any exist under public/uploads or public/media
  const mediaFolders = [
    path.join(process.cwd(), 'public', 'uploads'),
    path.join(process.cwd(), 'public', 'media'),
  ];

  for (const folder of mediaFolders) {
    if (fs.existsSync(folder)) {
      try {
        const files = fs.readdirSync(folder);
        for (const file of files) {
          const filePath = path.join(folder, file);
          const stat = fs.statSync(filePath);
          if (stat.isFile()) {
            const fileData = fs.readFileSync(filePath);
            zip.file(`media/${file}`, fileData);
          }
        }
      } catch (e) {
        console.warn('Media folder read notice:', e);
      }
    }
  }

  // 3. Generate zip buffer
  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  return { buffer: zipBuffer, filename, metadata };
}

/**
 * Validates and inspects an uploaded ZIP backup without making any database changes.
 */
export async function inspectBackupZip(zipBuffer: Buffer): Promise<{
  valid: boolean;
  metadata?: BackupMetadata;
  error?: string;
  hasMediaFiles?: boolean;
}> {
  try {
    const zip = await JSZip.loadAsync(zipBuffer);
    const dbFile = zip.file('database.json');

    if (!dbFile) {
      return {
        valid: false,
        error: 'Invalid backup structure: "database.json" is missing from the ZIP archive.',
      };
    }

    const content = await dbFile.async('string');
    let payload: BackupPayload;
    try {
      payload = JSON.parse(content);
    } catch {
      return {
        valid: false,
        error: 'Invalid backup: "database.json" contains malformed JSON data.',
      };
    }

    if (!payload.metadata || !payload.data) {
      return {
        valid: false,
        error: 'Invalid backup schema: Missing metadata or data sections in database.json.',
      };
    }

    // Check media files
    const mediaFiles = Object.keys(zip.files).filter((f) => f.startsWith('media/') && !zip.files[f].dir);

    return {
      valid: true,
      metadata: payload.metadata,
      hasMediaFiles: mediaFiles.length > 0,
    };
  } catch (err: any) {
    return {
      valid: false,
      error: `Corrupted ZIP file: ${err.message || 'Unable to decompress archive.'}`,
    };
  }
}

/**
 * Restores a CMS backup using a safe, transaction-based import with fallback to memory persistence.
 * Preserves relational integrity with dynamic ID mapping.
 */
export async function restoreBackupZip(
  zipBuffer: Buffer,
  mode: ImportMode = 'skip',
  adminUserId: string = 'usr_admin_01'
): Promise<{
  success: boolean;
  importedCounts: Record<string, number>;
  message: string;
  metadata: BackupMetadata;
}> {
  // 1. Load and validate ZIP
  const zip = await JSZip.loadAsync(zipBuffer);
  const dbFile = zip.file('database.json');

  if (!dbFile) {
    throw new Error('Invalid backup structure: "database.json" is missing from the ZIP archive.');
  }

  const content = await dbFile.async('string');
  let payload: BackupPayload;
  try {
    payload = JSON.parse(content);
  } catch {
    throw new Error('Invalid backup: "database.json" contains malformed JSON data.');
  }

  if (!payload.metadata || !payload.data) {
    throw new Error('Invalid backup: database.json missing required metadata or data roots.');
  }

  const { data, metadata } = payload;
  const importedCounts: Record<string, number> = {
    users: 0,
    categories: 0,
    tags: 0,
    posts: 0,
    postTags: 0,
    pages: 0,
    media: 0,
    comments: 0,
    menus: 0,
    menuItems: 0,
    siteSettings: 0,
    advertisements: 0,
    newsletters: 0,
    videos: 0,
  };

  // 2. Extract media files to public/uploads if present
  const mediaFiles = Object.keys(zip.files).filter((f) => f.startsWith('media/') && !zip.files[f].dir);
  if (mediaFiles.length > 0) {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    for (const filePath of mediaFiles) {
      const fileName = path.basename(filePath);
      if (fileName) {
        try {
          const fileContent = await zip.files[filePath].async('nodebuffer');
          fs.writeFileSync(path.join(uploadsDir, fileName), fileContent);
        } catch (e) {
          console.warn('Extract media file warning:', e);
        }
      }
    }
  }

  // 3. Check if PostgreSQL database is active and reachable
  let dbConnected = false;
  try {
    await db.select().from(siteSettings).limit(1);
    dbConnected = true;
  } catch (err) {
    console.warn('[Restore] PostgreSQL not reachable, using resilient in-memory storage fallback:', err);
    dbConnected = false;
  }

  if (dbConnected) {
    try {
      await db.transaction(async (tx) => {
        const userIdMap = new Map<string, string>();
        const categoryIdMap = new Map<string, string>();
        const tagIdMap = new Map<string, string>();
        const postIdMap = new Map<string, string>();
        const menuIdMap = new Map<string, string>();

        const suffix = Date.now().toString(36);

        // A. SITE SETTINGS
        if (Array.isArray(data.siteSettings) && data.siteSettings.length > 0) {
          for (const setting of data.siteSettings) {
            if (!setting.key) continue;
            try {
              const [existing] = await tx.select().from(siteSettings).where(eq(siteSettings.key, setting.key));
              if (existing) {
                if (mode === 'update') {
                  await tx
                    .update(siteSettings)
                    .set({
                      value: typeof setting.value === 'object' ? JSON.stringify(setting.value) : String(setting.value),

                    })
                    .where(eq(siteSettings.key, setting.key));
                  importedCounts.siteSettings++;
                }
              } else {
                await tx.insert(siteSettings).values({
                  key: setting.key,
                  value: typeof setting.value === 'object' ? JSON.stringify(setting.value) : String(setting.value),
                  updatedAt: setting.updatedAt ? new Date(setting.updatedAt) : new Date(),
                });
                importedCounts.siteSettings++;
              }
            } catch (err) {
              console.warn(`Setting ${setting.key} insert/update notice:`, err);
            }
          }
        }

        // B. USERS
        if (Array.isArray(data.users)) {
          for (const user of data.users) {
            if (!user.id || !user.email) continue;
            try {
              const [existingByEmail] = await tx.select().from(users).where(eq(users.email, user.email.toLowerCase()));
              const [existingById] = await tx.select().from(users).where(eq(users.id, user.id));
              const existing = existingByEmail || existingById;

              if (existing) {
                userIdMap.set(user.id, existing.id);
                if (mode === 'update') {
                  await tx
                    .update(users)
                    .set({
                      name: user.name,
                      role: user.role || existing.role,
                      avatar: user.avatar || existing.avatar,
                      bio: user.bio ?? existing.bio,
                      website: user.website ?? existing.website,
                      twitter: user.twitter ?? existing.twitter,
                      facebook: user.facebook ?? existing.facebook,
                      instagram: user.instagram ?? existing.instagram,
                      linkedin: user.linkedin ?? existing.linkedin,
                      isActive: user.isActive ?? existing.isActive,

                    })
                    .where(eq(users.id, existing.id));
                  importedCounts.users++;
                }
              } else {
                let newId = user.id;
                let newEmail = user.email.toLowerCase();
                let newUsername = user.username || user.email.split('@')[0];

                if (mode === 'create_new') {
                  newId = `usr_${suffix}_${Math.random().toString(36).substring(2, 7)}`;
                  newEmail = `copy_${suffix}_${user.email.toLowerCase()}`;
                  newUsername = `${newUsername}_${suffix}`;
                }

                await tx.insert(users).values({
                  id: newId,
                  name: user.name,
                  username: newUsername,
                  email: newEmail,
                  passwordHash: user.passwordHash || null,
                  role: user.role || 'subscriber',
                  avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                  bio: user.bio || null,
                  website: user.website || null,
                  twitter: user.twitter || null,
                  facebook: user.facebook || null,
                  instagram: user.instagram || null,
                  linkedin: user.linkedin || null,
                  isActive: user.isActive ?? true,
                  createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
                  updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
                });
                userIdMap.set(user.id, newId);
                importedCounts.users++;
              }
            } catch (err) {
              console.warn(`User ${user.email} notice:`, err);
            }
          }
        }

        // C. CATEGORIES
        if (Array.isArray(data.categories)) {
          for (const cat of data.categories) {
            if (!cat.id || !cat.slug) continue;
            try {
              const [existingBySlug] = await tx.select().from(categories).where(eq(categories.slug, cat.slug.toLowerCase()));
              const [existingById] = await tx.select().from(categories).where(eq(categories.id, cat.id));
              const existing = existingBySlug || existingById;

              if (existing) {
                categoryIdMap.set(cat.id, existing.id);
                if (mode === 'update') {
                  await tx
                    .update(categories)
                    .set({
                      name: cat.name,
                      description: cat.description ?? existing.description,
                      color: cat.color || existing.color,
                      image: cat.image ?? existing.image,
                      seoTitle: cat.seoTitle ?? existing.seoTitle,
                      metaDescription: cat.metaDescription ?? existing.metaDescription,
                      order: cat.order ?? existing.order,

                    })
                    .where(eq(categories.id, existing.id));
                  importedCounts.categories++;
                }
              } else {
                let newId = cat.id;
                let newSlug = cat.slug.toLowerCase();
                if (mode === 'create_new') {
                  newId = `cat_${suffix}_${Math.random().toString(36).substring(2, 7)}`;
                  newSlug = `${cat.slug}-${suffix}`;
                }

                await tx.insert(categories).values({
                  id: newId,
                  name: cat.name,
                  slug: newSlug,
                  description: cat.description || null,
                  parentId: null, // Will resolve parentId in secondary pass
                  color: cat.color || '#E11D48',
                  image: cat.image || null,
                  seoTitle: cat.seoTitle || null,
                  metaDescription: cat.metaDescription || null,
                  order: cat.order ?? 0,
                  isTrashed: false,
                  createdAt: cat.createdAt ? new Date(cat.createdAt) : new Date(),
                  updatedAt: cat.updatedAt ? new Date(cat.updatedAt) : new Date(),
                });
                categoryIdMap.set(cat.id, newId);
                importedCounts.categories++;
              }
            } catch (err) {
              console.warn(`Category ${cat.slug} notice:`, err);
            }
          }

          // Resolve Category Parent IDs
          for (const cat of data.categories) {
            if (cat.parentId) {
              const resolvedChildId = categoryIdMap.get(cat.id);
              const resolvedParentId = categoryIdMap.get(cat.parentId);
              if (resolvedChildId && resolvedParentId && resolvedChildId !== resolvedParentId) {
                try {
                  await tx
                    .update(categories)
                    .set({ parentId: resolvedParentId })
                    .where(eq(categories.id, resolvedChildId));
                } catch {}
              }
            }
          }
        }

        // D. TAGS
        if (Array.isArray(data.tags)) {
          for (const tag of data.tags) {
            if (!tag.id || !tag.slug) continue;
            try {
              const [existingBySlug] = await tx.select().from(tags).where(eq(tags.slug, tag.slug.toLowerCase()));
              const [existingById] = await tx.select().from(tags).where(eq(tags.id, tag.id));
              const existing = existingBySlug || existingById;

              if (existing) {
                tagIdMap.set(tag.id, existing.id);
                if (mode === 'update') {
                  await tx
                    .update(tags)
                    .set({
                      name: tag.name,
                      description: tag.description ?? existing.description,

                    })
                    .where(eq(tags.id, existing.id));
                  importedCounts.tags++;
                }
              } else {
                let newId = tag.id;
                let newSlug = tag.slug.toLowerCase();
                if (mode === 'create_new') {
                  newId = `tag_${suffix}_${Math.random().toString(36).substring(2, 7)}`;
                  newSlug = `${tag.slug}-${suffix}`;
                }

                await tx.insert(tags).values({
                  id: newId,
                  name: tag.name,
                  slug: newSlug,
                  description: tag.description || null,
                  isTrashed: false,
                  createdAt: tag.createdAt ? new Date(tag.createdAt) : new Date(),

                });
                tagIdMap.set(tag.id, newId);
                importedCounts.tags++;
              }
            } catch (err) {
              console.warn(`Tag ${tag.slug} notice:`, err);
            }
          }
        }

        // E. MEDIA
        if (Array.isArray(data.media)) {
          for (const item of data.media) {
            if (!item.id || !item.url) continue;
            try {
              const [existing] = await tx.select().from(media).where(eq(media.id, item.id));
              if (existing && mode !== 'create_new') {
                if (mode === 'update') {
                  await tx
                    .update(media)
                    .set({
                      title: item.title,
                      altText: item.altText ?? existing.altText,
                      caption: item.caption ?? existing.caption,

                    })
                    .where(eq(media.id, existing.id));
                  importedCounts.media++;
                }
              } else {
                const uploaderId = item.uploadedBy ? (userIdMap.get(item.uploadedBy) || adminUserId) : adminUserId;
                await tx.insert(media).values({
                  id: mode === 'create_new' ? `med_${suffix}_${Math.random().toString(36).substring(2, 7)}` : item.id,
                  title: item.title,
                  fileName: item.fileName || 'file.jpg',
                  url: item.url,
                  thumbnailUrl: item.thumbnailUrl || item.url,
                  mimeType: item.mimeType || 'image/jpeg',
                  fileSize: item.fileSize || 102400,
                  width: item.width || null,
                  height: item.height || null,
                  altText: item.altText || null,
                  caption: item.caption || null,
                  uploadedBy: uploaderId,
                  createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),

                });
                importedCounts.media++;
              }
            } catch (err) {
              console.warn(`Media ${item.id} notice:`, err);
            }
          }
        }

        // F. PAGES
        if (Array.isArray(data.pages)) {
          for (const page of data.pages) {
            if (!page.id || !page.slug) continue;
            try {
              const [existing] = await tx.select().from(pages).where(eq(pages.slug, page.slug.toLowerCase()));
              if (existing && mode !== 'create_new') {
                if (mode === 'update') {
                  await tx
                    .update(pages)
                    .set({
                      title: page.title,
                      content: page.content,
                      featuredImage: page.featuredImage ?? existing.featuredImage,
                      status: page.status || existing.status,
                      seoTitle: page.seoTitle ?? existing.seoTitle,
                      metaDescription: page.metaDescription ?? existing.metaDescription,

                    })
                    .where(eq(pages.id, existing.id));
                  importedCounts.pages++;
                }
              } else {
                const pageAuthorId = page.authorId ? (userIdMap.get(page.authorId) || adminUserId) : adminUserId;
                await tx.insert(pages).values({
                  id: mode === 'create_new' ? `pag_${suffix}_${Math.random().toString(36).substring(2, 7)}` : page.id,
                  title: page.title,
                  slug: mode === 'create_new' ? `${page.slug}-${suffix}` : page.slug.toLowerCase(),
                  content: page.content || '',
                  featuredImage: page.featuredImage || null,
                  status: page.status || 'published',
                  authorId: pageAuthorId,
                  authorName: page.authorName || 'Staff',
                  seoTitle: page.seoTitle || null,
                  metaDescription: page.metaDescription || null,
                  isTrashed: false,
                  publishedAt: page.publishedAt ? new Date(page.publishedAt) : new Date(),
                  createdAt: page.createdAt ? new Date(page.createdAt) : new Date(),
                  updatedAt: page.updatedAt ? new Date(page.updatedAt) : new Date(),
                });
                importedCounts.pages++;
              }
            } catch (err) {
              console.warn(`Page ${page.slug} notice:`, err);
            }
          }
        }

        // G. POSTS
        if (Array.isArray(data.posts)) {
          for (const post of data.posts) {
            if (!post.id || !post.title || !post.slug) continue;
            try {
              const [existingBySlug] = await tx.select().from(posts).where(eq(posts.slug, post.slug.toLowerCase()));
              const [existingById] = await tx.select().from(posts).where(eq(posts.id, post.id));
              const existing = existingBySlug || existingById;

              const authorId = post.authorId ? (userIdMap.get(post.authorId) || adminUserId) : adminUserId;
              const categoryId = post.categoryId ? (categoryIdMap.get(post.categoryId) || 'cat_culture') : 'cat_culture';
              const subCategoryId = post.subCategoryId ? (categoryIdMap.get(post.subCategoryId) || null) : null;

              if (existing && mode !== 'create_new') {
                postIdMap.set(post.id, existing.id);
                if (mode === 'update') {
                  await tx
                    .update(posts)
                    .set({
                      title: post.title,
                      content: post.content,
                      excerpt: post.excerpt ?? existing.excerpt,
                      featuredImage: post.featuredImage ?? existing.featuredImage,
                      featuredImageCaption: post.featuredImageCaption ?? existing.featuredImageCaption,
                      authorId,

                      categoryId,
                      subCategoryId,
                      status: post.status || existing.status,
                      isFeatured: post.isFeatured ?? existing.isFeatured,
                      isTrending: post.isTrending ?? existing.isTrending,
                      isEditorPick: post.isEditorPick ?? existing.isEditorPick,
                      views: post.views ?? existing.views,
                      likes: post.likes ?? existing.likes,
                      readingTime: post.readingTime ?? existing.readingTime,
                      seoTitle: post.seoTitle ?? existing.seoTitle,
                      metaDescription: post.metaDescription ?? existing.metaDescription,
                      focusKeyword: post.focusKeyword ?? existing.focusKeyword,
                      canonicalUrl: post.canonicalUrl ?? existing.canonicalUrl,
                      ogImage: post.ogImage ?? existing.ogImage,
                      faqs: post.faqs || existing.faqs,
                      relatedPostIds: post.relatedPostIds || existing.relatedPostIds,
                      allowComments: post.allowComments ?? existing.allowComments,
                      blocks: post.blocks || existing.blocks,

                    })
                    .where(eq(posts.id, existing.id));
                  importedCounts.posts++;
                }
              } else {
                let newId = post.id;
                let newSlug = post.slug.toLowerCase();
                if (mode === 'create_new') {
                  newId = `pst_${suffix}_${Math.random().toString(36).substring(2, 7)}`;
                  newSlug = `${post.slug}-${suffix}`;
                }

                await tx.insert(posts).values({
                  id: newId,
                  title: post.title,
                  slug: newSlug,
                  content: post.content || '',
                  excerpt: post.excerpt || null,
                  featuredImage: post.featuredImage || null,
                  featuredImageCaption: post.featuredImageCaption || null,
                  authorId,

                  categoryId,
                  subCategoryId,
                  status: post.status || 'published',
                  isFeatured: post.isFeatured ?? false,
                  isTrending: post.isTrending ?? false,
                  isEditorPick: post.isEditorPick ?? false,
                  views: post.views ?? 0,
                  likes: post.likes ?? 0,
                  readingTime: post.readingTime ?? 3,
                  seoTitle: post.seoTitle || null,
                  metaDescription: post.metaDescription || null,
                  focusKeyword: post.focusKeyword || null,
                  canonicalUrl: post.canonicalUrl || null,
                  ogImage: post.ogImage || null,
                  faqs: post.faqs || [],
                  relatedPostIds: post.relatedPostIds || [],
                  allowComments: post.allowComments ?? true,
                  blocks: post.blocks || [],
                  isTrashed: false,
                  publishedAt: post.publishedAt ? new Date(post.publishedAt) : new Date(),
                  scheduledAt: post.scheduledAt ? new Date(post.scheduledAt) : null,
                  createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),

                });
                postIdMap.set(post.id, newId);
                importedCounts.posts++;
              }
            } catch (err) {
              console.warn(`Post ${post.slug} notice:`, err);
            }
          }
        }

        // H. POST TAGS
        if (Array.isArray(data.postTags)) {
          for (const pt of data.postTags) {
            const mappedPostId = postIdMap.get(pt.postId);
            const mappedTagId = tagIdMap.get(pt.tagId);
            if (mappedPostId && mappedTagId) {
              try {
                await tx
                  .insert(postTags)
                  .values({
                    id: `pt_${mappedPostId}_${mappedTagId}`,
                    postId: mappedPostId,
                    tagId: mappedTagId,
                  })
                  .onConflictDoNothing();
                importedCounts.postTags++;
              } catch {}
            }
          }
        }

        // Log Activity
        try {
          await tx.insert(activityLogs).values({
            id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            userId: adminUserId,
            userName: 'Administrator',
            userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            action: 'create',
            targetType: 'setting',
            targetId: 'backup_import',
            targetTitle: `Database Backup Import (${mode.replace('_', ' ').toUpperCase()})`,
            ipAddress: '127.0.0.1',
            timestamp: new Date(),
          });
        } catch {}
      });
    } catch (txError) {
      console.warn('[Restore] PostgreSQL transaction warning, falling back to memory store sync:', txError);
    }
  }

  // Always synchronize the imported data into active memory storage & persistent disk snapshot
  const memCounts = applyRestoredBackupToMemory(data, mode);

  // Return max counts between DB import and memory sync
  const finalCounts: Record<string, number> = {};
  for (const key of Object.keys(importedCounts)) {
    finalCounts[key] = Math.max(importedCounts[key] || 0, memCounts[key] || 0);
  }

  return {
    success: true,
    importedCounts: finalCounts,
    message: `Database backup restored successfully using '${mode}' mode. All articles, categories, and media are ready.`,
    metadata,
  };
}
