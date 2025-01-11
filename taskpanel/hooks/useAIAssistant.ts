import { useState, useCallback } from 'react';
import { aiService, type AIResponse, type AITaskAnalysis, type AIStreamResponse } from '../lib/ai-service';

export function useAIAssistant() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeTask = useCallback(async (taskDescription: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await aiService.initialize();
      const analysis = await aiService.analyzeTask(taskDescription);
      
      if (analysis.status === 'error') {
        throw new Error(analysis.error);
      }
      
      return analysis.content;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze task';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAIResponse = useCallback(async (
    prompt: string,
    onStreamUpdate?: (response: AIStreamResponse) => void
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      await aiService.initialize();
      
      if (onStreamUpdate) {
        await aiService.streamChat(prompt, onStreamUpdate);
      } else {
        // For non-streaming responses, we can use the task analysis endpoint
        // with a modified prompt that requests a direct response
        const response = await aiService.analyzeTask(prompt);
        if (response.status === 'error') {
          throw new Error(response.error);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get AI response';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    analyzeTask,
    getAIResponse,
    isLoading,
    error
  };
}