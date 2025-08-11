import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { travelPlanningWorkflow } from './workflows/travel-planning-workflow';
import { tomorrowTravelAgent } from './agents/tomorrow-travel-agent';
import { credoAIAgent } from './agents/credo-ai-agent';
import { 
  credoAIAgent as credoAIAgentEnhanced,
  themeRecommendationWorkflow,
  webScraperTool,
  toneAnalyzerTool,
  articleFetcherTool
} from './agents/credo-ai-agent-enhanced';
import { attachListeners } from '@mastra/evals';

// Configure persistent storage for production
const storage = new LibSQLStore({
  url: process.env.DATABASE_URL || 'file:./mastra.db',
});

export const mastra = new Mastra({
  workflows: { 
    travelPlanningWorkflow,
    themeRecommendationWorkflow 
  },
  agents: { 
    tomorrowTravelAgent, 
    credoAIAgent,
    credoAIAgentEnhanced 
  },
  tools: {
    webScraperTool,
    toneAnalyzerTool,
    articleFetcherTool
  },
  storage,
  logger: new PinoLogger({
    name: 'Tomorrow Travel Agent',
    level: 'info',
  }),
  telemetry: {
    serviceName: 'tomorrow-travel-agent',
    enabled: true,
    sampling: {
      type: 'always_on', // Capture all traces for comprehensive monitoring
    },
    export: {
      type: 'console', // Will use Mastra Cloud's built-in telemetry in production
    },
  },
});

// Attach evaluation listeners for Mastra Cloud integration
attachListeners(mastra);

// Export enhanced agent functions for API usage
export { 
  generateBioWithMemory,
  suggestLinkTitlesWithTools,
  recommendThemeWithWorkflow,
  summarizeArticleWithContext
} from './agents/credo-ai-agent-enhanced';
