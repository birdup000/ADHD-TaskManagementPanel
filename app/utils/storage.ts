import { Task, TaskList } from '../types/task';

const TASKS_STORAGE_KEY = 'midnight-eclipse-tasks';
const LISTS_STORAGE_KEY = 'midnight-eclipse-lists';

export const saveTasksToLocalStorage = (tasks: Task[]): void => {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks to localStorage:', error);
  }
};

export const loadTasksFromLocalStorage = (): Task[] => {
  try {
    const tasksJson = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!tasksJson) return [];
    
    const tasks = JSON.parse(tasksJson);
    // Convert string dates back to Date objects
    return tasks.map((task: any) => ({
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
    }));
  } catch (error) {
    console.error('Error loading tasks from localStorage:', error);
    return [];
  }
};

export const clearTasksFromLocalStorage = (): void => {
  try {
    localStorage.removeItem(TASKS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing tasks from localStorage:', error);
  }
};

export const saveListsToLocalStorage = (lists: TaskList[]): void => {
  try {
    localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(lists));
  } catch (error) {
    console.error('Error saving lists to localStorage:', error);
  }
};

export const loadListsFromLocalStorage = (): TaskList[] => {
  try {
    const listsJson = localStorage.getItem(LISTS_STORAGE_KEY);
    if (!listsJson) return [];
    return JSON.parse(listsJson);
  } catch (error) {
    console.error('Error loading lists from localStorage:', error);
    return [];
  }
};
