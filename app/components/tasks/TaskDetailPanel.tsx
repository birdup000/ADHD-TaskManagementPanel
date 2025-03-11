"use client";

import React from 'react';
import { Task } from '../../types/task';

interface TaskDetailPanelProps {
  task: Task | null;
  onClose: () => void;
  onSave: (task: Task) => void;
}

const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({
  task,
  onClose,
  onSave,
}) => {
  if (!task) {
    return (
      <div className="h-full flex items-center justify-center text-text-secondary">
        <p>Select a task to view details</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Task Details</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-hover rounded-md text-text-secondary 
                   hover:text-text-primary transition-colors duration-200"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Task Form */}
      <div className="flex-1 overflow-y-auto">
        <form className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">
              Title
            </label>
            <input
              type="text"
              defaultValue={task.title}
              className="w-full bg-bg-tertiary border border-border-default rounded-md px-3 py-2
                     text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">
              Description
            </label>
            <textarea
              defaultValue={task.description}
              rows={4}
              className="w-full bg-bg-tertiary border border-border-default rounded-md px-3 py-2
                     text-text-primary focus:outline-none focus:border-accent-primary resize-none"
            />
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                Priority
              </label>
              <select
                defaultValue={task.priority}
                className="w-full bg-bg-tertiary border border-border-default rounded-md px-3 py-2
                       text-text-primary focus:outline-none focus:border-accent-primary"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                Status
              </label>
              <select
                defaultValue={task.status}
                className="w-full bg-bg-tertiary border border-border-default rounded-md px-3 py-2
                       text-text-primary focus:outline-none focus:border-accent-primary"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                Start Date
              </label>
              <input
                type="date"
                defaultValue={task.startDate}
                className="w-full bg-bg-tertiary border border-border-default rounded-md px-3 py-2
                       text-text-primary focus:outline-none focus:border-accent-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                Due Date
              </label>
              <input
                type="date"
                defaultValue={task.dueDate}
                className="w-full bg-bg-tertiary border border-border-default rounded-md px-3 py-2
                       text-text-primary focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">
              Progress
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                defaultValue={task.progress || 0}
                className="flex-1 accent-accent-primary"
              />
              <span className="text-sm text-text-secondary w-12">
                {task.progress || 0}%
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {task.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-bg-tertiary text-sm flex items-center gap-2"
                >
                  {tag}
                  <button className="text-text-secondary hover:text-text-primary">
                    ×
                  </button>
                </span>
              ))}
              <button
                className="px-3 py-1 rounded-full border border-dashed border-border-default
                         text-sm text-text-secondary hover:text-text-primary hover:border-accent-primary"
              >
                + Add Tag
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 pt-4 mt-6 border-t border-border-default">
        <button
          onClick={() => onSave(task)}
          className="flex-1 py-2 px-4 rounded-md bg-accent-primary text-white
                   hover:bg-opacity-90 transition-colors duration-200"
        >
          Save Changes
        </button>
        <button
          onClick={onClose}
          className="py-2 px-4 rounded-md border border-border-default text-text-secondary
                   hover:bg-hover transition-colors duration-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TaskDetailPanel;