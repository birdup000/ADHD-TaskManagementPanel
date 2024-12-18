export interface ActivityLog {
  id: string;
  taskId: string;
  userId: string;
  action: 'created' | 'updated' | 'commented' | 'status_changed' | 'assigned';
  timestamp: Date;
  details?: {
    field?: string;
    oldValue?: any;
    newValue?: any;
    comment?: string;
  };
}

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: 'viewer' | 'editor' | 'owner';
  joinedAt: Date;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  replies?: Comment[];
}
