import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { travelPlanningWorkflow } from './workflows/travel-planning-workflow';
import { tomorrowTravelAgent } from './agents/tomorrow-travel-agent';
import { attachListeners } from '@mastra/evals';

export const mastra = new Mastra({
  workflows: { travelPlanningWorkflow },
  agents: { tomorrowTravelAgent },
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
