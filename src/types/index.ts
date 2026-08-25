/**
 * Sereia News & Content Management System
 * Core TypeScript Definitions & Domain Models
 */

export type Role = 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'SUBSCRIBER' | 'admin' | 'editor' | 'author' | 'subscriber';
export type UserRole = Role;

export type PostStatus = 'draft' | 'pending' | 'published' | 'scheduled' | 'trash';

export type PageStatus = 'draft' | 'published' | 'trash';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  avatar: string;
  bio?: string;
  website?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  isActive: boolean;
  emailVerified?: boolean;
  postsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  parentName?: string;
  image?: string;
  color?: string; // category accent badge color
  seoTitle?: string;
  metaDescription?: string;
  postCount?: number;
  order?: number;
  children?: Category[];
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  postCount?: number;
  createdAt: string;
}

export interface MediaItem {
  id: string;
  title: string;
  fileName: string;
  url: string;
  thumbnailUrl?: string;
  mimeType: string;
  fileSize: number; // in bytes
  width?: number;
  height?: number;
  altText?: string;
  caption?: string;
  uploadedBy: string; // User ID
  uploadedByName?: string;
  createdAt: string;
}

export interface ArticleFAQ {
  id: string;
  question: string;
  answer: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string; // HTML/Markdown string
  excerpt: string;
  featuredImage: string;
  featuredImageCaption?: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    bio?: string;
  };
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
    color?: string;
  };
  subCategoryId?: string | null;
  subCategory?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tagIds: string[];
  tags: Tag[];
  status: PostStatus;
  isFeatured: boolean;
  isTrending: boolean;
  isEditorPick: boolean;
  views: number;
  likes: number;
  readingTime: number; // in minutes
  publishedAt: string;
  scheduledAt?: string;
  updatedAt: string;
  createdAt: string;
  
  // SEO Metadata
  seoTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  ogImage?: string;
  
  // Structured Details
  blocks?: any[];
  faqs?: ArticleFAQ[];
  relatedPostIds?: string[];
  allowComments?: boolean;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  featuredImage?: string;
  status: PageStatus;
  authorId: string;
  authorName?: string;
  seoTitle?: string;
  metaDescription?: string;
  publishedAt: string;
  updatedAt: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  userId?: string;
  content: string;
  status: 'approved' | 'pending' | 'spam' | 'trash';
  parentId?: string | null;
  createdAt: string;
}

export interface SiteSettings {
  siteName: string;
  siteTitle?: string;
  tagline?: string;
  siteDescription: string;
  siteUrl: string;
  logo: string;
  logoDark?: string;
  favicon: string;
  postsPerPage: number;
  trendingTickerText?: string;
  
  // SEO Defaults
  defaultSeoTitle: string;
  defaultMetaDescription: string;
  defaultOgImage: string;
  googleAnalyticsId?: string;
  searchConsoleVerification?: string;
  
  // Social links
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  pinterestUrl?: string;
  linkedinUrl?: string;
  
  // Ads & Monetization
  headerAdHtml?: string;
  sidebarAdHtml?: string;
  inArticleAdHtml?: string;
  enableAds: boolean;
  showOurAuthorsOnAuthorPage?: boolean;
  
  // Contact & Footer
  contactEmail: string;
  copyrightText: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: 'create' | 'update' | 'delete' | 'publish' | 'login' | 'role_change';
  targetType: 'post' | 'category' | 'tag' | 'media' | 'page' | 'user' | 'setting';
  targetId?: string;
  targetTitle: string;
  timestamp: string;
}

export interface DashboardMetrics {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  pendingPosts: number;
  trashPosts: number;
  totalCategories: number;
  totalTags: number;
  totalMedia: number;
  totalPages: number;
  totalUsers: number;
  totalViews: number;
  recentPosts: Post[];
  recentUsers: User[];
  recentActivity: ActivityLog[];
}

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  categorySlug?: string;
  isMegaMenu?: boolean;
  children?: NavigationItem[];
}

export interface PostRevision {
  id: string;
  postId: string;
  title: string;
  content: string;
  excerpt: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface Menu {
  id: string;
  name: string;
  location: 'primary' | 'footer' | 'mobile';
  items?: MenuItem[];
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  menuId: string;
  label: string;
  url: string;
  categorySlug?: string;
  parentId?: string | null;
  order: number;
  target?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface Advertisement {
  id: string;
  title: string;
  location: 'header' | 'sidebar' | 'in_article' | 'footer';
  type: 'image' | 'code' | 'ad_network';
  code?: string;
  imageUrl?: string;
  targetUrl?: string;
  status: 'active' | 'inactive';
  startDate?: string;
  endDate?: string;
  impressions: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

export interface Newsletter {
  id: string;
  email: string;
  name?: string;
  status: 'subscribed' | 'unsubscribed';
  source?: string;
  subscribedAt: string;
  unsubscribedAt?: string;
}

export interface Video {
  id: string;
  title: string;
  slug: string;
  videoUrl: string;
  provider: 'youtube' | 'vimeo' | 'mp4';
  thumbnail: string;
  duration?: string;
  description?: string;
  categoryId?: string;
  authorId?: string;
  views: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}


