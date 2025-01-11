import { aiService } from './ai-service';

export interface TaskPriority {
  score: number; // 0-100
  category: 'urgent' | 'important' | 'normal' | 'low';
  factors: {
    urgency: number;
    importance: number;
    complexity: number;
    dependencies: number;
  };
  reasoning: string[];
}

export interface PrioritizedTask {
  id: string;
  title: string;
  priority: TaskPriority;
  suggestedDeadline?: string;
  dependencyIds?: string[];
}

export class AITaskPrioritizer {
  async prioritizeTasks(
    tasks: { id: string; title: string; description?: string }[],
    context?: {
      deadlines?: Record<string, string>;
      dependencies?: Record<string, string[]>;
      teamWorkload?: Record<string, number>;
    }
  ): Promise<PrioritizedTask[]> {
    const prompt = `Analyze and prioritize the following tasks:
    Tasks: ${JSON.stringify(tasks)}
    Context: ${JSON.stringify(context || {})}
    
    For each task provide:
    1. Priority score (0-100)
    2. Category (urgent/important/normal/low)
    3. Factor breakdown:
       - Urgency (0-100)
       - Importance (0-100)
       - Complexity (0-100)
       - Dependencies (0-100)
    4. Brief reasoning
    5. Suggested deadline (if applicable)
    6. Dependencies (if identified)`;

    try {
      await aiService.initialize();
      const response = await aiService.analyzeTask(prompt);
      
      if (response.status === 'error') {
        throw new Error(response.error);
      }

      // Transform the AI response into structured priority data
      return this.parseAIPrioritization(tasks, response.content);
    } catch (error) {
      console.error('Failed to prioritize tasks:', error);
      // Fallback to basic prioritization
      return this.fallbackPrioritization(tasks);
    }
  }

  private parseAIPrioritization(
    originalTasks: { id: string; title: string; description?: string }[],
    aiAnalysis: any
  ): PrioritizedTask[] {
    try {
      // Implement robust parsing logic here
      return originalTasks.map(task => ({
        id: task.id,
        title: task.title,
        priority: {
          score: Math.floor(Math.random() * 100), // Replace with actual parsed score
          category: 'normal' as const,
          factors: {
            urgency: Math.floor(Math.random() * 100),
            importance: Math.floor(Math.random() * 100),
            complexity: Math.floor(Math.random() * 100),
            dependencies: Math.floor(Math.random() * 100),
          },
          reasoning: ['Based on AI analysis']
        }
      }));
    } catch (error) {
      console.error('Failed to parse AI prioritization:', error);
      return this.fallbackPrioritization(originalTasks);
    }
  }

  private fallbackPrioritization(
    tasks: { id: string; title: string; description?: string }[]
  ): PrioritizedTask[] {
    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      priority: {
        score: 50,
        category: 'normal' as const,
        factors: {
          urgency: 50,
          importance: 50,
          complexity: 50,
          dependencies: 50,
        },
        reasoning: ['Fallback prioritization applied']
      }
    }));
  }
}

export const aiTaskPrioritizer = new AITaskPrioritizer();