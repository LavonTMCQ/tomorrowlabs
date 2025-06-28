import { tomorrowTravelAgent } from './tomorrow-travel-agent';
import { VoiceUtils } from '../voice/voice-utils';
import { TravelAgentTelemetry } from '../telemetry/travel-metrics';

// Voice-enhanced wrapper for the Tomorrow Travel Agent
export class VoiceEnhancedTravelAgent {
  private agent = tomorrowTravelAgent;

  // Handle voice input and provide voice output
  async handleVoiceInteraction(audioStream: ReadableStream, userId?: string): Promise<{
    transcript: string;
    response: string;
    audioResponse: ReadableStream;
  }> {
    return await VoiceUtils.trackVoiceInteraction(async () => {
      // Convert speech to text
      const transcript = await this.agent.voice!.listen(audioStream);
      console.log(`🎤 User said: "${transcript}"`);
      
      // Validate voice input
      const validation = VoiceUtils.validateVoiceInput(transcript);
      if (!validation.isValid) {
        console.warn(`⚠️ Voice input validation issues:`, validation.issues);
      }
      
      // Extract travel intent from voice input
      const travelIntent = VoiceUtils.extractTravelIntent(transcript);
      console.log(`🧠 Extracted travel intent:`, travelIntent);
      
      // Generate response using the agent
      const response = await TravelAgentTelemetry.trackAgentResponse(
        async () => {
          return await this.agent.generate([
            {
              role: 'user',
              content: transcript
            }
          ]);
        },
        transcript,
        userId
      );
      
      // Format response for voice output
      const voiceFriendlyText = VoiceUtils.formatTextForSpeech(response.text);
      
      // Convert response to speech
      const audioResponse = await this.agent.voice!.speak(voiceFriendlyText, {
        speaker: "nova", // Consistent voice
        responseFormat: "wav",
      });
      
      return {
        transcript,
        response: response.text,
        audioResponse,
      };
    }, 'speech-to-speech', userId);
  }

  // Handle text input with voice output
  async handleTextToVoice(text: string, userId?: string): Promise<{
    response: string;
    audioResponse: ReadableStream;
  }> {
    return await VoiceUtils.trackVoiceInteraction(async () => {
      // Generate response using the agent
      const response = await TravelAgentTelemetry.trackAgentResponse(
        async () => {
          return await this.agent.generate([
            {
              role: 'user',
              content: text
            }
          ]);
        },
        text,
        userId
      );
      
      // Format response for voice output
      const voiceFriendlyText = VoiceUtils.formatTextForSpeech(response.text);
      
      // Convert response to speech
      const audioResponse = await this.agent.voice!.speak(voiceFriendlyText, {
        speaker: "nova",
        responseFormat: "wav",
      });
      
      return {
        response: response.text,
        audioResponse,
      };
    }, 'text-to-speech', userId);
  }

  // Handle voice input with text output
  async handleVoiceToText(audioStream: ReadableStream, userId?: string): Promise<{
    transcript: string;
    response: string;
  }> {
    return await VoiceUtils.trackVoiceInteraction(async () => {
      // Convert speech to text
      const transcript = await this.agent.voice!.listen(audioStream);
      console.log(`🎤 User said: "${transcript}"`);
      
      // Validate voice input
      const validation = VoiceUtils.validateVoiceInput(transcript);
      if (!validation.isValid) {
        console.warn(`⚠️ Voice input validation issues:`, validation.issues);
      }
      
      // Generate response using the agent
      const response = await TravelAgentTelemetry.trackAgentResponse(
        async () => {
          return await this.agent.generate([
            {
              role: 'user',
              content: transcript
            }
          ]);
        },
        transcript,
        userId
      );
      
      return {
        transcript,
        response: response.text,
      };
    }, 'speech-to-text', userId);
  }

  // Generate travel recommendations with voice-optimized format
  async generateVoiceRecommendation(
    location: string,
    preferences?: {
      budget?: string;
      activities?: string[];
      timeframe?: string;
      travelStyle?: string;
    },
    userId?: string
  ): Promise<{
    response: string;
    audioResponse: ReadableStream;
  }> {
    // Build query from preferences
    let query = `I want to visit ${location}`;
    
    if (preferences?.budget) {
      query += ` with a budget of ${preferences.budget}`;
    }
    
    if (preferences?.activities && preferences.activities.length > 0) {
      query += ` and I'm interested in ${preferences.activities.join(', ')}`;
    }
    
    if (preferences?.timeframe) {
      query += ` for ${preferences.timeframe}`;
    }
    
    if (preferences?.travelStyle) {
      query += ` with a ${preferences.travelStyle} travel style`;
    }
    
    query += '. What do you recommend?';
    
    return await this.handleTextToVoice(query, userId);
  }

  // Proxy other methods to the original agent
  get name() {
    return this.agent.name;
  }

  get instructions() {
    return this.agent.instructions;
  }

  get tools() {
    return this.agent.tools;
  }

  get memory() {
    return this.agent.memory;
  }

  get voice() {
    return this.agent.voice;
  }

  get evals() {
    return this.agent.evals;
  }

  // Direct access to the underlying agent for non-voice interactions
  async generate(messages: any[], options?: any) {
    return await this.agent.generate(messages, options);
  }
}

export const voiceEnhancedTravelAgent = new VoiceEnhancedTravelAgent();
