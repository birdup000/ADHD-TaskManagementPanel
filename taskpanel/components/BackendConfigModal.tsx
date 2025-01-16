// components/BackendConfigModal.tsx
import React, { useState } from 'react';
import { useBackendConfig } from '../components/BackendConfig';

interface BackendConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BackendConfigModal: React.FC<BackendConfigModalProps> = ({ isOpen, onClose }) => {
  const { apiBaseUrl, updateApiBaseUrl, apiKey, updateApiKey } = useBackendConfig();
  const [newApiBaseUrl, setNewApiBaseUrl] = useState(apiBaseUrl);
    const [newApiKey, setNewApiKey] = useState(apiKey);


  const handleSave = () => {
    updateApiBaseUrl(newApiBaseUrl);
      updateApiKey(newApiKey);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Edit AGiXT Backend Configuration
          </h3>
          <div className="mt-2 px-7 py-3">
            <label className="block text-gray-700">API Base URL</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              value={newApiBaseUrl}
              onChange={(e) => setNewApiBaseUrl(e.target.value)}
            />
          </div>
            <div className="mt-2 px-7 py-3">
                <label className="block text-gray-700">API Key</label>
                <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                />
            </div>
          <div className="items-center px-4 py-3">
            <button
              className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className="mt-2 px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
               onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackendConfigModal;