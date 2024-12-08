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

export interface Block {
  id: string;
  type: 'text' | 'heading1' | 'heading2' | 'heading3' | 'bulletList' | 'numberList' | 'todo' | 'code' | 'quote' | 'divider' | 'callout' | 'toggle';
  content: string;
  checked?: boolean;
  properties?: {
    color?: string;
    icon?: string;
    collapsed?: boolean;
  };
}

export interface Document {
  id: string;
  title: string;
  icon?: string;
  cover?: string;
  emoji?: string;
  favorite?: boolean;
  blocks: Block[];
  children: Document[];
  createdAt: Date;
  updatedAt: Date;
  lastOpenedAt?: Date;
  parent?: string;
}