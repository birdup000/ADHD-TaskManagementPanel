export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'completed';
  dueDate?: string;
  startDate?: string;
  tags?: string[];
  effort?: string;
  progress?: number;
  category?: string;
  subTasks?: SubTask[];
  assigneeId?: string | null; // Added for task assignment

  // Fields for recurring tasks
  isRecurring?: boolean;
  recurrenceRule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval?: number; // e.g., every 2 weeks if frequency is 'weekly' and interval is 2
    daysOfWeek?: ('SU' | 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA')[]; // For weekly recurrence
    dayOfMonth?: number; // For monthly recurrence (e.g., 15th of the month)
    // monthOfYear for yearly recurrence can be derived from dueDate if needed
  };
  // TODO: Consider if nextDueDate is needed or if dueDate always represents the upcoming one.
  // For now, let's assume dueDate is always the next occurrence for recurring tasks.
  originalDueDate?: string; // Stores the initial due date when recurrence was set up
// TODO: Implement runtime validation for Task data using a library like zod or joi to ensure data integrity and type safety.
}

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
  // parentId?: string; // Optional: if you need to link back to the parent task explicitly
}