export interface Task {
  id: number;
  projectId: number;
  task: string;
  isComplete: boolean;
  description: string;
  dueDate: string | null;
  stage: 'toDo' | 'inProgress' | 'completed';
  notes: string;
  lastEdited?: Date;
}

export interface Project {
  id: number;
  name: string;
  isExpanded?: boolean;
  parentId?: number;
  notes?: string;
  permissions?: {
    canEditProjectNotes?: boolean;
    canEditTaskNotes?: boolean;
    canViewTaskNotes?: boolean;
  };
}