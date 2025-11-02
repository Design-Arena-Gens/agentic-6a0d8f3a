import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import { startScheduler, stopScheduler } from '@/lib/scheduler';

export async function GET() {
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const settings = await db.getSettings();
  return NextResponse.json(settings);
}

export async function PATCH(request: NextRequest) {
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const updates = await request.json();
  const settings = await db.updateSettings(updates);

  // Start/stop scheduler based on autoPost setting
  if (updates.autoPost !== undefined) {
    if (updates.autoPost) {
      startScheduler();
    } else {
      stopScheduler();
    }
  }

  return NextResponse.json(settings);
}
