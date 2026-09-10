import { relations, sql } from 'drizzle-orm';
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

// 1. Users Table
export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    uid: text('uid').unique(), // Firebase Auth UID or internal unique identifier
    name: text('name').notNull(),
    username: text('username').notNull().unique(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash'),
    role: text('role').notNull().default('subscriber'), // 'admin' | 'editor' | 'author' | 'subscriber'
    status: text('status').notNull().default('active'), // 'active' | 'inactive' | 'suspended'
    avatar: text('avatar').notNull().default('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'),
    bio: text('bio'),
    website: text('website'),
    twitter: text('twitter'),
    facebook: text('facebook'),
    instagram: text('instagram'),
    linkedin: text('linkedin'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
    verificationToken: text('verification_token'),
    verificationTokenExpires: integer('verification_token_expires', { mode: 'timestamp' }),
    passwordResetToken: text('password_reset_token'),
    passwordResetTokenExpires: integer('password_reset_token_expires', { mode: 'timestamp' }),
    isTrashed: integer('is_trashed', { mode: 'boolean' }).notNull().default(false),
    trashedAt: integer('trashed_at', { mode: 'timestamp' }),
    lastLogin: integer('last_login', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [
    index('users_email_idx').on(table.email),
    uniqueIndex('users_username_idx').on(table.username),
    index('users_role_idx').on(table.role),
    index('users_trashed_idx').on(table.isTrashed),
    index('users_verification_token_idx').on(table.verificationToken),
    index('users_password_reset_token_idx').on(table.passwordResetToken),
  ]
);

// 2. Categories Table
export const categories = sqliteTable(
  'categories',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    parentId: text('parent_id'), // Self reference
    color: text('color').default('#E11D48'),
    image: text('image'),
    seoTitle: text('seo_title'),
    metaDescription: text('meta_description'),
    order: integer('order').default(0),
    isTrashed: integer('is_trashed', { mode: 'boolean' }).notNull().default(false),
    trashedAt: integer('trashed_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [
    uniqueIndex('categories_slug_idx').on(table.slug),
    index('categories_parent_id_idx').on(table.parentId),
    index('categories_trashed_idx').on(table.isTrashed),
  ]
);

// 3. Tags Table
export const tags = sqliteTable(
  'tags',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    isTrashed: integer('is_trashed', { mode: 'boolean' }).notNull().default(false),
    trashedAt: integer('trashed_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [
    uniqueIndex('tags_slug_idx').on(table.slug),
    index('tags_trashed_idx').on(table.isTrashed),
  ]
);

// 4. Posts Table
export const posts = sqliteTable(
  'posts',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    content: text('content').notNull().default(''),
    excerpt: text('excerpt').notNull().default(''),
    featuredImage: text('featured_image').notNull(),
    featuredImageCaption: text('featured_image_caption'),
    authorId: text('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    categoryId: text('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'restrict' }),
    subCategoryId: text('sub_category_id').references(() => categories.id, { onDelete: 'set null' }),
    status: text('status').notNull().default('published'), // 'draft' | 'pending' | 'published' | 'scheduled' | 'trash'
    isFeatured: integer('is_featured', { mode: 'boolean' }).notNull().default(false),
    isTrending: integer('is_trending', { mode: 'boolean' }).notNull().default(false),
    isEditorPick: integer('is_editor_pick', { mode: 'boolean' }).notNull().default(false),
    isTrashed: integer('is_trashed', { mode: 'boolean' }).notNull().default(false),
    trashedAt: integer('trashed_at', { mode: 'timestamp' }),
    views: integer('views').notNull().default(0),
    likes: integer('likes').notNull().default(0),
    readingTime: integer('reading_time').notNull().default(3),
    publishedAt: integer('published_at', { mode: 'timestamp' }),
    scheduledAt: integer('scheduled_at', { mode: 'timestamp' }),
    seoTitle: text('seo_title'),
    metaDescription: text('meta_description'),
    focusKeyword: text('focus_keyword'),
    canonicalUrl: text('canonical_url'),
    ogImage: text('og_image'),
    blocks: text('blocks', { mode: 'json' }).$type<any[]>().default([]),
    faqs: text('faqs', { mode: 'json' }).$type<{ id: string; question: string; answer: string }[]>().default([]),
    relatedPostIds: text('related_post_ids', { mode: 'json' }).$type<string[]>().default([]),
    allowComments: integer('allow_comments', { mode: 'boolean' }).notNull().default(true),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [
    uniqueIndex('posts_slug_idx').on(table.slug),
    index('posts_status_idx').on(table.status),
    index('posts_published_at_idx').on(table.publishedAt),
    index('posts_author_id_idx').on(table.authorId),
    index('posts_category_id_idx').on(table.categoryId),
    index('posts_sub_category_id_idx').on(table.subCategoryId),
    index('posts_trashed_idx').on(table.isTrashed),
  ]
);

// 5. PostTags Junction Table
export const postTags = sqliteTable(
  'post_tags',
  {
    id: text('id').primaryKey(),
    postId: text('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => [
    uniqueIndex('post_tags_post_tag_unique_idx').on(table.postId, table.tagId),
    index('post_tags_post_id_idx').on(table.postId),
    index('post_tags_tag_id_idx').on(table.tagId),
  ]
);

// 6. PostRevisions Table
export const postRevisions = sqliteTable(
  'post_revisions',
  {
    id: text('id').primaryKey(),
    postId: text('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    content: text('content').notNull(),
    excerpt: text('excerpt').notNull(),
    authorId: text('author_id').notNull(),
    authorName: text('author_name').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [
    index('post_revisions_post_id_idx').on(table.postId),
    index('post_revisions_created_at_idx').on(table.createdAt),
  ]
);

// 7. Media Table
export const media = sqliteTable(
  'media',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    fileName: text('file_name').notNull(),
    url: text('url').notNull(),
    thumbnailUrl: text('thumbnail_url'),
    mimeType: text('mime_type').notNull(),
    fileSize: integer('file_size').notNull(), // in bytes
    width: integer('width'),
    height: integer('height'),
    altText: text('alt_text'),
    caption: text('caption'),
    uploadedBy: text('uploaded_by')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    uploadedByName: text('uploaded_by_name'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [
    index('media_uploaded_by_idx').on(table.uploadedBy),
    index('media_created_at_idx').on(table.createdAt),
  ]
);

// 8. Pages Table
export const pages = sqliteTable(
  'pages',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    content: text('content').notNull().default(''),
    featuredImage: text('featured_image'),
    status: text('status').notNull().default('published'), // 'draft' | 'published' | 'trash'
    authorId: text('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    authorName: text('author_name'),
    seoTitle: text('seo_title'),
    metaDescription: text('meta_description'),
    isTrashed: integer('is_trashed', { mode: 'boolean' }).notNull().default(false),
    trashedAt: integer('trashed_at', { mode: 'timestamp' }),
    publishedAt: integer('published_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [
    uniqueIndex('pages_slug_idx').on(table.slug),
    index('pages_status_idx').on(table.status),
    index('pages_trashed_idx').on(table.isTrashed),
  ]
);

// 9. Comments Table
export const comments = sqliteTable(
  'comments',
  {
    id: text('id').primaryKey(),
    postId: text('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    authorName: text('author_name').notNull(),
    authorEmail: text('author_email').notNull(),
    authorAvatar: text('author_avatar'),
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    content: text('content').notNull(),
    status: text('status').notNull().default('approved'), // 'approved' | 'pending' | 'spam' | 'trash'
    parentId: text('parent_id'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [
    index('comments_post_id_idx').on(table.postId),
    index('comments_status_idx').on(table.status),
    index('comments_created_at_idx').on(table.createdAt),
  ]
);

// 10. Menus Table
export const menus = sqliteTable(
  'menus',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    location: text('location').notNull().unique(), // 'primary' | 'footer' | 'mobile'
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [
    uniqueIndex('menus_location_idx').on(table.location),
  ]
);

// 11. MenuItems Table
export const menuItems = sqliteTable(
  'menu_items',
  {
    id: text('id').primaryKey(),
    menuId: text('menu_id')
      .notNull()
      .references(() => menus.id, { onDelete: 'cascade' }),
    label: text('label').notNull(),
    url: text('url').notNull(),
    categorySlug: text('category_slug'),
    parentId: text('parent_id'),
    order: integer('order').notNull().default(0),
    target: text('target').default('_self'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [
    index('menu_items_menu_id_idx').on(table.menuId),
    index('menu_items_order_idx').on(table.order),
  ]
);

// 12. SiteSettings Table (Key-Value)
export const siteSettings = sqliteTable('site_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
});

// 13. ActivityLogs Table
export const activityLogs = sqliteTable(
  'activity_logs',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    userName: text('user_name').notNull(),
    userAvatar: text('user_avatar').notNull(),
    action: text('action').notNull(), // 'create' | 'update' | 'delete' | 'publish' | 'login' | 'role_change'
    targetType: text('target_type').notNull(), // 'post' | 'category' | 'tag' | 'media' | 'page' | 'user' | 'setting' | 'comment'
    targetId: text('target_id'),
    targetTitle: text('target_title').notNull(),
    ipAddress: text('ip_address'),
    timestamp: integer('timestamp', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [
    index('activity_logs_timestamp_idx').on(table.timestamp),
    index('activity_logs_user_id_idx').on(table.userId),
  ]
);

// 14. Notifications Table
export const notifications = sqliteTable(
  'notifications',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    type: text('type').notNull().default('info'), // 'info' | 'warning' | 'success' | 'alert'
    isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
    link: text('link'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [
    index('notifications_is_read_idx').on(table.isRead),
    index('notifications_created_at_idx').on(table.createdAt),
  ]
);

// 15. Advertisements Table
export const advertisements = sqliteTable(
  'advertisements',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    location: text('location').notNull(), // 'header' | 'sidebar' | 'in_article' | 'footer'
    type: text('type').notNull().default('image'), // 'image' | 'code' | 'ad_network'
    code: text('code'),
    imageUrl: text('image_url'),
    targetUrl: text('target_url'),
    status: text('status').notNull().default('active'), // 'active' | 'inactive'
    startDate: integer('start_date', { mode: 'timestamp' }),
    endDate: integer('end_date', { mode: 'timestamp' }),
    impressions: integer('impressions').notNull().default(0),
    clicks: integer('clicks').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [
    index('ads_location_idx').on(table.location),
    index('ads_status_idx').on(table.status),
  ]
);

// 16. Newsletters Table
export const newsletters = sqliteTable(
  'newsletters',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    name: text('name'),
    status: text('status').notNull().default('subscribed'), // 'subscribed' | 'unsubscribed'
    source: text('source').default('footer'),
    subscribedAt: integer('subscribed_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
    unsubscribedAt: integer('unsubscribed_at', { mode: 'timestamp' }),
  },
  (table) => [
    uniqueIndex('newsletters_email_idx').on(table.email),
  ]
);

// 17. Videos Table
export const videos = sqliteTable(
  'videos',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    videoUrl: text('video_url').notNull(),
    provider: text('provider').notNull().default('youtube'), // 'youtube' | 'vimeo' | 'mp4'
    thumbnail: text('thumbnail').notNull(),
    duration: text('duration'),
    description: text('description'),
    categoryId: text('category_id'),
    authorId: text('author_id'),
    views: integer('views').notNull().default(0),
    isFeatured: integer('is_featured', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [
    uniqueIndex('videos_slug_idx').on(table.slug),
  ]
);

// 18. OTPs / Verification Codes Table
export const otps = sqliteTable(
  'otps',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    otpHash: text('otp_hash').notNull(),
    purpose: text('purpose').notNull(), // 'signup' | 'reset_password'
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    attempts: integer('attempts').notNull().default(0),
    maxAttempts: integer('max_attempts').notNull().default(5),
    isUsed: integer('is_used', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [
    index('otps_email_purpose_idx').on(table.email, table.purpose),
    index('otps_expires_at_idx').on(table.expiresAt),
  ]
);

// Relational Definitions
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  media: many(media),
  pages: many(pages),
  comments: many(comments),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'category_parent',
  }),
  children: many(categories, { relationName: 'category_parent' }),
  posts: many(posts, { relationName: 'category_posts' }),
  subCategoryPosts: many(posts, { relationName: 'subcategory_posts' }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
    relationName: 'category_posts',
  }),
  subCategory: one(categories, {
    fields: [posts.subCategoryId],
    references: [categories.id],
    relationName: 'subcategory_posts',
  }),
  postTags: many(postTags),
  revisions: many(postRevisions),
  comments: many(comments),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}));

export const postRevisionsRelations = relations(postRevisions, ({ one }) => ({
  post: one(posts, {
    fields: [postRevisions.postId],
    references: [posts.id],
  }),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  uploader: one(users, {
    fields: [media.uploadedBy],
    references: [users.id],
  }),
}));

export const pagesRelations = relations(pages, ({ one }) => ({
  author: one(users, {
    fields: [pages.authorId],
    references: [users.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const menusRelations = relations(menus, ({ many }) => ({
  items: many(menuItems),
}));

export const menuItemsRelations = relations(menuItems, ({ one }) => ({
  menu: one(menus, {
    fields: [menuItems.menuId],
    references: [menus.id],
  }),
}));
