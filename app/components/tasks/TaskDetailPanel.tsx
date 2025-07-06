"use client";

import React, { useState, useEffect } from 'react';
import { Task } from '../../types/task';

interface TaskDetailPanelProps {
  task: Task | null;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskDetailPanel({ task, onClose, onSave, onDelete }: TaskDetailPanelProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _onClose = onClose; // Accepted but intentionally unused - no close button needed
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
      // Auto-enable editing for new tasks (those with empty titles)
      setIsEditing(!task.title);
    } else {
      setEditedTask(null);
      setIsEditing(false);
    }
  }, [task]);

  if (!task || !editedTask) {
    return (
      <div className="w-96 bg-surface-primary border-l border-border-default h-full flex items-center justify-center">
        <div className="text-center text-text-secondary">
          <h3 className="text-lg font-medium text-text-primary mb-2">No task selected</h3>
          <p className="text-sm">Select a task to view its details</p>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    if (editedTask.title.trim()) {
      onSave(editedTask);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (task) {
      setEditedTask({ ...task });
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  return (
    <div className="w-96 bg-surface-primary border-l border-border-default h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border-default flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Task Details</h2>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 hover:bg-hover rounded-md text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Edit task"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={handleSave}
                disabled={!editedTask.title.trim()}
                className="p-2 hover:bg-hover rounded-md text-green-600 hover:text-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Save changes"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-hover rounded-md text-gray-600 hover:text-gray-700 transition-colors"
                aria-label="Cancel editing"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Title</label>
          {isEditing ? (
            <input
              type="text"
              value={editedTask.title}
              onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
              className="w-full px-3 py-2 border border-border-default rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
              placeholder="Enter task title"
              autoFocus
            />
          ) : (
            <h3 className="text-lg font-medium text-text-primary">{task.title || 'Untitled Task'}</h3>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Description</label>
          {isEditing ? (
            <textarea
              value={editedTask.description || ''}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              className="w-full px-3 py-2 border border-border-default rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent resize-none"
              rows={4}
              placeholder="Enter task description"
            />
          ) : (
            <p className="text-text-primary whitespace-pre-wrap">
              {task.description || <span className="text-text-secondary italic">No description</span>}
            </p>
          )}
        </div>

        {/* Status and Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Status</label>
            {isEditing ? (
              <select
                value={editedTask.status}
                onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value as Task['status'] })}
                className="w-full px-3 py-2 border border-border-default rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            ) : (
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                {task.status === 'todo' ? 'To Do' : 
                 task.status === 'in_progress' ? 'In Progress' : 'Completed'}
              </span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Priority</label>
            {isEditing ? (
              <select
                value={editedTask.priority}
                onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as Task['priority'] })}
                className="w-full px-3 py-2 border border-border-default rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            ) : (
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Start Date</label>
            {isEditing ? (
              <input
                type="date"
                value={editedTask.startDate || ''}
                onChange={(e) => setEditedTask({ ...editedTask, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-border-default rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
              />
            ) : (
              <p className="text-text-primary">{formatDate(task.startDate) || <span className="text-text-secondary italic">Not set</span>}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Due Date</label>
            {isEditing ? (
              <input
                type="date"
                value={editedTask.dueDate || ''}
                onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-border-default rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
              />
            ) : (
              <p className="text-text-primary">{formatDate(task.dueDate) || <span className="text-text-secondary italic">Not set</span>}</p>
            )}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Tags</label>
          {isEditing ? (
            <input
              type="text"
              value={editedTask.tags?.join(', ') || ''}
              onChange={(e) => setEditedTask({ 
                ...editedTask, 
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
              })}
              className="w-full px-3 py-2 border border-border-default rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
              placeholder="Enter tags separated by commas"
            />
          ) : (
            <div className="flex flex-wrap gap-1">
              {task.tags && task.tags.length > 0 ? (
                task.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-surface-secondary text-text-primary border border-border-default"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-text-secondary italic">No tags</span>
              )}
            </div>
          )}
        </div>

        {/* Progress */}
        {task.progress !== undefined && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Progress</label>
            {isEditing ? (
              <input
                type="range"
                min="0"
                max="100"
                value={editedTask.progress || 0}
                onChange={(e) => setEditedTask({ ...editedTask, progress: parseInt(e.target.value) })}
                className="w-full"
              />
            ) : (
              <div className="w-full bg-surface-secondary rounded-full h-2">
                <div
                  className="bg-accent-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${task.progress || 0}%` }}
                />
              </div>
            )}
            <div className="text-sm text-text-secondary mt-1">{editedTask.progress || task.progress || 0}%</div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {!isEditing && (
        <div className="p-4 border-t border-border-default">
          <button
            onClick={handleDelete}
            className="w-full px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Task
          </button>
        </div>
      )}
    </div>
  );
}