import React, { useState } from 'react';

interface GeminiConfigProps {
  onClose: () => void;
  onSave: (config: { apiKey: string; model: string }) => void;
}

const GeminiConfig: React.FC<GeminiConfigProps> = ({ onClose, onSave }) => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-pro');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ apiKey, model });
  };

  return (
    <div className="bg-[#212121] p-6 rounded-lg w-full max-w-md">
      <h2 className="text-xl font-semibold mb-4">Gemini Configuration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 bg-[#333333] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter your Gemini API key"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Model
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-3 py-2 bg-[#333333] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="gemini-pro">Gemini Pro</option>
            <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash Exp</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default GeminiConfig;