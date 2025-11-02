// Trending topic discovery from various sources
import axios from 'axios';
import * as cheerio from 'cheerio';
import Parser from 'rss-parser';

const rssParser = new Parser();

export interface TrendingTopic {
  title: string;
  description: string;
  source: string;
  category: string;
  popularityScore: number;
  keywords: string[];
  url?: string;
}

// Google Trends (scraping - free)
export async function getGoogleTrends(region = 'US'): Promise<TrendingTopic[]> {
  try {
    const url = `https://trends.google.com/trends/trendingsearches/daily/rss?geo=${region}`;
    const feed = await rssParser.parseURL(url);

    return feed.items.slice(0, 10).map((item, index) => ({
      title: item.title || 'Untitled',
      description: item.contentSnippet || item.content || '',
      source: 'Google Trends',
      category: 'general',
      popularityScore: 100 - (index * 5),
      keywords: item.title ? item.title.split(' ').filter(w => w.length > 3) : [],
      url: item.link,
    }));
  } catch (error) {
    console.error('Google Trends error:', error);
    return [];
  }
}

// Reddit Hot Topics (using public JSON API)
export async function getRedditTrending(subreddit = 'all'): Promise<TrendingTopic[]> {
  try {
    const response = await axios.get(`https://www.reddit.com/r/${subreddit}/hot.json?limit=25`, {
      headers: { 'User-Agent': 'Mozilla/5.0 SocialMediaBot/1.0' },
    });

    return response.data.data.children.slice(0, 10).map((post: any, index: number) => ({
      title: post.data.title,
      description: post.data.selftext || `${post.data.ups} upvotes, ${post.data.num_comments} comments`,
      source: 'Reddit',
      category: post.data.subreddit,
      popularityScore: Math.min(100, post.data.ups / 100),
      keywords: post.data.title.split(' ').filter((w: string) => w.length > 3),
      url: `https://reddit.com${post.data.permalink}`,
    }));
  } catch (error) {
    console.error('Reddit API error:', error);
    return [];
  }
}

// Hacker News (public API)
export async function getHackerNewsTrending(): Promise<TrendingTopic[]> {
  try {
    const topStories = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
    const storyIds = topStories.data.slice(0, 10);

    const stories = await Promise.all(
      storyIds.map((id: number) =>
        axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
      )
    );

    return stories.map((response, index) => {
      const story = response.data;
      return {
        title: story.title,
        description: story.text || `${story.score} points, ${story.descendants || 0} comments`,
        source: 'Hacker News',
        category: 'technology',
        popularityScore: Math.min(100, story.score / 10),
        keywords: story.title.split(' ').filter((w: string) => w.length > 3),
        url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
      };
    });
  } catch (error) {
    console.error('Hacker News API error:', error);
    return [];
  }
}

// Product Hunt (RSS feed)
export async function getProductHuntTrending(): Promise<TrendingTopic[]> {
  try {
    const feed = await rssParser.parseURL('https://www.producthunt.com/feed');

    return feed.items.slice(0, 10).map((item, index) => ({
      title: item.title || 'Untitled',
      description: item.contentSnippet || item.content || '',
      source: 'Product Hunt',
      category: 'product',
      popularityScore: 95 - (index * 5),
      keywords: item.title ? item.title.split(' ').filter(w => w.length > 3) : [],
      url: item.link,
    }));
  } catch (error) {
    console.error('Product Hunt error:', error);
    return [];
  }
}

// GitHub Trending (scraping)
export async function getGitHubTrending(language = ''): Promise<TrendingTopic[]> {
  try {
    const url = language
      ? `https://github.com/trending/${language}`
      : 'https://github.com/trending';

    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    const $ = cheerio.load(response.data);
    const trends: TrendingTopic[] = [];

    $('article.Box-row').slice(0, 10).each((index, element) => {
      const title = $(element).find('h2 a').text().trim().replace(/\s+/g, ' ');
      const description = $(element).find('p').text().trim();
      const stars = $(element).find('.float-sm-right').text().trim();

      if (title) {
        trends.push({
          title,
          description: description || `${stars} stars today`,
          source: 'GitHub',
          category: 'development',
          popularityScore: 90 - (index * 5),
          keywords: title.split(/[\/\s-]/).filter(w => w.length > 2),
          url: `https://github.com${$(element).find('h2 a').attr('href')}`,
        });
      }
    });

    return trends;
  } catch (error) {
    console.error('GitHub Trending error:', error);
    return [];
  }
}

// Dev.to Trending
export async function getDevToTrending(): Promise<TrendingTopic[]> {
  try {
    const response = await axios.get('https://dev.to/api/articles?top=7');

    return response.data.slice(0, 10).map((article: any, index: number) => ({
      title: article.title,
      description: article.description || `${article.positive_reactions_count} reactions`,
      source: 'Dev.to',
      category: 'development',
      popularityScore: Math.min(100, article.positive_reactions_count / 10),
      keywords: article.tag_list,
      url: article.url,
    }));
  } catch (error) {
    console.error('Dev.to API error:', error);
    return [];
  }
}

// News API (free tier - 100 requests/day)
export async function getNewsAPITrending(category = 'technology', language = 'en'): Promise<TrendingTopic[]> {
  try {
    // Using public RSS feeds instead for free access
    const feeds = {
      technology: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
      business: 'https://feeds.bbci.co.uk/news/business/rss.xml',
      entertainment: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml',
    };

    const feedUrl = feeds[category as keyof typeof feeds] || feeds.technology;
    const feed = await rssParser.parseURL(feedUrl);

    return feed.items.slice(0, 10).map((item, index) => ({
      title: item.title || 'Untitled',
      description: item.contentSnippet || item.content || '',
      source: 'BBC News',
      category,
      popularityScore: 85 - (index * 3),
      keywords: item.title ? item.title.split(' ').filter(w => w.length > 3) : [],
      url: item.link,
    }));
  } catch (error) {
    console.error('News API error:', error);
    return [];
  }
}

// Aggregate all trending topics
export async function getAllTrending(options: {
  languages?: string[];
  regions?: string[];
  categories?: string[];
}): Promise<TrendingTopic[]> {
  const { languages = ['en'], regions = ['US'], categories = ['technology'] } = options;

  const results = await Promise.allSettled([
    getGoogleTrends(regions[0]),
    getRedditTrending(),
    getHackerNewsTrending(),
    getProductHuntTrending(),
    getGitHubTrending(),
    getDevToTrending(),
    ...categories.map(cat => getNewsAPITrending(cat, languages[0])),
  ]);

  const allTrends: TrendingTopic[] = [];
  results.forEach(result => {
    if (result.status === 'fulfilled') {
      allTrends.push(...result.value);
    }
  });

  // Remove duplicates based on title similarity
  const unique = allTrends.filter((trend, index, self) =>
    index === self.findIndex(t =>
      t.title.toLowerCase().trim() === trend.title.toLowerCase().trim()
    )
  );

  // Sort by popularity score
  return unique.sort((a, b) => b.popularityScore - a.popularityScore);
}
