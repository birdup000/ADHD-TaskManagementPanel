"use client";

import React from 'react';
import TaskList from './tasks/TaskList';
import BoardView from './tasks/BoardView';
import TaskDetailPanel from './tasks/TaskDetailPanel';
import { Task } from '../types/task';
import { useTasks } from '../hooks/useTasks';

type ViewMode = 'list' | 'board';

const TaskManager: React.FC = () => {
  const {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus
  } = useTasks();

  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<ViewMode>('list');

  const selectedTask = React.useMemo(() => {
    return tasks.find(task => task.id === selectedTaskId) || null;
  }, [tasks, selectedTaskId]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* View Toggle */}
        <div className="p-4 border-b border-border-default">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md ${
                viewMode === 'list'
                  ? 'bg-accent-primary text-white'
                  : 'text-text-secondary hover:bg-hover'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`px-4 py-2 rounded-md ${
                viewMode === 'board'
                  ? 'bg-accent-primary text-white'
                  : 'text-text-secondary hover:bg-hover'
              }`}
            >
              Board View
            </button>
          </div>
        </div>

        {/* Task Views */}
        {viewMode === 'list' ? (
          <TaskList
            tasks={tasks}
            onTaskSelect={setSelectedTaskId}
            onTaskStatusChange={updateTaskStatus}
          />
        ) : (
          <BoardView
            tasks={tasks}
            onTaskSelect={setSelectedTaskId}
            onTaskStatusChange={updateTaskStatus}
          />
        )}
      </div>

      {/* Task Detail Panel */}
      <div className="w-96 border-l border-border-default">
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTaskId(null)}
          onSave={updateTask}
        />
      </div>
    </div>
  );
};

export default TaskManager;