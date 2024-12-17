import { RemoteStorage } from '@frigade/remote-storage';
import { Task, TaskList } from '../types/task';
import { RemoteStorageOptions, StorageProvider, SyncResult } from '../types/storage';

const TASKS_KEY = 'tasks';
const LISTS_KEY = 'lists';
const LAST_SYNC_KEY = 'lastSync';

export class RemoteStorageProvider implements StorageProvider {
  private storage: RemoteStorage;
  private namespace: string;

  constructor(options: RemoteStorageOptions) {
    this.storage = new RemoteStorage({
      apiKey: options.apiKey,
      userId: options.userId
    });
    this.namespace = options.namespace || 'midnight-eclipse';
  }

  private getFullKey(key: string): string {
    return `${this.namespace}:${key}`;
  }

  async getTasks(): Promise<Task[]> {
    try {
      const tasksJson = await this.storage.get(this.getFullKey(TASKS_KEY));
      if (!tasksJson) return [];
      
      const tasks = JSON.parse(tasksJson);
      return tasks.map((task: any) => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        scheduledFor: task.scheduledFor ? new Date(task.scheduledFor) : undefined,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        collaborators: task.collaborators?.map((c: any) => ({
          ...c,
          joinedAt: new Date(c.joinedAt)
        })),
        activityLog: task.activityLog?.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        })),
        lastViewed: task.lastViewed ? Object.entries(task.lastViewed).reduce((acc: any, [userId, date]: [string, any]) => ({
          ...acc,
          [userId]: new Date(date)
        }), {}) : undefined,
      }));
    } catch (error) {
      console.error('Error loading tasks from remote storage:', error);
      return [];
    }
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    try {
      await this.storage.set(this.getFullKey(TASKS_KEY), JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to remote storage:', error);
      throw error;
    }
  }

  async getLists(): Promise<TaskList[]> {
    try {
      const listsJson = await this.storage.get(this.getFullKey(LISTS_KEY));
      if (!listsJson) return [];
      return JSON.parse(listsJson);
    } catch (error) {
      console.error('Error loading lists from remote storage:', error);
      return [];
    }
  }

  async saveLists(lists: TaskList[]): Promise<void> {
    try {
      await this.storage.set(this.getFullKey(LISTS_KEY), JSON.stringify(lists));
    } catch (error) {
      console.error('Error saving lists to remote storage:', error);
      throw error;
    }
  }

async sync(): Promise<SyncResult> {
    try {
      const lastSyncJson = await this.storage.get(this.getFullKey(LAST_SYNC_KEY));
      const lastSync = lastSyncJson ? new Date(JSON.parse(lastSyncJson)) : new Date(0);
      
      // Get remote data
      const [remoteTasks, remoteLists] = await Promise.all([
        this.getTasks(),
        this.getLists()
      ]);

      // Update last sync time
      await this.storage.set(this.getFullKey(LAST_SYNC_KEY), JSON.stringify(new Date()));

      return {
        tasks: remoteTasks,
        lists: remoteLists,
        lastSynced: new Date()
      };
    } catch (error) {
      console.error('Error during sync:', error);
      throw error;
    }
  }
}
