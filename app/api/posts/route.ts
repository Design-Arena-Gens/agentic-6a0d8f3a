import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateContent } from '@/lib/ai-content';
import { generateImage } from '@/lib/ai-content';
import { postToSocialMedia } from '@/lib/social-media';
import { isAuthenticated } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const filters = {
    status: searchParams.get('status') || undefined,
    platform: searchParams.get('platform') || undefined,
  };

  const posts = await db.getPosts(filters);
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  if (body.action === 'generate') {
    // Generate content for a trend
    const trend = await db.getTrends();
    const selectedTrend = trend.find(t => t.id === body.trendId);

    if (!selectedTrend) {
      return NextResponse.json({ error: 'Trend not found' }, { status: 404 });
    }

    const settings = await db.getSettings();
    const content = await generateContent({
      topic: selectedTrend.title,
      description: selectedTrend.description,
      platform: body.platform,
      tone: body.tone || settings.tone,
      language: selectedTrend.language,
      keywords: selectedTrend.keywords,
    });

    // Generate image if needed
    let imageUrl;
    if (['instagram', 'pinterest', 'facebook'].includes(body.platform) && content.imagePrompt) {
      imageUrl = await generateImage(content.imagePrompt) || undefined;
    }

    const post = await db.addPost({
      trendId: body.trendId,
      platform: body.platform,
      content: `${content.text}\n\n${content.hashtags.join(' ')}`,
      imageUrl,
      tone: body.tone || settings.tone,
      status: 'draft',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(post);
  }

  if (body.action === 'schedule') {
    // Schedule a post
    const post = await db.updatePost(body.postId, {
      status: 'scheduled',
      scheduledFor: body.scheduledFor,
    });

    return NextResponse.json(post);
  }

  if (body.action === 'post') {
    // Post immediately
    const posts = await db.getPosts();
    const post = posts.find(p => p.id === body.postId);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const result = await postToSocialMedia(post.platform, {
      text: post.content,
      imageUrl: post.imageUrl,
      hashtags: post.content.match(/#\w+/g) || [],
    });

    if (result.success) {
      await db.updatePost(post.id, {
        status: 'posted',
        postedAt: new Date().toISOString(),
      });

      // Mark trend as used
      await db.updateTrend(post.trendId, { used: true });

      return NextResponse.json({ success: true, post });
    } else {
      await db.updatePost(post.id, {
        status: 'failed',
        error: result.error,
      });

      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
