import { beforeAll } from 'vitest';
import { attachListeners } from '@mastra/evals';
import { mastra } from './src/mastra/index';

beforeAll(async () => {
  // Set up environment variables for testing
  if (!process.env.MEM0_API_KEY) {
    process.env.MEM0_API_KEY = 'm0-B1vS1gBhOzd960RtXEYu0FILXOcibHwy6VihCjqT';
  }
  if (!process.env.UPSTASH_URL) {
    process.env.UPSTASH_URL = 'https://loving-anchovy-26418.upstash.io';
  }
  if (!process.env.UPSTASH_TOKEN) {
    process.env.UPSTASH_TOKEN = 'AWcyAAIjcDE5M2QxMGJmYzU5OWU0NWViODk1NmQwYzQwN2U0ZDc2OHAxMA';
  }
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'AIzaSyDE-citv7MlLVRw_8XE9juqf5GM-2FSb3M';
  }

  // Store evals in Mastra Storage and capture results in the Mastra dashboard
  await attachListeners(mastra);
});
