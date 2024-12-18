import React from 'react';
import { Task } from '../types/task';

interface TaskSelectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  excludeTaskIds?: string[];
}

const TaskSelectDialog: React.FC<TaskSelectDialogProps> = ({
  isOpen,
  onClose,
  tasks,
  onSelectTask,
  excludeTaskIds = [],
}) => {
  if (!isOpen) return null;

  const availableTasks = tasks.filter(task => !excludeTaskIds.includes(task.id));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#212121] p-6 rounded-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Select Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ×
          </button>
        </div>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {availableTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No available tasks to link</p>
            </div>
          ) : (
            availableTasks.map(task => (
              <div
                key={task.id}
                onClick={() => {
                  onSelectTask(task);
                  onClose();
                }}
                className="p-3 rounded-lg cursor-pointer hover:bg-[#333333]"
              >
                <div className="font-medium">{task.title}</div>
                <div className="text-sm text-gray-400 truncate">
                  {task.description || 'No description'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskSelectDialog;
