import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';


export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ user: user || null });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}

