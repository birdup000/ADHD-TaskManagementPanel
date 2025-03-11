"use client";

import React from 'react';
import { Task } from '../../types/task';

interface TaskListProps {
  tasks: Task[];
  onTaskSelect: (taskId: string) => void;
  onTaskStatusChange: (taskId: string, status: Task['status']) => void;
}

const getPriorityColor = (priority: Task['priority']) => {
  const colors = {
    high: 'bg-priority-high',
    medium: 'bg-priority-medium',
    low: 'bg-priority-low'
  };
  return colors[priority];
};

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskSelect,
  onTaskStatusChange,
}) => {
  return (
    <div className="h-full p-4">
      {/* Header with sorting and view options */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">All Tasks</h2>
        <div className="flex items-center gap-4">
          <select
            className="bg-bg-tertiary text-text-primary border border-border-default rounded-md 
                     px-3 py-1.5 text-sm focus:outline-none focus:border-accent-primary"
          >
            <option value="priority">Sort by Priority</option>
            <option value="dueDate">Sort by Due Date</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`group flex items-center gap-4 p-4 rounded-lg bg-bg-secondary 
                     hover:bg-bg-tertiary transition-colors duration-200 cursor-pointer
                     ${task.status === 'completed' ? 'opacity-60' : ''}`}
            onClick={() => onTaskSelect(task.id)}
          >
            {/* Checkbox */}
            <button
              className={`w-5 h-5 rounded-full border-2 border-border-default flex items-center justify-center
                       hover:border-accent-primary transition-colors duration-200
                       ${task.status === 'completed' ? 'bg-priority-completed' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onTaskStatusChange(
                  task.id,
                  task.status === 'completed' ? 'todo' : 'completed'
                );
              }}
            >
              {task.status === 'completed' && (
                <svg className="w-3 h-3 text-text-primary" viewBox="0 0 12 12">
                  <path
                    d="M3.5 6L5 7.5L8.5 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            {/* Priority Indicator */}
            <div
              className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}
            />

            {/* Task Content */}
            <div className="flex-1">
              <h3 className={`text-base font-medium ${
                task.status === 'completed' ? 'line-through' : ''
              }`}>
                {task.title}
              </h3>
              
              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {task.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full bg-bg-tertiary text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Due Date */}
            {task.dueDate && (
              <span className="text-sm text-text-secondary">
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}

            {/* Actions */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                className="p-2 hover:bg-hover rounded-md text-text-secondary 
                         hover:text-text-primary transition-colors duration-200"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;