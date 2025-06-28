// Manual evaluation test to see if we can trigger evals for Mastra Cloud
import { mastra } from './src/mastra/index.js';
import { evaluate } from '@mastra/evals';
import { AnswerRelevancyMetric } from '@mastra/evals/llm';
import { google } from '@ai-sdk/google';

async function testManualEvaluation() {
  console.log('🧪 Testing Manual Evaluation for Mastra Cloud...\n');
  
  try {
    // Get the agent
    const agent = mastra.getAgent('tomorrowTravelAgent');
    
    // Test query
    const testQuery = "I want to visit a warm beach destination in December with a $2000 budget. What do you recommend?";
    
    console.log('📝 Query:', testQuery);
    
    // Generate response
    const response = await agent.generate([
      {
        role: 'user',
        content: testQuery
      }
    ]);
    
    console.log('\n🤖 Agent Response:');
    console.log(response.text);
    
    // Create evaluation metric
    const evalModel = google(process.env.MODEL ?? "gemini-2.5-pro");
    const answerRelevancyMetric = new AnswerRelevancyMetric(evalModel, { scale: 1 });
    
    // Run manual evaluation
    console.log('\n🔍 Running manual evaluation...');
    const evalResult = await evaluate(testQuery, response.text, answerRelevancyMetric);
    
    console.log('\n📊 Evaluation Result:');
    console.log('Score:', evalResult.score);
    console.log('Info:', evalResult.info);
    
    console.log('\n✅ Manual evaluation completed!');
    console.log('💡 Check Mastra Cloud dashboard to see if this evaluation appears.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testManualEvaluation();
