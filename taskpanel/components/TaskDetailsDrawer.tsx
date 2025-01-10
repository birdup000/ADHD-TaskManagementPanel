import React, { useState } from 'react';
import SubtaskGenerator from './SubtaskGenerator';

export interface SubTask {
  id: number;
  title: string;
  description: string;
  estimatedTime: number;
  completed: boolean;
}

interface TaskDetailsDrawerProps {
  task: any;
  onClose: () => void;
  onUpdate?: (updatedTask: any) => void;
}

const identifyDependencies = async (title: string, description: string) => {
  // Placeholder for dependency identification logic
  console.log("Identifying dependencies for:", title, description);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return ["dependency 1", "dependency 2"];
};

const TaskDetailsDrawer: React.FC<TaskDetailsDrawerProps> = ({ task, onClose, onUpdate }) => {
  const [taskState, setTaskState] = useState(task);
  const [aiStatus, setAIStatus] = useState({ processing: false });
  const [error, setError] = useState<string | null>(null);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);

  const handleSubtasksGenerated = (newSubtasks: SubTask[]) => {
    const updatedTask = {
      ...taskState,
      subtasks: [...(taskState.subtasks || []), ...newSubtasks],
    };
    setTaskState(updatedTask);
    onUpdate?.(updatedTask);
    setSubtasks(updatedTask.subtasks || []);
  };

  const handleIdentifyDependencies = async () => {
    setAIStatus((prev) => ({ ...prev, processing: true }));
    try {
      const dependencies = await identifyDependencies(task.title, task.description || "");
      console.log("Dependencies identified:", dependencies);
    } catch (error) {
      console.error("Error identifying dependencies:", error);
      setError(String(error));
    }
    finally {
      setAIStatus((prev) => ({ ...prev, processing: false }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
      <div className="bg-background dark:bg-background rounded-lg p-6 max-w-md mx-auto mt-20">
        <h2 className="text-xl font-semibold mb-4">{taskState.title}</h2>
        <p className="text-muted-foreground mb-4">{taskState.description}</p>
        
        {/* AI Subtask Generator */}
        <div className="mb-6">
          <SubtaskGenerator
            task={taskState}
            onSubtasksGenerated={handleSubtasksGenerated}
          />
        </div>
        {aiStatus.processing && (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            Analyzing tasks...
          </div>
        )}
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {subtasks.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="font-medium">Generated Subtasks</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {subtasks.map((subtask, index) => (
                <div
                  key={index}
                  className="p-3 bg-background/50 rounded-lg border border-border/20"
                >
                  <div className="font-medium">{subtask.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {subtask.description}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Estimated Time: {subtask.estimatedTime} minutes
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={onClose}
          className="mt-6 bg-accent hover:bg-accent/80 text-background rounded-lg px-4 py-2 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default TaskDetailsDrawer;