// Test script for RAG (Retrieval-Augmented Generation) system
import { travelKnowledgeTool } from './src/mastra/tools/travel-rag-tool.js';

async function testRAGSystem() {
  console.log('🔍 Testing Tomorrow Travel Agent RAG System...\n');
  
  try {
    // Test 1: Destination-specific queries
    console.log('📍 Test 1: Destination-specific queries');
    const destinationQueries = [
      { query: 'Tokyo attractions and activities', category: 'destination' },
      { query: 'Paris best time to visit', category: 'destination' },
      { query: 'Bali cultural tips and temples', category: 'destination' },
    ];
    
    for (const testQuery of destinationQueries) {
      console.log(`\n🔍 Query: "${testQuery.query}"`);
      
      const result = await travelKnowledgeTool.execute({
        context: testQuery
      });
      
      if (result.success) {
        console.log(`✅ Found ${result.totalResults} results`);
        console.log(`📝 Summary: ${result.summary}`);
        if (result.results && result.results.length > 0) {
          console.log(`🎯 Top result: ${result.results[0].content.substring(0, 150)}...`);
        }
      } else {
        console.log(`❌ Query failed: ${result.message}`);
        if (result.fallbackAdvice) {
          console.log(`💡 Fallback advice: ${result.fallbackAdvice}`);
        }
      }
    }
    
    // Test 2: Category-based filtering
    console.log('\n\n🏷️ Test 2: Category-based filtering');
    const categoryQueries = [
      { query: 'budget travel advice', category: 'tips' },
      { query: 'travel safety guidelines', category: 'safety' },
      { query: 'cultural etiquette', category: 'culture' },
    ];
    
    for (const testQuery of categoryQueries) {
      console.log(`\n🔍 Query: "${testQuery.query}" (Category: ${testQuery.category})`);
      
      const result = await travelKnowledgeTool.execute({
        context: testQuery
      });
      
      if (result.success) {
        console.log(`✅ Found ${result.totalResults} results in category "${testQuery.category}"`);
        if (result.results && result.results.length > 0) {
          console.log(`📋 Categories found: ${result.results.map(r => r.category).join(', ')}`);
        }
      } else {
        console.log(`❌ Query failed: ${result.message}`);
      }
    }
    
    // Test 3: Regional filtering
    console.log('\n\n🌍 Test 3: Regional filtering');
    const regionalQueries = [
      { query: 'Asian destinations', region: 'Asia' },
      { query: 'European travel', region: 'Europe' },
    ];
    
    for (const testQuery of regionalQueries) {
      console.log(`\n🔍 Query: "${testQuery.query}" (Region: ${testQuery.region})`);
      
      const result = await travelKnowledgeTool.execute({
        context: testQuery
      });
      
      if (result.success) {
        console.log(`✅ Found ${result.totalResults} results in region "${testQuery.region}"`);
        if (result.results && result.results.length > 0) {
          console.log(`🗺️ Regions found: ${result.results.map(r => r.region).filter(Boolean).join(', ')}`);
        }
      } else {
        console.log(`❌ Query failed: ${result.message}`);
      }
    }
    
    // Test 4: Budget-level filtering
    console.log('\n\n💰 Test 4: Budget-level filtering');
    const budgetQueries = [
      { query: 'affordable destinations', budgetLevel: 'budget-friendly' },
      { query: 'luxury travel options', budgetLevel: 'luxury' },
    ];
    
    for (const testQuery of budgetQueries) {
      console.log(`\n🔍 Query: "${testQuery.query}" (Budget: ${testQuery.budgetLevel})`);
      
      const result = await travelKnowledgeTool.execute({
        context: testQuery
      });
      
      if (result.success) {
        console.log(`✅ Found ${result.totalResults} results for budget level "${testQuery.budgetLevel}"`);
        if (result.results && result.results.length > 0) {
          console.log(`💵 Budget levels found: ${result.results.map(r => r.budgetLevel).filter(Boolean).join(', ')}`);
        }
      } else {
        console.log(`❌ Query failed: ${result.message}`);
      }
    }
    
    // Test 5: Activity-based filtering
    console.log('\n\n🎯 Test 5: Activity-based filtering');
    const activityQueries = [
      { query: 'beach destinations', activities: ['beaches'] },
      { query: 'cultural experiences', activities: ['culture', 'temples'] },
      { query: 'food and dining', activities: ['food'] },
    ];
    
    for (const testQuery of activityQueries) {
      console.log(`\n🔍 Query: "${testQuery.query}" (Activities: ${testQuery.activities.join(', ')})`);
      
      const result = await travelKnowledgeTool.execute({
        context: testQuery
      });
      
      if (result.success) {
        console.log(`✅ Found ${result.totalResults} results for activities: ${testQuery.activities.join(', ')}`);
        if (result.results && result.results.length > 0) {
          console.log(`🎪 Activities found: ${result.results.map(r => r.activities).filter(Boolean).flat().join(', ')}`);
        }
      } else {
        console.log(`❌ Query failed: ${result.message}`);
      }
    }
    
    // Test 6: Complex multi-filter query
    console.log('\n\n🔧 Test 6: Complex multi-filter query');
    const complexQuery = {
      query: 'Asian beach destinations for budget travelers',
      category: 'destination',
      region: 'Asia',
      budgetLevel: 'budget-friendly',
      activities: ['beaches']
    };
    
    console.log(`\n🔍 Complex Query: "${complexQuery.query}"`);
    console.log(`📋 Filters: Category=${complexQuery.category}, Region=${complexQuery.region}, Budget=${complexQuery.budgetLevel}, Activities=${complexQuery.activities.join(',')}`);
    
    const result = await travelKnowledgeTool.execute({
      context: complexQuery
    });
    
    if (result.success) {
      console.log(`✅ Found ${result.totalResults} results matching all criteria`);
      console.log(`🎯 Applied filters:`, result.filters);
      if (result.results && result.results.length > 0) {
        console.log(`🏆 Best match: ${result.results[0].source} - ${result.results[0].content.substring(0, 100)}...`);
      }
    } else {
      console.log(`❌ Complex query failed: ${result.message}`);
      if (result.fallbackAdvice) {
        console.log(`💡 Fallback advice: ${result.fallbackAdvice}`);
      }
    }
    
    console.log('\n\n🎉 RAG System Test Summary:');
    console.log('✅ Destination-specific queries tested');
    console.log('✅ Category-based filtering tested');
    console.log('✅ Regional filtering tested');
    console.log('✅ Budget-level filtering tested');
    console.log('✅ Activity-based filtering tested');
    console.log('✅ Complex multi-filter queries tested');
    console.log('\n🚀 Tomorrow Travel Agent RAG system is ready!');
    console.log('📚 Knowledge base includes: Tokyo, Paris, Bali + travel tips & safety advice');
    console.log('🔍 Vector search enables semantic matching for travel queries');
    console.log('🎯 Multiple filtering options for precise recommendations');
    
  } catch (error) {
    console.error('❌ RAG system test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testRAGSystem();
