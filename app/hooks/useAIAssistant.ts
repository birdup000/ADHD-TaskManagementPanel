import { useState, useCallback } from 'react';
import { Task } from '../types/task';
import { initializeAGiXT, handleGenerateSubtasks, handleRunChain } from '../utils/agixt';

interface UseAIAssistantProps {
  backendUrl: string;
  authToken: string;
}

export const useAIAssistant = ({ backendUrl, authToken }: UseAIAssistantProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const generateTaskSuggestions = useCallback(async (context: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const agixt = await initializeAGiXT(backendUrl, authToken);
      if (!agixt) {
        throw new Error('Failed to initialize AGiXT');
      }

      const prompt = `Given the following context, suggest 3-5 tasks that would be relevant and helpful:
      Context: ${context}
      
      Format your response as a JSON array of task objects with the following properties:
      - title: A clear, concise task title
      - description: Detailed description of what needs to be done
      - priority: "low", "medium", or "high"
      - estimatedTime: Estimated time to complete in minutes`;

        const result = await agixt.runChain(
        'Task Suggestions',
        prompt,
        selectedAgent,
        { conversation_name: `task_suggestions_${Date.now()}` }
      );

      try {
        return JSON.parse(result);
      } catch {
        return [];
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate task suggestions');
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, [backendUrl, authToken, selectedAgent]);

  const optimizeTaskOrder = useCallback(async (tasks: Task[]) => {
    setIsProcessing(true);
    setError(null);
    try {
      const agixt = await initializeAGiXT(backendUrl, authToken);
      if (!agixt) {
        throw new Error('Failed to initialize AGiXT');
      }

      const prompt = `Given the following list of tasks, suggest the optimal order to complete them based on priority, dependencies, and efficiency:

      Tasks:
      ${tasks.map(task => `- ${task.title} (Priority: ${task.priority})`).join('\n')}

      Format your response as a JSON array of task IDs in the optimal order.`;

        const result = await agixt.runChain(
        'Task Optimization',
        prompt,
        selectedAgent,
        { conversation_name: `task_optimization_${Date.now()}` }
      );

      try {
        return JSON.parse(result);
      } catch {
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to optimize task order');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [backendUrl, authToken, selectedAgent]);

  const analyzeTaskProgress = useCallback(async (task: Task) => {
    setIsProcessing(true);
    setError(null);
    try {
      const agixt = await initializeAGiXT(backendUrl, authToken);
      if (!agixt) {
        throw new Error('Failed to initialize AGiXT');
      }

      const prompt = `Analyze the following task and provide insights on progress and potential blockers:

      Task Title: ${task.title}
      Description: ${task.description}
      Current Status: ${task.status}
      Progress: ${task.progress}%
      Subtasks Completed: ${task.subtasks?.filter(st => st.completed).length || 0}/${task.subtasks?.length || 0}

      Format your response as a JSON object with the following properties:
      - progressAnalysis: String describing the current progress
      - potentialBlockers: Array of potential blockers
      - recommendations: Array of recommendations to move forward
      - estimatedTimeToCompletion: Number of minutes estimated to complete`;

        const result = await agixt.runChain(
        'Task Analysis',
        prompt,
        selectedAgent,
        { conversation_name: `task_analysis_${Date.now()}` }
      );

      try {
        return JSON.parse(result);
      } catch {
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze task progress');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [backendUrl, authToken, selectedAgent]);

  const generateSubtasks = useCallback(async (task: Task) => {
    setIsProcessing(true);
    setError(null);
    try {
      const result = await handleGenerateSubtasks(task, selectedAgent, backendUrl, authToken);
      if (!result) {
        throw new Error('Failed to generate subtasks');
      }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate subtasks');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [backendUrl, authToken, selectedAgent]);

  return {
    isProcessing,
    error,
    selectedAgent,
    setSelectedAgent,
    generateTaskSuggestions,
    optimizeTaskOrder,
    analyzeTaskProgress,
    generateSubtasks,
  };
};
