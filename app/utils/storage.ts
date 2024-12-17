import { Task, TaskList } from '../types/task';
import { StorageProvider, StorageConfig, SyncResult } from '../types/storage';
import { RemoteStorageProvider } from './remoteStorage';

const TASKS_STORAGE_KEY = 'midnight-eclipse-tasks';
const LISTS_STORAGE_KEY = 'midnight-eclipse-lists';
const LAST_SYNC_KEY = 'midnight-eclipse-last-sync';

class StorageManager implements StorageProvider {
  private remoteStorage?: RemoteStorageProvider;
  private config: StorageConfig;

  constructor(config: StorageConfig) {
    this.config = config;
    if (config.remoteEnabled && config.apiKey && config.userId) {
      this.remoteStorage = new RemoteStorageProvider({
        apiKey: config.apiKey,
        userId: config.userId
      });
    }
  }

  async getTasks(): Promise<Task[]> {
    const localTasks = this.loadTasksFromLocalStorage();
    if (!this.remoteStorage) return localTasks;
    
    try {
      const remoteTasks = await this.remoteStorage.getTasks();
      // Merge remote and local tasks, preferring remote versions for conflicts
      const mergedTasks = this.mergeTasks(localTasks, remoteTasks);
      this.saveTasksToLocalStorage(mergedTasks);
      return mergedTasks;
    } catch (error) {
      console.error('Error fetching remote tasks:', error);
      return localTasks;
    }
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    this.saveTasksToLocalStorage(tasks);
    if (this.remoteStorage) {
      try {
        await this.remoteStorage.saveTasks(tasks);
      } catch (error) {
        console.error('Error saving tasks to remote storage:', error);
      }
    }
  }

  async getLists(): Promise<TaskList[]> {
    const localLists = this.loadListsFromLocalStorage();
    if (!this.remoteStorage) return localLists;
    
    try {
      const remoteLists = await this.remoteStorage.getLists();
      // Merge remote and local lists, preferring remote versions
      const mergedLists = this.mergeLists(localLists, remoteLists);
      this.saveListsToLocalStorage(mergedLists);
      return mergedLists;
    } catch (error) {
      console.error('Error fetching remote lists:', error);
      return localLists;
    }
  }

  async saveLists(lists: TaskList[]): Promise<void> {
    this.saveListsToLocalStorage(lists);
    if (this.remoteStorage) {
      try {
        await this.remoteStorage.saveLists(lists);
      } catch (error) {
        console.error('Error saving lists to remote storage:', error);
      }
    }
  }

  async sync(): Promise<SyncResult> {
    if (!this.remoteStorage) {
      return {
        tasks: this.loadTasksFromLocalStorage(),
        lists: this.loadListsFromLocalStorage(),
        lastSynced: new Date()
      };
    }

    try {
      const syncResult = await this.remoteStorage.sync();
      this.saveTasksToLocalStorage(syncResult.tasks);
      this.saveListsToLocalStorage(syncResult.lists);
      localStorage.setItem(LAST_SYNC_KEY, JSON.stringify(syncResult.lastSynced));
      return syncResult;
    } catch (error) {
      console.error('Error during sync:', error);
      throw error;
    }
  }

  private saveTasksToLocalStorage(tasks: Task[]): void {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  }

  private loadTasksFromLocalStorage(): Task[] {
    try {
      const tasksJson = localStorage.getItem(TASKS_STORAGE_KEY);
      if (!tasksJson) return [];
      
      const tasks = JSON.parse(tasksJson);
      // Convert string dates back to Date objects
      return tasks.map((task: any) => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        // Convert collaboration dates
        collaborators: task.collaborators?.map((c: any) => ({
          ...c,
          joinedAt: new Date(c.joinedAt)
        })),
        activityLog: task.activityLog?.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        })),
        comments: task.comments?.map((comment: any) => ({
          ...comment,
          createdAt: new Date(comment.createdAt),
          updatedAt: comment.updatedAt ? new Date(comment.updatedAt) : undefined,
          replies: comment.replies?.map((reply: any) => ({
            ...reply,
            createdAt: new Date(reply.createdAt),
            updatedAt: reply.updatedAt ? new Date(reply.updatedAt) : undefined,
          }))
        })),
        lastViewed: task.lastViewed ? Object.entries(task.lastViewed).reduce((acc: any, [userId, date]: [string, any]) => ({
          ...acc,
          [userId]: new Date(date)
        }), {}) : undefined,
      }));
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
      return [];
    }
  }

  private clearTasksFromLocalStorage(): void {
    try {
      localStorage.removeItem(TASKS_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing tasks from localStorage:', error);
    }
  }

  private saveListsToLocalStorage(lists: TaskList[]): void {
    try {
      localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(lists));
    } catch (error) {
      console.error('Error saving lists to localStorage:', error);
    }
  }

  private loadListsFromLocalStorage(): TaskList[] {
    try {
      const listsJson = localStorage.getItem(LISTS_STORAGE_KEY);
      if (!listsJson) return [];
      return JSON.parse(listsJson);
    } catch (error) {
      console.error('Error loading lists from localStorage:', error);
      return [];
    }
  }

  private mergeTasks(localTasks: Task[], remoteTasks: Task[]): Task[] {
    const taskMap = new Map<string, Task>();
    
    // Add all local tasks to the map
    localTasks.forEach(task => taskMap.set(task.id, task));
    
    // Override with remote tasks (they take precedence)
    remoteTasks.forEach(task => taskMap.set(task.id, task));
    
    return Array.from(taskMap.values());
  }

  private mergeLists(localLists: TaskList[], remoteLists: TaskList[]): TaskList[] {
    const listMap = new Map<string, TaskList>();
    
    // Add all local lists to the map
    localLists.forEach(list => listMap.set(list.id, list));
    
    // Override with remote lists (they take precedence)
    remoteLists.forEach(list => listMap.set(list.id, list));
    
    return Array.from(listMap.values());
  }
}

// Export a function to create a new storage manager instance
export const createStorageManager = (config: StorageConfig): StorageProvider => {
  return new StorageManager(config);
};
