import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';


export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'Sereia Next.js Editorial Engine', timestamp: new Date().toISOString() });
}
