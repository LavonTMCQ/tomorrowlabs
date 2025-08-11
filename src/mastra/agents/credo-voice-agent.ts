import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';
import { OpenAIVoice } from '@mastra/voice-openai';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Voice-enabled tools for common Credo operations
const addLinkTool = createTool({
  id: 'add-link',
  description: 'Add a new link to the user profile',
  inputSchema: z.object({
    url: z.string().url(),
    title: z.string().optional(),
    description: z.string().optional(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    linkId: z.string(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    // Simulate adding a link
    console.log('Adding link:', context.url);
    
    return {
      success: true,
      linkId: `link-${Date.now()}`,
      message: `Added link: ${context.title || context.url}`,
    };
  },
});

const changeThemeTool = createTool({
  id: 'change-theme',
  description: 'Change the profile theme',
  inputSchema: z.object({
    theme: z.enum(['apex', 'mineral', 'lunar', 'default']),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    previousTheme: z.string(),
    newTheme: z.string(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    console.log('Changing theme to:', context.theme);
    
    const themeDescriptions = {
      apex: 'Bold gradients with floating elements',
      mineral: 'Brutalist design with strong blocks',
      lunar: 'Glassmorphism with cosmic elements',
      default: 'Classic clean design',
    };
    
    return {
      success: true,
      previousTheme: 'default',
      newTheme: context.theme,
      message: `Theme changed to ${context.theme}: ${themeDescriptions[context.theme]}`,
    };
  },
});

const updateBioTool = createTool({
  id: 'update-bio',
  description: 'Update the user bio',
  inputSchema: z.object({
    bio: z.string(),
    style: z.enum(['professional', 'creative', 'executive']).optional(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    console.log('Updating bio:', context.bio);
    
    return {
      success: true,
      message: `Bio updated successfully${context.style ? ` with ${context.style} style` : ''}`,
    };
  },
});

const getAnalyticsTool = createTool({
  id: 'get-analytics',
  description: 'Get profile analytics and performance metrics',
  inputSchema: z.object({
    timeRange: z.enum(['today', 'week', 'month', 'all']).optional(),
  }),
  outputSchema: z.object({
    totalViews: z.number(),
    totalClicks: z.number(),
    topLink: z.string(),
    conversionRate: z.number(),
    summary: z.string(),
  }),
  execute: async ({ context }) => {
    // Simulate fetching analytics
    const analytics = {
      totalViews: 1250,
      totalClicks: 342,
      topLink: 'My Latest Blog Post',
      conversionRate: 27.4,
    };
    
    return {
      ...analytics,
      summary: `In the last ${context.timeRange || 'month'}, you had ${analytics.totalViews} views and ${analytics.totalClicks} clicks. Your top performing link is "${analytics.topLink}" with a ${analytics.conversionRate}% conversion rate.`,
    };
  },
});

const reorderLinksTool = createTool({
  id: 'reorder-links',
  description: 'Reorder links on the profile',
  inputSchema: z.object({
    linkTitle: z.string(),
    position: z.enum(['top', 'up', 'down', 'bottom']),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    console.log('Reordering link:', context.linkTitle, 'to', context.position);
    
    return {
      success: true,
      message: `Moved "${context.linkTitle}" ${context.position === 'top' ? 'to the top' : context.position}`,
    };
  },
});

// Create the voice-enabled Credo agent
export const credoVoiceAgent = new Agent({
  name: 'credo-voice-assistant',
  instructions: `You are Credo, a voice-enabled AI assistant for managing link-in-bio profiles.
  
  You can help users with:
  - Adding and managing links ("Add my blog post about AI")
  - Changing themes ("Switch to something more minimalist" → Mineral theme)
  - Updating bios ("Make my bio more professional")
  - Checking analytics ("How's my profile performing?")
  - Reordering content ("Move my consulting link to the top")
  
  Be conversational and natural. Understand context and intent even if the user doesn't use exact commands.
  For example:
  - "I just wrote about growth hacking" → Offer to add the link
  - "My page looks boring" → Suggest theme changes
  - "Am I getting clicks?" → Provide analytics
  
  Always confirm actions before executing them and provide helpful feedback after completion.
  Keep responses concise and natural for voice interaction.`,
  
  model: openai('gpt-4o-mini'),
  
  tools: {
    addLink: addLinkTool,
    changeTheme: changeThemeTool,
    updateBio: updateBioTool,
    getAnalytics: getAnalyticsTool,
    reorderLinks: reorderLinksTool,
  },
  
  // Enable voice capabilities
  voice: new OpenAIVoice({
    speechModel: {
      name: 'tts-1',
      apiKey: process.env.OPENAI_API_KEY,
    },
    listeningModel: {
      name: 'whisper-1',
      apiKey: process.env.OPENAI_API_KEY,
    },
    speaker: 'nova', // Use a friendly, professional voice
  }),
});

// Voice conversation handler
export async function handleVoiceCommand(audioStream: ReadableStream) {
  try {
    // Transcribe the audio
    const transcript = await credoVoiceAgent.voice?.listen(audioStream);
    
    if (!transcript) {
      throw new Error('Could not transcribe audio');
    }
    
    console.log('User said:', transcript);
    
    // Process the command with the agent
    const response = await credoVoiceAgent.generate(transcript, {
      maxSteps: 3, // Allow tool usage
    });
    
    console.log('Agent response:', response.text);
    
    // Convert response to speech
    const responseAudio = await credoVoiceAgent.voice?.speak(response.text, {
      responseFormat: 'mp3',
    });
    
    return {
      transcript,
      response: response.text,
      audio: responseAudio,
      toolsUsed: response.toolCalls?.map(tc => tc.toolName),
    };
  } catch (error) {
    console.error('Voice command error:', error);
    
    // Provide error feedback via voice
    const errorMessage = "I'm sorry, I couldn't process that request. Please try again.";
    const errorAudio = await credoVoiceAgent.voice?.speak(errorMessage);
    
    return {
      transcript: '',
      response: errorMessage,
      audio: errorAudio,
      error: true,
    };
  }
}

// Example usage patterns for voice commands
export const voiceCommandExamples = [
  {
    command: "Hey Credo, add a new link to my latest blog post about growth hacking",
    expectedAction: "Add link with title suggestion",
    tools: ['addLink'],
  },
  {
    command: "Change my theme to something more minimalist",
    expectedAction: "Switch to Mineral theme",
    tools: ['changeTheme'],
  },
  {
    command: "How's my profile performing this week?",
    expectedAction: "Provide analytics summary",
    tools: ['getAnalytics'],
  },
  {
    command: "Move my consulting services link to the top",
    expectedAction: "Reorder link to position 1",
    tools: ['reorderLinks'],
  },
  {
    command: "Update my bio to sound more executive",
    expectedAction: "Generate and update bio with executive tone",
    tools: ['updateBio'],
  },
];