// Voice utilities for Tomorrow Travel Agent
import { TravelAgentTelemetry } from '../telemetry/travel-metrics';

export class VoiceUtils {
  
  // Track voice interaction telemetry
  static async trackVoiceInteraction<T>(
    operation: () => Promise<T>,
    interactionType: 'speech-to-text' | 'text-to-speech' | 'speech-to-speech',
    userId?: string
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      // Log voice interaction metrics
      console.log(`🎤 Voice ${interactionType} completed in ${duration}ms`);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Voice ${interactionType} failed after ${duration}ms:`, error);
      throw error;
    }
  }

  // Convert text to voice-friendly format
  static formatTextForSpeech(text: string): string {
    return text
      // Remove markdown formatting
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1') // Italic
      .replace(/`(.*?)`/g, '$1') // Code
      .replace(/#{1,6}\s/g, '') // Headers
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
      
      // Replace bullet points with natural speech
      .replace(/^[\s]*[-*+]\s/gm, 'First, ')
      .replace(/^[\s]*\d+\.\s/gm, 'Next, ')
      
      // Add natural pauses
      .replace(/\. /g, '. ... ')
      .replace(/\? /g, '? ... ')
      .replace(/! /g, '! ... ')
      
      // Replace abbreviations with full words
      .replace(/\bUS\b/g, 'United States')
      .replace(/\bUK\b/g, 'United Kingdom')
      .replace(/\bNY\b/g, 'New York')
      .replace(/\bCA\b/g, 'California')
      .replace(/\bFL\b/g, 'Florida')
      .replace(/\bTX\b/g, 'Texas')
      
      // Replace symbols with words
      .replace(/&/g, 'and')
      .replace(/@/g, 'at')
      .replace(/%/g, 'percent')
      .replace(/\$/g, 'dollars')
      .replace(/°C/g, 'degrees Celsius')
      .replace(/°F/g, 'degrees Fahrenheit')
      
      // Clean up extra spaces
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Extract key information from voice input
  static extractTravelIntent(transcript: string): {
    location?: string;
    budget?: string;
    activities?: string[];
    timeframe?: string;
    travelStyle?: string;
  } {
    const lowerTranscript = transcript.toLowerCase();
    
    // Extract location mentions
    const locationPatterns = [
      /(?:go to|visit|travel to|trip to)\s+([a-zA-Z\s,]+?)(?:\s|$|,|\.|!|\?)/,
      /(?:in|at)\s+([a-zA-Z\s,]+?)(?:\s|$|,|\.|!|\?)/,
    ];
    
    let location: string | undefined;
    for (const pattern of locationPatterns) {
      const match = lowerTranscript.match(pattern);
      if (match) {
        location = match[1].trim();
        break;
      }
    }
    
    // Extract budget mentions
    const budgetPatterns = [
      /budget.*?(\$[\d,]+)/,
      /(\$[\d,]+).*?budget/,
      /(cheap|affordable|budget|expensive|luxury)/,
    ];
    
    let budget: string | undefined;
    for (const pattern of budgetPatterns) {
      const match = lowerTranscript.match(pattern);
      if (match) {
        budget = match[1];
        break;
      }
    }
    
    // Extract activities
    const activityKeywords = [
      'beach', 'swimming', 'surfing', 'snorkeling', 'diving',
      'hiking', 'mountain', 'skiing', 'snowboarding',
      'museum', 'art', 'culture', 'history', 'sightseeing',
      'food', 'restaurant', 'dining', 'cuisine',
      'shopping', 'nightlife', 'bars', 'clubs',
      'family', 'kids', 'children', 'playground',
      'adventure', 'extreme', 'sports', 'outdoor',
      'relaxation', 'spa', 'wellness', 'peaceful'
    ];
    
    const activities = activityKeywords.filter(keyword => 
      lowerTranscript.includes(keyword)
    );
    
    // Extract timeframe
    const timeframePatterns = [
      /(next week|this week|weekend|tomorrow|today)/,
      /(january|february|march|april|may|june|july|august|september|october|november|december)/,
      /(spring|summer|fall|autumn|winter)/,
      /(\d+\s*days?|\d+\s*weeks?|\d+\s*months?)/,
    ];
    
    let timeframe: string | undefined;
    for (const pattern of timeframePatterns) {
      const match = lowerTranscript.match(pattern);
      if (match) {
        timeframe = match[1];
        break;
      }
    }
    
    // Extract travel style
    const styleKeywords = {
      luxury: ['luxury', 'premium', 'high-end', 'expensive', 'fancy'],
      budget: ['budget', 'cheap', 'affordable', 'economical'],
      adventure: ['adventure', 'extreme', 'active', 'outdoor'],
      cultural: ['cultural', 'history', 'art', 'museum', 'heritage'],
      family: ['family', 'kids', 'children', 'family-friendly'],
      romantic: ['romantic', 'honeymoon', 'couple', 'intimate'],
      business: ['business', 'work', 'conference', 'meeting'],
    };
    
    let travelStyle: string | undefined;
    for (const [style, keywords] of Object.entries(styleKeywords)) {
      if (keywords.some(keyword => lowerTranscript.includes(keyword))) {
        travelStyle = style;
        break;
      }
    }
    
    return {
      location,
      budget,
      activities: activities.length > 0 ? activities : undefined,
      timeframe,
      travelStyle,
    };
  }

  // Generate voice-friendly travel recommendations
  static formatTravelRecommendation(
    location: string,
    weather: any,
    activities: string[],
    budget?: string
  ): string {
    const temp = weather.temperature;
    const description = weather.description;
    
    let recommendation = `Great choice! ${location} is currently ${temp} degrees with ${description}. `;
    
    // Weather-based activity suggestions
    if (temp > 25) {
      recommendation += `It's perfect weather for outdoor activities. `;
    } else if (temp < 10) {
      recommendation += `It's quite cool, so indoor activities might be more comfortable. `;
    } else {
      recommendation += `The temperature is pleasant for both indoor and outdoor activities. `;
    }
    
    // Activity recommendations
    if (activities.length > 0) {
      recommendation += `Based on your interests in ${activities.slice(0, 2).join(' and ')}, I'd suggest `;
      
      if (activities.includes('beach') && temp > 20) {
        recommendation += `visiting the local beaches for swimming or sunbathing. `;
      }
      if (activities.includes('hiking') && temp > 5 && temp < 30) {
        recommendation += `exploring hiking trails in the area. `;
      }
      if (activities.includes('museum') || activities.includes('culture')) {
        recommendation += `checking out the local museums and cultural sites. `;
      }
    }
    
    // Budget considerations
    if (budget) {
      if (budget.includes('budget') || budget.includes('cheap')) {
        recommendation += `For budget-friendly options, look for local markets, free walking tours, and public parks. `;
      } else if (budget.includes('luxury')) {
        recommendation += `For a luxury experience, consider high-end restaurants, premium hotels, and exclusive tours. `;
      }
    }
    
    recommendation += `Would you like more specific recommendations for any particular aspect of your trip?`;
    
    return recommendation;
  }

  // Validate voice input quality
  static validateVoiceInput(transcript: string): {
    isValid: boolean;
    confidence: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let confidence = 1.0;
    
    // Check transcript length
    if (transcript.length < 5) {
      issues.push('Transcript too short');
      confidence -= 0.3;
    }
    
    // Check for common transcription errors
    if (transcript.includes('[inaudible]') || transcript.includes('[unclear]')) {
      issues.push('Audio quality issues detected');
      confidence -= 0.4;
    }
    
    // Check for travel-related content
    const travelKeywords = ['travel', 'trip', 'visit', 'go', 'destination', 'vacation', 'holiday'];
    const hasTravel = travelKeywords.some(keyword => 
      transcript.toLowerCase().includes(keyword)
    );
    
    if (!hasTravel) {
      issues.push('No travel-related content detected');
      confidence -= 0.2;
    }
    
    return {
      isValid: confidence > 0.5,
      confidence,
      issues,
    };
  }
}
