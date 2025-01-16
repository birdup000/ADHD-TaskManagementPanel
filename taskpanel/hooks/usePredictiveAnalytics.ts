import { useState } from 'react';
import { Task } from '../components/TaskPanel';
import { SubTask } from '../components/TaskDetailsDrawer';

const BOTTLENECK_ANALYSIS_PROMPT = `
Analyze the following historical task data and current workload to identify potential bottlenecks and delays:

Historical Tasks:
{historicalTasks}

Current Tasks:
{currentTasks}

Consider the following factors:
1. Task completion patterns and delays
2. Resource utilization and constraints
3. Dependencies between tasks
4. Seasonal patterns and trends
5. Team capacity and workload distribution
6. Critical path analysis
7. Risk factors and common bottlenecks
8. Historical bottleneck patterns
9. Resource availability windows
10. Task complexity correlation with delays

Provide a detailed analysis in the following JSON format:
{
  "potentialBottlenecks": [
    {
      "type": "resource"|"dependency"|"capacity"|"scheduling",
      "description": string,
      "impact": "high"|"medium"|"low",
      "affectedTasks": string[],
      "predictedDelay": number,
      "mitigationSuggestions": string[]
    }
  ],
  "workloadForecasts": [
    {
      "timeframe": string,
      "predictedUtilization": number,
      "riskLevel": "high"|"medium"|"low",
      "bottleneckProbability": number,
      "recommendations": string[]
    }
  ],
  "resourceOptimizations": [
    {
      "resource": string,
      "currentUtilization": number,
      "predictedBottlenecks": string[],
      "optimizationStrategies": string[]
    }
  ]
}
`;

export interface BottleneckAnalysis {
  potentialBottlenecks: Array<{
    type: 'resource' | 'dependency' | 'capacity' | 'scheduling';
    description: string;
    impact: 'high' | 'medium' | 'low';
    affectedTasks: string[];
    predictedDelay: number;
    mitigationSuggestions: string[];
  }>;
  workloadForecasts: Array<{
    timeframe: string;
    predictedUtilization: number;
    riskLevel: 'high' | 'medium' | 'low';
    bottleneckProbability: number;
    recommendations: string[];
  }>;
  resourceOptimizations: Array<{
    resource: string;
    currentUtilization: number;
    predictedBottlenecks: string[];
    optimizationStrategies: string[];
  }>;
}

export const usePredictiveAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<BottleneckAnalysis | null>(null);

  const analyzeBottlenecks = async (
    historicalTasks: Task[],
    currentTasks: Task[],
  ): Promise<BottleneckAnalysis> => {
    setLoading(true);
    setError(null);

    try {

      const historicalTasksContext = formatTasksForAnalysis(historicalTasks);
      const currentTasksContext = formatTasksForAnalysis(currentTasks);

      const prompt = BOTTLENECK_ANALYSIS_PROMPT
        .replace('{historicalTasks}', historicalTasksContext)
        .replace('{currentTasks}', currentTasksContext);

      const response = `{"potentialBottlenecks": [], "workloadForecasts": [], "resourceOptimizations": []}`;
      const parsedAnalysis = JSON.parse(response) as BottleneckAnalysis;
      setAnalysis(parsedAnalysis);
      return parsedAnalysis;
    } catch (err) {
      const errorMessage = 'Failed to analyze bottlenecks. Please try again.';
      setError(errorMessage);
      console.error('Predictive Analytics Error:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatTasksForAnalysis = (tasks: Task[]): string => {
    return tasks
      .map(
        (task) => `
        Task ID: ${task.id}
        Title: ${task.title}
        Description: ${task.description}
        Priority: ${task.priority}
        Due Date: ${task.dueDate?.toISOString() || 'Not set'}
        Created Date: ${task.createdAt?.toISOString() || 'Not set'}
        // Completed Date: ${task.completedAt?.toISOString() || 'Not set'}
        Progress: ${calculateTaskProgress(task)}%
        // Dependencies: ${task.dependencies?.join(', ') || 'None'}
        // Resources: ${task.resources?.join(', ') || 'None'}
        Subtasks: ${formatSubtasks(task.subtasks)}
      `
      )
      .join('\n\n');
  };

  const calculateTaskProgress = (task: Task): number => {
    if (!task.subtasks || task.subtasks.length === 0) {
      return task.completed ? 100 : 0;
    }
    const completedSubtasks = task.subtasks.filter((st: SubTask) => st.completed).length;
    return Math.round((completedSubtasks / task.subtasks.length) * 100);
  };

  const formatSubtasks = (subtasks?: SubTask[]): string => {
    if (!subtasks || subtasks.length === 0) {
      return 'None';
    }
    return subtasks
      .map(
        (st) => `
      - ${st.title} (${st.completed ? 'Completed' : 'Pending'})
        Est. Time: ${st.estimatedTime} minutes
    `
      )
      .join('\n');
  };

  return {
    analyzeBottlenecks,
    loading,
    error,
    analysis,
  };
};