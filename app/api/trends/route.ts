import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAllTrending } from '@/lib/trending';
import { isAuthenticated } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const filters = {
    approved: searchParams.get('approved') === 'true' ? true : searchParams.get('approved') === 'false' ? false : undefined,
    used: searchParams.get('used') === 'true' ? true : searchParams.get('used') === 'false' ? false : undefined,
    language: searchParams.get('language') || undefined,
  };

  const trends = await db.getTrends(filters);
  return NextResponse.json(trends);
}

export async function POST(request: NextRequest) {
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  if (body.action === 'fetch') {
    // Fetch new trending topics
    const settings = await db.getSettings();
    const trendingTopics = await getAllTrending({
      languages: settings.languages,
      regions: settings.regions,
      categories: settings.categories,
    });

    // Save to database
    for (const topic of trendingTopics) {
      await db.addTrend({
        title: topic.title,
        description: topic.description,
        source: topic.source,
        category: topic.category,
        language: settings.languages[0] || 'en',
        region: settings.regions[0] || 'US',
        popularityScore: topic.popularityScore,
        fetchedAt: new Date().toISOString(),
        approved: false,
        used: false,
        keywords: topic.keywords,
        url: topic.url,
      });
    }

    return NextResponse.json({ success: true, count: trendingTopics.length });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
