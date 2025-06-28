// Telemetry dashboard configuration for monitoring Tomorrow Travel Agent
// This configuration defines the key metrics and alerts for production monitoring

export const TELEMETRY_CONFIG = {
  // Service identification
  serviceName: 'tomorrow-travel-agent',
  version: '1.0.0',
  
  // Key Performance Indicators (KPIs)
  kpis: {
    // Response time thresholds (in milliseconds)
    responseTime: {
      excellent: 1000,   // < 1s is excellent
      good: 3000,        // < 3s is good
      acceptable: 5000,  // < 5s is acceptable
      poor: 10000,       // > 10s is poor
    },
    
    // Memory retrieval thresholds
    memoryRetrieval: {
      excellent: 500,    // < 500ms is excellent
      good: 1000,        // < 1s is good
      acceptable: 2000,  // < 2s is acceptable
      poor: 5000,        // > 5s is poor
    },
    
    // Weather API call thresholds
    weatherApi: {
      excellent: 1000,   // < 1s is excellent
      good: 2000,        // < 2s is good
      acceptable: 3000,  // < 3s is acceptable
      poor: 5000,        // > 5s is poor
    },
    
    // Quality score thresholds (0-1 scale)
    qualityScore: {
      excellent: 0.8,    // > 0.8 is excellent
      good: 0.6,         // > 0.6 is good
      acceptable: 0.4,   // > 0.4 is acceptable
      poor: 0.2,         // < 0.2 is poor
    },
    
    // Error rate thresholds (percentage)
    errorRate: {
      excellent: 1,      // < 1% is excellent
      good: 3,           // < 3% is good
      acceptable: 5,     // < 5% is acceptable
      poor: 10,          // > 10% is poor
    },
  },
  
  // Monitoring alerts configuration
  alerts: {
    // High response time alert
    highResponseTime: {
      threshold: 5000,   // Alert if response time > 5s
      duration: '5m',    // For 5 minutes
      severity: 'warning',
    },
    
    // High error rate alert
    highErrorRate: {
      threshold: 5,      // Alert if error rate > 5%
      duration: '2m',    // For 2 minutes
      severity: 'critical',
    },
    
    // Low quality score alert
    lowQualityScore: {
      threshold: 0.4,    // Alert if quality score < 0.4
      duration: '10m',   // For 10 minutes
      severity: 'warning',
    },
    
    // Memory system failure
    memoryFailure: {
      threshold: 50,     // Alert if memory error rate > 50%
      duration: '1m',    // For 1 minute
      severity: 'critical',
    },
    
    // Weather API failure
    weatherApiFailure: {
      threshold: 30,     // Alert if weather API error rate > 30%
      duration: '2m',    // For 2 minutes
      severity: 'warning',
    },
  },
  
  // Metrics to track
  metrics: [
    'travel_agent_response_time',
    'memory_retrieval_time',
    'weather_api_call_time',
    'user_engagement_total',
    'travel_agent_errors_total',
    'recommendation_quality_score',
  ],
  
  // Custom dimensions for filtering and grouping
  dimensions: {
    queryType: [
      'beach_travel',
      'mountain_travel',
      'city_travel',
      'budget_travel',
      'luxury_travel',
      'family_travel',
      'general_travel',
    ],
    memoryType: ['mem0', 'upstash', 'both'],
    operationType: [
      'generate_response',
      'memory_retrieval',
      'weather_api_call',
      'recommendation_quality',
    ],
    status: ['success', 'error'],
  },
  
  // Dashboard panels configuration
  dashboardPanels: [
    {
      title: 'Agent Response Time',
      type: 'histogram',
      metric: 'travel_agent_response_time',
      unit: 'ms',
      description: 'Distribution of response times for travel agent queries',
    },
    {
      title: 'User Engagement by Query Type',
      type: 'counter',
      metric: 'user_engagement_total',
      groupBy: 'query_type',
      description: 'Number of user interactions by travel query category',
    },
    {
      title: 'Memory System Performance',
      type: 'histogram',
      metric: 'memory_retrieval_time',
      groupBy: 'memory_type',
      unit: 'ms',
      description: 'Performance of different memory systems (Mem0, Upstash)',
    },
    {
      title: 'Weather API Performance',
      type: 'histogram',
      metric: 'weather_api_call_time',
      unit: 'ms',
      description: 'Performance of weather API calls by location',
    },
    {
      title: 'Recommendation Quality Trends',
      type: 'gauge',
      metric: 'recommendation_quality_score',
      description: 'Average quality score of travel recommendations over time',
    },
    {
      title: 'Error Rate by Operation',
      type: 'counter',
      metric: 'travel_agent_errors_total',
      groupBy: 'operation',
      description: 'Error rates for different agent operations',
    },
  ],
  
  // Sampling configuration
  sampling: {
    // Sample all traces in development, 10% in production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Always sample errors and slow requests
    alwaysSample: {
      errors: true,
      slowRequests: true,
      slowThreshold: 5000, // ms
    },
  },
  
  // Export configuration for different environments
  export: {
    development: {
      type: 'console',
      verbose: true,
    },
    production: {
      type: 'otlp',
      endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318',
      headers: process.env.OTEL_EXPORTER_OTLP_HEADERS ? 
        JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS) : {},
    },
  },
};

// Helper function to get environment-specific config
export function getTelemetryConfig() {
  const env = process.env.NODE_ENV || 'development';
  return {
    ...TELEMETRY_CONFIG,
    export: TELEMETRY_CONFIG.export[env as keyof typeof TELEMETRY_CONFIG.export] || TELEMETRY_CONFIG.export.development,
  };
}
