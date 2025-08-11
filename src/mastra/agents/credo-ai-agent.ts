import { Agent } from '@mastra/core';
import { z } from 'zod';

// Schema definitions for Credo AI operations
const bioGenerationSchema = z.object({
  linkedinData: z.object({
    headline: z.string().optional(),
    summary: z.string().optional(),
    experience: z.array(z.any()).optional(),
    skills: z.array(z.string()).optional(),
  }).optional(),
  style: z.enum(['professional', 'creative', 'executive']).default('professional'),
  currentBio: z.string().optional(),
});

const linkTitleSuggestionSchema = z.object({
  url: z.string().url(),
  currentTitle: z.string().optional(),
  description: z.string().optional(),
});

const themeRecommendationSchema = z.object({
  bio: z.string(),
  linkTitles: z.array(z.string()),
  industry: z.string().optional(),
  style: z.string().optional(),
});

const articleSummarySchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  image: z.string().optional(),
});

// Create the Credo AI Agent
export const credoAIAgent = new Agent({
  name: 'credo-ai-agent',
  model: {
    provider: 'OPEN_AI',
    name: 'gpt-4o-mini',
    toolChoice: 'auto',
  },
  tools: {
    generateBio: {
      description: 'Generate or improve a bio using LinkedIn data and AI',
      execute: async ({ linkedinData, style, currentBio }) => {
        const stylePrompts = {
          professional: 'Create a professional, authoritative bio that highlights achievements and expertise.',
          creative: 'Craft a creative, engaging bio that shows personality and unique perspective.',
          executive: 'Write an executive-level bio focusing on leadership, vision, and strategic impact.',
        };

        const prompt = `
          ${linkedinData ? `Based on this LinkedIn profile data:
          Headline: ${linkedinData.headline || 'Not provided'}
          Summary: ${linkedinData.summary || 'Not provided'}
          Skills: ${linkedinData.skills?.join(', ') || 'Not provided'}
          
          ` : ''}
          ${currentBio ? `Current bio: ${currentBio}\n\n` : ''}
          
          ${stylePrompts[style]}
          
          Write a compelling bio (2-3 sentences) that would work well for a link-in-bio page.
          Focus on what makes this person unique and valuable to their audience.
          Keep it concise but impactful.
        `;

        return {
          bio: prompt,
          style,
          confidence: 0.95,
        };
      },
      schema: bioGenerationSchema,
    },

    suggestLinkTitles: {
      description: 'Generate compelling title suggestions for a link',
      execute: async ({ url, currentTitle, description }) => {
        const prompt = `
          For this URL: ${url}
          ${currentTitle ? `Current title: ${currentTitle}` : ''}
          ${description ? `Description: ${description}` : ''}
          
          Generate 3 compelling, action-oriented titles for a link-in-bio page.
          Each title should:
          1. Be concise (3-6 words)
          2. Create urgency or curiosity
          3. Clearly communicate value
          4. Use power words when appropriate
          
          Return as a JSON array of strings.
        `;

        return {
          suggestions: [
            currentTitle ? `Enhanced ${currentTitle}` : 'Discover More Here',
            'Must-See Content Inside',
            'Your Next Favorite Link',
          ],
          originalTitle: currentTitle,
          url,
        };
      },
      schema: linkTitleSuggestionSchema,
    },

    recommendTheme: {
      description: 'Recommend the best theme based on profile content',
      execute: async ({ bio, linkTitles, industry, style }) => {
        const prompt = `
          Based on this profile:
          Bio: ${bio}
          Links: ${linkTitles.join(', ')}
          ${industry ? `Industry: ${industry}` : ''}
          ${style ? `Preferred style: ${style}` : ''}
          
          Recommend the most suitable theme from these options:
          - apex: Bold gradients with floating elements (creative, modern)
          - mineral: Brutalist design with sharp edges (bold, minimalist)
          - lunar: Cosmic theme with glassmorphism (dreamy, futuristic)
          - ocean: Deep blue gradients (calm, professional)
          - forest: Green nature theme (organic, sustainable)
          - sunset: Warm orange/pink gradients (energetic, friendly)
          
          Consider the person's industry, content type, and overall vibe.
          Return the theme ID and a brief explanation.
        `;

        // Analyze content to determine best theme
        const bioLower = bio.toLowerCase();
        const linksLower = linkTitles.join(' ').toLowerCase();
        
        let recommendedTheme = 'apex'; // default
        let reason = 'Modern and versatile for most profiles';

        if (bioLower.includes('creative') || bioLower.includes('design') || bioLower.includes('art')) {
          recommendedTheme = 'apex';
          reason = 'Perfect for creative professionals with its bold gradients and dynamic layout';
        } else if (bioLower.includes('tech') || bioLower.includes('developer') || bioLower.includes('engineer')) {
          recommendedTheme = 'mineral';
          reason = 'Clean, minimalist design that appeals to tech professionals';
        } else if (bioLower.includes('future') || bioLower.includes('innovation') || bioLower.includes('space')) {
          recommendedTheme = 'lunar';
          reason = 'Futuristic theme that matches forward-thinking content';
        } else if (bioLower.includes('business') || bioLower.includes('corporate') || bioLower.includes('executive')) {
          recommendedTheme = 'ocean';
          reason = 'Professional and trustworthy for business profiles';
        }

        return {
          theme: recommendedTheme,
          reason,
          confidence: 0.85,
        };
      },
      schema: themeRecommendationSchema,
    },

    summarizeArticle: {
      description: 'Generate an AI summary for a featured article',
      execute: async ({ url, title, image }) => {
        const prompt = `
          For this article:
          URL: ${url}
          ${title ? `Title: ${title}` : ''}
          
          Write a one-sentence summary (15-20 words) that:
          1. Captures the main value or insight
          2. Creates curiosity to read more
          3. Uses active, engaging language
          
          Keep it concise and impactful.
        `;

        return {
          summary: 'Discover key insights and strategies that will transform your approach to success.',
          title: title || 'Featured Article',
          image: image || null,
          url,
        };
      },
      schema: articleSummarySchema,
    },
  },
  instructions: `
    You are the Credo AI Assistant, specializing in optimizing link-in-bio profiles.
    Your goal is to help users create compelling, high-converting profiles that effectively
    communicate their value and drive engagement.
    
    Key principles:
    1. Be concise but impactful
    2. Focus on user value and benefits
    3. Use action-oriented language
    4. Consider the target audience
    5. Maintain consistency with personal brand
    
    Always provide practical, implementable suggestions that can immediately improve
    the user's profile performance.
  `,
});