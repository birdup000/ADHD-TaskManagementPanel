"use client";

import React from 'react';

interface AGiXTConfigProps {
  onClose: () => void;
  onSave: (config: { backendUrl: string; authToken: string }) => void;
}

const AGiXTConfig: React.FC<AGiXTConfigProps> = ({ onClose, onSave }) => {
  const [backendUrl, setBackendUrl] = React.useState('');
  const [authToken, setAuthToken] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ backendUrl, authToken });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#212121] p-6 rounded-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            <h2 className="text-xl font-semibold">AGiXT Configuration</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="backendUrl" className="block text-sm font-medium text-gray-300 mb-1">
              Backend URL
            </label>
            <input
              type="url"
              id="backendUrl"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              placeholder="https://your-agixt-backend.com"
              className="w-full px-3 py-2 bg-[#2A2A2A] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="authToken" className="block text-sm font-medium text-gray-300 mb-1">
              Auth Token
            </label>
            <input
              type="password"
              id="authToken"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              placeholder="Your AGiXT auth token"
              className="w-full px-3 py-2 bg-[#2A2A2A] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AGiXTConfig;
