"use client";

import React, { useState } from 'react';
import { useAIAssistant } from '../hooks/useAIAssistant';
import { Task } from '../types/task';

interface AIAssistantPanelProps {
  backendUrl: string;
  authToken: string;
  onTaskSuggestion: (task: Partial<Task>) => void;
  onTaskOptimization: (taskIds: string[]) => void;
  tasks: Task[];
  selectedTask: Task | null;
  className?: string;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  backendUrl,
  authToken,
  onTaskSuggestion,
  onTaskOptimization,
  tasks,
  selectedTask,
  className = '',
}) => {
  const [context, setContext] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const {
    isProcessing,
    error,
    selectedAgent,
    setSelectedAgent,
    generateTaskSuggestions,
    optimizeTaskOrder,
    analyzeTaskProgress,
    generateSubtasks,
  } = useAIAssistant({ backendUrl, authToken });

  const handleGenerateSuggestions = async () => {
    const result = await generateTaskSuggestions(context);
    setSuggestions(result);
  };

  const handleOptimizeOrder = async () => {
    const result = await optimizeTaskOrder(tasks);
    if (result) {
      onTaskOptimization(result);
    }
  };

  const handleAnalyzeTask = async () => {
    if (!selectedTask) return;
    const result = await analyzeTaskProgress(selectedTask);
    setAnalysis(result);
  };

  const handleGenerateSubtasks = async () => {
    if (!selectedTask) return;
    const result = await generateSubtasks(selectedTask);
    if (result) {
      onTaskSuggestion({ ...selectedTask, subtasks: result.subtasks });
    }
  };

  return (
    <div 
      className={`bg-[#1E1E1E] text-white rounded-lg shadow-lg transition-all duration-300 ease-in-out ${className} ${
        isExpanded ? 'w-80' : 'w-12'
      }`}
    >
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h3 className={`font-semibold ${isExpanded ? '' : 'hidden'}`}>AI Assistant</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-gray-700 rounded transition-colors"
          aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}
        >
          {isExpanded ? '←' : '→'}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-6">
          {error && (
            <div className="bg-red-900/50 text-red-200 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              AI Agent
            </label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full px-3 py-2 bg-[#2A2A2A] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select an agent</option>
              <option value="gpt-4">GPT-4</option>
              <option value="claude">Claude</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Context
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full px-3 py-2 bg-[#2A2A2A] rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              placeholder="Describe your current work context..."
            />
            <button
              onClick={handleGenerateSuggestions}
              disabled={isProcessing || !selectedAgent}
              className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 rounded-md transition-colors"
            >
              {isProcessing ? 'Generating...' : 'Generate Task Suggestions'}
            </button>
          </div>

          {suggestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-300">Suggestions</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-3 bg-[#2A2A2A] rounded-md cursor-pointer hover:bg-[#333333] transition-colors"
                    onClick={() => onTaskSuggestion(suggestion)}
                  >
                    <div className="font-medium">{suggestion.title}</div>
                    <div className="text-sm text-gray-400 mt-1">
                      {suggestion.description}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-sm">
                      <span className={`px-2 py-0.5 rounded-full ${
                        suggestion.priority === 'high'
                          ? 'bg-red-900/50 text-red-200'
                          : suggestion.priority === 'medium'
                          ? 'bg-yellow-900/50 text-yellow-200'
                          : 'bg-green-900/50 text-green-200'
                      }`}>
                        {suggestion.priority}
                      </span>
                      <span className="text-gray-400">
                        ~{suggestion.estimatedTime} min
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTask && (
            <div className="space-y-4">
              <div className="border-t border-gray-700 pt-4">
                <h4 className="font-medium text-gray-300 mb-2">Selected Task Actions</h4>
                <div className="space-y-2">
                  <button
                    onClick={handleAnalyzeTask}
                    disabled={isProcessing || !selectedAgent}
                    className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 rounded-md transition-colors"
                  >
                    Analyze Progress
                  </button>
                  <button
                    onClick={handleGenerateSubtasks}
                    disabled={isProcessing || !selectedAgent}
                    className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 rounded-md transition-colors"
                  >
                    Generate Subtasks
                  </button>
                </div>
              </div>

              {analysis && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-300">Analysis</h4>
                  <div className="p-3 bg-[#2A2A2A] rounded-md space-y-3 max-h-60 overflow-y-auto">
                    <div>
                      <div className="text-sm font-medium text-gray-400">Progress</div>
                      <div>{analysis.progressAnalysis}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-400">Potential Blockers</div>
                      <ul className="list-disc list-inside">
                        {analysis.potentialBlockers.map((blocker: string, index: number) => (
                          <li key={index}>{blocker}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-400">Recommendations</div>
                      <ul className="list-disc list-inside">
                        {analysis.recommendations.map((rec: string, index: number) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-400">Estimated Time to Completion</div>
                      <div>{analysis.estimatedTimeToCompletion} minutes</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tasks.length > 1 && (
            <div className="border-t border-gray-700 pt-4">
              <button
                onClick={handleOptimizeOrder}
                disabled={isProcessing || !selectedAgent}
                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 rounded-md transition-colors"
              >
                Optimize Task Order
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAssistantPanel;
