import { trace, metrics, SpanStatusCode, SpanKind } from '@opentelemetry/api';

// Create tracer and meter for travel agent metrics
const tracer = trace.getTracer('tomorrow-travel-agent', '1.0.0');
const meter = metrics.getMeter('tomorrow-travel-agent', '1.0.0');

// Create custom metrics for travel agent performance
const agentResponseTimeHistogram = meter.createHistogram('travel_agent_response_time', {
  description: 'Time taken for travel agent to generate responses',
  unit: 'ms',
});

const memoryRetrievalTimeHistogram = meter.createHistogram('memory_retrieval_time', {
  description: 'Time taken to retrieve user preferences from memory',
  unit: 'ms',
});

const weatherApiCallTimeHistogram = meter.createHistogram('weather_api_call_time', {
  description: 'Time taken for weather API calls',
  unit: 'ms',
});

const userEngagementCounter = meter.createCounter('user_engagement_total', {
  description: 'Total number of user interactions with travel agent',
});

const errorRateCounter = meter.createCounter('travel_agent_errors_total', {
  description: 'Total number of errors in travel agent operations',
});

const recommendationQualityGauge = meter.createUpDownCounter('recommendation_quality_score', {
  description: 'Quality score of travel recommendations (0-1)',
});

// Telemetry wrapper functions
export class TravelAgentTelemetry {
  
  // Track agent response time
  static async trackAgentResponse<T>(
    operation: () => Promise<T>,
    userQuery: string,
    userId?: string
  ): Promise<T> {
    const startTime = Date.now();
    const span = tracer.startSpan('travel_agent_generate_response', {
      kind: SpanKind.SERVER,
      attributes: {
        'travel.user_query': userQuery,
        'travel.user_id': userId || 'anonymous',
        'travel.operation': 'generate_response',
      },
    });

    try {
      const result = await operation();
      const responseTime = Date.now() - startTime;
      
      // Record metrics
      agentResponseTimeHistogram.record(responseTime, {
        operation: 'generate_response',
        status: 'success',
      });
      
      userEngagementCounter.add(1, {
        user_id: userId || 'anonymous',
        query_type: this.categorizeQuery(userQuery),
      });

      span.setAttributes({
        'travel.response_time_ms': responseTime,
        'travel.status': 'success',
      });
      span.setStatus({ code: SpanStatusCode.OK });
      
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Record error metrics
      agentResponseTimeHistogram.record(responseTime, {
        operation: 'generate_response',
        status: 'error',
      });
      
      errorRateCounter.add(1, {
        operation: 'generate_response',
        error_type: error instanceof Error ? error.name : 'unknown',
      });

      span.setAttributes({
        'travel.response_time_ms': responseTime,
        'travel.status': 'error',
        'travel.error_message': error instanceof Error ? error.message : 'Unknown error',
      });
      span.setStatus({ code: SpanStatusCode.ERROR, message: error instanceof Error ? error.message : 'Unknown error' });
      
      throw error;
    } finally {
      span.end();
    }
  }

  // Track memory retrieval performance
  static async trackMemoryRetrieval<T>(
    operation: () => Promise<T>,
    memoryType: 'mem0' | 'upstash' | 'both',
    userId?: string
  ): Promise<T> {
    const startTime = Date.now();
    const span = tracer.startSpan('travel_memory_retrieval', {
      kind: SpanKind.CLIENT,
      attributes: {
        'memory.type': memoryType,
        'memory.user_id': userId || 'anonymous',
      },
    });

    try {
      const result = await operation();
      const retrievalTime = Date.now() - startTime;
      
      memoryRetrievalTimeHistogram.record(retrievalTime, {
        memory_type: memoryType,
        status: 'success',
      });

      span.setAttributes({
        'memory.retrieval_time_ms': retrievalTime,
        'memory.status': 'success',
      });
      span.setStatus({ code: SpanStatusCode.OK });
      
      return result;
    } catch (error) {
      const retrievalTime = Date.now() - startTime;
      
      memoryRetrievalTimeHistogram.record(retrievalTime, {
        memory_type: memoryType,
        status: 'error',
      });
      
      errorRateCounter.add(1, {
        operation: 'memory_retrieval',
        memory_type: memoryType,
        error_type: error instanceof Error ? error.name : 'unknown',
      });

      span.setAttributes({
        'memory.retrieval_time_ms': retrievalTime,
        'memory.status': 'error',
        'memory.error_message': error instanceof Error ? error.message : 'Unknown error',
      });
      span.setStatus({ code: SpanStatusCode.ERROR, message: error instanceof Error ? error.message : 'Unknown error' });
      
      throw error;
    } finally {
      span.end();
    }
  }

  // Track weather API call performance
  static async trackWeatherApiCall<T>(
    operation: () => Promise<T>,
    location: string
  ): Promise<T> {
    const startTime = Date.now();
    const span = tracer.startSpan('weather_api_call', {
      kind: SpanKind.CLIENT,
      attributes: {
        'weather.location': location,
        'weather.api': 'openweathermap',
      },
    });

    try {
      const result = await operation();
      const apiCallTime = Date.now() - startTime;
      
      weatherApiCallTimeHistogram.record(apiCallTime, {
        location: location,
        status: 'success',
      });

      span.setAttributes({
        'weather.api_call_time_ms': apiCallTime,
        'weather.status': 'success',
      });
      span.setStatus({ code: SpanStatusCode.OK });
      
      return result;
    } catch (error) {
      const apiCallTime = Date.now() - startTime;
      
      weatherApiCallTimeHistogram.record(apiCallTime, {
        location: location,
        status: 'error',
      });
      
      errorRateCounter.add(1, {
        operation: 'weather_api_call',
        location: location,
        error_type: error instanceof Error ? error.name : 'unknown',
      });

      span.setAttributes({
        'weather.api_call_time_ms': apiCallTime,
        'weather.status': 'error',
        'weather.error_message': error instanceof Error ? error.message : 'Unknown error',
      });
      span.setStatus({ code: SpanStatusCode.ERROR, message: error instanceof Error ? error.message : 'Unknown error' });
      
      throw error;
    } finally {
      span.end();
    }
  }

  // Track recommendation quality
  static recordRecommendationQuality(score: number, queryType: string, userId?: string) {
    recommendationQualityGauge.add(score, {
      query_type: queryType,
      user_id: userId || 'anonymous',
    });

    const span = tracer.startSpan('recommendation_quality_assessment', {
      attributes: {
        'recommendation.quality_score': score,
        'recommendation.query_type': queryType,
        'recommendation.user_id': userId || 'anonymous',
      },
    });
    span.end();
  }

  // Helper function to categorize user queries
  private static categorizeQuery(query: string): string {
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
}
