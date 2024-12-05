"use client";

import React, { useState } from 'react';

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
  const [taskData, setTaskData] = useState({
    task: '',
    description: '',
    dueDate: '',
    stage: 'toDo' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAdd) {
      onAdd({
        ...taskData,
        dueDate: taskData.dueDate || null
      });
    }
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-[500px]">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          New Task
        </h2>
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
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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