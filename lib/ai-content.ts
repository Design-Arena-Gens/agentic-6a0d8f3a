// AI Content Generation using free APIs
import axios from 'axios';

export interface ContentRequest {
  topic: string;
  description: string;
  platform: string;
  tone: 'funny' | 'professional' | 'informative' | 'casual' | 'inspirational';
  language: string;
  keywords?: string[];
}

export interface GeneratedContent {
  text: string;
  hashtags: string[];
  imagePrompt?: string;
}

// HuggingFace API (free with rate limits)
export async function generateWithHuggingFace(request: ContentRequest): Promise<GeneratedContent> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  const platformLimits: Record<string, number> = {
    twitter: 280,
    instagram: 2200,
    facebook: 500,
    threads: 500,
    pinterest: 500,
    youtube: 1000,
  };

  const maxLength = platformLimits[request.platform] || 500;

  const prompt = createPrompt(request, maxLength);

  try {
    if (apiKey) {
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
        { inputs: prompt, parameters: { max_new_tokens: 300, temperature: 0.7 } },
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );

      const generatedText = response.data[0]?.generated_text || '';
      const content = extractContent(generatedText, prompt);

      return {
        text: content,
        hashtags: generateHashtags(request),
        imagePrompt: generateImagePrompt(request),
      };
    }
  } catch (error) {
    console.error('HuggingFace API error:', error);
  }

  // Fallback to template-based generation
  return generateWithTemplate(request);
}

// OpenAI API (if available)
export async function generateWithOpenAI(request: ContentRequest): Promise<GeneratedContent> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return generateWithHuggingFace(request);
  }

  const platformLimits: Record<string, number> = {
    twitter: 280,
    instagram: 2200,
    facebook: 500,
    threads: 500,
    pinterest: 500,
    youtube: 1000,
  };

  const maxLength = platformLimits[request.platform] || 500;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a social media content creator. Create engaging posts in ${request.language} language with a ${request.tone} tone.`,
          },
          {
            role: 'user',
            content: `Create a ${request.platform} post about: ${request.topic}. Description: ${request.description}. Maximum ${maxLength} characters. Do not include hashtags in the main text.`,
          },
        ],
        max_tokens: 300,
        temperature: 0.8,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const text = response.data.choices[0].message.content.trim();

    return {
      text: text.substring(0, maxLength),
      hashtags: generateHashtags(request),
      imagePrompt: generateImagePrompt(request),
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    return generateWithHuggingFace(request);
  }
}

// Template-based generation (free fallback)
function generateWithTemplate(request: ContentRequest): GeneratedContent {
  const templates = {
    funny: [
      `Just discovered ${request.topic}! 😂 ${request.description}. This is hilarious!`,
      `${request.topic} is trending and I can't stop laughing! 🤣 ${request.description}`,
      `Breaking: ${request.topic} exists and it's comedy gold! ${request.description}`,
    ],
    professional: [
      `Interesting development: ${request.topic}. ${request.description}. Worth following.`,
      `${request.topic} is making waves in the industry. ${request.description}`,
      `Key insight on ${request.topic}: ${request.description}. Thoughts?`,
    ],
    informative: [
      `Did you know? ${request.topic} - ${request.description}`,
      `Here's what you need to know about ${request.topic}: ${request.description}`,
      `Quick facts on ${request.topic}: ${request.description}`,
    ],
    casual: [
      `So ${request.topic} is a thing now... ${request.description} 🤔`,
      `Checking out ${request.topic} today. ${request.description}`,
      `${request.topic} caught my attention! ${request.description}`,
    ],
    inspirational: [
      `${request.topic} reminds us that ${request.description}. Keep pushing forward! 💪`,
      `Inspired by ${request.topic}. ${request.description}. You can do it too!`,
      `${request.topic} shows us what's possible. ${request.description} ✨`,
    ],
  };

  const toneTemplates = templates[request.tone] || templates.professional;
  const template = toneTemplates[Math.floor(Math.random() * toneTemplates.length)];

  return {
    text: template,
    hashtags: generateHashtags(request),
    imagePrompt: generateImagePrompt(request),
  };
}

function createPrompt(request: ContentRequest, maxLength: number): string {
  return `Create a ${request.tone} social media post for ${request.platform} about "${request.topic}".
Description: ${request.description}
Language: ${request.language}
Maximum length: ${maxLength} characters
Do not include hashtags in the text.

Post:`;
}

function extractContent(generated: string, prompt: string): string {
  // Remove the prompt from generated text
  let content = generated.replace(prompt, '').trim();

  // Remove any markdown or special formatting
  content = content.replace(/```[\s\S]*?```/g, '');
  content = content.replace(/#{1,6}\s/g, '');

  // Get first paragraph or sentence
  const lines = content.split('\n').filter(l => l.trim());
  return lines[0] || content;
}

function generateHashtags(request: ContentRequest): string[] {
  const keywords = request.keywords || request.topic.split(' ');
  const hashtags = keywords
    .filter(k => k.length > 3)
    .slice(0, 5)
    .map(k => `#${k.replace(/[^a-zA-Z0-9]/g, '')}`);

  // Add trending hashtag
  hashtags.push('#Trending');

  return hashtags;
}

function generateImagePrompt(request: ContentRequest): string {
  return `Professional ${request.tone} image about ${request.topic}, high quality, modern design, suitable for social media`;
}

// Generate image using HuggingFace Stable Diffusion (free)
export async function generateImage(prompt: string): Promise<string | null> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
      { inputs: prompt },
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        responseType: 'arraybuffer',
      }
    );

    // Convert to base64
    const base64 = Buffer.from(response.data).toString('base64');
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error('Image generation error:', error);
    return null;
  }
}

// Main content generation function
export async function generateContent(request: ContentRequest): Promise<GeneratedContent> {
  // Try OpenAI first, then HuggingFace, then templates
  try {
    if (process.env.OPENAI_API_KEY) {
      return await generateWithOpenAI(request);
    } else if (process.env.HUGGINGFACE_API_KEY) {
      return await generateWithHuggingFace(request);
    }
  } catch (error) {
    console.error('Content generation error:', error);
  }

  return generateWithTemplate(request);
}
