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
        throw new Error(response.error ? response.error : 'Unknown error from AI service');
      }
      if (typeof response.content === 'string') {
        throw new Error('Unexpected string response from AI service');
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
      const aiAnalysisString = typeof aiAnalysis === 'string' ? aiAnalysis : JSON.stringify(aiAnalysis);
      const lines = aiAnalysisString.split('\n');
      const prioritizedTasks: PrioritizedTask[] = [];

      for (let i = 0; i < originalTasks.length; i++) {
        const task = originalTasks[i];
        const taskLines = lines.slice(i * 7, (i + 1) * 7); // Assuming 7 lines per task

        const scoreMatch = taskLines.find(line => line.startsWith('1. Priority score:'))?.match(/(\d+)/);
        const categoryMatch = taskLines.find(line => line.startsWith('2. Category:'))?.match(/(urgent|important|normal|low)/);
        const urgencyMatch = taskLines.find(line => line.includes('- Urgency:'))?.match(/(\d+)/);
        const importanceMatch = taskLines.find(line => line.includes('- Importance:'))?.match(/(\d+)/);
        const complexityMatch = taskLines.find(line => line.includes('- Complexity:'))?.match(/(\d+)/);
        const dependenciesMatch = taskLines.find(line => line.includes('- Dependencies:'))?.match(/(\d+)/);
        const reasoningMatch = taskLines.find(line => line.startsWith('4. Brief reasoning:'))?.split(':').slice(1).join(':').trim();
        const deadlineMatch = taskLines.find(line => line.startsWith('5. Suggested deadline:'))?.split(':').slice(1).join(':').trim();
        const dependencyIdsMatch = taskLines.find(line => line.startsWith('6. Dependencies:'))?.split(':').slice(1).join(':').trim().split(',').map(id => id.trim());

        const priority: TaskPriority = {
          score: scoreMatch ? parseInt(scoreMatch[1], 10) : 50,
          category: (categoryMatch ? categoryMatch[1] : 'normal') as 'urgent' | 'important' | 'normal' | 'low',
          factors: {
            urgency: urgencyMatch ? parseInt(urgencyMatch[1], 10) : 50,
            importance: importanceMatch ? parseInt(importanceMatch[1], 10) : 50,
            complexity: complexityMatch ? parseInt(complexityMatch[1], 10) : 50,
            dependencies: dependenciesMatch ? parseInt(dependenciesMatch[1], 10) : 50,
          },
          reasoning: reasoningMatch ? [reasoningMatch] : ['No reasoning provided'],
        };

        const prioritizedTask: PrioritizedTask = {
          id: task.id,
          title: task.title,
          priority,
          suggestedDeadline: deadlineMatch,
          dependencyIds: dependencyIdsMatch,
        };
        prioritizedTasks.push(prioritizedTask);
      }
      return prioritizedTasks;
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