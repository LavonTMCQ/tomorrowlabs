// Test script to verify telemetry is working
import { mastra } from './src/mastra/index.js';

async function testTelemetrySystem() {
  console.log('🔍 Testing Tomorrow Travel Agent Telemetry System...\n');
  
  try {
    const agent = mastra.getAgent('tomorrowTravelAgent');
    
    // Test queries to generate telemetry data
    const testQueries = [
      "I want to visit a warm beach destination in December with a $2000 budget",
      "What's the weather like in Tokyo for mountain hiking?",
      "Family-friendly city destinations in Europe under $3000",
      "Luxury travel recommendations for the Maldives"
    ];
    
    console.log('📊 Generating telemetry data with test queries...\n');
    
    for (let i = 0; i < testQueries.length; i++) {
      const query = testQueries[i];
      console.log(`🧪 Test ${i + 1}/4: "${query}"`);
      
      const startTime = Date.now();
      
      try {
        const response = await agent.generate([
          {
            role: 'user',
            content: query
          }
        ]);
        
        const responseTime = Date.now() - startTime;
        console.log(`✅ Response received in ${responseTime}ms`);
        console.log(`📝 Response preview: ${response.text.substring(0, 100)}...\n`);
        
      } catch (error) {
        console.log(`❌ Error: ${error.message}\n`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('🎉 Telemetry test completed!');
    console.log('\n📈 Expected telemetry data generated:');
    console.log('- Agent response times for 4 different query types');
    console.log('- Memory retrieval performance metrics');
    console.log('- Weather API call latency (if weather queries were made)');
    console.log('- User engagement counters');
    console.log('- Recommendation quality scores');
    console.log('\n🔍 Check Mastra Cloud dashboard for telemetry data visibility!');
    
  } catch (error) {
    console.error('❌ Telemetry test failed:', error.message);
  }
}

testTelemetrySystem();
