import { Collaborator, ActivityLog, Comment } from './collaboration';

export interface Checkpoint {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  description?: string;
  state?: {
    [key: string]: any;
  };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: Date;
  scheduledFor?: Date;
  assignees?: string[];
  tags?: string[];
  dependsOn?: string[];
  category?: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
  };
  checkpoints?: Checkpoint[];
  progress: number;
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
  // Collaboration features
  owner: string;
  collaborators: Collaborator[];
  activityLog: ActivityLog[];
  comments: Comment[];
  lastViewed?: {
    [userId: string]: Date;
  };
  version: number; // For handling concurrent edits
}

export interface TaskList {
  id: string;
  name: string;
}
