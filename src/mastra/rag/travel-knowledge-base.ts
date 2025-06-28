// Travel Knowledge Base with comprehensive destination information
import { MDocument } from '@mastra/rag';
import { embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import { PgVector } from '@mastra/pg';

// Travel knowledge base content
export const TRAVEL_KNOWLEDGE_BASE = {
  destinations: [
    {
      id: 'tokyo-japan',
      name: 'Tokyo, Japan',
      content: `
# Tokyo, Japan - Complete Travel Guide

## Overview
Tokyo is Japan's bustling capital, blending ultra-modern technology with traditional culture. Home to 14 million people, it's one of the world's most exciting cities.

## Best Time to Visit
- **Spring (March-May)**: Cherry blossom season, mild weather, perfect for walking
- **Fall (September-November)**: Comfortable temperatures, beautiful autumn colors
- **Summer (June-August)**: Hot and humid, festival season
- **Winter (December-February)**: Cold but clear, fewer crowds

## Top Attractions
- **Senso-ji Temple**: Ancient Buddhist temple in Asakusa district
- **Tokyo Skytree**: 634m tall tower with panoramic city views
- **Shibuya Crossing**: World's busiest pedestrian crossing
- **Tsukiji Outer Market**: Fresh seafood and street food
- **Meiji Shrine**: Peaceful Shinto shrine in Harajuku
- **Imperial Palace**: Historic residence of Japanese Emperor

## Neighborhoods
- **Shibuya**: Youth culture, shopping, nightlife
- **Harajuku**: Fashion, pop culture, quirky shops
- **Ginza**: Luxury shopping, fine dining, upscale entertainment
- **Asakusa**: Traditional Tokyo, temples, old-style shops
- **Shinjuku**: Business district, entertainment, skyscrapers

## Food & Dining
- **Sushi**: Try authentic sushi at Tsukiji or high-end restaurants
- **Ramen**: Ichiran, Ippudo for excellent ramen
- **Tempura**: Light, crispy fried seafood and vegetables
- **Yakitori**: Grilled chicken skewers, perfect with beer
- **Kaiseki**: Multi-course traditional Japanese cuisine

## Transportation
- **JR Pass**: Unlimited travel on JR trains, great for tourists
- **Tokyo Metro**: Extensive subway system, get a day pass
- **IC Cards**: Suica or Pasmo for easy train/bus payments
- **Taxis**: Expensive but convenient, drivers don't speak English

## Budget Guidelines
- **Budget**: $50-80/day (hostels, street food, public transport)
- **Mid-range**: $100-200/day (hotels, restaurants, attractions)
- **Luxury**: $300+/day (high-end hotels, fine dining, private tours)

## Cultural Tips
- Bow when greeting, remove shoes indoors
- Don't eat while walking, be quiet on trains
- Tipping is not customary and can be offensive
- Learn basic Japanese phrases: arigatou (thank you), sumimasen (excuse me)

## Safety
Tokyo is extremely safe with very low crime rates. Women can walk alone at night. Emergency number: 110 (police), 119 (fire/ambulance).
      `,
      category: 'destination',
      region: 'Asia',
      country: 'Japan',
      climate: 'temperate',
      budgetLevel: 'medium-high',
      activities: ['culture', 'food', 'shopping', 'temples', 'technology'],
    },
    
    {
      id: 'paris-france',
      name: 'Paris, France',
      content: `
# Paris, France - The City of Light

## Overview
Paris, the capital of France, is renowned for its art, fashion, gastronomy, and culture. With iconic landmarks like the Eiffel Tower and Louvre Museum, it's one of the world's most visited cities.

## Best Time to Visit
- **Spring (April-June)**: Pleasant weather, blooming gardens, perfect for walking
- **Fall (September-November)**: Mild temperatures, fewer crowds, beautiful autumn colors
- **Summer (July-August)**: Warm weather but crowded and expensive
- **Winter (December-March)**: Cold but magical, Christmas markets, fewer tourists

## Top Attractions
- **Eiffel Tower**: Iconic iron lattice tower, best views at sunset
- **Louvre Museum**: World's largest art museum, home to Mona Lisa
- **Notre-Dame Cathedral**: Gothic masterpiece (under restoration)
- **Arc de Triomphe**: Triumphal arch at the center of Place Charles de Gaulle
- **Sacré-Cœur**: Beautiful basilica atop Montmartre hill
- **Champs-Élysées**: Famous avenue for shopping and cafes

## Neighborhoods
- **Le Marais**: Historic Jewish quarter, trendy boutiques, galleries
- **Montmartre**: Artistic district, Sacré-Cœur, street artists
- **Saint-Germain**: Intellectual hub, cafes, bookshops, galleries
- **Latin Quarter**: Student area, Sorbonne, narrow medieval streets
- **Champs-Élysées**: Luxury shopping, theaters, cafes

## Food & Dining
- **Croissants & Pastries**: Best at local boulangeries in the morning
- **French Cuisine**: Coq au vin, bouillabaisse, escargot
- **Wine**: Extensive wine culture, try local bistros
- **Cheese**: Over 400 varieties, visit fromageries
- **Macarons**: Ladurée and Pierre Hermé for the best

## Transportation
- **Metro**: Extensive subway system, buy day passes
- **Vélib'**: Bike-sharing system throughout the city
- **Walking**: Many attractions within walking distance
- **Taxis/Uber**: Available but can be expensive

## Budget Guidelines
- **Budget**: $60-100/day (hostels, cafes, museums)
- **Mid-range**: $150-250/day (hotels, restaurants, attractions)
- **Luxury**: $400+/day (luxury hotels, fine dining, private tours)

## Cultural Tips
- Greet with "Bonjour" when entering shops
- Dress elegantly, Parisians value style
- Lunch is typically 12-2pm, dinner after 7:30pm
- Learn basic French: merci (thank you), s'il vous plaît (please)

## Safety
Paris is generally safe but watch for pickpockets in tourist areas and on public transport. Emergency number: 112.
      `,
      category: 'destination',
      region: 'Europe',
      country: 'France',
      climate: 'temperate',
      budgetLevel: 'medium-high',
      activities: ['culture', 'art', 'food', 'museums', 'romance'],
    },

    {
      id: 'bali-indonesia',
      name: 'Bali, Indonesia',
      content: `
# Bali, Indonesia - Island Paradise

## Overview
Bali is Indonesia's most famous island, known for its forested volcanic mountains, iconic rice paddies, beaches, and coral reefs. It's a spiritual and cultural hub with Hindu temples and vibrant arts scene.

## Best Time to Visit
- **Dry Season (April-October)**: Perfect weather, minimal rainfall, ideal for outdoor activities
- **Wet Season (November-March)**: Higher humidity, afternoon showers, fewer crowds, lower prices

## Top Attractions
- **Tanah Lot Temple**: Iconic sea temple on a rock formation
- **Ubud**: Cultural heart with rice terraces, art galleries, yoga retreats
- **Mount Batur**: Active volcano, popular for sunrise hikes
- **Uluwatu Temple**: Clifftop temple with ocean views and Kecak dance
- **Tegallalang Rice Terraces**: Stunning stepped rice fields
- **Sekumpul Waterfall**: Bali's most beautiful waterfall

## Regions
- **Ubud**: Cultural center, rice terraces, wellness retreats
- **Seminyak**: Upscale beach area, luxury resorts, fine dining
- **Canggu**: Surf town, beach clubs, digital nomad hub
- **Sanur**: Quiet beach town, family-friendly, traditional
- **Nusa Dua**: Luxury resort area, pristine beaches

## Activities
- **Surfing**: World-class waves at Uluwatu, Canggu, Padang Padang
- **Yoga & Wellness**: Ubud is the wellness capital
- **Temple Hopping**: Visit ancient Hindu temples
- **Rice Terrace Tours**: Jatiluwih and Tegallalang terraces
- **Volcano Hiking**: Mount Batur sunrise trek
- **Snorkeling/Diving**: Coral reefs around Nusa Penida

## Food & Dining
- **Nasi Goreng**: Indonesian fried rice, national dish
- **Satay**: Grilled meat skewers with peanut sauce
- **Gado-Gado**: Mixed vegetable salad with peanut dressing
- **Rendang**: Slow-cooked beef curry
- **Fresh Seafood**: Jimbaran beach for grilled fish

## Transportation
- **Scooter Rental**: Most popular way to get around
- **Private Driver**: Affordable for day trips and tours
- **Grab**: Ride-hailing app available in main areas
- **Tourist Shuttle**: Connects major tourist areas

## Budget Guidelines
- **Budget**: $25-40/day (guesthouses, local food, public transport)
- **Mid-range**: $50-100/day (hotels, restaurants, tours)
- **Luxury**: $200+/day (resorts, fine dining, private tours)

## Cultural Tips
- Dress modestly when visiting temples
- Use right hand for giving/receiving items
- Remove shoes before entering homes/temples
- Respect local customs and Hindu traditions

## Safety
Bali is generally safe but be cautious of traffic, strong ocean currents, and petty theft. Emergency number: 112.
      `,
      category: 'destination',
      region: 'Asia',
      country: 'Indonesia',
      climate: 'tropical',
      budgetLevel: 'budget-friendly',
      activities: ['beaches', 'culture', 'wellness', 'surfing', 'temples'],
    },
  ],

  travelTips: [
    {
      id: 'budget-travel-tips',
      content: `
# Budget Travel Tips - Travel More for Less

## Accommodation
- **Hostels**: Great for meeting people, shared facilities
- **Airbnb**: Often cheaper than hotels, local experience
- **Couchsurfing**: Free accommodation, meet locals
- **House-sitting**: Free accommodation in exchange for pet/house care

## Transportation
- **Book in advance**: Flights and trains are cheaper when booked early
- **Be flexible**: Use flexible date searches for better deals
- **Public transport**: Much cheaper than taxis or rental cars
- **Walk or bike**: Free and healthy way to explore cities

## Food & Dining
- **Street food**: Authentic and inexpensive local cuisine
- **Cook your own meals**: Shop at local markets
- **Lunch specials**: Many restaurants offer cheaper lunch menus
- **Happy hours**: Discounted drinks and appetizers

## Activities
- **Free walking tours**: Available in most major cities
- **Museums**: Many have free days or student discounts
- **Nature**: Hiking, beaches, parks are usually free
- **Local events**: Festivals and cultural events often free

## Money-Saving Tips
- **Travel insurance**: Protects against expensive emergencies
- **City passes**: Discounts on multiple attractions
- **Student discounts**: Get an ISIC card for discounts worldwide
- **Off-season travel**: Lower prices, fewer crowds
      `,
      category: 'tips',
      topic: 'budget',
    },

    {
      id: 'safety-travel-tips',
      content: `
# Travel Safety Tips - Stay Safe While Exploring

## Before You Go
- **Research destination**: Know local laws, customs, and current events
- **Travel insurance**: Essential for medical emergencies and trip cancellations
- **Copies of documents**: Keep digital and physical copies of passport, visa, insurance
- **Emergency contacts**: Share itinerary with family/friends

## Money & Documents
- **Multiple payment methods**: Cards, cash, backup cards
- **Secure storage**: Use hotel safes, money belts, hidden pockets
- **ATM safety**: Use bank ATMs, cover PIN, be aware of surroundings
- **Scam awareness**: Common tourist scams vary by destination

## Health & Medical
- **Vaccinations**: Check requirements 4-6 weeks before travel
- **Prescription medications**: Bring extra, keep in original containers
- **Travel health kit**: Basic first aid, common medications
- **Water safety**: Drink bottled water in developing countries

## Personal Safety
- **Stay alert**: Be aware of surroundings, trust your instincts
- **Blend in**: Dress like locals, don't flash expensive items
- **Transportation**: Use reputable companies, avoid unlicensed taxis
- **Accommodation**: Read reviews, choose safe neighborhoods

## Communication
- **Local SIM card**: Stay connected for emergencies
- **Emergency numbers**: Know local police, medical, fire numbers
- **Embassy contact**: Register with your embassy if traveling long-term
- **Check-ins**: Regular contact with home
      `,
      category: 'tips',
      topic: 'safety',
    },
  ],
};

// Vector store configuration for travel knowledge base
export class TravelKnowledgeBase {
  private vectorStore: PgVector | null = null;
  private indexName = 'travel_knowledge';
  private isAvailable = false;

  constructor() {
    // Only initialize PostgreSQL if connection string is provided
    if (process.env.POSTGRES_CONNECTION_STRING) {
      try {
        this.vectorStore = new PgVector({
          connectionString: process.env.POSTGRES_CONNECTION_STRING,
        });
        this.isAvailable = true;
        console.log('✅ PostgreSQL vector store initialized');
      } catch (error) {
        console.log('⚠️ PostgreSQL vector store initialization failed:', error.message);
        this.isAvailable = false;
      }
    } else {
      console.log('ℹ️ No PostgreSQL connection string provided, using fallback mode');
      this.isAvailable = false;
    }
  }

  // Initialize the knowledge base
  async initialize() {
    if (!this.isAvailable || !this.vectorStore) {
      console.log('ℹ️ Vector store not available, skipping initialization');
      return;
    }

    try {
      // Create vector index for travel knowledge
      await this.vectorStore.createIndex({
        indexName: this.indexName,
        dimension: 1536, // OpenAI text-embedding-3-small dimension
      });

      console.log('✅ Travel knowledge base vector index created');
    } catch (error) {
      console.log('ℹ️ Vector index already exists or error:', error.message);
      // Don't throw error, just log it
    }
  }

  // Populate the knowledge base with travel content
  async populateKnowledgeBase() {
    if (!this.isAvailable || !this.vectorStore) {
      console.log('ℹ️ Vector store not available, skipping knowledge base population');
      return;
    }

    console.log('📚 Populating travel knowledge base...');

    const allContent = [
      ...TRAVEL_KNOWLEDGE_BASE.destinations,
      ...TRAVEL_KNOWLEDGE_BASE.travelTips,
    ];

    for (const item of allContent) {
      await this.addDocument(item);
    }

    console.log('✅ Travel knowledge base populated successfully');
  }

  // Add a single document to the knowledge base
  async addDocument(item: any) {
    if (!this.isAvailable || !this.vectorStore) {
      console.log(`ℹ️ Skipping document ${item.name || item.id} - vector store not available`);
      return;
    }

    try {
      // Create document from content
      const doc = MDocument.fromMarkdown(item.content);

      // Chunk the document
      const chunks = await doc.chunk({
        strategy: 'recursive',
        size: 512,
        overlap: 50,
      });

      // Generate embeddings
      const { embeddings } = await embedMany({
        model: openai.embedding('text-embedding-3-small'),
        values: chunks.map(chunk => chunk.text),
      });

      // Prepare metadata for each chunk
      const metadata = chunks.map((chunk, index) => ({
        text: chunk.text,
        id: `${item.id}_chunk_${index}`,
        documentId: item.id,
        documentName: item.name || item.id,
        category: item.category,
        region: item.region,
        country: item.country,
        climate: item.climate,
        budgetLevel: item.budgetLevel,
        activities: item.activities,
        topic: item.topic,
        chunkIndex: index,
        totalChunks: chunks.length,
      }));

      // Store in vector database
      await this.vectorStore.upsert({
        indexName: this.indexName,
        vectors: embeddings,
        metadata,
      });

      console.log(`✅ Added ${item.name || item.id} to knowledge base (${chunks.length} chunks)`);
    } catch (error) {
      console.error(`❌ Error adding ${item.name || item.id}:`, error.message);
    }
  }

  // Query the knowledge base
  async query(queryText: string, options: {
    topK?: number;
    filter?: any;
  } = {}) {
    if (!this.isAvailable || !this.vectorStore) {
      console.log('ℹ️ Vector store not available, returning empty results');
      return [];
    }

    const { topK = 5, filter } = options;

    try {
      // Generate embedding for query
      const { embedding } = await embedMany({
        model: openai.embedding('text-embedding-3-small'),
        values: [queryText],
      });

      // Query vector store
      const results = await this.vectorStore.query({
        indexName: this.indexName,
        queryVector: embedding[0],
        topK,
        filter,
      });

      return results;
    } catch (error) {
      console.error('❌ Error querying knowledge base:', error.message);
      return [];
    }
  }

  // Get the vector store instance
  getVectorStore() {
    return this.vectorStore;
  }

  // Get index name
  getIndexName() {
    return this.indexName;
  }
}
