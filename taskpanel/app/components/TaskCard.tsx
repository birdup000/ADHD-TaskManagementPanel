"use client";

import React from 'react';
import TaskActions from './TaskActions';
import { Task } from '../types/task';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onDelete?: () => void;
  onUpdateTask?: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, onDelete, onUpdateTask }) => {
  const { title, description, priority, status, dueDate, tags = [], assignees = [] } = task;
  const isOverdue = dueDate && new Date(dueDate) < new Date() && status !== 'done';

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDelete?.();
  };

type StatusColors = {
  [key in Task['status']]: string;
};

const statusColors: StatusColors = {
    todo: 'border-l-gray-400',
    'in-progress': 'border-l-blue-400',
    done: 'border-l-green-400',
  };

type PriorityColors = {
  [key in Task['priority']]: string;
};

const priorityColors: PriorityColors = {
    low: 'bg-green-600',
    medium: 'bg-yellow-600',
    high: 'bg-red-600',
  };

  const priorityIcons = {
    low: '🟢',
    medium: '🟡',
    high: '🔴',
  };

  return (
    <div
      className={`bg-[#333333] border-l-4 p-4 rounded-lg hover:bg-[#383838] transition-colors cursor-pointer ${statusColors[status]} ${isOverdue ? 'ring-2 ring-red-500/50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          {title}
          {task.dependsOn && task.dependsOn.length > 0 && (
            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded" title="Has dependencies">
              🔗 {task.dependsOn.length}
            </span>
          )}
          {task.category && (
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
              📂 {task.category}
            </span>
          )}
        </h3>
        <div className="flex items-center space-x-2">
          <span className={`${priorityColors[priority]} px-2 py-1 rounded text-xs text-white flex items-center gap-1`}>
            {priorityIcons[priority]} {priority}
          </span>
          {task.recurring && (
            <span className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded text-xs flex items-center gap-1">
              🔄 {task.recurring.frequency}
            </span>
          )}
          <button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              const nextStatus = status === 'todo' 
                ? 'in-progress' 
                : status === 'in-progress' 
                  ? 'done' 
                  : 'todo';
              onUpdateTask?.({ ...task, status: nextStatus });
            }}
            className={`p-1.5 rounded transition-colors ${
              status === 'done'
                ? 'bg-green-600/20 text-green-400'
                : status === 'in-progress'
                ? 'bg-blue-600/20 text-blue-400'
                : 'bg-gray-600/20 text-gray-400'
            } hover:bg-opacity-30`}
            title={status === 'todo' 
              ? 'Start task' 
              : status === 'in-progress'
                ? 'Complete task'
                : 'Reopen task'
            }
          >
            {status === 'done' 
              ? '✓' 
              : status === 'in-progress'
                ? '►'
                : '○'
            }
          </button>
          <TaskActions
            task={task}
            onUpdateTask={(task: Task) => onUpdateTask?.(task)}
            onDelete={() => onDelete?.()}
          />
        </div>
        {onDelete && (
          <button
            onClick={handleDelete}
            className="ml-2 text-gray-400 hover:text-red-400 p-1 rounded hover:bg-red-400/10"
            title="Delete task"
          >
            ✕
          </button>
        )}
      </div>
      <p className="text-gray-300 text-sm mb-3">{description}</p>
      {dueDate && (
        <div className="text-xs text-gray-400 mb-2">
          Due: {dueDate.toLocaleDateString()}
        </div>
      )}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-indigo-600/30 text-indigo-200 px-2 py-0.5 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <span>Subtasks:</span>
          <div className="w-32 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{
                width: `${(task.subtasks.filter((s: { completed: boolean }) => s.completed).length / task.subtasks.length) * 100}%`
              }}
            />
          </div>
          <span>{task.subtasks.filter((s: { completed: boolean }) => s.completed).length}/{task.subtasks.length}</span>
        </div>
      )}
      {assignees.length > 0 && (
        <div className="flex -space-x-2">
          {assignees.map((assignee) => (
            <div
              key={assignee}
              className="w-6 h-6 rounded-full bg-gray-500 border-2 border-[#333333] flex items-center justify-center text-xs text-white"
              title={assignee}
            >
              {assignee[0]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskCard;