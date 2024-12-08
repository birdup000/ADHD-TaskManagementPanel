"use client";

import React, { useState, useCallback } from 'react';

interface AddTaskModalProps {
  onClose?: () => void;
  onAdd?: (task: {
    task: string;
    description: string;
    dueDate: string | null;
    stage: 'toDo' | 'inProgress' | 'completed';
  }) => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ onClose, onAdd }) => {
  // Always declare hooks first, before any conditional logic
  const [taskData, setTaskData] = useState({
    task: '',
    description: '',
    dueDate: '',
    stage: 'toDo' as const
  });

  // Handle submission with proper hook usage
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Combine conditionals to ensure consistent execution
    if (onAdd && taskData) {
      onAdd({
        ...taskData,
        dueDate: taskData.dueDate || null
      });
      // Only close after successful add
      onClose?.();
    }
  }, [onAdd, onClose, taskData]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800/90 rounded-xl shadow-xl w-[500px] max-w-[90vw] overflow-hidden animate-slide-in">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Create New Task
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Task Name
            </label>
            <input
              type="text"
              value={taskData.task}
              onChange={(e) => setTaskData(prev => ({ ...prev, task: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md dark:border-gray-700 
                       dark:bg-gray-900 dark:text-gray-100"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={taskData.description}
              onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md dark:border-gray-700 
                       dark:bg-gray-900 dark:text-gray-100"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={taskData.dueDate}
              onChange={(e) => setTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md dark:border-gray-700 
                       dark:bg-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 
                       dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;