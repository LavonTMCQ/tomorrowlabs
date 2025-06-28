import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { TravelKnowledgeBase } from '../rag/travel-knowledge-base';
import { TravelAgentTelemetry } from '../telemetry/travel-metrics';

// Initialize travel knowledge base
const travelKB = new TravelKnowledgeBase();

// Initialize knowledge base on first import
let isInitialized = false;
const initializeKB = async () => {
  if (!isInitialized) {
    try {
      await travelKB.initialize();
      await travelKB.populateKnowledgeBase();
      isInitialized = true;
      console.log('✅ Travel knowledge base initialized successfully');
    } catch (error) {
      console.log('ℹ️ Knowledge base initialization completed with fallback mode:', error.message);
      isInitialized = true; // Mark as initialized even if vector store is not available
    }
  }
};

// Initialize on module load (non-blocking)
void initializeKB();

export const travelKnowledgeTool = createTool({
  id: 'travel_knowledge_search',
  description: 'Search the comprehensive travel knowledge base for destination information, travel tips, cultural insights, safety information, and local recommendations',
  inputSchema: z.object({
    query: z.string().describe('Search query for travel information (e.g., "Tokyo attractions", "budget travel tips", "Paris safety")'),
    category: z.enum(['destination', 'tips', 'safety', 'culture', 'budget', 'activities']).optional().describe('Filter by content category'),
    region: z.enum(['Asia', 'Europe', 'Americas', 'Africa', 'Oceania']).optional().describe('Filter by geographic region'),
    budgetLevel: z.enum(['budget-friendly', 'medium', 'medium-high', 'luxury']).optional().describe('Filter by budget level'),
    activities: z.array(z.string()).optional().describe('Filter by activity types (e.g., ["beaches", "culture", "food"])'),
  }),
  execute: async ({ context }) => {
    return await TravelAgentTelemetry.trackMemoryRetrieval(async () => {
      const { query, category, region, budgetLevel, activities } = context;
      
      console.log(`🔍 Searching travel knowledge base: "${query}"`);
      
      try {
        // Build filter based on provided criteria
        const filter: any = {};
        if (category) filter.category = category;
        if (region) filter.region = region;
        if (budgetLevel) filter.budgetLevel = budgetLevel;
        if (activities && activities.length > 0) {
          filter.activities = { $in: activities };
        }
        
        // Query the knowledge base
        const results = await travelKB.query(query, {
          topK: 5,
          filter: Object.keys(filter).length > 0 ? filter : undefined,
        });
        
        if (!results || results.length === 0) {
          return {
            success: false,
            message: 'No relevant travel information found for your query.',
            suggestions: [
              'Try a broader search term',
              'Check spelling of destination names',
              'Use general terms like "budget tips" or "safety advice"',
            ],
          };
        }
        
        // Format results for the agent
        const formattedResults = results.map((result: any, index: number) => ({
          rank: index + 1,
          relevanceScore: result.score?.toFixed(3) || 'N/A',
          content: result.metadata?.text || result.text,
          source: result.metadata?.documentName || 'Travel Knowledge Base',
          category: result.metadata?.category || 'general',
          region: result.metadata?.region,
          country: result.metadata?.country,
          activities: result.metadata?.activities,
          budgetLevel: result.metadata?.budgetLevel,
        }));
        
        console.log(`✅ Found ${results.length} relevant travel knowledge entries`);
        
        return {
          success: true,
          query: query,
          totalResults: results.length,
          results: formattedResults,
          summary: `Found ${results.length} relevant travel knowledge entries for "${query}"`,
          filters: {
            category,
            region,
            budgetLevel,
            activities,
          },
        };
        
      } catch (error) {
        console.error('❌ Error searching travel knowledge base:', error);
        
        // Fallback to basic travel advice if RAG fails
        return {
          success: false,
          message: 'Travel knowledge base temporarily unavailable. Using general travel advice.',
          fallbackAdvice: getFallbackTravelAdvice(query),
        };
      }
    }, 'both'); // Track as both memory systems since RAG combines vector search with knowledge retrieval
  },
});

// Fallback travel advice when RAG is unavailable
function getFallbackTravelAdvice(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('tokyo') || lowerQuery.includes('japan')) {
    return 'Tokyo is best visited in spring (cherry blossoms) or fall. Must-see: Senso-ji Temple, Tokyo Skytree, Shibuya Crossing. Try authentic sushi and ramen. Use JR Pass for transportation.';
  }
  
  if (lowerQuery.includes('paris') || lowerQuery.includes('france')) {
    return 'Paris is beautiful year-round. Visit Eiffel Tower, Louvre Museum, Notre-Dame. Try croissants, French cuisine, and local wines. Use Metro for transportation. Learn basic French phrases.';
  }
  
  if (lowerQuery.includes('bali') || lowerQuery.includes('indonesia')) {
    return 'Bali is best April-October (dry season). Visit Ubud for culture, Seminyak for beaches. Try nasi goreng and fresh seafood. Rent a scooter for transportation. Respect Hindu temples and traditions.';
  }
  
  if (lowerQuery.includes('budget')) {
    return 'Budget travel tips: Stay in hostels, eat street food, use public transport, book in advance, travel off-season, look for free activities like walking tours and museums.';
  }
  
  if (lowerQuery.includes('safety')) {
    return 'Travel safety: Research destination, get travel insurance, keep copies of documents, stay alert, use reputable transportation, drink bottled water in developing countries.';
  }
  
  return 'For the best travel experience, research your destination, respect local customs, try local cuisine, use public transportation, and always prioritize safety.';
}

export { travelKB };
