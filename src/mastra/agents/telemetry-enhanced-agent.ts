import { tomorrowTravelAgent } from './tomorrow-travel-agent';
import { TravelAgentTelemetry } from '../telemetry/travel-metrics';

// Enhanced agent wrapper that automatically tracks telemetry
export class TelemetryEnhancedTravelAgent {
  private agent = tomorrowTravelAgent;

  async generate(messages: any[], options?: any) {
    // Extract user input for telemetry
    const userInput = messages[messages.length - 1]?.content || '';
    const userId = options?.userId || 'anonymous';
    
    // Track agent response time and user engagement
    return await TravelAgentTelemetry.trackAgentResponse(
      async () => {
        const response = await this.agent.generate(messages, options);
        
        // Track recommendation quality based on response
        const queryType = this.categorizeQuery(userInput);
        const qualityScore = this.assessResponseQuality(response.text, userInput);
        TravelAgentTelemetry.recordRecommendationQuality(qualityScore, queryType, userId);
        
        return response;
      },
      userInput,
      userId
    );
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

  get evals() {
    return this.agent.evals;
  }

  // Helper method to categorize queries for telemetry
  private categorizeQuery(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('beach') || lowerQuery.includes('ocean') || lowerQuery.includes('coast')) {
      return 'beach_travel';
    } else if (lowerQuery.includes('mountain') || lowerQuery.includes('hiking') || lowerQuery.includes('ski')) {
      return 'mountain_travel';
    } else if (lowerQuery.includes('city') || lowerQuery.includes('urban') || lowerQuery.includes('museum')) {
      return 'city_travel';
    } else if (lowerQuery.includes('budget') || lowerQuery.includes('cheap') || lowerQuery.includes('affordable')) {
      return 'budget_travel';
    } else if (lowerQuery.includes('luxury') || lowerQuery.includes('premium') || lowerQuery.includes('expensive')) {
      return 'luxury_travel';
    } else if (lowerQuery.includes('family') || lowerQuery.includes('kids') || lowerQuery.includes('children')) {
      return 'family_travel';
    } else {
      return 'general_travel';
    }
  }

  // Simple quality assessment based on response characteristics
  private assessResponseQuality(response: string, query: string): number {
    let score = 0.5; // Base score
    
    // Check if response is substantial (not too short)
    if (response.length > 100) score += 0.1;
    if (response.length > 300) score += 0.1;
    
    // Check if response includes specific travel elements
    const travelKeywords = ['destination', 'weather', 'activity', 'recommend', 'visit', 'travel', 'trip'];
    const keywordMatches = travelKeywords.filter(keyword => 
      response.toLowerCase().includes(keyword)
    ).length;
    score += Math.min(keywordMatches * 0.05, 0.2);
    
    // Check if response addresses the query
    const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 3);
    const addressedWords = queryWords.filter(word => 
      response.toLowerCase().includes(word)
    ).length;
    if (queryWords.length > 0) {
      score += (addressedWords / queryWords.length) * 0.2;
    }
    
    // Check for specific travel advice indicators
    if (response.includes('temperature') || response.includes('weather')) score += 0.05;
    if (response.includes('budget') || response.includes('cost') || response.includes('price')) score += 0.05;
    if (response.includes('activity') || response.includes('activities')) score += 0.05;
    
    // Ensure score is between 0 and 1
    return Math.max(0, Math.min(1, score));
  }
}

export const telemetryEnhancedTravelAgent = new TelemetryEnhancedTravelAgent();
