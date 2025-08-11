import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { credoAIAgent } from '../agents/credo-ai-agent';

// Step 1: Profile Analysis
const analyzeProfileStep = createStep({
  id: 'analyze-profile',
  description: 'Analyzes user profile from LinkedIn data',
  inputSchema: z.object({
    linkedinData: z.any().optional(),
    currentBio: z.string().optional(),
    name: z.string(),
    headline: z.string().optional(),
  }),
  outputSchema: z.object({
    analysis: z.object({
      industry: z.string(),
      professionalFocus: z.string(),
      targetAudience: z.string(),
      strengths: z.array(z.string()),
    }),
    bios: z.array(z.object({
      style: z.enum(['professional', 'creative', 'executive']),
      text: z.string(),
      reasoning: z.string(),
    })),
  }),
  execute: async ({ inputData }) => {
    const prompt = `
    Analyze this professional profile and generate 3 alternative bios:
    
    Name: ${inputData.name}
    Current Headline: ${inputData.headline}
    Current Bio: ${inputData.currentBio}
    LinkedIn Data: ${JSON.stringify(inputData.linkedinData)}
    
    Provide:
    1. Analysis of their professional profile (industry, focus, audience, strengths)
    2. Three bio alternatives in Executive tone that will attract high-value clients
    
    Return as structured JSON with analysis and bios array.
    `;

    const response = await credoAIAgent.generate(prompt, {
      output: z.object({
        analysis: z.object({
          industry: z.string(),
          professionalFocus: z.string(),
          targetAudience: z.string(),
          strengths: z.array(z.string()),
        }),
        bios: z.array(z.object({
          style: z.enum(['professional', 'creative', 'executive']),
          text: z.string(),
          reasoning: z.string(),
        })),
      }),
    });

    return response.object;
  },
});

// Step 2: Link Analysis
const analyzeLinksStep = createStep({
  id: 'analyze-links', 
  description: 'Analyzes user links and generates SEO-friendly titles',
  inputSchema: z.object({
    links: z.array(z.object({
      id: z.string(),
      url: z.string(),
      title: z.string(),
      clicks: z.number().optional(),
    })),
  }),
  outputSchema: z.object({
    suggestions: z.array(z.object({
      linkId: z.string(),
      originalTitle: z.string(),
      suggestedTitle: z.string(),
      reasoning: z.string(),
      seoKeywords: z.array(z.string()),
    })),
  }),
  execute: async ({ inputData }) => {
    const suggestions = [];
    
    for (const link of inputData.links) {
      const prompt = `
      Analyze this link and create a more compelling, SEO-friendly title:
      
      URL: ${link.url}
      Current Title: ${link.title}
      Clicks: ${link.clicks || 0}
      
      Generate:
      1. A compelling, action-oriented title (max 60 chars)
      2. Reasoning for the change
      3. 3-5 SEO keywords
      
      Focus on conversion and click-through rate.
      `;

      const response = await credoAIAgent.generate(prompt, {
        output: z.object({
          suggestedTitle: z.string(),
          reasoning: z.string(),
          seoKeywords: z.array(z.string()),
        }),
      });

      suggestions.push({
        linkId: link.id,
        originalTitle: link.title,
        ...response.object,
      });
    }

    return { suggestions };
  },
});

// Step 3: Theme Recommendation
const recommendThemeStep = createStep({
  id: 'recommend-theme',
  description: 'Recommends the best theme based on profile and content',
  inputSchema: z.object({
    industry: z.string(),
    professionalFocus: z.string(),
    linkTypes: z.array(z.string()),
    currentTheme: z.string().optional(),
  }),
  outputSchema: z.object({
    recommendedTheme: z.enum(['apex', 'mineral', 'lunar']),
    reasoning: z.string(),
    preview: z.object({
      primaryColor: z.string(),
      description: z.string(),
      benefits: z.array(z.string()),
    }),
  }),
  execute: async ({ inputData }) => {
    const prompt = `
    Based on this professional profile, recommend the best theme:
    
    Industry: ${inputData.industry}
    Professional Focus: ${inputData.professionalFocus}
    Content Types: ${inputData.linkTypes.join(', ')}
    Current Theme: ${inputData.currentTheme || 'default'}
    
    Available themes:
    - Apex: Bold gradients, floating elements, aurora effects (creative/design)
    - Mineral: Brutalist design, monolithic blocks (technical/engineering)
    - Lunar: Glassmorphism, cosmic particles (executive/professional)
    
    Recommend the best theme with reasoning and benefits.
    `;

    const response = await credoAIAgent.generate(prompt, {
      output: z.object({
        recommendedTheme: z.enum(['apex', 'mineral', 'lunar']),
        reasoning: z.string(),
        preview: z.object({
          primaryColor: z.string(),
          description: z.string(),
          benefits: z.array(z.string()),
        }),
      }),
    });

    return response.object;
  },
});

// Complete Onboarding Wizard Workflow
export const onboardingWizardWorkflow = createWorkflow({
  id: 'onboarding-wizard',
  description: 'AI-powered onboarding that analyzes profile and provides personalized setup',
  inputSchema: z.object({
    user: z.object({
      id: z.string(),
      name: z.string(),
      linkedinData: z.any().optional(),
      currentBio: z.string().optional(),
      headline: z.string().optional(),
    }),
    links: z.array(z.object({
      id: z.string(),
      url: z.string(),
      title: z.string(),
      clicks: z.number().optional(),
    })),
    currentTheme: z.string().optional(),
  }),
  outputSchema: z.object({
    profileAnalysis: z.object({
      industry: z.string(),
      professionalFocus: z.string(),
      targetAudience: z.string(),
      strengths: z.array(z.string()),
    }),
    bioSuggestions: z.array(z.object({
      style: z.enum(['professional', 'creative', 'executive']),
      text: z.string(),
      reasoning: z.string(),
    })),
    linkSuggestions: z.array(z.object({
      linkId: z.string(),
      originalTitle: z.string(),
      suggestedTitle: z.string(),
      reasoning: z.string(),
      seoKeywords: z.array(z.string()),
    })),
    themeRecommendation: z.object({
      recommendedTheme: z.enum(['apex', 'mineral', 'lunar']),
      reasoning: z.string(),
      preview: z.object({
        primaryColor: z.string(),
        description: z.string(),
        benefits: z.array(z.string()),
      }),
    }),
  }),
})
  .map(({ inputData }) => ({
    // Map for profile analysis
    linkedinData: inputData.user.linkedinData,
    currentBio: inputData.user.currentBio,
    name: inputData.user.name,
    headline: inputData.user.headline,
  }))
  .then(analyzeProfileStep)
  .map(({ inputData, getInitData }) => {
    const initData = getInitData();
    return {
      // Pass links for analysis
      links: initData.links,
    };
  })
  .then(analyzeLinksStep)
  .map(({ getStepResult, getInitData }) => {
    const profileAnalysis = getStepResult(analyzeProfileStep);
    const initData = getInitData();
    
    // Extract link types from URLs
    const linkTypes = initData.links.map((link: any) => {
      if (link.url.includes('youtube')) return 'video';
      if (link.url.includes('github')) return 'code';
      if (link.url.includes('linkedin')) return 'professional';
      return 'article';
    });

    return {
      industry: profileAnalysis.analysis.industry,
      professionalFocus: profileAnalysis.analysis.professionalFocus,
      linkTypes,
      currentTheme: initData.currentTheme,
    };
  })
  .then(recommendThemeStep)
  .map(({ getStepResult }) => {
    // Compile all results
    const profileResult = getStepResult(analyzeProfileStep);
    const linksResult = getStepResult(analyzeLinksStep);
    const themeResult = getStepResult(recommendThemeStep);

    return {
      profileAnalysis: profileResult.analysis,
      bioSuggestions: profileResult.bios,
      linkSuggestions: linksResult.suggestions,
      themeRecommendation: themeResult,
    };
  })
  .commit();

// Helper function to execute onboarding for a user
export async function runOnboardingWizard({
  userId,
  name,
  linkedinData,
  currentBio,
  headline,
  links,
  currentTheme,
}: {
  userId: string;
  name: string;
  linkedinData?: any;
  currentBio?: string;
  headline?: string;
  links: Array<{ id: string; url: string; title: string; clicks?: number }>;
  currentTheme?: string;
}) {
  const result = await onboardingWizardWorkflow.execute({
    inputData: {
      user: {
        id: userId,
        name,
        linkedinData,
        currentBio,
        headline,
      },
      links,
      currentTheme,
    },
  });

  return result.result;
}