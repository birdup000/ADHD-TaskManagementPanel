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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800/90 rounded-lg shadow-xl p-6 w-[400px] animate-slide-in">
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

export default AddProjectModal;