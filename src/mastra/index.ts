import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { travelPlanningWorkflow } from './workflows/travel-planning-workflow';
import { tomorrowTravelAgent } from './agents/tomorrow-travel-agent';
import { attachListeners } from '@mastra/evals';

export const mastra = new Mastra({
  workflows: { travelPlanningWorkflow },
  agents: { tomorrowTravelAgent },
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});

// Attach evaluation listeners for Mastra Cloud integration
attachListeners(mastra);
