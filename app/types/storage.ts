import { Task, TaskList } from './task';

export interface StorageConfig {
  remoteEnabled: boolean;
  apiKey?: string;
  userId?: string;
}

export interface StorageProvider {
  getTasks(): Promise<Task[]>;
  saveTasks(tasks: Task[]): Promise<void>;
  getLists(): Promise<TaskList[]>;
  saveLists(lists: TaskList[]): Promise<void>;
  sync(): Promise<SyncResult>;
}

export interface SyncResult {
  tasks: Task[];
  lists: TaskList[];
  lastSynced: Date;
}

export interface RemoteStorageOptions {
  apiKey: string;
  userId: string;
  namespace?: string;
}
