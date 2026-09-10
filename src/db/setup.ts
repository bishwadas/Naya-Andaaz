import bcrypt from 'bcryptjs';
import { db, initDatabaseSchema, getClient, resolveDatabaseUrl } from './index';
import { siteSettings, users, menus, menuItems } from './schema';
import { DEFAULT_SITE_SETTINGS } from '@/lib/constants';
import { ensureStorageDirectories, getUploadsDir } from '@/lib/storage';
import { eq } from 'drizzle-orm';

export async function setupDatabase() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 NAYA ANDAAZ - FRESH DATABASE & STORAGE INITIALIZATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // 1. Ensure Persistent Storage Directories Exist
  const storage = ensureStorageDirectories();
  console.log(`📁 Persistent Data Directory : ${storage.dataDir}`);
  console.log(`📁 Persistent Uploads Path   : ${storage.uploadsDir}`);
  console.log(`📁 Database Location URL     : ${resolveDatabaseUrl()}`);

  // 2. Initialize SQLite Schema (All 18 Tables & Indexes)
  console.log('\n🔨 Initializing 18 Database Tables and Indexes (Non-destructive)...');
  await initDatabaseSchema();
  console.log('✓ Database schema verified / created successfully');

  // 3. Initialize Essential Site Settings (if missing)
  try {
    console.log('\n⚙️ Checking Essential Site Configuration...');
    let settingsInserted = 0;
    for (const [key, value] of Object.entries(DEFAULT_SITE_SETTINGS)) {
      const existing = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.key, key))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(siteSettings).values({
          key,
          value: typeof value === 'object' ? JSON.stringify(value) : String(value),
          updatedAt: new Date(),
        });
        settingsInserted++;
      }
    }
    console.log(`✓ Site settings ready (${settingsInserted} new settings initialized)`);
  } catch (error) {
    console.warn('Notice while setting up default settings:', error);
  }

  // 4. Initialize Default Navigation Menus (if missing)
  try {
    const existingMenus = await db.select().from(menus).limit(1);
    if (existingMenus.length === 0) {
      const mainMenuId = 'menu_main_nav';
      const footerMenuId = 'menu_footer_nav';

      await db.insert(menus).values([
        { id: mainMenuId, name: 'Main Navigation', location: 'header' },
        { id: footerMenuId, name: 'Footer Menu', location: 'footer' },
      ]);

      await db.insert(menuItems).values([
        { id: 'item_nav_home', menuId: mainMenuId, label: 'Home', url: '/', order: 0 },
        { id: 'item_nav_lifestyle', menuId: mainMenuId, label: 'Lifestyle', url: '/category/lifestyle', order: 1 },
        { id: 'item_nav_fashion', menuId: mainMenuId, label: 'Fashion', url: '/category/fashion', order: 2 },
        { id: 'item_nav_culture', menuId: mainMenuId, label: 'Culture', url: '/category/culture', order: 3 },
        { id: 'item_foot_about', menuId: footerMenuId, label: 'About Us', url: '/about', order: 0 },
        { id: 'item_foot_privacy', menuId: footerMenuId, label: 'Privacy Policy', url: '/privacy', order: 1 },
        { id: 'item_foot_contact', menuId: footerMenuId, label: 'Contact', url: '/contact', order: 2 },
      ]);
      console.log('✓ Default navigation menus created');
    }
  } catch (error) {
    console.warn('Notice while setting up navigation menus:', error);
  }

  // 5. First-Admin Account Setup
  try {
    console.log('\n👤 Checking Administrator Account...');
    const existingAdmins = await db
      .select()
      .from(users)
      .where(eq(users.role, 'admin'))
      .limit(1);

    if (existingAdmins.length > 0) {
      console.log(`✓ Admin account already exists (${existingAdmins[0].email}). Preserved without modification.`);
    } else {
      const adminEmail = (process.env.ADMIN_EMAIL || 'admin@nayaandaaz.com').trim().toLowerCase();
      const adminName = process.env.ADMIN_NAME || 'Naya Andaaz Administrator';
      const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@NayaAndaaz2026!';

      const passwordHash = await bcrypt.hash(adminPassword, 10);
      const adminId = `usr_admin_${Date.now()}`;

      await db.insert(users).values({
        id: adminId,
        uid: adminId,
        name: adminName,
        username: adminEmail.split('@')[0] || 'admin',
        email: adminEmail,
        passwordHash,
        role: 'admin',
        status: 'active',
        isActive: true,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log('🎉 First administrator account created successfully:');
      console.log(`   Email:    ${adminEmail}`);
      if (!process.env.ADMIN_PASSWORD) {
        console.log(`   Password: ${adminPassword} (Default initial password. Please change upon first login!)`);
      } else {
        console.log(`   Password: [SET VIA ADMIN_PASSWORD ENVIRONMENT VARIABLE]`);
      }
    }
  } catch (error) {
    console.error('Error verifying/creating admin account:', error);
  }

  // 6. Report Table Counts
  console.log('\n📊 Database Status Audit:');
  const client = getClient();
  const tables = [
    'users', 'categories', 'tags', 'posts', 'post_tags', 'post_revisions',
    'media', 'pages', 'comments', 'menus', 'menu_items', 'site_settings',
    'activity_logs', 'notifications', 'advertisements', 'newsletters', 'videos', 'otps'
  ];

  for (const t of tables) {
    try {
      const res = await client.execute(`SELECT COUNT(*) as cnt FROM ${t}`);
      console.log(`   ${t.padEnd(18)} : ${res.rows[0].cnt} rows`);
    } catch (e: any) {
      console.log(`   ${t.padEnd(18)} : ERROR (${e.message})`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ FRESH DATABASE SETUP COMPLETED SUCCESSFULLY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Allow direct execution via `npx tsx src/db/setup.ts` or `npm run db:setup`
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('setup.ts')) {
  setupDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Database setup failed:', err);
      process.exit(1);
    });
}
