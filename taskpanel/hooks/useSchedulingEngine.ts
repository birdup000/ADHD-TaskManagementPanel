import { useEffect, useState } from 'react';
import { Task } from '../components/TaskPanel';

interface ScheduledBlock {
  taskId: string;
  startDate: Date;
  endDate: Date;
  estimatedDuration?: number;
  actualDuration?: number;
  productivityScore?: number;
}

interface ScheduleConflict {
  taskIds: string[];
  reason: string;
  suggestion: string;
}

interface UserWorkPatterns {
  preferredTimes: { [hour: number]: number }; // Hour -> productivity score
  taskDurations: { [taskId: string]: number }; // Average duration for similar tasks
  completionRates: { [hour: number]: number }; // Success rate by hour
  breakPatterns: { [hour: number]: boolean }; // Preferred break times
}

export const useSchedulingEngine = (tasks: Task[]) => {
  const [scheduledBlocks, setScheduledBlocks] = useState<ScheduledBlock[]>([]);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [workPatterns, setWorkPatterns] = useState<UserWorkPatterns>({
    preferredTimes: {},
    taskDurations: {},
    completionRates: {},
    breakPatterns: {}
  });

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

  const analyzeWorkPatterns = (tasks: Task[]): UserWorkPatterns => {
  // Calculate productivity scores based on completion time vs estimated time
  const calculateProductivityScore = (task: Task): number => {
    if (!task.completed || !task.completedAt || !task.startedAt) return 0;
    const actualDuration = (task.completedAt.getTime() - task.startedAt.getTime()) / (1000 * 60 * 60);
    const estimatedDuration = task.estimatedDuration || 2; // Default 2 hours if not specified
    return Math.min(estimatedDuration / actualDuration, 2); // Cap at 2x efficiency
  };
  const patterns: UserWorkPatterns = {
    preferredTimes: {},
    taskDurations: {},
    completionRates: {},
    breakPatterns: {}
  };

  // Analyze completed tasks to identify patterns
  const completedTasks = tasks.filter(t => t.completed);
  
  // Calculate preferred times based on successful completions
  completedTasks.forEach(task => {
    if (task.completedAt) {
      const hour = task.completedAt.getHours();
      const productivityScore = calculateProductivityScore(task);
      
      // Weight the preferred times by productivity score
      patterns.preferredTimes[hour] = (patterns.preferredTimes[hour] || 0) + productivityScore;
      patterns.completionRates[hour] = (patterns.completionRates[hour] || 0) + 1;
      
      // Also track completion success rate
      const successScore = task.completed && task.dueDate && task.completedAt <= task.dueDate ? 1 : 0;
      patterns.completionRates[hour] = 
        ((patterns.completionRates[hour] || 0) * (completedTasks.length - 1) + successScore) / 
        completedTasks.length;
    }
  });

  // Normalize scores
  const maxScore = Math.max(...Object.values(patterns.preferredTimes));
  Object.keys(patterns.preferredTimes).forEach(hour => {
    patterns.preferredTimes[parseInt(hour)] /= maxScore;
  });

  // Calculate average task durations
  tasks.forEach(task => {
    if (task.completed && task.completedAt && task.startedAt) {
      const duration = (task.completedAt.getTime() - task.startedAt.getTime()) / (1000 * 60 * 60);
      const taskType = task.category;
      patterns.taskDurations[taskType] = patterns.taskDurations[taskType] 
        ? (patterns.taskDurations[taskType] + duration) / 2 
        : duration;
    }
  });

  // Identify break patterns (gaps between tasks)
  completedTasks.forEach((task, index) => {
    if (index > 0 && task.completedAt && completedTasks[index - 1].completedAt) {
      const gap = (task.startedAt?.getTime() || 0) - completedTasks[index - 1].completedAt.getTime();
      if (gap > 15 * 60 * 1000) { // Break longer than 15 minutes
        const hour = new Date(completedTasks[index - 1].completedAt!).getHours();
        patterns.breakPatterns[hour] = true;
      }
    }
  });

  return patterns;
};

const optimizeSchedule = (blocks: ScheduledBlock[]): ScheduledBlock[] => {
  // Helper function to calculate scheduling score for a given hour
  const calculateHourScore = (hour: number, task: Task): number => {
    const preferredTimeScore = workPatterns.preferredTimes[hour] || 0;
    const completionRateScore = workPatterns.completionRates[hour] || 0;
    const isBreakTime = workPatterns.breakPatterns[hour] || false;
    
    // Penalize scheduling during break times
    const breakPenalty = isBreakTime ? 0.5 : 1;
    
    // Consider task priority in scoring
    const priorityMultiplier = 
      task.priority === 'high' ? 1.5 :
      task.priority === 'medium' ? 1.2 : 1;
    
    return (preferredTimeScore * 0.6 + completionRateScore * 0.4) * breakPenalty * priorityMultiplier;
  };
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

      // Calculate optimal time based on work patterns and task characteristics
      const startDate = new Date(block.startDate);
      
      // Find the most productive hour for this task type
      const productiveHours = Object.entries(workPatterns.preferredTimes)
        .sort(([,a], [,b]) => b - a)
        .map(([hour]) => parseInt(hour));
      
      // Calculate optimal hour based on multiple factors
      const hourScores = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        score: calculateHourScore(hour, task)
      }));
      
      // Filter out hours that already have tasks scheduled
      const availableHours = hourScores
        .filter(({ hour }) => !blocks.some(b => new Date(b.startDate).getHours() === hour))
        .sort((a, b) => b.score - a.score);
      
      const optimalHour = availableHours.length > 0 ? availableHours[0].hour : 9;
      
      startDate.setHours(optimalHour, 0, 0, 0);

      // Use historical duration data to estimate task length
      const estimatedDuration = workPatterns.taskDurations[task.category] || 2; // Default 2 hours
      const endDate = new Date(startDate.getTime() + estimatedDuration * 60 * 60 * 1000);
      
      // Add buffer time based on historical accuracy
      const completionRate = workPatterns.completionRates[optimalHour] || 0.5;
      const bufferTime = (1 - completionRate) * estimatedDuration * 0.5; // Up to 50% buffer for low completion rates
      endDate.setHours(endDate.getHours() + bufferTime);

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
      const adjustedEndDate = new Date(startDate.getTime() + bufferedDuration);

      // Add 15-minute break after the task
      adjustedEndDate.setMinutes(adjustedEndDate.getMinutes() + 15);

      return {
        ...block,
        startDate,
        endDate
      };
    });

    return distributedBlocks;
  };

  useEffect(() => {
    // Analyze work patterns and reschedule tasks
    const reschedule = async () => {
      // Update work patterns based on task history
      const newPatterns = analyzeWorkPatterns(tasks);
      setWorkPatterns(newPatterns);
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