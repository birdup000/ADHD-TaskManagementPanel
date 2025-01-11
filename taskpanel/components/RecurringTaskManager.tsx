import { useState, useEffect } from 'react';
import { Task } from './TaskPanel';
import { getPuter } from '../lib/puter';

interface RecurringTaskPattern {
  taskId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  historicalDurations: number[]; // Duration in minutes
  adaptiveEstimate: number; // Estimated duration in minutes
  lastCompleted?: Date;
  nextDue?: Date;
}

export const useRecurringTaskManager = () => {
  const [recurringPatterns, setRecurringPatterns] = useState<RecurringTaskPattern[]>([]);
  const puter = getPuter();

  // Load recurring patterns from storage
  useEffect(() => {
    const loadPatterns = async () => {
      if (puter.kv) {
        const patternsString = await puter.kv.get("recurringPatterns");
        if (patternsString) {
          try {
            const patterns = JSON.parse(patternsString);
            setRecurringPatterns(patterns.map((p: any) => ({
              ...p,
              lastCompleted: p.lastCompleted ? new Date(p.lastCompleted) : undefined,
              nextDue: p.nextDue ? new Date(p.nextDue) : undefined
            })));
          } catch (error) {
            console.error("Error loading recurring patterns:", error);
          }
        }
      }
    };
    loadPatterns();
  }, []);

  // Update pattern with new completion time
  const updateTaskCompletion = async (taskId: string, durationMinutes: number) => {
    const updatedPatterns = recurringPatterns.map(pattern => {
      if (pattern.taskId === taskId) {
        const newHistorical = [...pattern.historicalDurations, durationMinutes].slice(-5); // Keep last 5 durations
        const avgDuration = newHistorical.reduce((a, b) => a + b, 0) / newHistorical.length;
        
        return {
          ...pattern,
          historicalDurations: newHistorical,
          adaptiveEstimate: avgDuration,
          lastCompleted: new Date(),
          nextDue: calculateNextDueDate(pattern.frequency, new Date())
        };
      }
      return pattern;
    });

    if (puter.kv) {
      await puter.kv.set("recurringPatterns", JSON.stringify(updatedPatterns));
      setRecurringPatterns(updatedPatterns);
    }
  };

  // Add new recurring task pattern
  const addRecurringPattern = async (taskId: string, frequency: 'daily' | 'weekly' | 'monthly', initialEstimate: number) => {
    const newPattern: RecurringTaskPattern = {
      taskId,
      frequency,
      historicalDurations: [],
      adaptiveEstimate: initialEstimate,
      nextDue: calculateNextDueDate(frequency, new Date())
    };

    const updatedPatterns = [...recurringPatterns, newPattern];
    if (puter.kv) {
      await puter.kv.set("recurringPatterns", JSON.stringify(updatedPatterns));
      setRecurringPatterns(updatedPatterns);
    }
  };

  // Helper function to calculate next due date based on frequency
  const calculateNextDueDate = (frequency: 'daily' | 'weekly' | 'monthly', fromDate: Date): Date => {
    const next = new Date(fromDate);
    switch (frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
    }
    return next;
  };

  // Get tasks that need to be recreated based on patterns
  const getTasksDueForRecreation = (tasks: Task[]): string[] => {
    const now = new Date();
    return recurringPatterns
      .filter(pattern => {
        const taskExists = tasks.some(task => task.id === pattern.taskId && !task.completed);
        return pattern.nextDue && pattern.nextDue <= now && !taskExists;
      })
      .map(pattern => pattern.taskId);
  };

  return {
    recurringPatterns,
    updateTaskCompletion,
    addRecurringPattern,
    getTasksDueForRecreation
  };
};

interface RecurringTaskManagerProps {
  task: Task;
  onAddRecurring: (frequency: 'daily' | 'weekly' | 'monthly') => void;
}

export function RecurringTaskManager({ task, onAddRecurring }: RecurringTaskManagerProps) {
  return (
    <div className="mt-4 p-4 bg-background/50 rounded-lg border border-border/20">
      <h4 className="text-sm font-medium mb-2">Make Recurring</h4>
      <div className="flex gap-2">
        <button
          onClick={() => onAddRecurring('daily')}
          className="px-3 py-1 text-xs rounded-md bg-accent/10 hover:bg-accent/20 transition-colors"
        >
          Daily
        </button>
        <button
          onClick={() => onAddRecurring('weekly')}
          className="px-3 py-1 text-xs rounded-md bg-accent/10 hover:bg-accent/20 transition-colors"
        >
          Weekly
        </button>
        <button
          onClick={() => onAddRecurring('monthly')}
          className="px-3 py-1 text-xs rounded-md bg-accent/10 hover:bg-accent/20 transition-colors"
        >
          Monthly
        </button>
      </div>
    </div>
  );
}