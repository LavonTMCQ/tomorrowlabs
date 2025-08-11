# Credo AI Agent - Enhanced MASTRA Cloud Deployment

## 🚀 Overview

This repository contains the enhanced Credo AI Agent powered by MASTRA, featuring:
- **Persistent Memory**: Resource-scoped memory that remembers users across conversations
- **Advanced Tools**: Web scraping, tone analysis, and content fetching capabilities
- **Multi-step Workflows**: Intelligent theme recommendations through chained analysis
- **Cloud-Ready**: Optimized for MASTRA Cloud deployment with automatic scaling

## 🏗️ Architecture

### Core Components

1. **Enhanced Agent** (`credo-ai-agent-enhanced.ts`)
   - Persistent memory with LibSQL storage
   - Resource-scoped working memory template
   - Integrated tools for content analysis
   - Conversation context management

2. **Tools**
   - `webScraperTool`: Extracts metadata from URLs
   - `toneAnalyzerTool`: Analyzes text tone and style
   - `articleFetcherTool`: Retrieves article content

3. **Workflows**
   - `themeRecommendationWorkflow`: Multi-step theme analysis
     - Step 1: Analyze bio tone
     - Step 2: Analyze top links
     - Step 3: Synthesize recommendation

4. **Memory System**
   - Last 20 messages for context
   - Semantic recall (top 5 relevant messages)
   - Persistent user profiles across threads
   - Tracks bio evolution and preferences

## 📦 Required Environment Variables

```env
# MASTRA Cloud Configuration
MASTRA_API_KEY=your-mastra-api-key
MASTRA_AGENT_URL=https://your-agent.mastra.cloud
DATABASE_URL=file:./mastra.db  # Or cloud database URL

# LLM Configuration
OPENAI_API_KEY=your-openai-api-key

# Optional: External Services
POSTGRES_CONNECTION_STRING=postgresql://...  # For pgVector
```

## 🚢 Deployment to MASTRA Cloud

### Prerequisites
1. MASTRA Cloud account ([cloud.mastra.ai](https://cloud.mastra.ai))
2. GitHub repository connected to MASTRA Cloud
3. Environment variables configured in MASTRA Cloud dashboard

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy enhanced Credo AI agent with memory and workflows"
   git push origin main
   ```

2. **MASTRA Cloud Auto-Deploy**
   - MASTRA Cloud automatically detects changes
   - Builds and deploys the agent
   - Exposes REST API endpoints

3. **Available Endpoints**
   ```
   POST /api/agents/credoAIAgentEnhanced/generate
   POST /api/workflows/themeRecommendationWorkflow/execute
   POST /api/tools/webScraperTool/execute
   ```

## 🔧 Integration with Credo Platform

### Update API Endpoints in Credo

Replace the placeholder URLs in the Credo API routes with your MASTRA Cloud endpoints:

```typescript
// In /credo/src/app/api/ai/generate-bio-v2/route.ts
const MASTRA_AGENT_URL = 'https://your-project.mastra.cloud';

// In /credo/src/app/api/ai/suggest-title/route.ts
const MASTRA_AGENT_URL = 'https://your-project.mastra.cloud';

// In /credo/src/app/api/ai/recommend-theme/route.ts
const MASTRA_AGENT_URL = 'https://your-project.mastra.cloud';
```

## 🧠 Key Features

### 1. Memory-Enhanced Bio Generation
```typescript
// The agent remembers previous bio versions
POST /api/ai/generate-bio-v2
{
  "linkedinData": {...},
  "style": "professional",
  "currentBio": "Previous version..."
}
```

### 2. Intelligent Link Title Suggestions
```typescript
// Uses web scraping to understand content
POST /api/ai/suggest-title
{
  "url": "https://example.com",
  "currentTitle": "Example"
}
```

### 3. Data-Driven Theme Recommendations
```typescript
// Multi-step workflow analyzes bio and links
POST /api/ai/recommend-theme
{
  "bio": "User bio text",
  "links": ["url1", "url2", "url3"]
}
```

### 4. Context-Aware Article Summaries
```typescript
// Generates summaries based on user interests
POST /api/ai/summarize-article
{
  "url": "https://article.com",
  "title": "Article Title"
}
```

## 📊 Observability

MASTRA Cloud provides built-in observability:
- **Logs**: View detailed execution logs
- **Traces**: Track agent interactions and tool usage
- **Evals**: Monitor response quality metrics
- **Telemetry**: OpenTelemetry support for custom monitoring

## 🔒 Security Considerations

1. **API Keys**: Store all sensitive keys in environment variables
2. **Rate Limiting**: Implement rate limiting in production
3. **Input Validation**: The agent validates all inputs with Zod schemas
4. **Memory Privacy**: User memory is scoped by resourceId

## 🧪 Testing

### Local Testing
```bash
npm install
npm run dev
# Visit http://localhost:4111 for MASTRA playground
```

### Production Testing
Use the MASTRA Cloud playground or integrate with the Credo platform for end-to-end testing.

## 📈 Performance Optimization

- **Memory Limits**: TokenLimiter prevents context overflow
- **Semantic Recall**: Efficiently retrieves relevant past messages
- **Tool Caching**: Web scraping results can be cached
- **Workflow Parallelization**: Steps execute in parallel when possible

## 🚀 Advanced Capabilities

### RAG (Retrieval-Augmented Generation)
The agent supports vector storage for document retrieval:
- Multiple vector database support (pgVector, Pinecone, etc.)
- Metadata filtering for precise queries
- Re-ranking for improved relevance

### Evaluation Metrics
Built-in evals for quality monitoring:
- Content similarity scoring
- Tone consistency checking
- Hallucination detection
- Completeness assessment

### Workflow Orchestration
Complex multi-step operations:
- Conditional branching
- Parallel execution
- Suspend/resume capabilities
- Event-driven triggers

## 📝 Maintenance

### Updating the Agent
1. Modify agent code in `credo-ai-agent-enhanced.ts`
2. Push to GitHub
3. MASTRA Cloud auto-deploys

### Monitoring
- Check MASTRA Cloud dashboard for logs
- Review eval scores for quality metrics
- Monitor API response times

## 🆘 Support

- MASTRA Documentation: [docs.mastra.ai](https://docs.mastra.ai)
- MASTRA Cloud Dashboard: [cloud.mastra.ai](https://cloud.mastra.ai)
- GitHub Issues: Report issues in this repository

---

**Note**: This agent is production-ready and includes enterprise features like persistent memory, advanced tools, and multi-step workflows. It's designed to scale with your Credo platform as it grows.