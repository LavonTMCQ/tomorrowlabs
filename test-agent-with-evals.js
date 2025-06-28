// Simple test script to demonstrate how evaluations work
// Run this with: node test-agent-with-evals.js

import { mastra } from './src/mastra/index.js';

async function testAgentWithEvaluations() {
  console.log('🧪 Testing Tomorrow Travel Agent with Evaluations...\n');
  
  try {
    const agent = mastra.getAgent('tomorrowTravelAgent');
    
    // Test query that should trigger evaluations
    const testQuery = "I want to visit a warm beach destination in December with a $2000 budget. What do you recommend?";
    
    console.log('📝 Query:', testQuery);
    console.log('\n🤖 Agent Response:');
    
    const response = await agent.generate([
      {
        role: 'user',
        content: testQuery
      }
    ]);
    
    console.log(response.text);
    console.log('\n✅ Evaluations should now be visible in Mastra Cloud dashboard!');
    console.log('\n📊 The following metrics were automatically evaluated:');
    console.log('- Answer Relevancy: How well the response addresses the query');
    console.log('- Prompt Alignment: Adherence to travel agent instructions');
    console.log('- Content Similarity: Consistency with expected travel advice');
    console.log('- Tone Consistency: Professional and helpful tone');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAgentWithEvaluations();
