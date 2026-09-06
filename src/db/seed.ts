import bcrypt from 'bcryptjs';
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
  postTags,
  siteSettings,
  tags,
  users,
  videos,
} from './schema';
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

export async function seedDatabase() {
  console.log('🌱 Starting Sereia PostgreSQL Database Seed...');

  // 1. Seed Site Settings
  try {
    for (const [key, value] of Object.entries(DEFAULT_SITE_SETTINGS)) {
      await db
        .insert(siteSettings)
        .values({
          key,
          value: typeof value === 'object' ? JSON.stringify(value) : String(value),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: {
            value: typeof value === 'object' ? JSON.stringify(value) : String(value),
            updatedAt: new Date(),
          },
        });
    }
    console.log('✓ Site settings seeded');
  } catch (error) {
    console.error('Error seeding site settings:', error);
  }

  // 2. Seed Users with verified bcrypt passwords
  try {
    const defaultPasswordHash = await bcrypt.hash('nayaandaaz@168', 10);

    for (const user of INITIAL_USERS) {
      await db
        .insert(users)
        .values({
          id: user.id,
          uid: user.id, // default uid mapping
          name: user.name,
          username: user.username,
          email: user.email.toLowerCase(),
          passwordHash: defaultPasswordHash,
          role: user.role,
          status: 'active',
          avatar: user.avatar,
          bio: user.bio,
          website: user.website,
          twitter: user.twitter,
          facebook: user.facebook,
          instagram: user.instagram,
          linkedin: user.linkedin,
          isActive: user.isActive ?? true,
          createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
          updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            name: user.name,
            email: user.email.toLowerCase(),
            passwordHash: defaultPasswordHash,
            avatar: user.avatar,
            bio: user.bio,
            role: user.role,
          },
        });
    }
    console.log('✓ Users seeded with secure password hashes');
  } catch (error) {
    console.error('Error seeding users:', error);
  }

  // 3. Seed Categories (Parents first, then subcategories)
  try {
    const parentCategories = INITIAL_CATEGORIES.filter((c) => !c.parentId);
    const subCategories = INITIAL_CATEGORIES.filter((c) => Boolean(c.parentId));

    for (const cat of parentCategories) {
      await db
        .insert(categories)
        .values({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          parentId: null,
          color: cat.color,
          image: cat.image,
          seoTitle: cat.seoTitle,
          metaDescription: cat.metaDescription,
          order: cat.order ?? 0,
          createdAt: cat.createdAt ? new Date(cat.createdAt) : new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: categories.id,
          set: {
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            color: cat.color,
          },
        });
    }

    for (const cat of subCategories) {
      await db
        .insert(categories)
        .values({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          parentId: cat.parentId,
          color: cat.color,
          image: cat.image,
          seoTitle: cat.seoTitle,
          metaDescription: cat.metaDescription,
          order: cat.order ?? 0,
          createdAt: cat.createdAt ? new Date(cat.createdAt) : new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: categories.id,
          set: {
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            parentId: cat.parentId,
            color: cat.color,
          },
        });
    }
    console.log('✓ Categories seeded (parents & subcategories hierarchy resolved)');
  } catch (error) {
    console.error('Error seeding categories:', error);
  }

  // 4. Seed Tags
  try {
    for (const tag of INITIAL_TAGS) {
      await db
        .insert(tags)
        .values({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          description: tag.description,
          createdAt: tag.createdAt ? new Date(tag.createdAt) : new Date(),
        })
        .onConflictDoUpdate({
          target: tags.id,
          set: {
            name: tag.name,
            slug: tag.slug,
          },
        });
    }
    console.log('✓ Tags seeded');
  } catch (error) {
    console.error('Error seeding tags:', error);
  }

  // 5. Seed Media
  try {
    for (const item of INITIAL_MEDIA) {
      await db
        .insert(media)
        .values({
          id: item.id,
          title: item.title,
          fileName: item.fileName,
          url: item.url,
          thumbnailUrl: item.thumbnailUrl ?? item.url,
          mimeType: item.mimeType,
          fileSize: item.fileSize,
          width: item.width ?? 1200,
          height: item.height ?? 800,
          altText: item.altText,
          caption: item.caption,
          uploadedBy: item.uploadedBy,
          uploadedByName: item.uploadedByName,
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        })
        .onConflictDoUpdate({
          target: media.id,
          set: {
            title: item.title,
            url: item.url,
          },
        });
    }
    console.log('✓ Media seeded');
  } catch (error) {
    console.error('Error seeding media:', error);
  }

  // 6. Seed Posts & PostTags
  try {
    for (const post of INITIAL_POSTS) {
      await db
        .insert(posts)
        .values({
          id: post.id,
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt,
          featuredImage: post.featuredImage,
          featuredImageCaption: post.featuredImageCaption,
          authorId: post.authorId,
          categoryId: post.categoryId,
          subCategoryId: post.subCategoryId ?? null,
          status: post.status,
          isFeatured: post.isFeatured,
          isTrending: post.isTrending,
          isEditorPick: post.isEditorPick,
          views: post.views,
          likes: post.likes,
          readingTime: post.readingTime,
          publishedAt: post.publishedAt ? new Date(post.publishedAt) : new Date(),
          scheduledAt: post.scheduledAt ? new Date(post.scheduledAt) : null,
          seoTitle: post.seoTitle,
          metaDescription: post.metaDescription,
          focusKeyword: post.focusKeyword,
          canonicalUrl: post.canonicalUrl,
          ogImage: post.ogImage,
          faqs: post.faqs ?? [],
          relatedPostIds: post.relatedPostIds ?? [],
          allowComments: post.allowComments ?? true,
          createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
          updatedAt: post.updatedAt ? new Date(post.updatedAt) : new Date(),
        })
        .onConflictDoUpdate({
          target: posts.id,
          set: {
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt,
            featuredImage: post.featuredImage,
            status: post.status,
            views: post.views,
            likes: post.likes,
            updatedAt: new Date(),
          },
        });

      // PostTags junction
      if (post.tagIds && post.tagIds.length > 0) {
        for (const tagId of post.tagIds) {
          await db
            .insert(postTags)
            .values({
              id: `${post.id}_${tagId}`,
              postId: post.id,
              tagId,
            })
            .onConflictDoNothing();
        }
      }
    }
    console.log('✓ Posts & PostTags seeded');
  } catch (error) {
    console.error('Error seeding posts:', error);
  }

  // 7. Seed Pages
  try {
    for (const page of INITIAL_PAGES) {
      await db
        .insert(pages)
        .values({
          id: page.id,
          title: page.title,
          slug: page.slug,
          content: page.content,
          featuredImage: page.featuredImage,
          status: page.status,
          authorId: page.authorId,
          authorName: page.authorName,
          seoTitle: page.seoTitle,
          metaDescription: page.metaDescription,
          publishedAt: page.publishedAt ? new Date(page.publishedAt) : new Date(),
          createdAt: page.createdAt ? new Date(page.createdAt) : new Date(),
          updatedAt: page.updatedAt ? new Date(page.updatedAt) : new Date(),
        })
        .onConflictDoUpdate({
          target: pages.id,
          set: {
            title: page.title,
            content: page.content,
            status: page.status,
          },
        });
    }
    console.log('✓ Pages seeded');
  } catch (error) {
    console.error('Error seeding pages:', error);
  }

  // 8. Seed Menus & Menu Items
  try {
    const primaryMenu = {
      id: 'menu_primary',
      name: 'Primary Navigation',
      location: 'primary',
    };
    await db
      .insert(menus)
      .values(primaryMenu)
      .onConflictDoUpdate({
        target: menus.location,
        set: { name: primaryMenu.name },
      });

    const primaryItems = [
      { id: 'item_1', menuId: 'menu_primary', label: 'Home', url: '/', order: 0 },
      { id: 'item_2', menuId: 'menu_primary', label: 'Entertainment', url: '/entertainment', categorySlug: 'entertainment', order: 1 },
      { id: 'item_3', menuId: 'menu_primary', label: 'Women Lifestyle', url: '/women-lifestyle', categorySlug: 'women-lifestyle', order: 2 },
      { id: 'item_4', menuId: 'menu_primary', label: 'Travel', url: '/travel', categorySlug: 'travel', order: 3 },
      { id: 'item_5', menuId: 'menu_primary', label: 'Food & Wine', url: '/food-wine', categorySlug: 'food-wine', order: 4 },
      { id: 'item_6', menuId: 'menu_primary', label: 'Career & Finance', url: '/career-finance', categorySlug: 'career-finance', order: 5 },
    ];

    for (const item of primaryItems) {
      await db
        .insert(menuItems)
        .values(item)
        .onConflictDoNothing();
    }

    const footerMenu = {
      id: 'menu_footer',
      name: 'Footer Links',
      location: 'footer',
    };
    await db
      .insert(menus)
      .values(footerMenu)
      .onConflictDoUpdate({
        target: menus.location,
        set: { name: footerMenu.name },
      });

    const footerItems = [
      { id: 'item_f1', menuId: 'menu_footer', label: 'About Us', url: '/page/about-us', order: 0 },
      { id: 'item_f2', menuId: 'menu_footer', label: 'Contact Us', url: '/page/contact-us', order: 1 },
      { id: 'item_f3', menuId: 'menu_footer', label: 'Privacy Policy', url: '/page/privacy-policy', order: 2 },
      { id: 'item_f4', menuId: 'menu_footer', label: 'Terms of Service', url: '/page/terms-and-conditions', order: 3 },
    ];

    for (const item of footerItems) {
      await db
        .insert(menuItems)
        .values(item)
        .onConflictDoNothing();
    }
    console.log('✓ Menus & Menu Items seeded');
  } catch (error) {
    console.error('Error seeding menus:', error);
  }

  // 9. Seed Comments
  try {
    const sampleComments = [
      {
        id: 'comment_1',
        postId: 'post_01',
        authorName: 'Sophia Lorenzi',
        authorEmail: 'sophia@example.com',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
        content: 'The level of detail on the hand embroidery this season was truly transcendent. Thank you for this breathtaking breakdown!',
        status: 'approved',
        createdAt: new Date('2026-08-12T14:30:00Z'),
      },
      {
        id: 'comment_2',
        postId: 'post_02',
        authorName: 'David K.',
        authorEmail: 'david@example.com',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
        content: 'Cannot wait for the Golden Lion announcement. The Lido selection this year looks incredible.',
        status: 'approved',
        createdAt: new Date('2026-08-12T16:00:00Z'),
      },
    ];

    for (const c of sampleComments) {
      await db
        .insert(comments)
        .values(c)
        .onConflictDoNothing();
    }
    console.log('✓ Comments seeded');
  } catch (error) {
    console.error('Error seeding comments:', error);
  }

  // 10. Seed Activity Logs
  try {
    for (const log of INITIAL_ACTIVITY_LOGS) {
      await db
        .insert(activityLogs)
        .values({
          id: log.id,
          userId: log.userId,
          userName: log.userName,
          userAvatar: log.userAvatar,
          action: log.action,
          targetType: log.targetType,
          targetTitle: log.targetTitle,
          timestamp: log.timestamp ? new Date(log.timestamp) : new Date(),
        })
        .onConflictDoNothing();
    }
    console.log('✓ Activity logs seeded');
  } catch (error) {
    console.error('Error seeding activity logs:', error);
  }

  // 11. Seed Notifications
  try {
    const sampleNotifications = [
      {
        id: 'notif_1',
        title: 'New Article Published',
        message: 'Elena Rostova published "The Renaissance of Haute Couture"',
        type: 'success',
        isRead: false,
        link: '/renaissance-haute-couture-paris-fashion-week',
        createdAt: new Date('2026-08-12T10:05:00Z'),
      },
      {
        id: 'notif_2',
        title: 'New Comment Pending',
        message: 'A new reader comment is awaiting moderation on Post #01',
        type: 'info',
        isRead: false,
        link: '/admin/comments',
        createdAt: new Date('2026-08-12T14:35:00Z'),
      },
    ];

    for (const n of sampleNotifications) {
      await db
        .insert(notifications)
        .values(n)
        .onConflictDoNothing();
    }
    console.log('✓ Notifications seeded');
  } catch (error) {
    console.error('Error seeding notifications:', error);
  }

  // 12. Seed Advertisements
  try {
    const sampleAds = [
      {
        id: 'ad_header_01',
        title: 'Audemars Piguet Royal Oak Offshore Campaign',
        location: 'header',
        type: 'image',
        imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
        targetUrl: '/haute-horlogerie',
        status: 'active',
        impressions: 24500,
        clicks: 1820,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'ad_sidebar_01',
        title: 'Vogue International Architectural Biennial 2026',
        location: 'sidebar',
        type: 'image',
        imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
        targetUrl: '/architecture-design',
        status: 'active',
        impressions: 14200,
        clicks: 960,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'ad_in_article_01',
        title: 'Maison Margiela Artisanal Capsule Invitation',
        location: 'in_article',
        type: 'image',
        imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80',
        targetUrl: '/women-lifestyle',
        status: 'active',
        impressions: 19800,
        clicks: 1430,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    for (const ad of sampleAds) {
      await db.insert(advertisements).values(ad).onConflictDoNothing();
    }
    console.log('✓ Advertisements seeded');
  } catch (error) {
    console.error('Error seeding advertisements:', error);
  }

  // 13. Seed Newsletters
  try {
    const sampleNewsletters = [
      {
        id: 'nl_01',
        email: 'curator@metmuseum.org',
        name: 'Julian Vance',
        status: 'subscribed',
        source: 'homepage_hero',
        subscribedAt: new Date(Date.now() - 3600000 * 48),
      },
      {
        id: 'nl_02',
        email: 'editorial@vogue.fr',
        name: 'Claire Beauchamp',
        status: 'subscribed',
        source: 'footer',
        subscribedAt: new Date(Date.now() - 3600000 * 24),
      },
    ];

    for (const nl of sampleNewsletters) {
      await db.insert(newsletters).values(nl).onConflictDoNothing();
    }
    console.log('✓ Newsletters seeded');
  } catch (error) {
    console.error('Error seeding newsletters:', error);
  }

  // 14. Seed Videos
  try {
    const sampleVideos = [
      {
        id: 'vid_01',
        title: 'Inside the Kyoto Minimalist Tea Pavilions',
        slug: 'inside-kyoto-minimalist-tea-pavilions',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        provider: 'youtube',
        thumbnail: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
        duration: '08:42',
        description: 'An exclusive cinematic walkthrough of Kyoto’s contemporary masterworks.',
        categoryId: 'cat_03',
        authorId: 'usr_admin_01',
        views: 4520,
        isFeatured: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'vid_02',
        title: 'Haute Horlogerie: The Art of Hand-Chased Tourbillons',
        slug: 'haute-horlogerie-art-of-hand-chased-tourbillons',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        provider: 'youtube',
        thumbnail: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
        duration: '12:15',
        description: 'Master watchmakers in Geneva demonstrate traditional hand-finishing techniques.',
        categoryId: 'cat_05',
        authorId: 'usr_editor_01',
        views: 8930,
        isFeatured: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    for (const vid of sampleVideos) {
      await db.insert(videos).values(vid).onConflictDoNothing();
    }
    console.log('✓ Videos seeded');
  } catch (error) {
    console.error('Error seeding videos:', error);
  }

  console.log('✨ Sereia PostgreSQL Database Seed Completed Successfully!');
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].includes('seed.ts')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed execution failed:', err);
      process.exit(1);
    });
}

