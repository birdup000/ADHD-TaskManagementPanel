"use client";

import { useState, useEffect } from 'react';
import { Task, TaskList } from '../types/task';
import { loadTasksFromLocalStorage, saveTasksToLocalStorage, loadListsFromLocalStorage, saveListsToLocalStorage } from '../utils/storage';

const TASKS_STORAGE_KEY = 'tasks';
const LISTS_STORAGE_KEY = 'lists';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<TaskList[]>([]);

  // Load tasks and lists from localStorage only on client-side after initial render
  useEffect(() => {
    const storedTasks = loadTasksFromLocalStorage() || [];
    const storedLists = loadListsFromLocalStorage() || [{ id: 'default', name: 'Default' }];
    setTasks(storedTasks);
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
