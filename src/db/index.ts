import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

export function getDatabaseUrl(): string | null {
  if (process.env.SQL_HOST && process.env.SQL_USER && process.env.SQL_PASSWORD && process.env.SQL_DB_NAME) {
    const user = process.env.SQL_USER;
    const password = encodeURIComponent(process.env.SQL_PASSWORD);
    const host = encodeURIComponent(process.env.SQL_HOST);
    const dbName = process.env.SQL_DB_NAME;
    return `postgresql://${user}:${password}@/${dbName}?host=${host}`;
  }

  if (process.env.DATABASE_URL && typeof process.env.DATABASE_URL === 'string' && process.env.DATABASE_URL.trim() !== '') {
    return process.env.DATABASE_URL.trim();
  }

  return null;
}

declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    if (process.env.SQL_HOST && process.env.SQL_USER && process.env.SQL_PASSWORD && process.env.SQL_DB_NAME) {
      global._postgresPool = new Pool({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DB_NAME,
        port: process.env.SQL_PORT ? Number(process.env.SQL_PORT) : undefined,
        max: 15,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });
    } else {
      const dbUrl = getDatabaseUrl() || 'postgresql://postgres:password@localhost:5432/sereia_news';
      global._postgresPool = new Pool({
        connectionString: dbUrl,
        max: 15,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });
    }

    global._postgresPool.on('error', (err) => {
      console.warn('[PostgreSQL Pool Warning]', err.message);
    });
  }
  return global._postgresPool;
};

let _dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!_dbInstance) {
    const pool = createPool();
    _dbInstance = drizzle(pool, { schema });
  }
  return _dbInstance;
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
