import { Collaborator, ActivityLog, Comment } from './collaboration';

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface TimeEntry {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  description?: string;
}

export interface Reminder {
  id: string;
  time: Date;
  message: string;
  type: 'due_date' | 'milestone' | 'custom';
  isEnabled: boolean;
}

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
  attachments?: Attachment[];
  timeEntries?: TimeEntry[];
  reminders?: Reminder[];
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
  tasks: Task[];
}
