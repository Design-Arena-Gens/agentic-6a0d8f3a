# AI Social Media Manager

Fully automated social media management system with AI-powered content generation and multi-platform posting.

## Features

- 🔥 **Trending Discovery**: Fetch trending topics from Google Trends, Reddit, Hacker News, Product Hunt, GitHub, Dev.to, and more
- 🤖 **AI Content Generation**: Create unique posts using OpenAI GPT or HuggingFace models
- 📱 **Multi-Platform Support**: Facebook, Instagram, Twitter/X, YouTube, Pinterest, Threads
- 📊 **Admin Dashboard**: Full control over trends, posts, and automation settings
- ⏰ **Automated Scheduling**: Set posting intervals and let the system handle everything
- 🎨 **Image Generation**: AI-powered image creation with Stable Diffusion
- 🌍 **Multi-Language**: Support for English, Urdu, and more

## Quick Start

### 1. Installation

```bash
npm install
```

### 2. Configuration

Edit `.env.local` and add your API keys:

```env
# AI APIs (optional - has fallback templates)
OPENAI_API_KEY=your_key_here
HUGGINGFACE_API_KEY=your_key_here

# Social Media APIs
FACEBOOK_ACCESS_TOKEN=your_token
INSTAGRAM_ACCESS_TOKEN=your_token
TWITTER_API_KEY=your_key
TWITTER_API_SECRET=your_secret
TWITTER_ACCESS_TOKEN=your_token
TWITTER_ACCESS_SECRET=your_secret

# Admin Login
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Default login: `admin` / `admin123`

## How to Get API Keys

### Free/Freemium APIs

1. **HuggingFace** (Free): https://huggingface.co/settings/tokens
2. **OpenAI** ($5 credit): https://platform.openai.com/api-keys

### Social Media APIs

1. **Facebook/Instagram**: https://developers.facebook.com/
   - Create an app
   - Get access token with `pages_manage_posts` permission

2. **Twitter/X**: https://developer.twitter.com/
   - Create app
   - Get API keys and access tokens

3. **Pinterest**: https://developers.pinterest.com/
   - Create app
   - Get access token with write permissions

4. **Threads**: Uses Instagram API

## Usage

### 1. Dashboard Overview

View statistics about trends, posts, and platform performance.

### 2. Trending Topics

- Click "Fetch New Trends" to discover trending topics
- Approve/reject trends manually
- Generate posts from approved trends

### 3. Posts Management

- View all generated posts
- Edit content before posting
- Post immediately or schedule
- Monitor posting status

### 4. Settings

- Enable/disable auto-posting
- Set posting intervals
- Choose content tone
- Select active platforms
- Configure languages and regions

## Trending Sources

- Google Trends (RSS)
- Reddit Hot Topics (JSON API)
- Hacker News (Firebase API)
- Product Hunt (RSS)
- GitHub Trending (Scraping)
- Dev.to Articles (API)
- BBC News (RSS)

## Content Generation

The system supports multiple AI providers:

1. **OpenAI GPT-3.5**: Best quality (requires API key)
2. **HuggingFace Mistral**: Free alternative (requires API key)
3. **Template-based**: Fallback when no API keys configured

## Image Generation

Uses HuggingFace Stable Diffusion 2.1 (free with API key)

## Automation

Enable auto-posting in Settings:

1. System fetches trending topics periodically
2. Generates content for approved trends
3. Posts to enabled platforms at set intervals
4. Monitors and logs all activities

## Security

- Admin authentication required
- Session-based login
- Environment variables for sensitive data
- HTTPS recommended for production

## Deployment

### Vercel (Recommended)

```bash
vercel deploy --prod
```

### Other Platforms

Works on any Node.js hosting:
- Railway
- Render
- AWS
- DigitalOcean

## Troubleshooting

### Posts Failing

1. Check API credentials in `.env.local`
2. Verify social media app permissions
3. Check error messages in Posts page

### No Trends Found

1. Trending sources may be rate-limited
2. Try again in a few minutes
3. Check internet connectivity

### Images Not Generating

1. Add HuggingFace API key
2. Some platforms work without images

## Architecture

- **Frontend**: Next.js 15 + React + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: File-based JSON storage
- **AI**: OpenAI / HuggingFace APIs
- **Scheduling**: Node.js setInterval

## API Endpoints

- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Logout
- `GET /api/trends` - Get trends
- `POST /api/trends` - Fetch new trends
- `PATCH /api/trends/[id]` - Update trend
- `GET /api/posts` - Get posts
- `POST /api/posts` - Generate/schedule/post
- `GET /api/settings` - Get settings
- `PATCH /api/settings` - Update settings
- `GET /api/stats` - Get statistics

## License

MIT

## Support

For issues and questions, please check:
- API provider documentation
- Social media platform API docs
- GitHub issues

---

Built with ❤️ using Next.js and AI
