"use client";

import React from 'react';

interface AIAssistantProps {
  onClose: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onClose }) => {
  const suggestions = [
    {
      title: 'Update Documentation',
      priority: 'medium',
      reason: 'Based on recent code changes',
    },
    {
      title: 'Code Review: Authentication',
      priority: 'high',
      reason: 'Security-critical component',
    },
    {
      title: 'Weekly Team Sync',
      priority: 'low',
      reason: 'Regular team communication',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#212121] p-6 rounded-lg w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <h2 className="text-xl font-semibold">AI Task Suggestions</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="bg-[#2A2A2A] p-4 rounded-lg hover:bg-[#333333] transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{suggestion.title}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs text-white ${
                    suggestion.priority === 'high'
                      ? 'bg-red-600'
                      : suggestion.priority === 'medium'
                      ? 'bg-yellow-600'
                      : 'bg-green-600'
                  }`}
                >
                  {suggestion.priority}
                </span>
              </div>
              <p className="text-sm text-gray-400">{suggestion.reason}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-[#2A2A2A] p-4 rounded-lg">
          <h3 className="font-medium mb-2">
            📈 AI Analysis
          </h3>
          <p className="text-sm text-gray-400">
            Based on your work patterns, I notice you're most productive in the mornings. 
            Consider scheduling high-priority tasks between 9 AM and 12 PM for optimal focus.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;