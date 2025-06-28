import { google } from '@ai-sdk/google';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { UpstashStore } from '@mastra/upstash';
import { weatherTool, travelRememberTool, travelMemorizeTool } from '../tools';
import { AnswerRelevancyMetric, PromptAlignmentMetric } from '@mastra/evals/llm';
import { ContentSimilarityMetric, ToneConsistencyMetric } from '@mastra/evals/nlp';

// Create cloud-compatible memory (optional - only if Upstash credentials are provided)
const createMemory = () => {
  if (process.env.UPSTASH_URL && process.env.UPSTASH_TOKEN) {
    return new Memory({
      storage: new UpstashStore({
        url: process.env.UPSTASH_URL,
        token: process.env.UPSTASH_TOKEN,
      }),
      options: {
        lastMessages: 10,
        workingMemory: {
          enabled: true,
          template: `# Travel Profile
- **Name**:
- **Preferred Destinations**:
- **Budget Range**:
- **Travel Style**:
- **Favorite Activities**:
- **Dietary Restrictions**:
- **Past Trips**:
`,
        },
      },
    });
  }
  return undefined;
};

// Create evaluation model for metrics
const evalModel = google(process.env.MODEL ?? "gemini-2.5-pro");

export const tomorrowTravelAgent = new Agent({
  name: 'Tomorrow Travel Agent',
  memory: createMemory(), // Add native Mastra memory if Upstash is configured
  evals: {
    answerRelevancy: new AnswerRelevancyMetric(evalModel),
    promptAlignment: new PromptAlignmentMetric(evalModel, {
      instructions: [
        "Provide specific travel recommendations based on weather conditions",
        "Include budget considerations when mentioned",
        "Suggest activities appropriate for the destination and season",
        "Maintain a helpful and informative tone"
      ]
    }),
    contentSimilarity: new ContentSimilarityMetric(),
    toneConsistency: new ToneConsistencyMetric(),
  },
  instructions: `
      You are Tomorrow Travel Agent, a helpful travel assistant that provides weather-based travel recommendations and planning advice with memory capabilities.

      Your primary function is to help users plan their travel activities based on weather conditions. When responding:
      - Always ask for a location if none is provided
      - If the location name isn’t in English, please translate it
      - If giving a location with multiple parts (e.g. "New York, NY"), use the most relevant part (e.g. "New York")
      - Provide travel and activity recommendations based on weather conditions
      - Include relevant details like humidity, wind conditions, and precipitation that affect travel plans
      - Suggest indoor and outdoor activities based on weather forecasts
      - Keep responses helpful and travel-focused

      MEMORY CAPABILITIES:
      - Use travelMemorizeTool to save important user information like travel preferences, past trips, favorite destinations, dietary restrictions, budget preferences, etc.
      - Use travelRememberTool to recall previously saved information about the user to provide personalized recommendations
      - Always try to remember user preferences and refer to them in future conversations
      - Save any travel-related information the user shares (destinations they've visited, liked/disliked, preferences, etc.)

      AVAILABLE TOOLS:
      - weatherTool: Fetch current weather data for travel planning
      - travelMemorizeTool: Save travel preferences and user information to memory
      - travelRememberTool: Recall previously saved travel information and preferences
`,
  model: google(process.env.MODEL ?? "gemini-2.5-pro"),
  tools: { weatherTool, travelRememberTool, travelMemorizeTool },
});
