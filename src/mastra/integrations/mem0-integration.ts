import { Mem0Integration } from '@mastra/mem0';

// Create Mem0 integration with fallback for testing
export const mem0 = new Mem0Integration({
  config: {
    apiKey: process.env.MEM0_API_KEY || 'm0-B1vS1gBhOzd960RtXEYu0FILXOcibHwy6VihCjqT',
    user_id: 'tomorrow-travel-user', // You can make this dynamic per user later
  },
});
