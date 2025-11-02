// Background scheduler for automated posting
import { db } from './db';
import { generateContent } from './ai-content';
import { postToSocialMedia } from './social-media';
import { generateImage } from './ai-content';

let schedulerInterval: NodeJS.Timeout | null = null;

export function startScheduler() {
  if (schedulerInterval) {
    return;
  }

  // Run every minute
  schedulerInterval = setInterval(async () => {
    await processScheduledPosts();
  }, 60000);

  console.log('Scheduler started');
}

export function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('Scheduler stopped');
  }
}

async function processScheduledPosts() {
  try {
    const settings = await db.getSettings();

    if (!settings.autoPost) {
      return;
    }

    // Get scheduled posts that are due
    const now = new Date();
    const allPosts = await db.getPosts({ status: 'scheduled' });
    const duePosts = allPosts.filter(post =>
      post.scheduledFor && new Date(post.scheduledFor) <= now
    );

    for (const post of duePosts) {
      try {
        // Update status to posting
        await db.updatePost(post.id, { status: 'draft' });

        // Post to social media
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
        } else {
          await db.updatePost(post.id, {
            status: 'failed',
            error: result.error,
          });
        }
      } catch (error: any) {
        await db.updatePost(post.id, {
          status: 'failed',
          error: error.message,
        });
      }
    }

    // Auto-generate new posts if needed
    await autoGeneratePosts();
  } catch (error) {
    console.error('Scheduler error:', error);
  }
}

async function autoGeneratePosts() {
  try {
    const settings = await db.getSettings();

    if (!settings.autoPost) {
      return;
    }

    // Check if we need to create new posts
    const scheduledPosts = await db.getPosts({ status: 'scheduled' });

    if (scheduledPosts.length >= 5) {
      return; // Already have enough scheduled posts
    }

    // Get approved, unused trends
    const trends = await db.getTrends({ approved: true, used: false });

    if (trends.length === 0) {
      return;
    }

    // Get enabled platforms
    const enabledPlatforms = Object.entries(settings.platforms)
      .filter(([_, enabled]) => enabled)
      .map(([platform]) => platform);

    if (enabledPlatforms.length === 0) {
      return;
    }

    // Generate posts for each platform
    const trend = trends[0]; // Use the first available trend

    for (const platform of enabledPlatforms) {
      // Check if post already exists
      const existingPosts = await db.getPosts();
      const alreadyExists = existingPosts.some(
        p => p.trendId === trend.id && p.platform === platform
      );

      if (alreadyExists) {
        continue;
      }

      // Generate content
      const content = await generateContent({
        topic: trend.title,
        description: trend.description,
        platform,
        tone: settings.tone as any,
        language: trend.language,
        keywords: trend.keywords,
      });

      // Generate image if needed
      let imageUrl;
      if (['instagram', 'pinterest', 'facebook'].includes(platform) && content.imagePrompt) {
        imageUrl = await generateImage(content.imagePrompt) || undefined;
      }

      // Create scheduled post
      const scheduledFor = new Date();
      scheduledFor.setMinutes(scheduledFor.getMinutes() + settings.postingInterval);

      await db.addPost({
        trendId: trend.id,
        platform,
        content: `${content.text}\n\n${content.hashtags.join(' ')}`,
        imageUrl,
        tone: settings.tone,
        status: 'scheduled',
        scheduledFor: scheduledFor.toISOString(),
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Auto-generate posts error:', error);
  }
}

// Initialize database and scheduler
export async function initializeSystem() {
  await db.init();

  const settings = await db.getSettings();
  if (settings.autoPost) {
    startScheduler();
  }
}
