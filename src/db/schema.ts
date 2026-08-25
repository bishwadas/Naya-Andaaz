import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// 1. Users Table
export const users = pgTable(
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
    isActive: boolean('is_active').notNull().default(true),
    emailVerified: boolean('email_verified').notNull().default(false),
    verificationToken: text('verification_token'),
    verificationTokenExpires: timestamp('verification_token_expires', { withTimezone: true }),
    passwordResetToken: text('password_reset_token'),
    passwordResetTokenExpires: timestamp('password_reset_token_expires', { withTimezone: true }),
    isTrashed: boolean('is_trashed').notNull().default(false),
    trashedAt: timestamp('trashed_at', { withTimezone: true }),
    lastLogin: timestamp('last_login', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
    usernameIdx: uniqueIndex('users_username_idx').on(table.username),
    roleIdx: index('users_role_idx').on(table.role),
    trashedIdx: index('users_trashed_idx').on(table.isTrashed),
    verificationTokenIdx: index('users_verification_token_idx').on(table.verificationToken),
    passwordResetTokenIdx: index('users_password_reset_token_idx').on(table.passwordResetToken),
  })
);

// 2. Categories Table
export const categories = pgTable(
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
    isTrashed: boolean('is_trashed').notNull().default(false),
    trashedAt: timestamp('trashed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex('categories_slug_idx').on(table.slug),
    parentIdIdx: index('categories_parent_id_idx').on(table.parentId),
    trashedIdx: index('categories_trashed_idx').on(table.isTrashed),
  })
);

// 3. Tags Table
export const tags = pgTable(
  'tags',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    isTrashed: boolean('is_trashed').notNull().default(false),
    trashedAt: timestamp('trashed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex('tags_slug_idx').on(table.slug),
    trashedIdx: index('tags_trashed_idx').on(table.isTrashed),
  })
);

// 4. Posts Table
export const posts = pgTable(
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
    isFeatured: boolean('is_featured').notNull().default(false),
    isTrending: boolean('is_trending').notNull().default(false),
    isEditorPick: boolean('is_editor_pick').notNull().default(false),
    isTrashed: boolean('is_trashed').notNull().default(false),
    trashedAt: timestamp('trashed_at', { withTimezone: true }),
    views: integer('views').notNull().default(0),
    likes: integer('likes').notNull().default(0),
    readingTime: integer('reading_time').notNull().default(3),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
    seoTitle: text('seo_title'),
    metaDescription: text('meta_description'),
    focusKeyword: text('focus_keyword'),
    canonicalUrl: text('canonical_url'),
    ogImage: text('og_image'),
    blocks: jsonb('blocks').$type<any[]>().default([]),
    faqs: jsonb('faqs').$type<{ id: string; question: string; answer: string }[]>().default([]),
    relatedPostIds: jsonb('related_post_ids').$type<string[]>().default([]),
    allowComments: boolean('allow_comments').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex('posts_slug_idx').on(table.slug),
    statusIdx: index('posts_status_idx').on(table.status),
    publishedAtIdx: index('posts_published_at_idx').on(table.publishedAt),
    authorIdIdx: index('posts_author_id_idx').on(table.authorId),
    categoryIdIdx: index('posts_category_id_idx').on(table.categoryId),
    subCategoryIdIdx: index('posts_sub_category_id_idx').on(table.subCategoryId),
    featuredTrendingIdx: index('posts_featured_trending_idx').on(table.isFeatured, table.isTrending),
    trashedIdx: index('posts_trashed_idx').on(table.isTrashed),
  })
);

// 5. PostTags Junction Table
export const postTags = pgTable(
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
  (table) => ({
    postTagUniqueIdx: uniqueIndex('post_tags_post_tag_unique_idx').on(table.postId, table.tagId),
    postIdIdx: index('post_tags_post_id_idx').on(table.postId),
    tagIdIdx: index('post_tags_tag_id_idx').on(table.tagId),
  })
);

// 6. PostRevisions Table
export const postRevisions = pgTable(
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
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    postIdIdx: index('post_revisions_post_id_idx').on(table.postId),
    createdAtIdx: index('post_revisions_created_at_idx').on(table.createdAt),
  })
);

// 7. Media Table
export const media = pgTable(
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
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uploadedByIdx: index('media_uploaded_by_idx').on(table.uploadedBy),
    createdAtIdx: index('media_created_at_idx').on(table.createdAt),
  })
);

// 8. Pages Table
export const pages = pgTable(
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
    isTrashed: boolean('is_trashed').notNull().default(false),
    trashedAt: timestamp('trashed_at', { withTimezone: true }),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex('pages_slug_idx').on(table.slug),
    statusIdx: index('pages_status_idx').on(table.status),
    trashedIdx: index('pages_trashed_idx').on(table.isTrashed),
  })
);

// 9. Comments Table
export const comments = pgTable(
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
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    postIdIdx: index('comments_post_id_idx').on(table.postId),
    statusIdx: index('comments_status_idx').on(table.status),
    createdAtIdx: index('comments_created_at_idx').on(table.createdAt),
  })
);

// 10. Menus Table
export const menus = pgTable(
  'menus',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    location: text('location').notNull().unique(), // 'primary' | 'footer' | 'mobile'
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    locationIdx: uniqueIndex('menus_location_idx').on(table.location),
  })
);

// 11. MenuItems Table
export const menuItems = pgTable(
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
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    menuIdIdx: index('menu_items_menu_id_idx').on(table.menuId),
    orderIdx: index('menu_items_order_idx').on(table.order),
  })
);

// 12. SiteSettings Table (Key-Value)
export const siteSettings = pgTable('site_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// 13. ActivityLogs Table
export const activityLogs = pgTable(
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
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    timestampIdx: index('activity_logs_timestamp_idx').on(table.timestamp),
    userIdIdx: index('activity_logs_user_id_idx').on(table.userId),
  })
);

// 14. Notifications Table
export const notifications = pgTable(
  'notifications',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    type: text('type').notNull().default('info'), // 'info' | 'warning' | 'success' | 'alert'
    isRead: boolean('is_read').notNull().default(false),
    link: text('link'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    isReadIdx: index('notifications_is_read_idx').on(table.isRead),
    createdAtIdx: index('notifications_created_at_idx').on(table.createdAt),
  })
);

// 15. Advertisements Table
export const advertisements = pgTable(
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
    startDate: timestamp('start_date', { withTimezone: true }),
    endDate: timestamp('end_date', { withTimezone: true }),
    impressions: integer('impressions').notNull().default(0),
    clicks: integer('clicks').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    locationIdx: index('ads_location_idx').on(table.location),
    statusIdx: index('ads_status_idx').on(table.status),
  })
);

// 16. Newsletters Table
export const newsletters = pgTable(
  'newsletters',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    name: text('name'),
    status: text('status').notNull().default('subscribed'), // 'subscribed' | 'unsubscribed'
    source: text('source').default('footer'),
    subscribedAt: timestamp('subscribed_at', { withTimezone: true }).notNull().defaultNow(),
    unsubscribedAt: timestamp('unsubscribed_at', { withTimezone: true }),
  },
  (table) => ({
    emailIdx: uniqueIndex('newsletters_email_idx').on(table.email),
  })
);

// 17. Videos Table
export const videos = pgTable(
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
    isFeatured: boolean('is_featured').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex('videos_slug_idx').on(table.slug),
  })
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

// 12. OTPs / Verification Codes Table
export const otps = pgTable(
  'otps',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    otpHash: text('otp_hash').notNull(),
    purpose: text('purpose').notNull(), // 'signup' | 'reset_password'
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    attempts: integer('attempts').notNull().default(0),
    maxAttempts: integer('max_attempts').notNull().default(5),
    isUsed: boolean('is_used').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    emailPurposeIdx: index('otps_email_purpose_idx').on(table.email, table.purpose),
    expiresAtIdx: index('otps_expires_at_idx').on(table.expiresAt),
  })
);
