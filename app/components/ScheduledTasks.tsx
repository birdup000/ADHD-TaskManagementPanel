import React, { useState } from 'react';
import { Task } from '../types/task';

interface ScheduledTasksProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

// Ensure scheduledFor is treated as a Date when it exists
const ensureDateType = (date: Date | undefined): Date | undefined => {
  if (!date) return undefined;
  return date instanceof Date ? date : new Date(date);
};

const ScheduledTasks: React.FC<ScheduledTasksProps> = ({
  tasks,
  onTaskClick,
  onDeleteTask,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const scheduledTasks = tasks.filter(task => 
    task.status === 'todo' && 
    task.scheduledFor && 
    ensureDateType(task.scheduledFor)! > new Date()
  );

  if (scheduledTasks.length === 0) return null;

  return (
    <div className="mt-6 border-t border-[#444444] pt-4">
      <div 
        className="flex items-center gap-2 mb-4 cursor-pointer hover:text-gray-300 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transform transition-transform ${isOpen ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <h3 className="text-md font-medium text-gray-400">Scheduled Tasks</h3>
        <span className="text-sm text-gray-500">
          ({scheduledTasks.length})
        </span>
      </div>
      <div className={`transition-all duration-200 ${isOpen ? 'block' : 'hidden'}`}>
        <div className="space-y-2">
          {scheduledTasks.map((task) => (
            <div
              key={task.id}
              className="px-4 py-3 bg-[#333333] rounded-lg cursor-pointer hover:bg-[#444444] transition-colors"
              onClick={() => onTaskClick(task)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{task.title}</h4>
                  <div className="text-sm text-gray-400 mt-1">
                    Scheduled for: {ensureDateType(task.scheduledFor)!.toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTask(task);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduledTasks;
