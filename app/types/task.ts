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
}