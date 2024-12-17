"use client";

import React from 'react';
import { Task } from '../types/task';

interface AIAssistantProps {
  onClose: () => void;
  selectedAgent: string;
  onGenerateSubtasks: (task: Task) => Promise<void>;
  onRunChain: (task: Task) => Promise<void>;
  isLoading: boolean;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ 
  onClose, 
  selectedAgent, 
  onGenerateSubtasks, 
  onRunChain,
  isLoading 
}) => {
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);

  const suggestions: Array<{
    title: string;
    description: string;
    priority: Task['priority'];
  }> = [
    {
      title: 'Update Documentation',
      priority: 'medium',
      description: 'Based on recent code changes',
    },
    {
      title: 'Code Review: Authentication',
      priority: 'high',
      description: 'Security-critical component',
    },
    {
      title: 'Weekly Team Sync',
      priority: 'low',
      description: 'Regular team communication',
    },
  ];

  const [taskCreated, setTaskCreated] = React.useState(false);

  const handleGenerateSubtasks = async () => {
    if (selectedTask) {
      await onGenerateSubtasks(selectedTask);
      setTaskCreated(true);
    }
  };

  const handleRunChain = async () => {
    if (selectedTask) {
      await onRunChain(selectedTask);
      setTaskCreated(true);
    }
  };

  const resetSelection = () => {
    setSelectedTask(null);
    setTaskCreated(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#212121] p-6 rounded-lg w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <div>
              <h2 className="text-xl font-semibold">AI Task Assistant</h2>
              <p className="text-sm text-gray-400">Using agent: {selectedAgent}</p>
            </div>
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
              onClick={() => setSelectedTask({
                id: crypto.randomUUID(),
                title: suggestion.title,
                description: suggestion.description,
                priority: suggestion.priority as Task['priority'],
                status: 'todo',
                listId: 'default',
                subtasks: [],
                createdAt: new Date(),
                updatedAt: new Date(),
              })}
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
              <p className="text-sm text-gray-400">{suggestion.description}</p>
            </div>
          ))}
        </div>

        {selectedTask && (
          <div className="mt-6 bg-[#2A2A2A] p-4 rounded-lg">
            <h3 className="font-medium mb-4">Selected Task: {selectedTask.title}</h3>
            {taskCreated ? (
              <div className="text-center">
                <p className="text-green-400 mb-4">✓ Task processed successfully!</p>
                <button
                  onClick={resetSelection}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Process Another Task
                </button>
              </div>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={handleGenerateSubtasks}
                  disabled={isLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Generating...' : 'Generate Subtasks'}
                </button>
                <button
                  onClick={handleRunChain}
                  disabled={isLoading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Running...' : 'Run Chain'}
                </button>
              </div>
            )}
          </div>
        )}

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
