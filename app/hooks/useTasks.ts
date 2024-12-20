"use client";

import { useState, useEffect } from 'react';
import { Task, TaskList } from '../types/task';
import { ActivityLog } from '../types/collaboration';
import { findChanges, mergeTaskChanges } from '../utils/collaboration';
import { createStorageManager } from '../utils/storage';
import { StorageConfig } from '../types/storage';

export const useTasks = (storageConfig: StorageConfig) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<TaskList[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const storage = createStorageManager(storageConfig);

  // Load tasks and lists from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [storedTasks, storedLists] = await Promise.all([
          storage.getTasks(),
          storage.getLists()
        ]);

        const defaultList = { id: 'default', name: 'General Task List' };
        const initialLists = storedLists.length > 0 ? storedLists : [defaultList];
        setLists(initialLists);

        if (storedTasks.length === 0 && initialLists.length > 0) {
          const defaultTask: Task = {
            id: 'default-task',
            title: 'Example Task',
            listId: initialLists[0].id,
            description: 'This is an example task.',
            createdAt: new Date(),
            updatedAt: new Date(),
            completedAt: undefined,
            priority: 'medium',
            status: 'todo',
            owner: storageConfig.userId || 'anonymous',
            collaborators: [],
            activityLog: [],
            comments: [],
            version: 1,
            progress: 0
          };
          setTasks([defaultTask]);
          await storage.saveTasks([defaultTask]);
        } else {
          setTasks(storedTasks);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load data'));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [storage]);

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

  const addTask = (task: Task) => {
    if (!task.listId) {
      console.error("Task must have a listId:", task);
      return;
    }
setTasks((prev) => [...prev, task]);
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

    const updateTask = (updatedTask: Task) => {
      // Get the old version of the task
      const oldTask = tasks.find((t) => t.id === updatedTask.id);
      if (!oldTask) return;

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
      if (updatedTask.checkpoints) {
        taskWithUpdates.checkpoints = updatedTask.checkpoints;
      }

      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? taskWithUpdates : t))
      );
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

  const sync = async () => {
    try {
      await Promise.all([
        storage.saveTasks(tasks),
        storage.saveLists(lists)
      ]);
    } catch (err) {
      console.error('Error syncing data:', err);
    }
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
    sync,
    isLoading,
    error,
  };
};
