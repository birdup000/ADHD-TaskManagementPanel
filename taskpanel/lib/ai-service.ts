import type { PuterAI } from '../types/puter';
import { loadPuter } from './puter';

export interface AIResponse<T = string> {
  content: T;
  model: string;
  status: 'success' | 'error';
  error?: string;
}

export interface AIStreamResponse extends AIResponse {
  isComplete: boolean;
}

export interface AITaskAnalysis {
  complexity: number;
  estimatedTime: string;
  suggestedSubtasks: string[];
  keywords: string[];
}

export class AIService {
  private ai: PuterAI | null = null;

  async initialize(): Promise<void> {
    const puter = await loadPuter();
    this.ai = puter.ai;
  }

  async analyzeTask(taskDescription: string): Promise<AIResponse<AITaskAnalysis>> {
    if (!this.ai) throw new Error('AI service not initialized');
    
    const prompt = `Analyze the following task and provide structured output:
    Task: ${taskDescription}
    
    Provide:
    1. Complexity (1-10)
    2. Estimated time
    3. 2-4 suggested subtasks
    4. Related keywords`;

    try {
      const response = await this.ai.chat(prompt);
      // Parse the response into structured format
      const analysis = this.parseTaskAnalysis(response);
      
      return {
        content: analysis,
        model: 'gpt-3.5-turbo',
        status: 'success'
      };
    } catch (error) {
      return {
        content: {
          complexity: 0,
          estimatedTime: 'unknown',
          suggestedSubtasks: [],
          keywords: []
        },
        model: 'gpt-3.5-turbo',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async streamChat(
    prompt: string,
    onUpdate: (response: AIStreamResponse) => void,
    options: {
      temperature?: number;
      maxTokens?: number;
      context?: string[];
    } = {}
  ): Promise<void> {
    if (!this.ai) throw new Error('AI service not initialized');

    try {
      // Get relevant context if not provided
      const context = options.context || await contextManager.getRelevantContext(prompt);
      
      // Construct prompt with context
      const contextualPrompt = [
        ...context.map(ctx => `Context: ${ctx}`),
        `Current request: ${prompt}`
      ].join('\n\n');

      const response = await this.ai.chat(contextualPrompt, { 
        stream: true,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
      });
      // Handle streaming response
      onUpdate({
        content: response,
        model: 'gpt-3.5-turbo',
        status: 'success',
        isComplete: true
      });
    } catch (error) {
      onUpdate({
        content: '',
        model: 'gpt-3.5-turbo',
        status: 'error',
        isComplete: true,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async analyzeSentiment(text: string): Promise<{ sentiment: string; confidence: number }> {
    if (!this.ai) throw new Error('AI service not initialized');
    
    try {
      const result = await this.ai.analyze(text, 'sentiment');
      return result;
    } catch (error) {
      console.error('Failed to analyze sentiment:', error);
      return { sentiment: 'neutral', confidence: 0 };
    }
  }

  async extractKeyPhrases(text: string): Promise<string[]> {
    if (!this.ai) throw new Error('AI service not initialized');
    
    try {
      const result = await this.ai.analyze(text, 'keywords');
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Failed to extract key phrases:', error);
      return [];
    }
  }

  async moderateContent(text: string): Promise<boolean> {
    if (!this.ai) throw new Error('AI service not initialized');
    
    try {
      const result = await this.ai.moderate(text);
      return !result.flagged;
    } catch (error) {
      console.error('Failed to moderate content:', error);
      return true; // Allow content by default
    }
  }

  private parseTaskAnalysis(response: string): AITaskAnalysis {
    // Basic parsing logic - in production this should be more robust
    const lines = response.split('\n');
    const complexity = parseInt(lines.find(l => l.includes('Complexity'))?.match(/\d+/)?.[0] || '5');
    const estimatedTime = lines.find(l => l.includes('Estimated time'))?.split(':')[1]?.trim() || 'unknown';
    const subtasks = lines
      .filter(l => l.match(/^\d+\./))
      .map(l => l.replace(/^\d+\.\s*/, '').trim());
    const keywords = lines
      .find(l => l.toLowerCase().includes('keywords'))
      ?.split(':')[1]
      ?.split(',')
      .map(k => k.trim()) || [];

    return {
      complexity,
      estimatedTime,
      suggestedSubtasks: subtasks,
      keywords
    };
  }
}

// Export singleton instance
export const aiService = new AIService();