"use client";

import React from 'react';
import { Task } from '../types/task';
import TaskProgress from './TaskProgress';
import TaskComments from './TaskComments';
import TaskAttachments from './TaskAttachments';
import TaskTimer from './TaskTimer';
import TaskNotifications from './TaskNotifications';
import TaskRecurrence from './TaskRecurrence';
import TaskHistory from './TaskHistory';
import TaskLabels from './TaskLabels';
import TaskDependencies from './TaskDependencies';

interface TaskDetailsPanelProps {
  task: Task | null;
  onClose: () => void;
  onUpdateTask: (task: Task) => void;
  allTasks: Task[];
  className?: string;
}

const TaskDetailsPanel: React.FC<TaskDetailsPanelProps> = ({
  task,
  onClose,
  onUpdateTask,
  allTasks,
  className = '',
}) => {
  if (!task) return null;

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleProgressChange = (value: number) => {
    onUpdateTask({
      ...task,
      progress: value,
      status: value === 100 ? 'done' : value > 0 ? 'in-progress' : task.status,
      activityLog: [
        ...task.activityLog,
        {
          id: Date.now().toString(),
          taskId: task.id,
          userId: 'current-user',
          action: 'updated',
          timestamp: new Date(),
        },
      ],
    });
  };

  const handleStatusChange = (status: Task['status']) => {
    onUpdateTask({
      ...task,
      status,
      progress: status === 'done' ? 100 : task.progress,
      activityLog: [
        ...task.activityLog,
        {
          id: Date.now().toString(),
          taskId: task.id,
          userId: 'current-user',
          action: 'status_changed',
          timestamp: new Date(),
        },
      ],
    });
  };

  const handlePriorityChange = (priority: Task['priority']) => {
    onUpdateTask({
      ...task,
      priority,
      activityLog: [
        ...task.activityLog,
        {
          id: Date.now().toString(),
          taskId: task.id,
          userId: 'current-user',
          action: 'updated',
          timestamp: new Date(),
        },
      ],
    });
  };

  return (
    <div className={`fixed inset-y-0 right-0 w-[32rem] bg-gray-800 shadow-xl overflow-y-auto ${className}`}>
      <div className="sticky top-0 bg-gray-800 p-6 border-b border-gray-700 z-10">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Task Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">{task.title}</h3>
          <p className="text-gray-400">{task.description}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Progress
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={task.progress}
                onChange={(e) => handleProgressChange(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-400 w-12">{task.progress}%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Status
            </label>
            <div className="flex gap-2">
              {(['todo', 'in-progress', 'done'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    task.status === status
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {status.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Priority
            </label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((priority) => (
                <button
                  key={priority}
                  onClick={() => handlePriorityChange(priority)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    task.priority === priority
                      ? {
                          low: 'bg-green-600 text-white',
                          medium: 'bg-yellow-600 text-white',
                          high: 'bg-red-600 text-white',
                        }[priority]
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>
        </div>

        <TaskProgress task={task} />

        <div className="border-t border-gray-700 pt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Due Date
            </label>
            <p className="text-gray-400">{formatDate(task.dueDate)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Created
            </label>
            <p className="text-gray-400">{formatDate(task.createdAt)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Last Updated
            </label>
            <p className="text-gray-400">{formatDate(task.updatedAt)}</p>
          </div>
        </div>

        {task.subtasks && task.subtasks.length > 0 && (
          <div className="border-t border-gray-700 pt-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Subtasks</h4>
            <div className="space-y-2">
              {task.subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => {
                      const updatedSubtasks = task.subtasks?.map((st) =>
                        st.id === subtask.id
                          ? { ...st, completed: !st.completed }
                          : st
                      );
                      onUpdateTask({
                        ...task,
                        subtasks: updatedSubtasks,
                        activityLog: [
                          ...task.activityLog,
                          {
                            id: Date.now().toString(),
                            taskId: task.id,
                            userId: 'current-user',
                            action: 'updated',
                            timestamp: new Date(),
                          },
                        ],
                      });
                    }}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className={subtask.completed ? 'line-through text-gray-500' : ''}>
                    {subtask.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-gray-700 pt-4">
          <TaskLabels task={task} onUpdateTask={onUpdateTask} />
        </div>

        <div className="border-t border-gray-700 pt-4">
          <TaskDependencies task={task} allTasks={allTasks} onUpdateTask={onUpdateTask} />
        </div>

        <div className="border-t border-gray-700 pt-4">
          <TaskNotifications task={task} onUpdateTask={onUpdateTask} />
        </div>

        <div className="border-t border-gray-700 pt-4">
          <TaskTimer task={task} onUpdateTask={onUpdateTask} />
        </div>

        <div className="border-t border-gray-700 pt-4">
          <TaskAttachments task={task} onUpdateTask={onUpdateTask} />
        </div>

        <div className="border-t border-gray-700 pt-4">
          <TaskComments task={task} onUpdateTask={onUpdateTask} />
        </div>

        <div className="border-t border-gray-700 pt-4">
          <TaskHistory task={task} />
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsPanel;
