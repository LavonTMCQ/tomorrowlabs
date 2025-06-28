import { LanguageModel, generateText } from 'ai';

interface MetricResult {
  score: number;
  info?: any;
}

// Destination Relevance Metric - evaluates how well the recommendation matches the query
export class DestinationRelevanceMetric {
  constructor(private model: LanguageModel) {}

  async measure(input: string, output: string, expected?: any): Promise<MetricResult> {
    const prompt = `
Evaluate how well this travel recommendation matches the user's query on a scale of 0-1.

User Query: "${input}"
Agent Response: "${output}"

Consider:
- Does the destination match the requested type (beach, city, mountain, etc.)?
- Are the suggested activities aligned with the user's interests?
- Is the recommendation specific and actionable?

Return only a number between 0 and 1, where:
- 1.0 = Perfect match, highly relevant recommendation
- 0.8 = Good match with minor misalignments
- 0.6 = Adequate match but missing some key elements
- 0.4 = Poor match with significant issues
- 0.2 = Very poor match, mostly irrelevant
- 0.0 = Completely irrelevant or no useful recommendation

Score:`;

    try {
      const result = await generateText({
        model: this.model,
        prompt,
        maxTokens: 10,
        temperature: 0.1,
      });

      const score = parseFloat(result.text.trim());
      const finalScore = isNaN(score) ? 0 : Math.max(0, Math.min(1, score));
      return {
        score: finalScore,
        info: { reason: `Destination relevance evaluation completed with score: ${finalScore}` }
      };
    } catch (error) {
      console.error('Error in DestinationRelevanceMetric:', error);
      return { score: 0, info: { reason: 'Error during evaluation' } };
    }
  }
}

// Weather-Activity Alignment Metric - evaluates weather-based activity recommendations
export class WeatherActivityAlignmentMetric {
  constructor(private model: LanguageModel) {}

  async measure(input: string, output: string, expected?: any): Promise<MetricResult> {
    const prompt = `
Evaluate how well the travel recommendations align weather conditions with suggested activities on a scale of 0-1.

User Query: "${input}"
Agent Response: "${output}"

Consider:
- Are outdoor activities suggested only when weather is suitable?
- Are indoor alternatives provided for poor weather?
- Does the agent consider seasonal weather patterns?
- Are weather-dependent activities (beach, skiing, hiking) appropriately matched?

Return only a number between 0 and 1, where:
- 1.0 = Perfect weather-activity alignment
- 0.8 = Good alignment with minor issues
- 0.6 = Adequate alignment but some mismatches
- 0.4 = Poor alignment, weather not well considered
- 0.2 = Very poor alignment, inappropriate suggestions
- 0.0 = No weather consideration or completely inappropriate

Score:`;

    try {
      const result = await generateText({
        model: this.model,
        prompt,
        maxTokens: 10,
        temperature: 0.1,
      });

      const score = parseFloat(result.text.trim());
      const finalScore = isNaN(score) ? 0 : Math.max(0, Math.min(1, score));
      return {
        score: finalScore,
        info: { reason: `Weather-activity alignment evaluation completed with score: ${finalScore}` }
      };
    } catch (error) {
      console.error('Error in WeatherActivityAlignmentMetric:', error);
      return { score: 0, info: { reason: 'Error during evaluation' } };
    }
  }
}

// Budget Appropriateness Metric - evaluates budget alignment
export class BudgetAppropriatenessMetric {
  constructor(private model: LanguageModel) {}

  async measure(input: string, output: string, expected?: any): Promise<MetricResult> {
    const prompt = `
Evaluate how well the travel recommendations align with the user's budget constraints on a scale of 0-1.

User Query: "${input}"
Agent Response: "${output}"

Consider:
- Are suggested destinations within the stated budget range?
- Are recommended activities and accommodations budget-appropriate?
- Does the agent provide budget-conscious alternatives?
- Are cost considerations mentioned and addressed?

Return only a number between 0 and 1, where:
- 1.0 = Perfect budget alignment, cost-conscious recommendations
- 0.8 = Good budget consideration with minor oversights
- 0.6 = Adequate budget awareness but some expensive suggestions
- 0.4 = Poor budget consideration, some inappropriate costs
- 0.2 = Very poor budget alignment, mostly expensive options
- 0.0 = No budget consideration or completely unaffordable

Score:`;

    try {
      const result = await generateText({
        model: this.model,
        prompt,
        maxTokens: 10,
        temperature: 0.1,
      });

      const score = parseFloat(result.text.trim());
      const finalScore = isNaN(score) ? 0 : Math.max(0, Math.min(1, score));
      return {
        score: finalScore,
        info: { reason: `Budget appropriateness evaluation completed with score: ${finalScore}` }
      };
    } catch (error) {
      console.error('Error in BudgetAppropriatenessMetric:', error);
      return { score: 0, info: { reason: 'Error during evaluation' } };
    }
  }
}
