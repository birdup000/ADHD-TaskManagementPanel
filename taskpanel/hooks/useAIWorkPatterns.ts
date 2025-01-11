import { useState, useCallback } from 'react';
import { aiService } from '../lib/ai-service';

interface WorkPatternAnalysis {
  productiveHours: string[];
  preferredTaskTypes: string[];
  completionPatterns: {
    averageCompletionTime: string;
    preferredTimeBlocks: string[];
  };
  recommendations: string[];
}

export function useAIWorkPatterns() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeWorkPatterns = useCallback(async (taskHistory: any[]) => {
    setIsLoading(true);
    setError(null);

    try {
      await aiService.initialize();
      const prompt = `Analyze the following task completion history and provide insights:
      ${JSON.stringify(taskHistory)}
      
      Please provide:
      1. Most productive hours
      2. Preferred task types
      3. Task completion patterns
      4. Optimization recommendations`;

      const response = await aiService.analyzeTask(prompt);
      
      if (response.status === 'error') {
        throw new Error(response.error);
      }

      return response.content;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze work patterns';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getWorkloadSuggestions = useCallback(async (
    currentTasks: any[],
    workPatterns: WorkPatternAnalysis
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      await aiService.initialize();
      const prompt = `Based on work patterns and current tasks, suggest optimal workload distribution:
      Current Tasks: ${JSON.stringify(currentTasks)}
      Work Patterns: ${JSON.stringify(workPatterns)}
      
      Provide scheduling and prioritization recommendations.`;

      const response = await aiService.analyzeTask(prompt);
      
      if (response.status === 'error') {
        throw new Error(response.error);
      }

      return response.content;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get workload suggestions';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    analyzeWorkPatterns,
    getWorkloadSuggestions,
    isLoading,
    error,
  };
}