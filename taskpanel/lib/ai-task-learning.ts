import { aiService } from './ai-service';
import { contextManager } from './ai-context-manager';

interface TaskCompletion {
  taskId: string;
  title: string;
  description?: string;
  estimatedTime: string;
  actualTime: string;
  complexity: number;
  tags: string[];
  completedAt: string;
}

interface TaskPrediction {
  estimatedTime: string;
  confidence: number;
  suggestedApproach: string[];
  potentialChallenges: string[];
}

export class AITaskLearning {
  private static readonly MIN_SAMPLES = 5;
  private completionHistory: TaskCompletion[] = [];

  addTaskCompletion(completion: TaskCompletion) {
    this.completionHistory.push(completion);
    // Add to context for future reference
    contextManager.addEntry(
      JSON.stringify(completion),
      'task'
    );
  }

  async predictTaskMetrics(
    taskDescription: string,
    tags: string[] = []
  ): Promise<TaskPrediction> {
    if (this.completionHistory.length < AITaskLearning.MIN_SAMPLES) {
      return this.getDefaultPrediction();
    }

    try {
      await aiService.initialize();
      const prompt = `Based on historical task completions and the new task, predict metrics:
      
      Historical Data:
      ${JSON.stringify(this.completionHistory.slice(-10))}
      
      New Task:
      Description: ${taskDescription}
      Tags: ${tags.join(', ')}
      
      Provide:
      1. Estimated completion time
      2. Prediction confidence (0-100)
      3. Suggested approach
      4. Potential challenges`;

      const response = await aiService.analyzeTask(prompt);
      return this.parsePrediction(response.content);
    } catch (error) {
      console.error('Failed to predict task metrics:', error);
      return this.getDefaultPrediction();
    }
  }

  async analyzePerformanceTrends(): Promise<{
    trends: Record<string, any>;
    insights: string[];
    recommendations: string[];
  }> {
    try {
      await aiService.initialize();
      const prompt = `Analyze task completion history and identify performance trends:
      
      Data:
      ${JSON.stringify(this.completionHistory)}
      
      Provide:
      1. Key performance trends
      2. Actionable insights
      3. Recommendations for improvement`;

      const response = await aiService.analyzeTask(prompt);
      return {
        trends: {},  // Implement proper parsing
        insights: [],
        recommendations: []
      };
    } catch (error) {
      console.error('Failed to analyze performance trends:', error);
      return {
        trends: {},
        insights: ['Not enough data for analysis'],
        recommendations: ['Continue tracking task completions']
      };
    }
  }

  private parsePrediction(content: any): TaskPrediction {
    // Implement robust parsing logic here
    return {
      estimatedTime: '1 hour',
      confidence: 70,
      suggestedApproach: ['Break down task', 'Start with basics'],
      potentialChallenges: ['Time constraints']
    };
  }

  private getDefaultPrediction(): TaskPrediction {
    return {
      estimatedTime: 'unknown',
      confidence: 0,
      suggestedApproach: ['Break down task', 'Track time spent'],
      potentialChallenges: ['Insufficient historical data']
    };
  }
}

export const aiTaskLearning = new AITaskLearning();