"use client";

import { useState, useEffect } from 'react';
import { Task, TaskList } from '../types/task';
import { ActivityLog } from '../types/collaboration';
import { findChanges, mergeTaskChanges } from '../utils/collaboration';
import { loadTasksFromLocalStorage, saveTasksToLocalStorage, loadListsFromLocalStorage, saveListsToLocalStorage } from '../utils/storage';

const TASKS_STORAGE_KEY = 'tasks';
const LISTS_STORAGE_KEY = 'lists';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<TaskList[]>([]);

  // Load tasks and lists from localStorage only on client-side after initial render
  useEffect(() => {
    const storedTasks = loadTasksFromLocalStorage() || [];
    const storedLists = loadListsFromLocalStorage() || [{ id: 'default', name: 'General Task List' }];
    
    if (storedTasks.length === 0 && storedLists.length > 0) {
      const defaultListId = storedLists[0].id;
      const defaultTask: Task = {
        id: 'default-task',
        title: 'Example Task',
        listId: defaultListId,
        description: 'This is an example task.',
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: undefined,
        priority: 'medium',
        status: 'todo',
      };
      setTasks([defaultTask]);
    } else {
      setTasks(storedTasks);
    }
    setLists(storedLists);
  }, []);

  useEffect(() => {
    saveTasksToLocalStorage(tasks);
    saveListsToLocalStorage(lists);
  }, [tasks, lists]);

  const addTask = (task: Task) => {
    if (!task.listId) {
      console.error("Task must have a listId:", task);
      return;
    }
    setTasks(prev => [...prev, task]);
  };

  const updateTask = (updatedTask: Task) => {
    // Get the old version of the task
    const oldTask = tasks.find(t => t.id === updatedTask.id);
    if (!oldTask) return;

    // Track changes for activity log
    const changes = findChanges(oldTask, updatedTask);
    const newActivityLogs: ActivityLog[] = changes.map(change => ({
      id: Date.now().toString(),
      taskId: updatedTask.id,
      userId: currentUser,
      action: 'updated',
      timestamp: new Date(),
      details: {
        field: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue
      }
    }));

    // Prepare the updated task with new version and activity logs
    const taskWithUpdates = {
      ...updatedTask,
      version: (oldTask.version || 0) + 1,
      activityLog: [...(oldTask.activityLog || []), ...newActivityLogs],
      lastViewed: {
        ...(oldTask.lastViewed || {}),
        [currentUser]: new Date()
      }
    };
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const reorderTasks = (reorderedTasks: Task[]) => {
    setTasks(reorderedTasks);
  };

  const importTasks = (importedTasks: Task[], listId: string) => {
      const tasksWithListId = importedTasks.map(task => ({
        ...task,
        listId: listId,
      }));
      setTasks(prev => [...prev, ...tasksWithListId]);
    };

  const addList = (list: TaskList) => {
    setLists(prev => [...prev, list]);
  };

  const updateList = (updatedList: TaskList) => {
    setLists(prev => prev.map(l => l.id === updatedList.id ? updatedList : l));
  };

  const deleteList = (listId: string) => {
    setLists(prev => prev.filter(l => l.id !== listId));
    // Remove tasks associated with the deleted list
    setTasks(prev => prev.filter(t => t.listId !== listId));
  };

  return {
    tasks,
    lists,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    importTasks,
    addList,
    updateList,
    deleteList,
  };
};
