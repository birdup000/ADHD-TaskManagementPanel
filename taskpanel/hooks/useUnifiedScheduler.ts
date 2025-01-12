import { useState, useCallback, useEffect } from 'react';
import { Task } from '../components/TaskPanel';
import { useAITaskScheduler } from '../components/AITaskScheduler';
import { useAutoScheduler } from './useAutoScheduler';
import { useAIWorkPatterns } from './useAIWorkPatterns';
import { ScheduledBlock, ScheduleConflict, UserWorkPatterns } from './useSchedulingEngine';
import { aiTaskPrioritizer } from '../lib/ai-task-prioritizer';

interface UnifiedScheduleResult {
  schedule: Array<{
    taskId: string;
    startDate: Date;
    endDate: Date;
    confidence: number;
    source: 'ai' | 'auto' | 'hybrid';
    rationale?: string;
  }>;
  conflicts: ScheduleConflict[];
  recommendations: string[];
}

export function useUnifiedScheduler(tasks: Task[]) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unifiedSchedule, setUnifiedSchedule] = useState<UnifiedScheduleResult | null>(null);

  const { generateSchedule: generateAISchedule } = useAITaskScheduler();
  const autoScheduler = useAutoScheduler(tasks);
  const { workPatterns } = useAIWorkPatterns();

  const generateUnifiedSchedule = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Prioritize tasks first
      const prioritizedTasks = await aiTaskPrioritizer.prioritizeTasks(tasks);
      
      // Get AI-generated schedule with prioritized tasks
      const aiScheduleResult = await generateAISchedule(
        prioritizedTasks.map(pt => ({
          ...tasks.find(t => t.id === pt.taskId)!,
          priority: pt.priority,
          urgency: pt.urgency,
          importance: pt.importance
        }))
      );
      
      // Get auto-scheduler suggestions
      const autoScheduleResult = await autoScheduler.generateSchedule();

      // Merge and reconcile both schedules
      const mergedSchedule = mergeSchedules(aiScheduleResult, autoScheduleResult);
      
      // Resolve conflicts and optimize
      const optimizedSchedule = resolveConflicts(mergedSchedule);

      setUnifiedSchedule(optimizedSchedule);
      return optimizedSchedule;
    } catch (err) {
      setError('Failed to generate unified schedule');
      console.error('Unified Scheduler Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tasks, generateAISchedule, autoScheduler]);

  // Auto-update schedule when tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      generateUnifiedSchedule().catch(console.error);
    }
  }, [tasks, generateUnifiedSchedule]);

  const mergeSchedules = (aiSchedule: any, autoSchedule: any): UnifiedScheduleResult => {
    // Apply work pattern preferences to confidence scores
    const timePreferences = workPatterns?.timePreferences || {};
    
    // Combine schedules from both sources
    const mergedScheduleItems = [
      ...aiSchedule.schedule.map((item: any) => {
        const startHour = new Date(item.suggestedStartDate).getHours();
        const preferenceBonus = timePreferences[startHour] || 0;
        
        return {
          ...item,
          startDate: new Date(item.suggestedStartDate),
          endDate: new Date(item.suggestedEndDate),
          confidence: 0.8 + preferenceBonus, // Adjust confidence based on work patterns
          source: 'ai' as const
        };
      }),
      ...autoSchedule.schedule.map((item: any) => ({
        ...item,
        confidence: 0.6,
        source: 'auto' as const
      }))
    ];

    // Merge overlapping time slots and reconcile differences
    const consolidatedSchedule = mergedScheduleItems.reduce((acc: any[], curr: any) => {
      const existing = acc.find(item => item.taskId === curr.taskId);
      if (existing) {
        // Combine scheduling data using confidence scores
        const totalConfidence = existing.confidence + curr.confidence;
        const weight1 = existing.confidence / totalConfidence;
        const weight2 = curr.confidence / totalConfidence;

        return acc.map(item => 
          item.taskId === curr.taskId
            ? {
                ...item,
                startDate: weight1 > weight2 ? existing.startDate : curr.startDate,
                endDate: weight1 > weight2 ? existing.endDate : curr.endDate,
                confidence: Math.max(existing.confidence, curr.confidence),
                source: 'hybrid' as const,
                rationale: `Combined from ${existing.source} and ${curr.source} sources`
              }
            : item
        );
      }
      return [...acc, curr];
    }, []);

    return {
      schedule: consolidatedSchedule,
      conflicts: [...aiSchedule.conflicts, ...autoSchedule.conflicts],
      recommendations: [...aiSchedule.recommendations, ...autoSchedule.recommendations]
    };
  };

  const resolveConflicts = (schedule: UnifiedScheduleResult): UnifiedScheduleResult => {
    // Identify and resolve time conflicts
    const resolvedSchedule = [...schedule.schedule];
    const conflicts: ScheduleConflict[] = [];

    // Sort tasks by priority and confidence
    resolvedSchedule.sort((a, b) => {
      const taskA = tasks.find(t => t.id === a.taskId);
      const taskB = tasks.find(t => t.id === b.taskId);
      const priorityA = taskA?.priority || 0;
      const priorityB = taskB?.priority || 0;
      
      // Consider both priority and confidence
      return (priorityB + b.confidence) - (priorityA + a.confidence);
    });

    for (let i = 0; i < resolvedSchedule.length; i++) {
      for (let j = i + 1; j < resolvedSchedule.length; j++) {
        const task1 = resolvedSchedule[i];
        const task2 = resolvedSchedule[j];

        if (isTimeConflict(task1, task2)) {
          // Add buffer time and adjust schedule
          resolveTimeConflict(task1, task2, resolvedSchedule);
          conflicts.push({
            taskIds: [task1.taskId, task2.taskId],
            type: 'time_overlap',
            message: 'Tasks were automatically adjusted to resolve time conflict'
          });
        }
      }
    }

    return {
      ...schedule,
      schedule: resolvedSchedule,
      conflicts: [...schedule.conflicts, ...conflicts]
    };
  };

  const isTimeConflict = (task1: any, task2: any): boolean => {
    return (
      (task1.startDate <= task2.endDate && task1.endDate >= task2.startDate) ||
      (task2.startDate <= task1.endDate && task2.endDate >= task1.startDate)
    );
  };

  const resolveTimeConflict = (task1: any, task2: any, schedule: any[]): void => {
    // Implement conflict resolution logic
    // This is a simple implementation - could be made more sophisticated
    const buffer = 30 * 60 * 1000; // 30 minutes in milliseconds
    
    if (task1.confidence >= task2.confidence) {
      // Adjust task2 to start after task1
      const newStartDate = new Date(task1.endDate.getTime() + buffer);
      const duration = task2.endDate.getTime() - task2.startDate.getTime();
      const newEndDate = new Date(newStartDate.getTime() + duration);
      
      const taskIndex = schedule.findIndex(t => t.taskId === task2.taskId);
      if (taskIndex !== -1) {
        schedule[taskIndex] = {
          ...task2,
          startDate: newStartDate,
          endDate: newEndDate
        };
      }
    } else {
      // Adjust task1 to start after task2
      const newStartDate = new Date(task2.endDate.getTime() + buffer);
      const duration = task1.endDate.getTime() - task1.startDate.getTime();
      const newEndDate = new Date(newStartDate.getTime() + duration);
      
      const taskIndex = schedule.findIndex(t => t.taskId === task1.taskId);
      if (taskIndex !== -1) {
        schedule[taskIndex] = {
          ...task1,
          startDate: newStartDate,
          endDate: newEndDate
        };
      }
    }
  };

  return {
    generateUnifiedSchedule,
    unifiedSchedule,
    loading,
    error
  };
}