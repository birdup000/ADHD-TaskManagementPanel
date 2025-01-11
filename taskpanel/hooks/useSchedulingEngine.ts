import { useEffect, useState } from 'react';
import { Task } from '../components/TaskPanel';

interface ScheduledBlock {
  taskId: string;
  startDate: Date;
  endDate: Date;
}

interface ScheduleConflict {
  taskIds: string[];
  reason: string;
  suggestion: string;
}

export const useSchedulingEngine = (tasks: Task[]) => {
  const [scheduledBlocks, setScheduledBlocks] = useState<ScheduledBlock[]>([]);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);

  const detectConflicts = (blocks: ScheduledBlock[]): ScheduleConflict[] => {
    const newConflicts: ScheduleConflict[] = [];
    
    // Check for overlapping time blocks
    for (let i = 0; i < blocks.length; i++) {
      for (let j = i + 1; j < blocks.length; j++) {
        const block1 = blocks[i];
        const block2 = blocks[j];
        
        if (
          (block1.startDate <= block2.endDate && block1.endDate >= block2.startDate) ||
          (block2.startDate <= block1.endDate && block2.endDate >= block1.startDate)
        ) {
          newConflicts.push({
            taskIds: [block1.taskId, block2.taskId],
            reason: "Time block overlap detected",
            suggestion: "Consider rescheduling one of these tasks to a different time slot"
          });
        }
      }
    }

    // Check for overloaded days (more than 8 hours of work)
    const workloadByDay = new Map<string, number>();
    blocks.forEach(block => {
      const dateKey = block.startDate.toISOString().split('T')[0];
      const hours = (block.endDate.getTime() - block.startDate.getTime()) / (1000 * 60 * 60);
      
      // Calculate cognitive load factor based on task characteristics
      const task = tasks.find(t => t.id === block.taskId);
      const cognitiveLoadFactor = task?.priority === 'high' ? 1.5 : 
                                 task?.priority === 'medium' ? 1.2 : 1;
      
      const adjustedHours = hours * cognitiveLoadFactor;
      workloadByDay.set(dateKey, (workloadByDay.get(dateKey) || 0) + adjustedHours);
    });

    workloadByDay.forEach((hours, date) => {
      if (hours > 8) {
        const overloadedTasks = blocks
          .filter(block => block.startDate.toISOString().split('T')[0] === date)
          .map(block => block.taskId);
        newConflicts.push({
          taskIds: overloadedTasks,
          reason: `Workload exceeds 8 hours on ${date}`,
          suggestion: "Consider spreading these tasks across multiple days"
        });
      }
    });

    return newConflicts;
  };

  const optimizeSchedule = (blocks: ScheduledBlock[]): ScheduledBlock[] => {
    // First sort blocks by priority and due date
    blocks.sort((a, b) => {
      const taskA = tasks.find(t => t.id === a.taskId);
      const taskB = tasks.find(t => t.id === b.taskId);
      
      if (!taskA || !taskB) return 0;
      
      // First sort by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[taskA.priority] - priorityOrder[taskB.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by due date if priorities are equal
      if (taskA.dueDate && taskB.dueDate) {
        return taskA.dueDate.getTime() - taskB.dueDate.getTime();
      }
      return 0;
    });

    // Distribute tasks across working hours (9 AM - 5 PM)
    const distributedBlocks = blocks.map((block, index) => {
      const task = tasks.find(t => t.id === block.taskId);
      if (!task) return block;

      // Calculate optimal time based on task characteristics
      const startDate = new Date(block.startDate);
      startDate.setHours(9, 0, 0, 0); // Start at 9 AM

      // Add offset based on task priority and complexity
      if (task.priority === 'high') {
        // Schedule high priority tasks earlier in the day
        startDate.setHours(startDate.getHours() + index);
      } else if (task.priority === 'medium') {
        // Schedule medium priority tasks in mid-day
        startDate.setHours(startDate.getHours() + index + 2);
      } else {
        // Schedule low priority tasks later
        startDate.setHours(startDate.getHours() + index + 4);
      }

      // Ensure we don't schedule beyond working hours
      if (startDate.getHours() >= 17) { // Past 5 PM
        startDate.setDate(startDate.getDate() + 1); // Move to next day
        startDate.setHours(9, 0, 0, 0); // Reset to 9 AM
      }

      // Add buffer time (20% of the original duration)
      const duration = block.endDate.getTime() - block.startDate.getTime();
      const bufferedDuration = duration * 1.2;
      const endDate = new Date(startDate.getTime() + bufferedDuration);

      // Add 15-minute break after the task
      endDate.setMinutes(endDate.getMinutes() + 15);

      return {
        ...block,
        startDate,
        endDate
      };
    });

    return distributedBlocks;
  };

  useEffect(() => {
    // Continuous rescheduling when tasks change
    const reschedule = async () => {
      let newBlocks = [...scheduledBlocks];
      
      // Remove blocks for deleted tasks
      newBlocks = newBlocks.filter(block =>
        tasks.some(task => task.id === block.taskId)
      );
      
      // Add blocks for new tasks
      const unscheduledTasks = tasks.filter(task =>
        !newBlocks.some(block => block.taskId === task.id)
      );
      
      unscheduledTasks.forEach(task => {
        if (task.dueDate) {
          const endDate = new Date(task.dueDate);
          const startDate = new Date(endDate);
          startDate.setHours(startDate.getHours() - 2); // Default 2-hour block
          
          newBlocks.push({
            taskId: String(task.id),
            startDate,
            endDate
          });
        }
      });
      
      // Optimize the schedule
      newBlocks = optimizeSchedule(newBlocks);
      
      // Check for conflicts
      const newConflicts = detectConflicts(newBlocks);
      
      // Update state
      setScheduledBlocks(newBlocks);
      setConflicts(newConflicts);
    };

    reschedule();
  }, [tasks]);

  return {
    scheduledBlocks,
    conflicts,
    setScheduledBlocks,
  };
};