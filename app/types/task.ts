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
// TODO: Implement runtime validation for Task data using a library like zod or joi to ensure data integrity and type safety.
}

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
  // parentId?: string; // Optional: if you need to link back to the parent task explicitly
}