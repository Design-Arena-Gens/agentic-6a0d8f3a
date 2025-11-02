import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const trends = await db.getTrends();
  const posts = await db.getPosts();

  const stats = {
    totalTrends: trends.length,
    approvedTrends: trends.filter(t => t.approved).length,
    usedTrends: trends.filter(t => t.used).length,
    totalPosts: posts.length,
    scheduledPosts: posts.filter(p => p.status === 'scheduled').length,
    postedPosts: posts.filter(p => p.status === 'posted').length,
    failedPosts: posts.filter(p => p.status === 'failed').length,
    postsByPlatform: posts.reduce((acc, post) => {
      acc[post.platform] = (acc[post.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    postsByStatus: posts.reduce((acc, post) => {
      acc[post.status] = (acc[post.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return NextResponse.json(stats);
}
