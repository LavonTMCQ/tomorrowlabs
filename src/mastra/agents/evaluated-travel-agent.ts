import { tomorrowTravelAgent } from './tomorrow-travel-agent';
import { runEvaluations } from '../middleware/eval-middleware';

// Wrapper class that automatically runs evaluations
export class EvaluatedTravelAgent {
  private agent = tomorrowTravelAgent;

  async generate(messages: any[], options?: any) {
    // Get the user input
    const userInput = messages[messages.length - 1]?.content || '';
    
    // Generate response using the original agent
    const response = await this.agent.generate(messages, options);
    
    // Run evaluations in the background (don't block the response)
    setImmediate(async () => {
      try {
        await runEvaluations(userInput, response.text, 'tomorrowTravelAgent');
      } catch (error) {
        console.error('Background evaluation failed:', error);
      }
    });

    return response;
  }

  // Proxy other methods to the original agent
  get name() {
    return this.agent.name;
  }

  get instructions() {
    return this.agent.instructions;
  }

  get tools() {
    return this.agent.tools;
  }

  get memory() {
    return this.agent.memory;
  }
}

export const evaluatedTravelAgent = new EvaluatedTravelAgent();
