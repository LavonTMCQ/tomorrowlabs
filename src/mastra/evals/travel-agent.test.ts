import { describe, it, expect } from 'vitest';
import { google } from '@ai-sdk/google';
import { TRAVEL_TEST_CASES } from './test-data';
import {
  DestinationRelevanceMetric,
  WeatherActivityAlignmentMetric,
  BudgetAppropriatenessMetric
} from './travel-metrics';

// Initialize evaluation model (using a smaller model for cost efficiency)
const evalModel = google(process.env.MODEL ?? "gemini-2.5-pro");

// Initialize metrics
const destinationRelevanceMetric = new DestinationRelevanceMetric(evalModel);
const weatherActivityAlignmentMetric = new WeatherActivityAlignmentMetric(evalModel);
const budgetAppropriatenessMetric = new BudgetAppropriatenessMetric(evalModel);

describe('Tomorrow Travel Agent Evaluations', () => {
  describe('Evaluation Metrics Unit Tests', () => {
    it('should create destination relevance metric', async () => {
      const evalModel = google(process.env.MODEL ?? "gemini-2.5-pro");
      const metric = new DestinationRelevanceMetric(evalModel);
      expect(metric).toBeDefined();
    });

    it('should create weather-activity alignment metric', async () => {
      const evalModel = google(process.env.MODEL ?? "gemini-2.5-pro");
      const metric = new WeatherActivityAlignmentMetric(evalModel);
      expect(metric).toBeDefined();
    });

    it('should create budget appropriateness metric', async () => {
      const evalModel = google(process.env.MODEL ?? "gemini-2.5-pro");
      const metric = new BudgetAppropriatenessMetric(evalModel);
      expect(metric).toBeDefined();
    });

    it('should have valid test data', () => {
      expect(TRAVEL_TEST_CASES).toBeDefined();
      expect(TRAVEL_TEST_CASES.length).toBeGreaterThan(0);

      // Check first test case structure
      const firstCase = TRAVEL_TEST_CASES[0];
      expect(firstCase.input).toBeDefined();
      expect(firstCase.input.query).toBeDefined();
      expect(firstCase.input.location).toBeDefined();
      expect(firstCase.expected).toBeDefined();
    });
  });

});
