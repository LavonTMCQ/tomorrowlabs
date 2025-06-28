import { evaluate } from '@mastra/evals';
import { AnswerRelevancyMetric, PromptAlignmentMetric } from '@mastra/evals/llm';
import { ContentSimilarityMetric, ToneConsistencyMetric } from '@mastra/evals/nlp';
import { google } from '@ai-sdk/google';

// Create evaluation model
const evalModel = google(process.env.MODEL ?? "gemini-2.5-pro");

// Initialize metrics
const answerRelevancyMetric = new AnswerRelevancyMetric(evalModel, { scale: 1 });
const promptAlignmentMetric = new PromptAlignmentMetric(evalModel, {
  instructions: [
    "Provide specific travel recommendations based on weather conditions",
    "Include budget considerations when mentioned",
    "Suggest activities appropriate for the destination and season",
    "Maintain a helpful and informative tone"
  ],
  scale: 1
});
const contentSimilarityMetric = new ContentSimilarityMetric({ ignoreCase: true, ignoreWhitespace: true });
const toneConsistencyMetric = new ToneConsistencyMetric();

// Evaluation middleware that runs after agent responses
export async function runEvaluations(input: string, output: string, agentName: string) {
  try {
    console.log(`🧪 Running evaluations for ${agentName}...`);
    
    // Run all evaluations in parallel
    const [
      answerRelevancyResult,
      promptAlignmentResult,
      contentSimilarityResult,
      toneConsistencyResult
    ] = await Promise.all([
      evaluate(input, output, answerRelevancyMetric),
      evaluate(input, output, promptAlignmentMetric),
      evaluate(input, output, contentSimilarityMetric),
      evaluate(input, output, toneConsistencyMetric)
    ]);

    // Log results for debugging
    console.log('📊 Evaluation Results:');
    console.log(`- Answer Relevancy: ${answerRelevancyResult.score}`);
    console.log(`- Prompt Alignment: ${promptAlignmentResult.score}`);
    console.log(`- Content Similarity: ${contentSimilarityResult.score}`);
    console.log(`- Tone Consistency: ${toneConsistencyResult.score}`);

    // Return results for potential storage
    return {
      answerRelevancy: answerRelevancyResult,
      promptAlignment: promptAlignmentResult,
      contentSimilarity: contentSimilarityResult,
      toneConsistency: toneConsistencyResult,
      timestamp: new Date().toISOString(),
      agentName,
      input,
      output
    };

  } catch (error) {
    console.error('❌ Error running evaluations:', error);
    return null;
  }
}
