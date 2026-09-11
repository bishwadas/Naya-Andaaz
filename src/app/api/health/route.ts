import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { media, posts } from '@/db/schema';
import { count } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  let dbStatus = 'Operational';
  let mediaCount = 0;
  let postCount = 0;

  try {
    const [mediaRes, postRes] = await Promise.all([
      db.select({ value: count() }).from(media),
      db.select({ value: count() }).from(posts),
    ]);
    mediaCount = mediaRes[0]?.value || 0;
    postCount = postRes[0]?.value || 0;
  } catch (error) {
    console.error('Health check DB error:', error);
    dbStatus = 'Degraded';
  }

  return NextResponse.json({
    status: dbStatus === 'Operational' ? 'healthy' : 'degraded',
    service: 'Sereia CMS Editorial Engine',
    timestamp: new Date().toISOString(),
    system: {
      database: dbStatus,
      server: 'Healthy',
      storage: `${mediaCount} Media Assets`,
      mediaCount,
      postCount,
      cdn: 'Active',
      nodeVersion: process.version,
    },
  });
}

