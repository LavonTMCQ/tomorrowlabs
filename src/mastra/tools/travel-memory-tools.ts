import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { mem0 } from '../integrations/mem0-integration';
import { TravelAgentTelemetry } from '../telemetry/travel-metrics';

export const travelRememberTool = createTool({
  id: 'travel-remember',
  description: "Remember travel preferences, past trips, and user information that you've previously saved using the travel-memorize tool.",
  inputSchema: z.object({
    question: z.string().describe('Question used to look up travel information, preferences, or past experiences in saved memories.'),
  }),
  outputSchema: z.object({
    answer: z.string().describe('Remembered travel information'),
  }),
  execute: async ({ context }) => {
    return await TravelAgentTelemetry.trackMemoryRetrieval(async () => {
      console.log(`Searching travel memory: "${context.question}"`);
      const memory = await mem0.searchMemory(context.question);
      console.log(`Found travel memory: "${memory}"`);

      return {
        answer: memory,
      };
    }, 'mem0');
  },
});

export const travelMemorizeTool = createTool({
  id: 'travel-memorize',
  description: 'Save travel preferences, destinations, experiences, or user information to memory so you can remember it later using the travel-remember tool.',
  inputSchema: z.object({
    statement: z.string().describe('Travel-related information to save into memory (preferences, past trips, destinations, etc.)'),
  }),
  execute: async ({ context }) => {
    return await TravelAgentTelemetry.trackMemoryRetrieval(async () => {
      console.log(`Creating travel memory: "${context.statement}"`);
      // Save memories async to reduce latency
      void mem0.createMemory(context.statement).then(() => {
        console.log(`Travel memory saved: "${context.statement}"`);
      });
      return { success: true };
    }, 'mem0');
  },
});
