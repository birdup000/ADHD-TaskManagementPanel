import { useState, useCallback } from 'react';
import { aiService } from '../lib/ai-service';

export function useAITextAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeSentiment = useCallback(async (text: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await aiService.initialize();
      return await aiService.analyzeSentiment(text);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze sentiment';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const extractKeyPhrases = useCallback(async (text: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await aiService.initialize();
      return await aiService.extractKeyPhrases(text);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to extract key phrases';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const moderateContent = useCallback(async (text: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await aiService.initialize();
      return await aiService.moderateContent(text);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to moderate content';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    analyzeSentiment,
    extractKeyPhrases,
    moderateContent,
    isLoading,
    error,
  };
}