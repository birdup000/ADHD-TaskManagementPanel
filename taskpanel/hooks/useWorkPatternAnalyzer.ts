import { Task } from '../components/TaskPanel';
import { ScheduledBlock, UserWorkPatterns } from './useSchedulingEngine';

export function useWorkPatternAnalyzer() {
  // Analyze completed tasks to learn work patterns
  const analyzeWorkPatterns = (
    completedTasks: Task[],
    scheduledBlocks: ScheduledBlock[]
  ): UserWorkPatterns => {
    const preferredTimes: { [hour: number]: number } = {};
    const taskDurations: { [taskId: string]: number } = {};
    const completionRates: { [hour: number]: number } = {};
    const breakPatterns: { [hour: number]: boolean } = {};
    
    // Initialize hourly tracking
    for (let hour = 0; hour < 24; hour++) {
      preferredTimes[hour] = 0;
      completionRates[hour] = 0;
      breakPatterns[hour] = false;
    }

    // Analyze scheduled blocks to learn patterns
    scheduledBlocks.forEach((block) => {
      const startHour = block.startDate.getHours();
      const endHour = block.endDate.getHours();
      const duration = (block.endDate.getTime() - block.startDate.getTime()) / (1000 * 60 * 60);

      // Track task durations
      if (block.actualDuration) {
        taskDurations[block.taskId] = block.actualDuration;
      }

      // Track productivity by hour
      if (block.productivityScore) {
        for (let hour = startHour; hour <= endHour; hour++) {
          preferredTimes[hour] = (preferredTimes[hour] + block.productivityScore) / 2;
        }
      }

      // Track completion success rates
      const task = completedTasks.find(t => t.id === block.taskId);
      if (task) {
        const success = task.completed;
        for (let hour = startHour; hour <= endHour; hour++) {
          completionRates[hour] = ((completionRates[hour] || 0) + (success ? 1 : 0)) / 2;
        }
      }
    });

    // Identify break patterns (gaps between scheduled blocks)
    for (let i = 0; i < scheduledBlocks.length - 1; i++) {
      const currentBlock = scheduledBlocks[i];
      const nextBlock = scheduledBlocks[i + 1];
      const breakStart = currentBlock.endDate.getHours();
      const breakEnd = nextBlock.startDate.getHours();

      // If there's a consistent gap between tasks, mark as break time
      if (breakEnd - breakStart > 0.5) {
        breakPatterns[breakStart] = true;
      }
    }

    return {
      preferredTimes,
      taskDurations,
      completionRates,
      breakPatterns,
    };
  };

  const suggestTimeSlot = (
    task: Task,
    workPatterns: UserWorkPatterns,
    existingBlocks: ScheduledBlock[]
  ): { startDate: Date; endDate: Date } | null => {
    // Get estimated duration from historical data or default to 1 hour
    const estimatedDuration = workPatterns.taskDurations[task.id] || 1;
    
    // Find best time slot based on patterns
    const bestHours = Object.entries(workPatterns.preferredTimes)
      .sort(([, a], [, b]) => b - a)
      .map(([hour]) => parseInt(hour));

    const now = new Date();
    const maxDays = 7; // Look up to 7 days ahead

    for (let day = 0; day < maxDays; day++) {
      const currentDate = new Date(now);
      currentDate.setDate(currentDate.getDate() + day);

      for (const hour of bestHours) {
        // Skip break times
        if (workPatterns.breakPatterns[hour]) continue;

        const startDate = new Date(currentDate.setHours(hour, 0, 0, 0));
        const endDate = new Date(startDate.getTime() + estimatedDuration * 60 * 60 * 1000);

        // Check if slot conflicts with existing blocks
        const hasConflict = existingBlocks.some(block => 
          (startDate >= block.startDate && startDate < block.endDate) ||
          (endDate > block.startDate && endDate <= block.endDate)
        );

        if (!hasConflict) {
          return { startDate, endDate };
        }
      }
    }

    return null;
  };

  return {
    analyzeWorkPatterns,
    suggestTimeSlot,
  };
}