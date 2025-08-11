import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { credoAIAgent } from '../agents/credo-ai-agent';

// Types for insights
export type InsightType = 'optimization' | 'content' | 'monetization' | 'engagement' | 'growth';

export interface InsightCard {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  data?: any;
  createdAt: Date;
}

// Step 1: Analyze User Activity
const analyzeActivityStep = createStep({
  id: 'analyze-activity',
  description: 'Analyzes user activity and engagement patterns',
  inputSchema: z.object({
    userId: z.string(),
    analytics: z.object({
      totalClicks: z.number(),
      uniqueVisitors: z.number(),
      avgTimeOnPage: z.number(),
      bounceRate: z.number(),
      topLinks: z.array(z.object({
        id: z.string(),
        title: z.string(),
        url: z.string(),
        clicks: z.number(),
        conversionRate: z.number().optional(),
      })),
      trafficSources: z.record(z.number()),
    }),
    profile: z.object({
      bio: z.string(),
      theme: z.string(),
      linksCount: z.number(),
      hasDigitalProducts: z.boolean(),
      lastUpdated: z.string(),
    }),
  }),
  outputSchema: z.object({
    patterns: z.object({
      mostActiveTime: z.string(),
      topPerformingContent: z.array(z.string()),
      underperformingLinks: z.array(z.string()),
      visitorBehavior: z.string(),
    }),
    opportunities: z.array(z.string()),
  }),
  execute: async ({ inputData }) => {
    const prompt = `
    Analyze this user's activity data and identify patterns:
    
    Analytics:
    - Total Clicks: ${inputData.analytics.totalClicks}
    - Unique Visitors: ${inputData.analytics.uniqueVisitors}
    - Avg Time on Page: ${inputData.analytics.avgTimeOnPage}s
    - Bounce Rate: ${inputData.analytics.bounceRate}%
    
    Top Links:
    ${inputData.analytics.topLinks.map(l => `- ${l.title}: ${l.clicks} clicks`).join('\n')}
    
    Profile:
    - Links Count: ${inputData.profile.linksCount}
    - Has Digital Products: ${inputData.profile.hasDigitalProducts}
    - Last Updated: ${inputData.profile.lastUpdated}
    
    Identify:
    1. Content performance patterns
    2. Visitor behavior insights
    3. Underperforming areas
    4. Growth opportunities
    `;

    const response = await credoAIAgent.generate(prompt, {
      output: z.object({
        patterns: z.object({
          mostActiveTime: z.string(),
          topPerformingContent: z.array(z.string()),
          underperformingLinks: z.array(z.string()),
          visitorBehavior: z.string(),
        }),
        opportunities: z.array(z.string()),
      }),
    });

    return response.object;
  },
});

// Step 2: Generate Optimization Insights
const generateOptimizationInsightsStep = createStep({
  id: 'generate-optimization-insights',
  description: 'Generates specific optimization recommendations',
  inputSchema: z.object({
    patterns: z.object({
      topPerformingContent: z.array(z.string()),
      underperformingLinks: z.array(z.string()),
    }),
    topLinks: z.array(z.object({
      id: z.string(),
      title: z.string(),
      clicks: z.number(),
      position: z.number().optional(),
    })),
  }),
  outputSchema: z.object({
    optimizationInsights: z.array(z.object({
      type: z.literal('optimization'),
      title: z.string(),
      description: z.string(),
      action: z.string(),
      priority: z.enum(['high', 'medium', 'low']),
      data: z.object({
        linkId: z.string().optional(),
        currentPosition: z.number().optional(),
        suggestedPosition: z.number().optional(),
        expectedImpact: z.string(),
      }).optional(),
    })),
  }),
  execute: async ({ inputData }) => {
    const insights = [];

    // Check if top-performing link is not in top position
    const topPerformer = inputData.topLinks[0];
    if (topPerformer && topPerformer.position && topPerformer.position > 1) {
      insights.push({
        type: 'optimization' as const,
        title: 'Move Top Performer Up',
        description: `Your "${topPerformer.title}" link is getting the most clicks but isn't at the top`,
        action: 'Move to top position',
        priority: 'high' as const,
        data: {
          linkId: topPerformer.id,
          currentPosition: topPerformer.position,
          suggestedPosition: 1,
          expectedImpact: '15-20% increase in clicks',
        },
      });
    }

    // Suggest removing or updating underperforming links
    if (inputData.patterns.underperformingLinks.length > 0) {
      insights.push({
        type: 'optimization' as const,
        title: 'Update Low-Performing Links',
        description: `${inputData.patterns.underperformingLinks.length} links are underperforming`,
        action: 'Review and update titles or remove',
        priority: 'medium' as const,
        data: {
          expectedImpact: 'Improved overall engagement',
        },
      });
    }

    return { optimizationInsights: insights };
  },
});

// Step 3: Generate Content Insights
const generateContentInsightsStep = createStep({
  id: 'generate-content-insights',
  description: 'Generates content recommendations',
  inputSchema: z.object({
    opportunities: z.array(z.string()),
    lastUpdated: z.string(),
    currentContent: z.array(z.object({
      type: z.string(),
      count: z.number(),
    })),
  }),
  outputSchema: z.object({
    contentInsights: z.array(z.object({
      type: z.literal('content'),
      title: z.string(),
      description: z.string(),
      action: z.string(),
      priority: z.enum(['high', 'medium', 'low']),
    })),
  }),
  execute: async ({ inputData }) => {
    const insights = [];
    
    // Check if content is stale
    const lastUpdate = new Date(inputData.lastUpdated);
    const daysSinceUpdate = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceUpdate > 14) {
      insights.push({
        type: 'content' as const,
        title: 'Refresh Your Content',
        description: `Your page hasn't been updated in ${daysSinceUpdate} days`,
        action: 'Add new links or update existing ones',
        priority: 'high' as const,
      });
    }

    // Suggest content diversity
    const hasVideos = inputData.currentContent.find(c => c.type === 'video');
    if (!hasVideos) {
      insights.push({
        type: 'content' as const,
        title: 'Add Video Content',
        description: 'Video content typically gets 2x more engagement',
        action: 'Add YouTube or TikTok links',
        priority: 'medium' as const,
      });
    }

    return { contentInsights: insights };
  },
});

// Step 4: Generate Monetization Insights
const generateMonetizationInsightsStep = createStep({
  id: 'generate-monetization-insights',
  description: 'Generates monetization opportunities',
  inputSchema: z.object({
    hasDigitalProducts: z.boolean(),
    topPerformingContent: z.array(z.string()),
    visitorCount: z.number(),
    industry: z.string().optional(),
  }),
  outputSchema: z.object({
    monetizationInsights: z.array(z.object({
      type: z.literal('monetization'),
      title: z.string(),
      description: z.string(),
      action: z.string(),
      priority: z.enum(['high', 'medium', 'low']),
      data: z.object({
        potentialRevenue: z.string().optional(),
        recommendedPrice: z.string().optional(),
      }).optional(),
    })),
  }),
  execute: async ({ inputData }) => {
    const insights = [];

    // Suggest digital products if high traffic but no products
    if (!inputData.hasDigitalProducts && inputData.visitorCount > 100) {
      insights.push({
        type: 'monetization' as const,
        title: 'Monetize Your Audience',
        description: `With ${inputData.visitorCount} visitors, you could be earning from digital products`,
        action: 'Create a guide or template',
        priority: 'high' as const,
        data: {
          potentialRevenue: '$500-2000/month',
          recommendedPrice: '$29-49',
        },
      });
    }

    // Suggest affiliate opportunities based on content
    if (inputData.topPerformingContent.some(c => c.toLowerCase().includes('tool') || c.toLowerCase().includes('software'))) {
      insights.push({
        type: 'monetization' as const,
        title: 'Add Affiliate Links',
        description: 'Your tool-related content is perfect for affiliate marketing',
        action: 'Join affiliate programs',
        priority: 'medium' as const,
        data: {
          potentialRevenue: '$100-500/month',
        },
      });
    }

    return { monetizationInsights: insights };
  },
});

// Complete Insights Engine Workflow
export const insightsEngineWorkflow = createWorkflow({
  id: 'insights-engine',
  description: 'Generates proactive insights and recommendations',
  inputSchema: z.object({
    userId: z.string(),
    analytics: z.object({
      totalClicks: z.number(),
      uniqueVisitors: z.number(),
      avgTimeOnPage: z.number(),
      bounceRate: z.number(),
      topLinks: z.array(z.object({
        id: z.string(),
        title: z.string(),
        url: z.string(),
        clicks: z.number(),
        position: z.number().optional(),
        conversionRate: z.number().optional(),
      })),
      trafficSources: z.record(z.number()),
    }),
    profile: z.object({
      bio: z.string(),
      theme: z.string(),
      linksCount: z.number(),
      hasDigitalProducts: z.boolean(),
      lastUpdated: z.string(),
      industry: z.string().optional(),
    }),
    currentContent: z.array(z.object({
      type: z.string(),
      count: z.number(),
    })),
  }),
  outputSchema: z.object({
    insights: z.array(z.object({
      id: z.string(),
      type: z.enum(['optimization', 'content', 'monetization', 'engagement', 'growth']),
      title: z.string(),
      description: z.string(),
      action: z.string(),
      priority: z.enum(['high', 'medium', 'low']),
      data: z.any().optional(),
      createdAt: z.date(),
    })),
  }),
})
  .then(analyzeActivityStep)
  .parallel([
    // Run insight generation in parallel
    createStep({
      id: 'parallel-optimization',
      execute: async ({ inputData, getStepResult }) => {
        const activity = getStepResult(analyzeActivityStep);
        const initData = inputData;
        
        return await generateOptimizationInsightsStep.execute({
          inputData: {
            patterns: activity.patterns,
            topLinks: initData.analytics.topLinks.map((l: any, i: number) => ({
              ...l,
              position: i + 1,
            })),
          },
        });
      },
    }),
    createStep({
      id: 'parallel-content',
      execute: async ({ inputData, getStepResult }) => {
        const activity = getStepResult(analyzeActivityStep);
        const initData = inputData;
        
        return await generateContentInsightsStep.execute({
          inputData: {
            opportunities: activity.opportunities,
            lastUpdated: initData.profile.lastUpdated,
            currentContent: initData.currentContent,
          },
        });
      },
    }),
    createStep({
      id: 'parallel-monetization',
      execute: async ({ inputData, getStepResult }) => {
        const activity = getStepResult(analyzeActivityStep);
        const initData = inputData;
        
        return await generateMonetizationInsightsStep.execute({
          inputData: {
            hasDigitalProducts: initData.profile.hasDigitalProducts,
            topPerformingContent: activity.patterns.topPerformingContent,
            visitorCount: initData.analytics.uniqueVisitors,
            industry: initData.profile.industry,
          },
        });
      },
    }),
  ])
  .map(({ getStepResult }) => {
    // Compile all insights
    const allInsights: InsightCard[] = [];
    let idCounter = 1;

    // Add optimization insights
    const optimizationResult = getStepResult('parallel-optimization' as any);
    if (optimizationResult?.optimizationInsights) {
      optimizationResult.optimizationInsights.forEach((insight: any) => {
        allInsights.push({
          id: `insight-${idCounter++}`,
          ...insight,
          createdAt: new Date(),
        });
      });
    }

    // Add content insights
    const contentResult = getStepResult('parallel-content' as any);
    if (contentResult?.contentInsights) {
      contentResult.contentInsights.forEach((insight: any) => {
        allInsights.push({
          id: `insight-${idCounter++}`,
          ...insight,
          createdAt: new Date(),
        });
      });
    }

    // Add monetization insights
    const monetizationResult = getStepResult('parallel-monetization' as any);
    if (monetizationResult?.monetizationInsights) {
      monetizationResult.monetizationInsights.forEach((insight: any) => {
        allInsights.push({
          id: `insight-${idCounter++}`,
          ...insight,
          createdAt: new Date(),
        });
      });
    }

    // Sort by priority
    allInsights.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return { insights: allInsights };
  })
  .commit();

// Helper function to generate insights for a user
export async function generateInsights({
  userId,
  analytics,
  profile,
}: {
  userId: string;
  analytics: any;
  profile: any;
}) {
  // Analyze content types
  const contentTypes = new Map<string, number>();
  analytics.topLinks.forEach((link: any) => {
    let type = 'article';
    if (link.url.includes('youtube')) type = 'video';
    else if (link.url.includes('github')) type = 'code';
    else if (link.url.includes('product')) type = 'product';
    
    contentTypes.set(type, (contentTypes.get(type) || 0) + 1);
  });

  const currentContent = Array.from(contentTypes.entries()).map(([type, count]) => ({
    type,
    count,
  }));

  const result = await insightsEngineWorkflow.execute({
    inputData: {
      userId,
      analytics,
      profile,
      currentContent,
    },
  });

  return result.result.insights;
}