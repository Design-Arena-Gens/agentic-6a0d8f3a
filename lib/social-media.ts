// Social Media Platform APIs
import axios from 'axios';

export interface PostContent {
  text: string;
  imageUrl?: string;
  hashtags?: string[];
}

export interface PostResult {
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
}

// Facebook/Meta API
export async function postToFacebook(content: PostContent): Promise<PostResult> {
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

  if (!accessToken) {
    return { success: false, error: 'Facebook access token not configured' };
  }

  try {
    const message = `${content.text}\n\n${content.hashtags?.join(' ') || ''}`;

    const response = await axios.post(
      `https://graph.facebook.com/v18.0/me/feed`,
      {
        message,
        access_token: accessToken,
      }
    );

    return {
      success: true,
      postId: response.data.id,
      url: `https://facebook.com/${response.data.id}`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message,
    };
  }
}

// Instagram API (via Facebook Graph API)
export async function postToInstagram(content: PostContent): Promise<PostResult> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!accessToken) {
    return { success: false, error: 'Instagram access token not configured' };
  }

  if (!content.imageUrl) {
    return { success: false, error: 'Instagram requires an image' };
  }

  try {
    // Step 1: Create media container
    const caption = `${content.text}\n\n${content.hashtags?.join(' ') || ''}`;

    const containerResponse = await axios.post(
      `https://graph.facebook.com/v18.0/me/media`,
      {
        image_url: content.imageUrl,
        caption,
        access_token: accessToken,
      }
    );

    const creationId = containerResponse.data.id;

    // Step 2: Publish the container
    const publishResponse = await axios.post(
      `https://graph.facebook.com/v18.0/me/media_publish`,
      {
        creation_id: creationId,
        access_token: accessToken,
      }
    );

    return {
      success: true,
      postId: publishResponse.data.id,
      url: `https://instagram.com/p/${publishResponse.data.id}`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message,
    };
  }
}

// Twitter/X API v2
export async function postToTwitter(content: PostContent): Promise<PostResult> {
  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret = process.env.TWITTER_ACCESS_SECRET;

  if (!apiKey || !accessToken) {
    return { success: false, error: 'Twitter API credentials not configured' };
  }

  try {
    const text = `${content.text}\n\n${content.hashtags?.join(' ') || ''}`.substring(0, 280);

    // Note: This is a simplified example. In production, you'd use OAuth 1.0a signing
    const response = await axios.post(
      'https://api.twitter.com/2/tweets',
      { text },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      postId: response.data.data.id,
      url: `https://twitter.com/user/status/${response.data.data.id}`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message,
    };
  }
}

// Threads API (via Instagram)
export async function postToThreads(content: PostContent): Promise<PostResult> {
  const accessToken = process.env.THREADS_ACCESS_TOKEN;

  if (!accessToken) {
    return { success: false, error: 'Threads access token not configured' };
  }

  try {
    const text = `${content.text}\n\n${content.hashtags?.join(' ') || ''}`;

    const response = await axios.post(
      'https://graph.threads.net/v1.0/me/threads',
      {
        media_type: 'TEXT',
        text,
        access_token: accessToken,
      }
    );

    return {
      success: true,
      postId: response.data.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message,
    };
  }
}

// Pinterest API
export async function postToPinterest(content: PostContent): Promise<PostResult> {
  const accessToken = process.env.PINTEREST_ACCESS_TOKEN;

  if (!accessToken) {
    return { success: false, error: 'Pinterest access token not configured' };
  }

  if (!content.imageUrl) {
    return { success: false, error: 'Pinterest requires an image' };
  }

  try {
    const description = `${content.text}\n\n${content.hashtags?.join(' ') || ''}`;

    const response = await axios.post(
      'https://api.pinterest.com/v5/pins',
      {
        title: content.text.substring(0, 100),
        description,
        media_source: {
          source_type: 'image_url',
          url: content.imageUrl,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      postId: response.data.id,
      url: `https://pinterest.com/pin/${response.data.id}`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

// YouTube Community Post (requires YouTube Data API v3)
export async function postToYouTube(content: PostContent): Promise<PostResult> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return { success: false, error: 'YouTube API key not configured' };
  }

  // Note: YouTube Community Posts require OAuth and channel membership
  return {
    success: false,
    error: 'YouTube Community Posts require OAuth authentication - please configure manually',
  };
}

// Main posting function
export async function postToSocialMedia(
  platform: string,
  content: PostContent
): Promise<PostResult> {
  const platformFunctions: Record<string, (content: PostContent) => Promise<PostResult>> = {
    facebook: postToFacebook,
    instagram: postToInstagram,
    twitter: postToTwitter,
    threads: postToThreads,
    pinterest: postToPinterest,
    youtube: postToYouTube,
  };

  const postFunction = platformFunctions[platform.toLowerCase()];

  if (!postFunction) {
    return { success: false, error: `Unsupported platform: ${platform}` };
  }

  return postFunction(content);
}
