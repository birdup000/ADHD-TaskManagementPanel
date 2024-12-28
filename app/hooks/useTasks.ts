"use client";

import { useState, useEffect, useMemo } from 'react';
import { Task, TaskList } from '../types/task';
import { ActivityLog } from '../types/collaboration';
import { findChanges } from '../utils/collaboration';
import { createStorageManager } from '../utils/storage';
import { StorageConfig } from '../types/storage';

export const useTasks = (storageConfig: StorageConfig) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<TaskList[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const storage = useMemo(() => createStorageManager(storageConfig), [storageConfig]);

  // No default list - users must create their own lists

  // Load tasks and lists from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [storedTasks, storedLists] = await Promise.all([
          storage.getTasks(),
          storage.getLists()
        ]);

        setLists(storedLists);
        setTasks(storedTasks);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load data'));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Sync with storage when tasks or lists change
  useEffect(() => {
    const syncData = async () => {
      try {
        await Promise.all([
          storage.saveTasks(tasks),
          storage.saveLists(lists)
        ]);
      } catch (err) {
        console.error('Error syncing data:', err);
        setError(err instanceof Error ? err : new Error('Failed to sync data'));
      }
    };

    if (!isLoading && storage) {
      syncData();
    }
  }, [tasks, lists, storage, isLoading]);

  const updateTask = (updatedTask: Task) => {
    // Get the old version of the task
    const oldTask = tasks.find((t) => t.id === updatedTask.id);
    if (!oldTask) return;

    if (!updatedTask.listId) {
      console.error("Task must have a listId:", updatedTask);
      return;
    }

    const targetList = lists.find(list => list.id === updatedTask.listId);
    if (!targetList) {
      console.error("Target list not found:", updatedTask.listId);
      return;
    }

    // Track changes for activity log
    const changes = findChanges(oldTask, updatedTask);
    const newActivityLogs: ActivityLog[] = changes.map((change) => ({
      id: Date.now().toString(),
      taskId: updatedTask.id,
      userId: storageConfig.userId || "anonymous",
      action: "updated",
      timestamp: new Date(),
      details: {
        field: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue,
      },
    }));

    // Prepare the updated task with new version and activity logs
    const taskWithUpdates = {
      ...updatedTask,
      version: (oldTask.version || 0) + 1,
      activityLog: [...(oldTask.activityLog || []), ...newActivityLogs],
      lastViewed: {
        ...(oldTask.lastViewed || {}),
        [storageConfig.userId || "anonymous"]: new Date(),
      },
    };

    // Update checkpoints if present
    if (oldTask.checkpoints) {
      taskWithUpdates.checkpoints = oldTask.checkpoints;
    }

    setTasks(prev => 
      prev.map(task => task.id === updatedTask.id ? taskWithUpdates : task)
    );
    setLists(prev => 
      prev.map(list => {
        if (list.id === updatedTask.listId) {
          return {
            ...list,
            tasks: list.tasks.map(task => 
              task.id === updatedTask.id ? taskWithUpdates : task
            )
          };
        }
        return list;
      })
    );
  };

  const deleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(task => task.id === taskId);
    if (!taskToDelete) return;

    setTasks(prev => prev.filter(task => task.id !== taskId));
    setLists(prev => 
      prev.map(list => {
        if (list.id === taskToDelete.listId) {
          return {
            ...list,
            tasks: list.tasks.filter(task => task.id !== taskId)
          };
        }
        return list;
      })
    );
  };

  const addTask = (task: Task) => {
    if (!task.listId) {
      console.error("Task must have a listId:", task);
      return;
    }

    const targetList = lists.find(list => list.id === task.listId);
    if (!targetList) {
      console.error("Target list not found:", task.listId);
      return;
    }

    setTasks(prev => [...prev, task]);
    setLists(prev => prev.map(list => 
      list.id === task.listId 
        ? { ...list, tasks: [...list.tasks, task] }
        : list
    ));
  };

  const createList = (list: TaskList) => {
    setLists(prev => [...prev, list]);
  };

  const updateList = (updatedList: TaskList) => {
    setLists(prev =>
      prev.map(list =>
        list.id === updatedList.id ? updatedList : list
      )
    );
  };

  const deleteList = (listId: string) => {
    setLists(prev => prev.filter(list => list.id !== listId));
    // Also delete all tasks in the list
    setTasks(prev => prev.filter(task => task.listId !== listId));
  };

  const loadTaskCheckpoint = async (
    taskId: string,
    checkpointId: string
  ) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    const checkpoint = task.checkpoints?.find((cp) => cp.id === checkpointId);
    if (!checkpoint) {
      throw new Error(`Checkpoint not found: ${checkpointId}`);
    }

    if (checkpoint.state) {
      // Assuming the state can be directly applied to update the task
      updateTask({ ...task, ...checkpoint.state });
    } else {
      throw new Error("Checkpoint state is undefined");
    }
  };

  return {
    tasks,
    lists,
    isLoading,
    error,
    updateTask,
    deleteTask,
    addTask,
    createList,
    updateList,
    deleteList,
    loadTaskCheckpoint
  };
};