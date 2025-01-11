import { useState, useCallback } from 'react';
import { aiTaskLearning } from '../lib/ai-task-learning';
import type { TaskCompletion, TaskPrediction } from '../lib/ai-task-learning';

export function useAITaskAnalytics() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predictTaskMetrics = useCallback(async (
    taskDescription: string,
    tags: string[] = []
  ): Promise<TaskPrediction> => {
    setIsLoading(true);
    setError(null);

    try {
      return await aiTaskLearning.predictTaskMetrics(taskDescription, tags);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to predict task metrics';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const recordTaskCompletion = useCallback((completion: TaskCompletion) => {
    try {
      aiTaskLearning.addTaskCompletion(completion);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to record task completion';
      console.error(message);
    }
  }, []);

  const getPerformanceTrends = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      return await aiTaskLearning.analyzePerformanceTrends();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze performance trends';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    predictTaskMetrics,
    recordTaskCompletion,
    getPerformanceTrends,
    isLoading,
    error
  };
}