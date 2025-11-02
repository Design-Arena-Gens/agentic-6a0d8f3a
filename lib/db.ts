// Simple in-memory database with persistence to JSON files
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

export interface Trend {
  id: string;
  title: string;
  description: string;
  source: string;
  category: string;
  language: string;
  region: string;
  popularityScore: number;
  fetchedAt: string;
  approved: boolean;
  used: boolean;
  keywords: string[];
  url?: string;
}

export interface Post {
  id: string;
  trendId: string;
  platform: string;
  content: string;
  imageUrl?: string;
  tone: string;
  status: 'draft' | 'scheduled' | 'posted' | 'failed';
  scheduledFor?: string;
  postedAt?: string;
  error?: string;
  createdAt: string;
}

export interface Settings {
  autoPost: boolean;
  postingInterval: number; // minutes
  languages: string[];
  regions: string[];
  categories: string[];
  tone: string;
  platforms: {
    facebook: boolean;
    instagram: boolean;
    twitter: boolean;
    youtube: boolean;
    pinterest: boolean;
    threads: boolean;
  };
}

class Database {
  private trends: Trend[] = [];
  private posts: Post[] = [];
  private settings: Settings = {
    autoPost: false,
    postingInterval: 60,
    languages: ['en', 'ur'],
    regions: ['US', 'PK'],
    categories: ['technology', 'business', 'entertainment'],
    tone: 'professional',
    platforms: {
      facebook: true,
      instagram: true,
      twitter: true,
      youtube: false,
      pinterest: false,
      threads: false,
    },
  };

  async init() {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await this.load();
    } catch (error) {
      console.error('Database init error:', error);
    }
  }

  private async load() {
    try {
      const trendsData = await fs.readFile(path.join(DATA_DIR, 'trends.json'), 'utf-8');
      this.trends = JSON.parse(trendsData);
    } catch {
      this.trends = [];
    }

    try {
      const postsData = await fs.readFile(path.join(DATA_DIR, 'posts.json'), 'utf-8');
      this.posts = JSON.parse(postsData);
    } catch {
      this.posts = [];
    }

    try {
      const settingsData = await fs.readFile(path.join(DATA_DIR, 'settings.json'), 'utf-8');
      this.settings = JSON.parse(settingsData);
    } catch {
      // Use defaults
    }
  }

  private async save() {
    await fs.writeFile(path.join(DATA_DIR, 'trends.json'), JSON.stringify(this.trends, null, 2));
    await fs.writeFile(path.join(DATA_DIR, 'posts.json'), JSON.stringify(this.posts, null, 2));
    await fs.writeFile(path.join(DATA_DIR, 'settings.json'), JSON.stringify(this.settings, null, 2));
  }

  // Trends
  async getTrends(filters?: { approved?: boolean; used?: boolean; language?: string }) {
    let filtered = [...this.trends];
    if (filters?.approved !== undefined) {
      filtered = filtered.filter(t => t.approved === filters.approved);
    }
    if (filters?.used !== undefined) {
      filtered = filtered.filter(t => t.used === filters.used);
    }
    if (filters?.language) {
      filtered = filtered.filter(t => t.language === filters.language);
    }
    return filtered.sort((a, b) => new Date(b.fetchedAt).getTime() - new Date(a.fetchedAt).getTime());
  }

  async addTrend(trend: Omit<Trend, 'id'>) {
    const newTrend: Trend = {
      ...trend,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    this.trends.push(newTrend);
    await this.save();
    return newTrend;
  }

  async updateTrend(id: string, updates: Partial<Trend>) {
    const index = this.trends.findIndex(t => t.id === id);
    if (index !== -1) {
      this.trends[index] = { ...this.trends[index], ...updates };
      await this.save();
      return this.trends[index];
    }
    return null;
  }

  async deleteTrend(id: string) {
    this.trends = this.trends.filter(t => t.id !== id);
    await this.save();
  }

  // Posts
  async getPosts(filters?: { status?: string; platform?: string }) {
    let filtered = [...this.posts];
    if (filters?.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }
    if (filters?.platform) {
      filtered = filtered.filter(p => p.platform === filters.platform);
    }
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async addPost(post: Omit<Post, 'id'>) {
    const newPost: Post = {
      ...post,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    this.posts.push(newPost);
    await this.save();
    return newPost;
  }

  async updatePost(id: string, updates: Partial<Post>) {
    const index = this.posts.findIndex(p => p.id === id);
    if (index !== -1) {
      this.posts[index] = { ...this.posts[index], ...updates };
      await this.save();
      return this.posts[index];
    }
    return null;
  }

  async deletePost(id: string) {
    this.posts = this.posts.filter(p => p.id !== id);
    await this.save();
  }

  // Settings
  async getSettings() {
    return this.settings;
  }

  async updateSettings(updates: Partial<Settings>) {
    this.settings = { ...this.settings, ...updates };
    await this.save();
    return this.settings;
  }
}

export const db = new Database();
