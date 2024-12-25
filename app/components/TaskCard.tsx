"use client";

import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import TaskActions from './TaskActions';
import { Task } from '../types/task';
import { Collaborator } from '../types/collaboration';
import { handleGenerateSubtasks } from '../utils/agixt';

export interface TaskCardProps {
  task?: Task;
  index?: number;
  onClick?: () => void;
  onDelete?: () => void;
  onUpdateTask?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, index = 0, onClick, onDelete, onUpdateTask }) => {
  const [agixtError, setAgixtError] = useState<string | null>(null);

  if (!task) {
    return null;
  }
  const { title, description, priority, status, dueDate, tags = [], assignees = [], subtasks = [], createdAt, updatedAt, listId, progress } = task;
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

  const toggleSubtask = (index: number) => {
    const updatedSubtasks = subtasks.map((st, i) =>
      i === index ? { ...st, completed: !st.completed } : st
    );
    onUpdateTask?.({ ...task, subtasks: updatedSubtasks });
  };

  const handleGenerateSubtasksClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const agixtApiUri = localStorage.getItem('agixtapi') || '';
    const agixtApiKey = localStorage.getItem('agixtkey') || '';
    const selectedAgent = localStorage.getItem('selectedAgent') || 'OpenAI';
    if (agixtApiUri && agixtApiKey && selectedAgent && task) {
      const updatedTask = await handleGenerateSubtasks(task, selectedAgent, agixtApiUri, agixtApiKey);
      if (updatedTask) {
        onUpdateTask?.(updatedTask);
      }
    } else {
      setAgixtError("AGiXT API URI, API Key, or agent not set.");
    }
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-[#333333] border-l-4 p-4 rounded-lg hover:bg-[#383838] transition-colors cursor-pointer ${statusColors[status]} ${isOverdue ? 'ring-2 ring-red-500/50' : ''} ${task.recurring && status === 'done' ? 'opacity-75' : ''}`}
          onClick={onClick}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className={task.recurring && status === 'done' ? 'line-through text-gray-400' : ''}>
                {title}
                {task.recurring && status === 'done' && (
                  <span className="ml-2 text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded">
                    ✓ Completed
                  </span>
                )}
              </span>
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
              {subtasks && subtasks.length > 0 && (
                <span className="text-xs bg-gray-500/20 text-gray-300 px-2 py-0.5 rounded" title="Has subtasks">
                  Subtasks
                </span>
              )}
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`${priorityColors[priority]} px-2 py-1 rounded text-xs text-white flex items-center gap-1`}>
                {priorityIcons[priority]} {priority}
              </span>
              {task.collaborators?.length > 0 && (
                <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs flex items-center gap-1">
                  👥 {task.collaborators.length}
                </span>
              )}
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
                  onUpdateTask?.({ ...task, status: nextStatus, title, createdAt, updatedAt, listId });
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
              <button
                onClick={handleGenerateSubtasksClick}
                className="ml-2 text-gray-400 hover:text-blue-400 p-1 rounded hover:bg-blue-400/10"
                title="Generate Subtasks"
              >
                ✨
              </button>
              {agixtError && (
                <span className="text-red-500 text-xs ml-2">{agixtError}</span>
              )}
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
              Due: {new Date(dueDate).toLocaleDateString()}
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
          {progress >= 0 && (
            <div className="mb-2">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <span>Progress:</span>
                <div className="w-32 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span>{progress}%</span>
              </div>
            </div>
          )}
          {subtasks && subtasks.length > 0 && (
            <div className="mb-2">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <span>Subtasks:</span>
                <div className="w-32 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{
                      width: `${
                        (subtasks.filter((s: { completed: boolean }) => s.completed)
                          .length /
                          subtasks.length) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <span>
                  {subtasks.filter((s: { completed: boolean }) => s.completed).length}
                  /{subtasks.length}
                </span>
              </div>
              <div className="flex flex-col gap-1 mt-1">
                {subtasks.map((st, index) => (
                  <div
                    key={index}
                    className="px-2 py-1 bg-[#444444] rounded-md text-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => toggleSubtask(index)}
                        className="rounded-sm text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <span>{st.title}</span>
                    </div>
                  </div>
                ))}
              </div>
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
      )}
    </Draggable>
  );
};
