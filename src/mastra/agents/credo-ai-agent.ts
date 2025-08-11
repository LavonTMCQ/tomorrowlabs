import { Agent } from '@mastra/core';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { createTool } from '@mastra/core/tools';
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';

// ==========================================
// 1. MEMORY CONFIGURATION
// ==========================================

// Configure persistent memory for the Credo AI Agent
// This uses resource-scoped memory to remember users across conversations
// Semantic recall is disabled when no vector store is available
const memoryOptions: any = {
  lastMessages: 20, // Remember last 20 messages for context
  workingMemory: {
    enabled: true,
    scope: 'resource', // Persistent user profile across threads
    template: `# Credo User Profile
## Personal Information
- **Name**: 
- **Company/Role**: 
- **Industry**: 
- **LinkedIn Profile**: 

## Content Preferences
- **Bio Style**: [professional/creative/executive]
- **Previous Bio Versions**: 
  - Version 1: 
  - Version 2: 
  - Current: 
- **Preferred Link Titles Style**: [action-oriented/descriptive/minimalist]
- **Theme Preference**: 
- **Color Preferences**: 

## Link Profile
- **Primary Links**: 
- **Content Categories**: 
- **Most Clicked Links**: 
- **Link Performance Notes**: 

## Interaction History
- **Last Bio Generation**: 
- **Last Theme Recommendation**: 
- **AI Suggestions Used**: 
- **Feedback Notes**: 
`,
  },
};

// Only enable semantic recall if a vector store is configured
if (process.env.POSTGRES_CONNECTION_STRING) {
  memoryOptions.semanticRecall = {
    topK: 5, // Retrieve 5 most relevant past messages
    messageRange: 3, // Include 3 messages of context
    scope: 'resource', // Remember across all user conversations
  };
}

// Create memory only if storage is available
let credoMemory: Memory | undefined;
try {
  credoMemory = new Memory({
    storage: new LibSQLStore({
      url: process.env.MASTRA_DB_URL || 'file:./credo-memory.db',
    }),
    options: memoryOptions,
  });
} catch (error) {
  console.warn('Memory initialization failed, continuing without persistent memory:', error);
  // Agent will work without memory, just won't remember across conversations
}

// ==========================================
// 2. TOOLS DEFINITION
// ==========================================

// Tool for scraping web content
export const webScraperTool = createTool({
  id: 'web-scraper',
  description: 'Scrapes a URL to extract title, H1 tag, and meta description',
  inputSchema: z.object({
    url: z.string().url().describe('The URL to scrape'),
  }),
  outputSchema: z.object({
    title: z.string().optional(),
    h1: z.string().optional(),
    metaDescription: z.string().optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      // In production, this would make an actual HTTP request
      // For now, we'll simulate the scraping
      const response = await fetch(context.url);
      const html = await response.text();
      
      // Simple regex extraction (in production, use a proper HTML parser)
      const titleMatch = html.match(/<title>(.*?)<\/title>/i);
      const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
      const metaMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
      
      return {
        title: titleMatch?.[1] || undefined,
        h1: h1Match?.[1] || undefined,
        metaDescription: metaMatch?.[1] || undefined,
      };
    } catch (error) {
      return {
        error: `Failed to scrape URL: ${error}`,
      };
    }
  },
});

// Tool for analyzing text tone
export const toneAnalyzerTool = createTool({
  id: 'tone-analyzer',
  description: 'Analyzes the tone and style of text content',
  inputSchema: z.object({
    text: z.string().describe('The text to analyze'),
  }),
  outputSchema: z.object({
    primaryTone: z.enum(['professional', 'creative', 'casual', 'technical', 'inspirational']),
    confidence: z.number().min(0).max(1),
    keywords: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    // Analyze text for tone (simplified version)
    const text = context.text.toLowerCase();
    
    let primaryTone: 'professional' | 'creative' | 'casual' | 'technical' | 'inspirational' = 'professional';
    let confidence = 0.8;
    
    if (text.includes('innovation') || text.includes('creative') || text.includes('design')) {
      primaryTone = 'creative';
      confidence = 0.85;
    } else if (text.includes('ceo') || text.includes('executive') || text.includes('leadership')) {
      primaryTone = 'professional';
      confidence = 0.9;
    } else if (text.includes('code') || text.includes('engineering') || text.includes('technical')) {
      primaryTone = 'technical';
      confidence = 0.88;
    }
    
    // Extract keywords (simplified)
    const words = text.split(/\s+/);
    const keywords = words
      .filter(word => word.length > 5)
      .slice(0, 5);
    
    return {
      primaryTone,
      confidence,
      keywords,
    };
  },
});

// Tool for fetching article content
export const articleFetcherTool = createTool({
  id: 'article-fetcher',
  description: 'Fetches and extracts key content from an article URL',
  inputSchema: z.object({
    url: z.string().url(),
  }),
  outputSchema: z.object({
    title: z.string(),
    summary: z.string(),
    mainPoints: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    // First use the web scraper tool
    const scraped = await webScraperTool.execute({ context });
    
    return {
      title: scraped.title || 'Article',
      summary: scraped.metaDescription || 'Interesting content worth exploring',
      mainPoints: ['Key insight from the article', 'Important takeaway'],
    };
  },
});

// ==========================================
// 3. ENHANCED CREDO AI AGENT
// ==========================================

export const credoAIAgent = new Agent({
  name: 'credo-ai-agent',
  model: openai('gpt-4o-mini'),
  ...(credoMemory && { memory: credoMemory }),
  tools: {
    webScraperTool,
    toneAnalyzerTool,
    articleFetcherTool,
  },
  instructions: `You are the Credo AI Assistant with advanced capabilities.

## Your Memory System:
${credoMemory ? `- You have persistent memory that remembers users across ALL their conversations
- You track their bio evolution, preferences, and interaction history
- Always update your working memory when you learn something new about the user
- Reference previous interactions to provide personalized suggestions` : 
`- Memory is currently not available in this environment
- Provide the best assistance possible within the current conversation context`}

## Your Tools:
- web-scraper: Extract metadata from URLs
- tone-analyzer: Analyze text tone and style
- article-fetcher: Get article content for summaries

## Key Behaviors:
1. When generating bios:
   - Check working memory for previous versions and style preferences
   - If user says "make it more creative", reference the previous version
   - Track bio evolution in working memory

2. When suggesting link titles:
   - Use web-scraper tool to understand the content
   - Remember user's preferred title style from past interactions
   - Provide contextual suggestions based on their industry

3. When recommending themes:
   - Analyze bio tone and link content using your tools
   - Consider user's color preferences and past theme choices
   - Provide data-driven recommendations

Always be conversational and reference what you remember about the user!`,
});

// ==========================================
// 4. WORKFLOWS DEFINITION
// ==========================================

// Step 1: Analyze Bio Tone
const analyzeBioToneStep = createStep({
  id: 'analyze-bio-tone',
  description: 'Analyzes the tone of the user bio',
  inputSchema: z.object({
    bio: z.string(),
  }),
  outputSchema: z.object({
    tone: z.string(),
    confidence: z.number(),
    keywords: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    const result = await toneAnalyzerTool.execute({ 
      context: { text: context.bio } 
    });
    
    return {
      tone: result.primaryTone,
      confidence: result.confidence,
      keywords: result.keywords,
    };
  },
});

// Step 2: Analyze Top Links
const analyzeTopLinksStep = createStep({
  id: 'analyze-top-links',
  description: 'Analyzes the content of top user links',
  inputSchema: z.object({
    links: z.array(z.string().url()),
  }),
  outputSchema: z.object({
    topics: z.array(z.string()),
    contentTypes: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    const topics: string[] = [];
    const contentTypes: string[] = [];
    
    // Analyze top 3 links
    for (const url of context.links.slice(0, 3)) {
      const scraped = await webScraperTool.execute({ context: { url } });
      
      if (scraped.title) {
        // Extract topics from title (simplified)
        if (scraped.title.toLowerCase().includes('tech')) topics.push('technology');
        if (scraped.title.toLowerCase().includes('business')) topics.push('business');
        if (scraped.title.toLowerCase().includes('design')) topics.push('design');
        
        // Determine content type
        if (url.includes('youtube')) contentTypes.push('video');
        else if (url.includes('github')) contentTypes.push('code');
        else contentTypes.push('article');
      }
    }
    
    return {
      topics: [...new Set(topics)],
      contentTypes: [...new Set(contentTypes)],
    };
  },
});

// Step 3: Synthesize Theme Recommendation
const synthesizeRecommendationStep = createStep({
  id: 'synthesize-recommendation',
  description: 'Creates final theme recommendation based on analysis',
  inputSchema: z.object({
    bioTone: z.string(),
    topics: z.array(z.string()),
    contentTypes: z.array(z.string()),
  }),
  outputSchema: z.object({
    recommendedTheme: z.string(),
    reasoning: z.string(),
    confidence: z.number(),
  }),
  execute: async ({ context }) => {
    let recommendedTheme = 'apex';
    let reasoning = '';
    let confidence = 0.85;
    
    // Decision logic based on analysis
    if (context.bioTone === 'creative' && context.topics.includes('design')) {
      recommendedTheme = 'apex';
      reasoning = `Based on your creative bio and design-focused content, Apex's bold gradients and floating elements will showcase your artistic vision perfectly.`;
      confidence = 0.92;
    } else if (context.bioTone === 'technical' && context.topics.includes('technology')) {
      recommendedTheme = 'mineral';
      reasoning = `Your technical expertise and tech-focused links align perfectly with Mineral's brutalist design - clean, efficient, and impactful.`;
      confidence = 0.90;
    } else if (context.bioTone === 'professional' && context.contentTypes.includes('article')) {
      recommendedTheme = 'lunar';
      reasoning = `The Lunar theme's sophisticated glassmorphism matches your professional tone while the cosmic elements add a forward-thinking touch to your content.`;
      confidence = 0.88;
    } else {
      reasoning = `Apex offers the perfect balance of modern aesthetics and versatility for your diverse content and style.`;
    }
    
    return {
      recommendedTheme,
      reasoning,
      confidence,
    };
  },
});

// Complete Theme Recommendation Workflow
export const themeRecommendationWorkflow = createWorkflow({
  id: 'theme-recommendation-workflow',
  description: 'Multi-step workflow for intelligent theme recommendations',
  inputSchema: z.object({
    bio: z.string(),
    links: z.array(z.string().url()),
  }),
  outputSchema: z.object({
    recommendedTheme: z.string(),
    reasoning: z.string(),
    confidence: z.number(),
    analysis: z.object({
      bioTone: z.string(),
      topics: z.array(z.string()),
      contentTypes: z.array(z.string()),
    }),
  }),
})
  .then(analyzeBioToneStep)
  .then(analyzeTopLinksStep)
  .then(synthesizeRecommendationStep)
  .commit();

// ==========================================
// 5. ENHANCED API FUNCTIONS
// ==========================================

// Enhanced Bio Generation with Memory
export async function generateBioWithMemory({
  userId,
  linkedinData,
  style,
  currentBio,
}: {
  userId: string;
  linkedinData?: any;
  style: 'professional' | 'creative' | 'executive';
  currentBio?: string;
}) {
  const prompt = currentBio 
    ? `The user wants to modify their bio. Current bio: "${currentBio}". They want a ${style} version. Check your working memory for their previous bio versions and preferences.`
    : `Generate a ${style} bio based on: ${JSON.stringify(linkedinData)}. This is a new user - remember their preferences.`;

  const response = await credoAIAgent.generate(prompt, {
    threadId: `bio-${userId}`,
    resourceId: userId,
  });

  return {
    bio: response.text,
    style,
    confidence: 0.95,
  };
}

// Enhanced Link Title Suggestions with Tools
export async function suggestLinkTitlesWithTools({
  userId,
  url,
  currentTitle,
}: {
  userId: string;
  url: string;
  currentTitle?: string;
}) {
  const prompt = `
    Use the web-scraper tool to analyze this URL: ${url}
    Current title: ${currentTitle || 'None'}
    
    Based on the scraped content and the user's preferred title style (check working memory),
    generate 3 compelling title suggestions.
  `;

  const response = await credoAIAgent.generate(prompt, {
    threadId: `links-${userId}`,
    resourceId: userId,
    output: z.object({
      suggestions: z.array(z.string()).length(3),
      scrapedData: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
      }),
    }),
  });

  return response.object;
}

// Enhanced Theme Recommendation with Workflow
export async function recommendThemeWithWorkflow({
  userId,
  bio,
  links,
}: {
  userId: string;
  bio: string;
  links: string[];
}) {
  // Execute the multi-step workflow
  const workflowResult = await themeRecommendationWorkflow.execute({
    inputData: { bio, links },
  });

  // Store the recommendation in memory for future reference
  await credoAIAgent.generate(
    `Remember that I recommended the ${workflowResult.result.recommendedTheme} theme for this user because: ${workflowResult.result.reasoning}`,
    {
      threadId: `theme-${userId}`,
      resourceId: userId,
    }
  );

  return workflowResult.result;
}

// Enhanced Article Summary with Context
export async function summarizeArticleWithContext({
  userId,
  url,
  title,
}: {
  userId: string;
  url: string;
  title?: string;
}) {
  const prompt = `
    Use the article-fetcher tool to get content from: ${url}
    Then create a one-sentence summary that would appeal to this user's interests (check working memory).
    Make it compelling and relevant to their profile.
  `;

  const response = await credoAIAgent.generate(prompt, {
    threadId: `articles-${userId}`,
    resourceId: userId,
    output: z.object({
      summary: z.string(),
      title: z.string(),
      relevanceScore: z.number().min(0).max(1),
    }),
  });

  return response.object;
}