"use client";

import React from 'react';
import { FaCheck, FaRegCircle } from 'react-icons/fa';

import type { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onDragStart?: (task: Task) => void;
  onDragEnd?: () => void;
}



export default React.forwardRef<HTMLDivElement, TaskItemProps>(function TaskItem({ task, onDragStart, onDragEnd }, ref) {
  return (
    <div 
      ref={ref}
      className={`group p-3 bg-white dark:bg-gray-800/50 rounded-lg
        border border-gray-200 dark:border-gray-700
        hover:shadow-sm dark:hover:border-gray-600 transition-all duration-200
        ${task.isComplete ? 'opacity-75' : ''}`}
      draggable
      onDragStart={(e) => {
        e.preventDefault();
        onDragStart?.(task);
      }}
      onDragEnd={() => onDragEnd?.()}
    >
      <div className="flex items-start gap-3">
        <button 
          className={`mt-1 p-1 rounded-full transition-colors
            ${task.isComplete 
              ? 'text-green-500 hover:text-green-600' 
              : 'text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400'
            }`}
        >
          {task.isComplete ? <FaCheck size={12} /> : <FaRegCircle size={12} />}
        </button>
        
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-medium text-gray-900 dark:text-gray-100 truncate
            ${task.isComplete ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
            {task.task}
          </h3>
          
          {task.description && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {task.description}
            </p>
          )}
          
          {task.dueDate && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 
                text-gray-600 dark:text-gray-300">
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});