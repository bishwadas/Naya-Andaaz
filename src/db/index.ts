import { createClient, Client } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import fs from 'fs';
import path from 'path';
import { getPersistentDataDir, ensureStorageDirectories } from '@/lib/storage';

declare global {
  var _libsqlClient: Client | undefined;
  var _sqliteDbInstance: ReturnType<typeof drizzle<typeof schema>> | undefined;
}

export function resolveDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL || process.env.SQLITE_DB_PATH;
  if (envUrl && envUrl.trim().length > 0) {
    const clean = envUrl.trim();
    if (clean.startsWith('file:') || clean.startsWith('libsql:') || clean.startsWith('http:') || clean.startsWith('https:')) {
      return clean;
    }
    return `file:${path.isAbsolute(clean) ? clean : path.resolve(process.cwd(), clean)}`;
  }

  const dataDir = getPersistentDataDir();
  return `file:${path.join(dataDir, 'nayaandaaz.db')}`;
}

export function ensureDatabaseDirectory(dbUrl: string): void {
  try {
    ensureStorageDirectories();
    if (dbUrl.startsWith('file:')) {
      const filePath = dbUrl.replace(/^file:/, '');
      const dir = path.dirname(path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath));
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  } catch (err) {
    console.warn('[SQLite Storage] Directory check warning:', err);
  }
}

export function getClient(): Client {
  if (!global._libsqlClient) {
    const url = resolveDatabaseUrl();
    ensureDatabaseDirectory(url);

    global._libsqlClient = createClient({
      url,
    });

    // Execute SQLite performance and data integrity pragmas
    try {
      global._libsqlClient.execute('PRAGMA journal_mode = WAL;');
      global._libsqlClient.execute('PRAGMA foreign_keys = ON;');
      global._libsqlClient.execute('PRAGMA busy_timeout = 5000;');
      global._libsqlClient.execute('PRAGMA synchronous = NORMAL;');
    } catch (err) {
      console.warn('[SQLite Pragmas] Notice:', err);
    }
  }
  return global._libsqlClient;
}

export const SQLITE_DDL_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    uid TEXT UNIQUE,
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    role TEXT NOT NULL DEFAULT 'subscriber',
    status TEXT NOT NULL DEFAULT 'active',
    avatar TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    bio TEXT,
    website TEXT,
    twitter TEXT,
    facebook TEXT,
    instagram TEXT,
    linkedin TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    email_verified INTEGER NOT NULL DEFAULT 0,
    verification_token TEXT,
    verification_token_expires INTEGER,
    password_reset_token TEXT,
    password_reset_token_expires INTEGER,
    is_trashed INTEGER NOT NULL DEFAULT 0,
    trashed_at INTEGER,
    last_login INTEGER,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );`,
  `CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);`,
  `CREATE UNIQUE INDEX IF NOT EXISTS users_username_idx ON users(username);`,
  `CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);`,
  `CREATE INDEX IF NOT EXISTS users_trashed_idx ON users(is_trashed);`,

  `CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id TEXT,
    color TEXT DEFAULT '#E11D48',
    image TEXT,
    seo_title TEXT,
    meta_description TEXT,
    "order" INTEGER DEFAULT 0,
    is_trashed INTEGER NOT NULL DEFAULT 0,
    trashed_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_idx ON categories(slug);`,
  `CREATE INDEX IF NOT EXISTS categories_parent_id_idx ON categories(parent_id);`,

  `CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    is_trashed INTEGER NOT NULL DEFAULT 0,
    trashed_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS tags_slug_idx ON tags(slug);`,

  `CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL DEFAULT '',
    excerpt TEXT NOT NULL DEFAULT '',
    featured_image TEXT NOT NULL,
    featured_image_caption TEXT,
    author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    sub_category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'published',
    is_featured INTEGER NOT NULL DEFAULT 0,
    is_trending INTEGER NOT NULL DEFAULT 0,
    is_editor_pick INTEGER NOT NULL DEFAULT 0,
    is_trashed INTEGER NOT NULL DEFAULT 0,
    trashed_at INTEGER,
    views INTEGER NOT NULL DEFAULT 0,
    likes INTEGER NOT NULL DEFAULT 0,
    reading_time INTEGER NOT NULL DEFAULT 3,
    published_at INTEGER,
    scheduled_at INTEGER,
    seo_title TEXT,
    meta_description TEXT,
    focus_keyword TEXT,
    canonical_url TEXT,
    og_image TEXT,
    blocks TEXT DEFAULT '[]',
    faqs TEXT DEFAULT '[]',
    related_post_ids TEXT DEFAULT '[]',
    allow_comments INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS posts_slug_idx ON posts(slug);`,
  `CREATE INDEX IF NOT EXISTS posts_status_idx ON posts(status);`,
  `CREATE INDEX IF NOT EXISTS posts_author_id_idx ON posts(author_id);`,
  `CREATE INDEX IF NOT EXISTS posts_category_id_idx ON posts(category_id);`,

  `CREATE TABLE IF NOT EXISTS post_tags (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS post_tags_post_tag_unique_idx ON post_tags(post_id, tag_id);`,

  `CREATE TABLE IF NOT EXISTS post_revisions (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    author_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );`,

  `CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    file_name TEXT NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    caption TEXT,
    uploaded_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    uploaded_by_name TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );`,

  `CREATE TABLE IF NOT EXISTS pages (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL DEFAULT '',
    featured_image TEXT,
    status TEXT NOT NULL DEFAULT 'published',
    author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    author_name TEXT,
    seo_title TEXT,
    meta_description TEXT,
    is_trashed INTEGER NOT NULL DEFAULT 0,
    trashed_at INTEGER,
    published_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS pages_slug_idx ON pages(slug);`,

  `CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    author_avatar TEXT,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'approved',
    parent_id TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );`,

  `CREATE TABLE IF NOT EXISTS menus (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );`,

  `CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    menu_id TEXT NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    category_slug TEXT,
    parent_id TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    target TEXT DEFAULT '_self',
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );`,

  `CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );`,

  `CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    target_title TEXT NOT NULL,
    ip_address TEXT,
    timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );`,

  `CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    is_read INTEGER NOT NULL DEFAULT 0,
    link TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );`,

  `CREATE TABLE IF NOT EXISTS advertisements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'image',
    code TEXT,
    image_url TEXT,
    target_url TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    start_date INTEGER,
    end_date INTEGER,
    impressions INTEGER NOT NULL DEFAULT 0,
    clicks INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );`,

  `CREATE TABLE IF NOT EXISTS newsletters (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    status TEXT NOT NULL DEFAULT 'subscribed',
    source TEXT DEFAULT 'footer',
    subscribed_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    unsubscribed_at INTEGER
  );`,

  `CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    video_url TEXT NOT NULL,
    provider TEXT NOT NULL DEFAULT 'youtube',
    thumbnail TEXT NOT NULL,
    duration TEXT,
    description TEXT,
    category_id TEXT,
    author_id TEXT,
    views INTEGER NOT NULL DEFAULT 0,
    is_featured INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );`,

  `CREATE TABLE IF NOT EXISTS otps (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    purpose TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 5,
    is_used INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );`,
];

export function initDatabaseSchemaSync(driver?: any): void {
  if (driver && typeof driver.exec === 'function') {
    try {
      driver.exec(SQLITE_DDL_STATEMENTS.join('\n'));
    } catch (err) {
      console.error('[SQLite Sync Schema Init Error]:', err);
    }
  }
}

export async function initDatabaseSchema(): Promise<void> {
  const client = getClient();
  for (const statement of SQLITE_DDL_STATEMENTS) {
    try {
      await client.execute(statement);
    } catch (err) {
      console.error('[SQLite Schema Init Error]:', err);
    }
  }
}

export function getDb() {
  if (!global._sqliteDbInstance) {
    const client = getClient();
    global._sqliteDbInstance = drizzle(client, { schema });
  }
  return global._sqliteDbInstance;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop, receiver) {
    const actualDb = getDb();
    const value = Reflect.get(actualDb as any, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(actualDb);
    }
    return value;
  },
});

export default db;
