"use client";

import React from 'react';

interface AddProjectModalProps {
  onClose?: () => void;
  onAdd?: (projectName: string) => void;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ onClose, onAdd }) => {
  const [projectName, setProjectName] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAdd) onAdd(projectName);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-[400px]">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          New Project
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project name"
            className="w-full px-3 py-2 border rounded-md dark:border-gray-700 
                     dark:bg-gray-900 dark:text-gray-100 mb-4"
            autoFocus
          />
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

export default AddProjectModal;