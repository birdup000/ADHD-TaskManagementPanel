import { Task, SubTask } from './TaskPanel';

export const calculateTaskProgress = (task: Task): number => {
  if (!task.subtasks || task.subtasks.length === 0) return 0;
  return Math.round(
    (task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100
  );
};

export const getTaskStatus = (task: Task): 'overdue' | 'at-risk' | 'on-track' | 'completed' => {
  if (task.completed) return 'completed';
  
  const progress = calculateTaskProgress(task);
  const now = new Date();
  
  if (task.dueDate && task.dueDate < now) return 'overdue';
  
  if (task.dueDate) {
    const totalDays = Math.ceil((task.dueDate.getTime() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((now.getTime() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const expectedProgress = (daysElapsed / totalDays) * 100;
    
    if (progress < expectedProgress - 20) return 'at-risk';
  }
  
  return 'on-track';
};

export const getStatusColor = (status: ReturnType<typeof getTaskStatus>): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-500 dark:bg-green-600';
    case 'overdue':
      return 'bg-red-500 dark:bg-red-600';
    case 'at-risk':
      return 'bg-yellow-500 dark:bg-yellow-600';
    case 'on-track':
      return 'bg-blue-500 dark:bg-blue-600';
    default:
      return 'bg-gray-500 dark:bg-gray-600';
  }
};

export const estimateSubtaskTime = (subtask: SubTask): number => {
  return subtask.estimatedTime || 30; // Default to 30 minutes if not specified
};

export const getTotalEstimatedTime = (task: Task): number => {
  if (!task.subtasks) return 0;
  return task.subtasks.reduce((total, subtask) => total + estimateSubtaskTime(subtask), 0);
};