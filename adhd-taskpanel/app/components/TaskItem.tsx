"use client";

import React from 'react';
import { FaCheck, FaRegCircle, FaClock, FaTrash, FaEdit } from 'react-icons/fa';
import type { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onDragStart?: (task: Task) => void;
  onDragEnd?: () => void;
  onDelete?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onToggleComplete?: (task: Task) => void;
}

export default React.forwardRef<HTMLDivElement, TaskItemProps>(
  function TaskItem({ task, onDragStart, onDragEnd, onDelete, onEdit, onToggleComplete }, ref) {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.isComplete;
    
    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete?.(task);
    };

    const handleEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit?.(task);
    };

    const handleToggleComplete = (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleComplete?.(task);
    };

    return (
      <div 
        ref={ref}
        className={`card group animate-slide-in
          ${task.isComplete ? 'opacity-75' : ''}
          ${isOverdue ? 'border-red-300 dark:border-red-700' : ''}`}
        draggable
        onDragStart={(e) => {
          e.preventDefault();
          onDragStart?.(task);
        }}
        onDragEnd={() => onDragEnd?.()}
        role="article"
        aria-label={`Task: ${task.task}`}
      >
        <div className="flex items-start gap-3">
          <button 
            onClick={handleToggleComplete}
            className={`mt-1 p-1.5 rounded-full transition-all duration-200
              ${task.isComplete 
                ? 'text-green-500 hover:text-green-600 bg-green-50 dark:bg-green-900/20' 
                : 'text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            aria-label={task.isComplete ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {task.isComplete ? <FaCheck size={14} /> : <FaRegCircle size={14} />}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <h3 className={`text-sm font-medium text-gray-900 dark:text-gray-100
                ${task.isComplete ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
                {task.task}
              </h3>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleEdit}
                  className="btn btn-ghost p-1"
                  aria-label="Edit task"
                >
                  <FaEdit size={14} />
                </button>
                <button
                  onClick={handleDelete}
                  className="btn btn-ghost p-1 hover:text-red-500 dark:hover:text-red-400"
                  aria-label="Delete task"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            </div>
            
            {task.description && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {task.description}
              </p>
            )}
            
            {task.dueDate && (
              <div className="mt-3 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full
                  ${isOverdue
                    ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                  <FaClock size={12} />
                  {new Date(task.dueDate).toISOString().split('T')[0]}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);