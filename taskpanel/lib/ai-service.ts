import type { PuterAI } from '../types/puter';
import { AIServiceError, TimeoutError } from '../types/errors';
import { withRetry } from './retry-utils';
import { loadPuter } from './puter';
import { contextManager } from './ai-context-manager';

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
  private static readonly DEFAULT_TIMEOUT = 30000; // 30 second default timeout

  async initialize(): Promise<void> {
    try {
      const puter = await loadPuter();
      if (!puter?.ai) {
        throw new AIServiceError('Failed to initialize AI service - AI provider not available', 'AI_INIT_FAILED');
      }
      this.ai = puter.ai;
    } catch (error) {
      throw new AIServiceError(
        `Failed to initialize AI service: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'AI_INIT_FAILED'
      );
    }
  }

  async analyzeTask(taskDescription: string): Promise<AIResponse<AITaskAnalysis>> {
    if (!this.ai) { throw new AIServiceError('AI service not initialized', 'AI_NOT_INITIALIZED'); }
    
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
        model: 'claude-3-5-sonnet',
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
        model: 'claude-3-5-sonnet',
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
      timeout?: number;
    } = {}
  ): Promise<void> {
    if (!this.ai) {
      throw new AIServiceError('AI service not initialized', 'AI_NOT_INITIALIZED');
    }

    const timeout = options.timeout || 30000; // 30 second default timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // Get relevant context if not provided
      const context = options.context || await contextManager.getRelevantContext(prompt);
      
      // Construct prompt with context
      const contextualPrompt = [
        ...context.map((ctx: string) => `Context: ${ctx}`),
        `Current request: ${prompt}`
      ].join('\n\n');

      const response = await this.ai.chat(contextualPrompt, { 
        stream: true,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
      });
      await withRetry(async () => {
        const response = await this.ai!.chat(contextualPrompt, {
          stream: true,
          temperature: options.temperature,
          max_tokens: options.maxTokens,
        });

        for await (const chunk of response) {
          onUpdate({
            content: chunk,
            isComplete: false,
            model: 'claude-3-5-sonnet',
            status: 'success'
          });
        }

        onUpdate({
          content: '',
          isComplete: true,
          model: 'claude-3-5-sonnet',
          status: 'success'
        });
      });
    } catch (error) {
      onUpdate({
        content: '',
        model: 'claude-3-5-sonnet',
        status: 'error',
        isComplete: true,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async analyzeSentiment(text: string): Promise<{ sentiment: string; confidence: number }> {
    if (!this.ai) {
      throw new AIServiceError('AI service not initialized', 'AI_NOT_INITIALIZED');
    }
    
    try {
      return await withRetry(async () => {
        const result = await this.ai!.analyze(text, 'sentiment');
        return result;
      });
    } catch (error) {
      console.error('Failed to analyze sentiment:', error);
      throw new AIServiceError(
        `Sentiment analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SENTIMENT_FAILED'
      );
    }
  }

  async extractKeyPhrases(text: string): Promise<string[]> {
    if (!this.ai) {
      throw new AIServiceError('AI service not initialized', 'AI_NOT_INITIALIZED');
    }
    
    try {
      return await withRetry(async () => {
        const result = await this.ai!.analyze(text, 'keywords');
        return Array.isArray(result) ? result : [];
      });
    } catch (error) {
      console.error('Failed to extract key phrases:', error);
      throw new AIServiceError(
        `Key phrase extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'KEYWORDS_FAILED'
      );
    }
  }

  async moderateContent(text: string): Promise<boolean> {
    if (!this.ai) {
      throw new AIServiceError('AI service not initialized', 'AI_NOT_INITIALIZED');
    }
    
    try {
      return await withRetry(async () => {
        const result = await this.ai!.moderate(text);
        return !result.flagged;
      });
    } catch (error) {
      console.error('Failed to moderate content:', error);
      throw new AIServiceError(
        `Content moderation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'MODERATION_FAILED'
      );
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