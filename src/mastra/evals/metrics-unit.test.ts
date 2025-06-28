import { describe, it, expect } from 'vitest';
import { google } from '@ai-sdk/google';
import { TRAVEL_TEST_CASES } from './test-data';
import { 
  DestinationRelevanceMetric, 
  WeatherActivityAlignmentMetric, 
  BudgetAppropriatenessMetric 
} from './travel-metrics';

describe('Travel Evaluation Metrics', () => {
  describe('Metric Creation', () => {
    it('should create destination relevance metric', () => {
      const evalModel = google(process.env.MODEL ?? "gemini-2.5-pro");
      const metric = new DestinationRelevanceMetric(evalModel);
      expect(metric).toBeDefined();
    });

    it('should create weather-activity alignment metric', () => {
      const evalModel = google(process.env.MODEL ?? "gemini-2.5-pro");
      const metric = new WeatherActivityAlignmentMetric(evalModel);
      expect(metric).toBeDefined();
    });

    it('should create budget appropriateness metric', () => {
      const evalModel = google(process.env.MODEL ?? "gemini-2.5-pro");
      const metric = new BudgetAppropriatenessMetric(evalModel);
      expect(metric).toBeDefined();
    });
  });

  describe('Test Data Validation', () => {
    it('should have valid test data structure', () => {
      expect(TRAVEL_TEST_CASES).toBeDefined();
      expect(TRAVEL_TEST_CASES.length).toBeGreaterThan(0);
      
      // Check first test case structure
      const firstCase = TRAVEL_TEST_CASES[0];
      expect(firstCase.input).toBeDefined();
      expect(firstCase.input.query).toBeDefined();
      expect(firstCase.input.location).toBeDefined();
      expect(firstCase.expected).toBeDefined();
      expect(firstCase.expected.destinationRelevance).toBeGreaterThanOrEqual(0);
      expect(firstCase.expected.destinationRelevance).toBeLessThanOrEqual(1);
    });

    it('should have multiple test cases covering different scenarios', () => {
      expect(TRAVEL_TEST_CASES.length).toBeGreaterThanOrEqual(3);
      
      // Check that we have different types of travel scenarios
      const queries = TRAVEL_TEST_CASES.map(tc => tc.input.query.toLowerCase());
      const hasBeachTravel = queries.some(q => q.includes('beach') || q.includes('warm'));
      const hasBudgetTravel = queries.some(q => q.includes('budget'));
      const hasLuxuryTravel = queries.some(q => q.includes('luxury'));
      
      expect(hasBeachTravel || hasBudgetTravel || hasLuxuryTravel).toBe(true);
    });
  });

  describe('Metric Functionality', () => {
    it('should handle basic metric evaluation without errors', async () => {
      const evalModel = google(process.env.MODEL ?? "gemini-2.5-pro");
      const metric = new DestinationRelevanceMetric(evalModel);
      
      // Test with simple input/output
      const result = await metric.measure(
        "I want to visit a beach destination",
        "I recommend visiting Miami Beach for its beautiful sandy shores and warm weather."
      );
      
      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
      expect(result.info).toBeDefined();
    }, 30000);
  });
});
