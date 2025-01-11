import React from 'react';
import { useAISubtaskGenerator } from '../hooks/useAISubtaskGenerator';
import { SubTask } from '../types/SubTask';

interface SubtaskGeneratorProps {
  task: {
    id: string;
    title: string;
    description: string;
    priority?: string;
    dueDate?: Date;
  };
  onSubtasksGenerated: (subtasks: SubTask[]) => void;
}

export default function SubtaskGenerator({ task, onSubtasksGenerated }: SubtaskGeneratorProps) {
  const { generateSubtasks, loading, error } = useAISubtaskGenerator();

  const handleGenerateSubtasks = async () => {
    const generatedSubtasks = await generateSubtasks(
      task.title,
      task.description,
      task.dueDate?.toISOString(),
      task.priority,
      ''
    );

    if (generatedSubtasks) {
      onSubtasksGenerated(generatedSubtasks);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={handleGenerateSubtasks}
          disabled={loading}
          className="ai-button ai-button-primary w-full"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating Subtasks...
            </div>
          ) : (
            'Generate AI Subtasks'
          )}
        </button>
      </div>
      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
}