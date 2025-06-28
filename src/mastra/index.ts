import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { travelPlanningWorkflow } from './workflows/travel-planning-workflow';
import { tomorrowTravelAgent } from './agents/tomorrow-travel-agent';

export const mastra = new Mastra({
  workflows: { travelPlanningWorkflow },
  agents: { tomorrowTravelAgent },
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
