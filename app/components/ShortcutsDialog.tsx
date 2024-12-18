"use client";

import React from 'react';

interface ShortcutsDialogProps {
  onClose: () => void;
}

const ShortcutsDialog: React.FC<ShortcutsDialogProps> = ({ onClose }) => {
  const shortcuts = [
    { key: 'Ctrl + N', description: 'Create new task' },
    { key: 'Ctrl + V', description: 'Toggle view (Board/Calendar)' },
    { key: 'Ctrl + /', description: 'Focus search' },
    { key: 'Ctrl + Del', description: 'Delete selected task' },
    { key: 'Space', description: 'Toggle task completion' },
    { key: '?', description: 'Show keyboard shortcuts' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#212121] p-6 rounded-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4">
          {shortcuts.map(({ key, description }) => (
            <div key={key} className="flex justify-between items-center">
              <span className="text-gray-300">{description}</span>
              <kbd className="px-2 py-1 bg-[#2A2A2A] rounded text-sm">{key}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShortcutsDialog;
