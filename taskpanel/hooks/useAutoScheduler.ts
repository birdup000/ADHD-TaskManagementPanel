import { useState, useEffect } from 'react';
import { Task } from '../components/TaskPanel';
import { useSchedulingEngine } from './useSchedulingEngine';

export function useAutoScheduler(tasks: Task[]) {
  const { autoScheduleTask, scheduledBlocks, workPatterns } = useSchedulingEngine(tasks);
  const [isScheduling, setIsScheduling] = useState(false);
  
  // Auto-schedule new or unscheduled tasks
  useEffect(() => {
    const scheduleUnscheduledTasks = async () => {
      if (isScheduling) return;
      
      const unscheduledTasks = tasks.filter(task => 
        !scheduledBlocks.some(block => block.taskId === task.id) &&
        !task.completed
      );
      
      if (unscheduledTasks.length > 0) {
        setIsScheduling(true);
        
        for (const task of unscheduledTasks) {
          await autoScheduleTask(task);
        }
        
        setIsScheduling(false);
      }
    };
    
    scheduleUnscheduledTasks();
  }, [tasks, scheduledBlocks, workPatterns]);
  
  return {
    isScheduling,
    scheduledBlocks
  };
}