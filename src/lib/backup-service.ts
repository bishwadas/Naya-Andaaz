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

const SUPPORTED_APP_NAME = 'Sereia';
const CURRENT_BACKUP_VERSION = '1.0';
const CURRENT_SCHEMA_VERSION = '1.0';

/**
 * Collects all CMS data from PostgreSQL via Drizzle ORM and builds a ZIP archive.
 */
export async function generateBackupZip(): Promise<{ buffer: Buffer; filename: string; metadata: BackupMetadata }> {
  // 1. Query all tables concurrently
  const [
    allSettings,
    allUsers,
    allCategories,
    allTags,
    allMedia,
    allPages,
    allPosts,
    allPostTags,
    allPostRevisions,
    allComments,
    allMenus,
    allMenuItems,
    allAdvertisements,
    allNewsletters,
    allVideos,
    allActivityLogs,
    allNotifications,
  ] = await Promise.all([
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

  const timestamp = new Date().toISOString();
  const dateStr = timestamp.split('T')[0];
  const filename = `sereia-backup-${dateStr}.zip`;

  const metadata: BackupMetadata = {
    appName: SUPPORTED_APP_NAME,
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
      const files = fs.readdirSync(folder);
      for (const file of files) {
        const filePath = path.join(folder, file);
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
          const fileData = fs.readFileSync(filePath);
          zip.file(`media/${file}`, fileData);
        }
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

    if (payload.metadata.appName !== SUPPORTED_APP_NAME) {
      return {
        valid: false,
        error: `Incompatible backup: Application "${payload.metadata.appName}" does not match "${SUPPORTED_APP_NAME}".`,
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
 * Restores a Sereia CMS backup using a safe, transaction-based import.
 * Preserves relational integrity with dynamic ID mapping.
 */
export async function restoreBackupZip(
  zipBuffer: Buffer,
  mode: ImportMode = 'skip',
  adminUserId: string
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

  if (payload.metadata.appName !== SUPPORTED_APP_NAME) {
    throw new Error(`Incompatible backup source: "${payload.metadata.appName}" is not supported.`);
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
        const fileContent = await zip.files[filePath].async('nodebuffer');
        fs.writeFileSync(path.join(uploadsDir, fileName), fileContent);
      }
    }
  }

  // 3. Run entire database restoration inside an atomic transaction
  await db.transaction(async (tx) => {
    // ID Mappings: Old ID -> New/Resolved Database ID
    const userIdMap = new Map<string, string>();
    const categoryIdMap = new Map<string, string>();
    const tagIdMap = new Map<string, string>();
    const postIdMap = new Map<string, string>();
    const menuIdMap = new Map<string, string>();
    const menuItemIdMap = new Map<string, string>();

    // Helper unique suffix generator for 'create_new' mode
    const suffix = Date.now().toString(36);

    // ----------------------------------------------------
    // A. SITE SETTINGS
    // ----------------------------------------------------
    if (Array.isArray(data.siteSettings) && data.siteSettings.length > 0) {
      for (const setting of data.siteSettings) {
        if (!setting.key) continue;
        const [existing] = await tx.select().from(siteSettings).where(eq(siteSettings.key, setting.key));

        if (existing) {
          if (mode === 'update') {
            await tx
              .update(siteSettings)
              .set({
                value: typeof setting.value === 'object' ? JSON.stringify(setting.value) : String(setting.value),
                updatedAt: new Date(),
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
      }
    }

    // ----------------------------------------------------
    // B. USERS
    // ----------------------------------------------------
    if (Array.isArray(data.users)) {
      for (const user of data.users) {
        if (!user.id || !user.email) continue;

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
                status: user.status || existing.status,
                avatar: user.avatar || existing.avatar,
                bio: user.bio ?? existing.bio,
                website: user.website ?? existing.website,
                twitter: user.twitter ?? existing.twitter,
                facebook: user.facebook ?? existing.facebook,
                instagram: user.instagram ?? existing.instagram,
                linkedin: user.linkedin ?? existing.linkedin,
                isActive: user.isActive ?? existing.isActive,
                emailVerified: user.emailVerified ?? existing.emailVerified,
                passwordHash: user.passwordHash || existing.passwordHash,
                updatedAt: new Date(),
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
            uid: user.uid ? `${user.uid}_${suffix}` : newId,
            name: user.name,
            username: newUsername,
            email: newEmail,
            passwordHash: user.passwordHash || null,
            role: user.role || 'subscriber',
            status: user.status || 'active',
            avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            bio: user.bio || null,
            website: user.website || null,
            twitter: user.twitter || null,
            facebook: user.facebook || null,
            instagram: user.instagram || null,
            linkedin: user.linkedin || null,
            isActive: user.isActive ?? true,
            emailVerified: user.emailVerified ?? false,
            createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
            updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
          });

          userIdMap.set(user.id, newId);
          importedCounts.users++;
        }
      }
    }

    // ----------------------------------------------------
    // C. CATEGORIES (Parent categories first, then sub-categories)
    // ----------------------------------------------------
    if (Array.isArray(data.categories)) {
      const parentCategories = data.categories.filter((c) => !c.parentId);
      const subCategories = data.categories.filter((c) => Boolean(c.parentId));
      const sortedCategories = [...parentCategories, ...subCategories];

      for (const cat of sortedCategories) {
        if (!cat.id || !cat.slug) continue;

        const [existing] = await tx.select().from(categories).where(eq(categories.slug, cat.slug));

        if (existing && mode !== 'create_new') {
          categoryIdMap.set(cat.id, existing.id);

          if (mode === 'update') {
            const mappedParentId = cat.parentId ? (categoryIdMap.get(cat.parentId) || null) : null;
            await tx
              .update(categories)
              .set({
                name: cat.name,
                description: cat.description ?? existing.description,
                parentId: mappedParentId,
                color: cat.color || existing.color,
                image: cat.image ?? existing.image,
                seoTitle: cat.seoTitle ?? existing.seoTitle,
                metaDescription: cat.metaDescription ?? existing.metaDescription,
                order: cat.order ?? existing.order,
                updatedAt: new Date(),
              })
              .where(eq(categories.id, existing.id));
            importedCounts.categories++;
          }
        } else {
          let newId = cat.id;
          let newSlug = cat.slug;

          if (mode === 'create_new') {
            newId = `cat_${suffix}_${Math.random().toString(36).substring(2, 7)}`;
            newSlug = `${cat.slug}-${suffix}`;
          }

          const mappedParentId = cat.parentId ? (categoryIdMap.get(cat.parentId) || null) : null;

          await tx.insert(categories).values({
            id: newId,
            name: cat.name,
            slug: newSlug,
            description: cat.description || null,
            parentId: mappedParentId,
            color: cat.color || '#E11D48',
            image: cat.image || null,
            seoTitle: cat.seoTitle || null,
            metaDescription: cat.metaDescription || null,
            order: cat.order ?? 0,
            createdAt: cat.createdAt ? new Date(cat.createdAt) : new Date(),
            updatedAt: cat.updatedAt ? new Date(cat.updatedAt) : new Date(),
          });

          categoryIdMap.set(cat.id, newId);
          importedCounts.categories++;
        }
      }
    }

    // ----------------------------------------------------
    // D. TAGS
    // ----------------------------------------------------
    if (Array.isArray(data.tags)) {
      for (const tag of data.tags) {
        if (!tag.id || !tag.slug) continue;

        const [existing] = await tx.select().from(tags).where(eq(tags.slug, tag.slug));

        if (existing && mode !== 'create_new') {
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
          let newSlug = tag.slug;

          if (mode === 'create_new') {
            newId = `tag_${suffix}_${Math.random().toString(36).substring(2, 7)}`;
            newSlug = `${tag.slug}-${suffix}`;
          }

          await tx.insert(tags).values({
            id: newId,
            name: tag.name,
            slug: newSlug,
            description: tag.description || null,
            createdAt: tag.createdAt ? new Date(tag.createdAt) : new Date(),
          });

          tagIdMap.set(tag.id, newId);
          importedCounts.tags++;
        }
      }
    }

    // ----------------------------------------------------
    // E. MEDIA
    // ----------------------------------------------------
    if (Array.isArray(data.media)) {
      for (const item of data.media) {
        if (!item.id || !item.url) continue;

        const [existing] = await tx.select().from(media).where(eq(media.url, item.url));
        const mappedUploaderId = userIdMap.get(item.uploadedBy) || adminUserId;

        if (existing && mode !== 'create_new') {
          if (mode === 'update') {
            await tx
              .update(media)
              .set({
                title: item.title,
                fileName: item.fileName,
                altText: item.altText ?? existing.altText,
                caption: item.caption ?? existing.caption,
              })
              .where(eq(media.id, existing.id));
            importedCounts.media++;
          }
        } else {
          let newId = item.id;
          if (mode === 'create_new') {
            newId = `med_${suffix}_${Math.random().toString(36).substring(2, 7)}`;
          }

          await tx.insert(media).values({
            id: newId,
            title: item.title || 'Imported Media',
            fileName: item.fileName || 'file.jpg',
            url: item.url,
            thumbnailUrl: item.thumbnailUrl || null,
            mimeType: item.mimeType || 'image/jpeg',
            fileSize: item.fileSize || 1024,
            width: item.width || null,
            height: item.height || null,
            altText: item.altText || null,
            caption: item.caption || null,
            uploadedBy: mappedUploaderId,
            uploadedByName: item.uploadedByName || 'Administrator',
            createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
          });
          importedCounts.media++;
        }
      }
    }

    // ----------------------------------------------------
    // F. PAGES
    // ----------------------------------------------------
    if (Array.isArray(data.pages)) {
      for (const page of data.pages) {
        if (!page.id || !page.slug) continue;

        const [existing] = await tx.select().from(pages).where(eq(pages.slug, page.slug));
        const mappedAuthorId = userIdMap.get(page.authorId) || adminUserId;

        if (existing && mode !== 'create_new') {
          if (mode === 'update') {
            await tx
              .update(pages)
              .set({
                title: page.title,
                content: page.content ?? existing.content,
                featuredImage: page.featuredImage ?? existing.featuredImage,
                status: page.status || existing.status,
                authorId: mappedAuthorId,
                seoTitle: page.seoTitle ?? existing.seoTitle,
                metaDescription: page.metaDescription ?? existing.metaDescription,
                updatedAt: new Date(),
              })
              .where(eq(pages.id, existing.id));
            importedCounts.pages++;
          }
        } else {
          let newId = page.id;
          let newSlug = page.slug;

          if (mode === 'create_new') {
            newId = `pag_${suffix}_${Math.random().toString(36).substring(2, 7)}`;
            newSlug = `${page.slug}-${suffix}`;
          }

          await tx.insert(pages).values({
            id: newId,
            title: page.title,
            slug: newSlug,
            content: page.content || '',
            featuredImage: page.featuredImage || null,
            status: page.status || 'published',
            authorId: mappedAuthorId,
            authorName: page.authorName || 'Administrator',
            seoTitle: page.seoTitle || null,
            metaDescription: page.metaDescription || null,
            publishedAt: page.publishedAt ? new Date(page.publishedAt) : new Date(),
            createdAt: page.createdAt ? new Date(page.createdAt) : new Date(),
            updatedAt: page.updatedAt ? new Date(page.updatedAt) : new Date(),
          });
          importedCounts.pages++;
        }
      }
    }

    // ----------------------------------------------------
    // G. POSTS
    // ----------------------------------------------------
    if (Array.isArray(data.posts)) {
      for (const post of data.posts) {
        if (!post.id || !post.slug) continue;

        const [existing] = await tx.select().from(posts).where(eq(posts.slug, post.slug));

        // Resolve relational foreign keys
        const mappedAuthorId = userIdMap.get(post.authorId) || adminUserId;

        // Find fallback category if not in map
        let mappedCategoryId = categoryIdMap.get(post.categoryId);
        if (!mappedCategoryId) {
          const [firstCat] = await tx.select().from(categories).limit(1);
          mappedCategoryId = firstCat?.id || 'cat_culture_01';
        }

        const mappedSubCategoryId = post.subCategoryId ? (categoryIdMap.get(post.subCategoryId) || null) : null;

        if (existing && mode !== 'create_new') {
          postIdMap.set(post.id, existing.id);

          if (mode === 'update') {
            await tx
              .update(posts)
              .set({
                title: post.title,
                content: post.content ?? existing.content,
                excerpt: post.excerpt ?? existing.excerpt,
                featuredImage: post.featuredImage || existing.featuredImage,
                featuredImageCaption: post.featuredImageCaption ?? existing.featuredImageCaption,
                authorId: mappedAuthorId,
                categoryId: mappedCategoryId,
                subCategoryId: mappedSubCategoryId,
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
                faqs: post.faqs ?? existing.faqs,
                allowComments: post.allowComments ?? existing.allowComments,
                updatedAt: new Date(),
              })
              .where(eq(posts.id, existing.id));
            importedCounts.posts++;
          }
        } else {
          let newId = post.id;
          let newSlug = post.slug;

          if (mode === 'create_new') {
            newId = `pst_${suffix}_${Math.random().toString(36).substring(2, 7)}`;
            newSlug = `${post.slug}-${suffix}`;
          }

          await tx.insert(posts).values({
            id: newId,
            title: post.title,
            slug: newSlug,
            content: post.content || '',
            excerpt: post.excerpt || '',
            featuredImage: post.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
            featuredImageCaption: post.featuredImageCaption || null,
            authorId: mappedAuthorId,
            categoryId: mappedCategoryId,
            subCategoryId: mappedSubCategoryId,
            status: post.status || 'published',
            isFeatured: post.isFeatured ?? false,
            isTrending: post.isTrending ?? false,
            isEditorPick: post.isEditorPick ?? false,
            views: post.views ?? 0,
            likes: post.likes ?? 0,
            readingTime: post.readingTime ?? 3,
            publishedAt: post.publishedAt ? new Date(post.publishedAt) : new Date(),
            scheduledAt: post.scheduledAt ? new Date(post.scheduledAt) : null,
            seoTitle: post.seoTitle || null,
            metaDescription: post.metaDescription || null,
            focusKeyword: post.focusKeyword || null,
            canonicalUrl: post.canonicalUrl || null,
            ogImage: post.ogImage || null,
            faqs: post.faqs || [],
            relatedPostIds: post.relatedPostIds || [],
            allowComments: post.allowComments ?? true,
            createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
            updatedAt: post.updatedAt ? new Date(post.updatedAt) : new Date(),
          });

          postIdMap.set(post.id, newId);
          importedCounts.posts++;
        }
      }
    }

    // ----------------------------------------------------
    // H. POST-TAGS JUNCTION
    // ----------------------------------------------------
    if (Array.isArray(data.postTags)) {
      for (const pt of data.postTags) {
        const resolvedPostId = postIdMap.get(pt.postId);
        const resolvedTagId = tagIdMap.get(pt.tagId);

        if (resolvedPostId && resolvedTagId) {
          const [existingJunction] = await tx
            .select()
            .from(postTags)
            .where(sql`${postTags.postId} = ${resolvedPostId} AND ${postTags.tagId} = ${resolvedTagId}`);

          if (!existingJunction) {
            await tx.insert(postTags).values({
              id: `pt_${resolvedPostId.substring(0, 10)}_${resolvedTagId.substring(0, 10)}_${Math.random().toString(36).substring(2, 5)}`,
              postId: resolvedPostId,
              tagId: resolvedTagId,
            });
            importedCounts.postTags++;
          }
        }
      }
    }

    // ----------------------------------------------------
    // I. POST REVISIONS
    // ----------------------------------------------------
    if (Array.isArray(data.postRevisions)) {
      for (const rev of data.postRevisions) {
        const resolvedPostId = postIdMap.get(rev.postId);
        const resolvedAuthorId = userIdMap.get(rev.authorId) || adminUserId;

        if (resolvedPostId) {
          await tx.insert(postRevisions).values({
            id: `rev_${suffix}_${Math.random().toString(36).substring(2, 7)}`,
            postId: resolvedPostId,
            title: rev.title || 'Revision',
            content: rev.content || '',
            excerpt: rev.excerpt || '',
            authorId: resolvedAuthorId,
            authorName: rev.authorName || 'Administrator',
            createdAt: rev.createdAt ? new Date(rev.createdAt) : new Date(),
          });
        }
      }
    }

    // ----------------------------------------------------
    // J. COMMENTS
    // ----------------------------------------------------
    if (Array.isArray(data.comments)) {
      for (const com of data.comments) {
        const resolvedPostId = postIdMap.get(com.postId);
        const resolvedUserId = com.userId ? (userIdMap.get(com.userId) || null) : null;

        if (resolvedPostId) {
          const [existing] = await tx
            .select()
            .from(comments)
            .where(
              sql`${comments.postId} = ${resolvedPostId} AND ${comments.authorEmail} = ${com.authorEmail} AND ${comments.content} = ${com.content}`
            );

          if (!existing || mode === 'create_new') {
            await tx.insert(comments).values({
              id: `com_${suffix}_${Math.random().toString(36).substring(2, 7)}`,
              postId: resolvedPostId,
              authorName: com.authorName || 'Reader',
              authorEmail: com.authorEmail || 'reader@example.com',
              authorAvatar: com.authorAvatar || null,
              userId: resolvedUserId,
              content: com.content,
              status: com.status || 'approved',
              parentId: com.parentId || null,
              createdAt: com.createdAt ? new Date(com.createdAt) : new Date(),
            });
            importedCounts.comments++;
          }
        }
      }
    }

    // ----------------------------------------------------
    // K. MENUS & MENU ITEMS
    // ----------------------------------------------------
    if (Array.isArray(data.menus)) {
      for (const menu of data.menus) {
        if (!menu.id || !menu.location) continue;

        const [existing] = await tx.select().from(menus).where(eq(menus.location, menu.location));

        if (existing && mode !== 'create_new') {
          menuIdMap.set(menu.id, existing.id);
          if (mode === 'update') {
            await tx
              .update(menus)
              .set({
                name: menu.name,
                updatedAt: new Date(),
              })
              .where(eq(menus.id, existing.id));
            importedCounts.menus++;
          }
        } else {
          let newId = menu.id;
          let newLocation = menu.location;

          if (mode === 'create_new') {
            newId = `mnu_${suffix}_${Math.random().toString(36).substring(2, 7)}`;
            newLocation = `${menu.location}_${suffix}`;
          }

          await tx.insert(menus).values({
            id: newId,
            name: menu.name,
            location: newLocation,
            createdAt: menu.createdAt ? new Date(menu.createdAt) : new Date(),
            updatedAt: menu.updatedAt ? new Date(menu.updatedAt) : new Date(),
          });

          menuIdMap.set(menu.id, newId);
          importedCounts.menus++;
        }
      }
    }

    if (Array.isArray(data.menuItems)) {
      for (const item of data.menuItems) {
        const resolvedMenuId = menuIdMap.get(item.menuId);
        if (resolvedMenuId) {
          const [existing] = await tx
            .select()
            .from(menuItems)
            .where(
              sql`${menuItems.menuId} = ${resolvedMenuId} AND ${menuItems.label} = ${item.label} AND ${menuItems.url} = ${item.url}`
            );

          if (!existing || mode === 'create_new') {
            const newId = `mit_${suffix}_${Math.random().toString(36).substring(2, 7)}`;
            await tx.insert(menuItems).values({
              id: newId,
              menuId: resolvedMenuId,
              label: item.label,
              url: item.url,
              categorySlug: item.categorySlug || null,
              parentId: item.parentId ? (menuItemIdMap.get(item.parentId) || null) : null,
              order: item.order ?? 0,
              target: item.target || '_self',
              createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
            });
            menuItemIdMap.set(item.id, newId);
            importedCounts.menuItems++;
          }
        }
      }
    }

    // ----------------------------------------------------
    // L. ADVERTISEMENTS
    // ----------------------------------------------------
    if (Array.isArray(data.advertisements)) {
      for (const ad of data.advertisements) {
        if (!ad.title || !ad.location) continue;

        const [existing] = await tx
          .select()
          .from(advertisements)
          .where(sql`${advertisements.title} = ${ad.title} AND ${advertisements.location} = ${ad.location}`);

        if (existing && mode !== 'create_new') {
          if (mode === 'update') {
            await tx
              .update(advertisements)
              .set({
                type: ad.type || existing.type,
                code: ad.code ?? existing.code,
                imageUrl: ad.imageUrl ?? existing.imageUrl,
                targetUrl: ad.targetUrl ?? existing.targetUrl,
                status: ad.status || existing.status,
                updatedAt: new Date(),
              })
              .where(eq(advertisements.id, existing.id));
            importedCounts.advertisements++;
          }
        } else {
          await tx.insert(advertisements).values({
            id: `ad_${suffix}_${Math.random().toString(36).substring(2, 7)}`,
            title: ad.title,
            location: ad.location,
            type: ad.type || 'image',
            code: ad.code || null,
            imageUrl: ad.imageUrl || null,
            targetUrl: ad.targetUrl || null,
            status: ad.status || 'active',
            startDate: ad.startDate ? new Date(ad.startDate) : null,
            endDate: ad.endDate ? new Date(ad.endDate) : null,
            impressions: ad.impressions ?? 0,
            clicks: ad.clicks ?? 0,
            createdAt: ad.createdAt ? new Date(ad.createdAt) : new Date(),
            updatedAt: ad.updatedAt ? new Date(ad.updatedAt) : new Date(),
          });
          importedCounts.advertisements++;
        }
      }
    }

    // ----------------------------------------------------
    // M. NEWSLETTERS
    // ----------------------------------------------------
    if (Array.isArray(data.newsletters)) {
      for (const news of data.newsletters) {
        if (!news.email) continue;

        const [existing] = await tx.select().from(newsletters).where(eq(newsletters.email, news.email.toLowerCase()));

        if (!existing) {
          await tx.insert(newsletters).values({
            id: `nws_${suffix}_${Math.random().toString(36).substring(2, 7)}`,
            email: news.email.toLowerCase(),
            name: news.name || null,
            status: news.status || 'subscribed',
            source: news.source || 'backup_import',
            subscribedAt: news.subscribedAt ? new Date(news.subscribedAt) : new Date(),
            unsubscribedAt: news.unsubscribedAt ? new Date(news.unsubscribedAt) : null,
          });
          importedCounts.newsletters++;
        }
      }
    }

    // ----------------------------------------------------
    // N. VIDEOS
    // ----------------------------------------------------
    if (Array.isArray(data.videos)) {
      for (const vid of data.videos) {
        if (!vid.title || !vid.videoUrl) continue;

        const [existing] = await tx.select().from(videos).where(eq(videos.slug, vid.slug));

        if (existing && mode !== 'create_new') {
          if (mode === 'update') {
            await tx
              .update(videos)
              .set({
                title: vid.title,
                videoUrl: vid.videoUrl,
                thumbnail: vid.thumbnail || existing.thumbnail,
                description: vid.description ?? existing.description,
                updatedAt: new Date(),
              })
              .where(eq(videos.id, existing.id));
            importedCounts.videos++;
          }
        } else {
          await tx.insert(videos).values({
            id: `vid_${suffix}_${Math.random().toString(36).substring(2, 7)}`,
            title: vid.title,
            slug: mode === 'create_new' ? `${vid.slug}-${suffix}` : vid.slug,
            videoUrl: vid.videoUrl,
            provider: vid.provider || 'youtube',
            thumbnail: vid.thumbnail || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
            duration: vid.duration || null,
            description: vid.description || null,
            categoryId: vid.categoryId ? (categoryIdMap.get(vid.categoryId) || null) : null,
            authorId: vid.authorId ? (userIdMap.get(vid.authorId) || adminUserId) : adminUserId,
            views: vid.views ?? 0,
            isFeatured: vid.isFeatured ?? false,
            createdAt: vid.createdAt ? new Date(vid.createdAt) : new Date(),
            updatedAt: vid.updatedAt ? new Date(vid.updatedAt) : new Date(),
          });
          importedCounts.videos++;
        }
      }
    }

    // Log Activity for Import Action
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
  });

  return {
    success: true,
    importedCounts,
    message: `Database backup restored successfully using '${mode}' mode.`,
    metadata,
  };
}
