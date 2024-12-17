export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: Date;
  assignees?: string[];
  tags?: string[];
  dependsOn?: string[];
  category?: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
  };
  subtasks?: {
    id: string;
    title: string;
    completed: boolean;
    createdAt: Date;
  }[];
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  listId: string;
}

export interface TaskList {
  id: string;
  name: string;
}
