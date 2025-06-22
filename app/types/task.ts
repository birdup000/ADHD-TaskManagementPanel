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
// TODO: Implement runtime validation for Task data using a library like zod or joi to ensure data integrity and type safety.
}