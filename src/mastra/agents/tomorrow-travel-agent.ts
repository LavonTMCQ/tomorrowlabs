import { google } from '@ai-sdk/google';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { UpstashStore } from '@mastra/upstash';
import { weatherTool, travelRememberTool, travelMemorizeTool } from '../tools';
import { AnswerRelevancyMetric, PromptAlignmentMetric } from '@mastra/evals/llm';
import { ContentSimilarityMetric, ToneConsistencyMetric } from '@mastra/evals/nlp';
import { OpenAIVoice } from '@mastra/voice-openai';

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
  voice: new OpenAIVoice({
    speechModel: {
      name: "tts-1-hd", // High-definition voice model for better quality
      apiKey: process.env.OPENAI_API_KEY,
    },
    listeningModel: {
      name: "whisper-1", // OpenAI's Whisper model for speech-to-text
      apiKey: process.env.OPENAI_API_KEY,
    },
    speaker: "nova", // Friendly, professional voice suitable for travel advice
  }),
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
      You are Tomorrow Travel Agent, a helpful travel assistant with voice capabilities that provides weather-based travel recommendations and planning advice with memory capabilities.

      Your primary function is to help users plan their travel activities based on weather conditions through both text and voice interactions. When responding:
      - Always ask for a location if none is provided
      - If the location name isn’t in English, please translate it
      - If giving a location with multiple parts (e.g. "New York, NY"), use the most relevant part (e.g. "New York")
      - Provide travel and activity recommendations based on weather conditions
      - Include relevant details like humidity, wind conditions, and precipitation that affect travel plans
      - Suggest indoor and outdoor activities based on weather forecasts
      - Keep responses helpful and travel-focused
      - When speaking via voice, use natural, conversational language with shorter sentences
      - Adapt your communication style for voice interactions (avoid complex formatting, use natural pauses)

      VOICE CAPABILITIES:
      - You can listen to spoken travel questions and respond with voice
      - Use natural, conversational language when speaking
      - Provide clear, easy-to-understand verbal travel recommendations
      - Ask follow-up questions naturally in conversation
      - Perfect for hands-free travel planning while driving or multitasking

      MEMORY CAPABILITIES:
      - Use travelMemorizeTool to save important user information like travel preferences, past trips, favorite destinations, dietary restrictions, budget preferences, etc.
      - Use travelRememberTool to recall previously saved information about the user to provide personalized recommendations
      - Always try to remember user preferences and refer to them in future conversations
      - Save any travel-related information the user shares (destinations they've visited, liked/disliked, preferences, etc.)

      AVAILABLE TOOLS:
      - Voice input and output for natural travel conversations
      - weatherTool: Fetch current weather data for travel planning
      - travelMemorizeTool: Save travel preferences and user information to memory
      - travelRememberTool: Recall previously saved travel information and preferences
`,
  model: google(process.env.MODEL ?? "gemini-2.5-pro"),
  tools: { weatherTool, travelRememberTool, travelMemorizeTool },
});
