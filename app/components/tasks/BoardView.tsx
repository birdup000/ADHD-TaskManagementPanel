"use client";

import React from 'react';
import { Task } from '../../types/task';

interface BoardViewProps {
  tasks: Task[];
  onTaskSelect: (taskId: string) => void;
  onTaskStatusChange: (taskId: string, status: Task['status']) => void;
}

interface TaskCardProps {
  task: Task;
  columnId: string;
  columnLabel: string;
  onTaskSelect: (taskId: string) => void;
  onTaskStatusChange: (taskId: string, status: Task['status']) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  columnId,
  columnLabel,
  onTaskSelect,
  onTaskStatusChange,
  onDragStart,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const hasDescription = task.description && task.description.length > 0;
  const showExpandButton = hasDescription || (task.tags && task.tags.length > 3);

  return (
    <article
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onTaskSelect(task.id)}
      className="card-interactive p-4 lg:p-5 transition-all duration-200
               hover:shadow-lg focus-within:ring-2 focus-within:ring-accent-focus
               focus-within:ring-offset-1 focus-within:ring-offset-bg-secondary group"
      tabIndex={0}
      role="button"
      aria-label={`Task: ${task.title}, Priority: ${task.priority}, Status: ${columnLabel}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onTaskSelect(task.id);
        } else if (e.key === 'ArrowLeft' && columnId !== 'todo') {
          e.preventDefault();
          const newStatus = columnId === 'in_progress' ? 'todo' : 'in_progress';
          onTaskStatusChange(task.id, newStatus as Task['status']);
        } else if (e.key === 'ArrowRight' && columnId !== 'completed') {
          e.preventDefault();
          const newStatus = columnId === 'todo' ? 'in_progress' : 'completed';
          onTaskStatusChange(task.id, newStatus as Task['status']);
        }
      }}
    >
      <div className="flex items-start gap-3">
        <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
          task.priority === 'high' ? 'bg-priority-high' :
          task.priority === 'medium' ? 'bg-priority-medium' :
          'bg-priority-low'
        }`}
        aria-label={`${task.priority} priority`}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-text-primary mb-2 leading-tight">
            {task.title}
          </h3>
          
          {/* Description - expandable */}
          {hasDescription && (
            <div className={`text-sm text-text-secondary mb-3 leading-relaxed ${
              isExpanded ? '' : 'line-clamp-2'
            }`}>
              {task.description}
            </div>
          )}
          
          {/* Tags - show first 3, expand for more */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {task.tags.slice(0, isExpanded ? task.tags.length : 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 rounded-md bg-bg-primary text-xs text-text-secondary
                           border border-border-default"
                  title={tag}
                >
                  {tag}
                </span>
              ))}
              {!isExpanded && task.tags.length > 3 && (
                <span className="px-2 py-1 rounded-md bg-bg-primary text-xs text-text-tertiary">
                  +{task.tags.length - 3} more
                </span>
              )}
            </div>
          )}
          
          {/* Due date */}
          {task.dueDate && (
            <div className="text-xs text-text-secondary flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Due {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
          
          {/* Expand/Collapse button */}
          {showExpandButton && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="mt-2 text-xs text-accent-primary hover:text-accent-primaryHover
                       focus:outline-none focus:ring-1 focus:ring-accent-focus rounded px-1"
              aria-label={isExpanded ? 'Show less' : 'Show more'}
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

const BoardView: React.FC<BoardViewProps> = ({
  tasks,
  onTaskSelect,
  onTaskStatusChange,
}) => {
  const columns = [
    { id: 'todo', label: 'To Do' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
  ];

  const tasksByStatus = tasks.reduce((acc, task) => {
    if (!acc[task.status]) {
      acc[task.status] = [];
    }
    acc[task.status].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-bg-tertiary');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-bg-tertiary');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: Task['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    onTaskStatusChange(taskId, status);
  };

  return (
    <div className="h-full flex flex-col bg-bg-primary" role="main" aria-label="Kanban board view">
      {/* Board Header - Improved hierarchy */}
      <header className="p-6 border-b border-border-default bg-bg-primary">
        <div className="flex items-center justify-between">
          <h1 className="heading-secondary">Board View</h1>
          <div className="text-sm text-text-secondary">
            Drag tasks between columns or use arrow keys to change status
          </div>
        </div>
      </header>

      {/* Board Columns - Enhanced responsiveness */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full min-w-full lg:min-w-fit">
          {columns.map((column) => {
            const columnTasks = tasksByStatus[column.id] || [];
            return (
              <section
                key={column.id}
                className="flex-1 min-w-[280px] lg:min-w-[320px] bg-bg-secondary rounded-lg p-4 lg:p-6
                         border border-border-default shadow-sm"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id as Task['status'])}
                role="region"
                aria-label={`${column.label} column with ${columnTasks.length} tasks`}
              >
                <header className="flex items-center justify-between mb-6">
                  <h2 className="heading-tertiary">{column.label}</h2>
                  <span className="text-xs bg-bg-tertiary text-text-secondary px-2 py-1 rounded-full">
                    {columnTasks.length}
                  </span>
                </header>
                <div className="space-y-3 min-h-[200px]">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    columnId={column.id}
                    columnLabel={column.label}
                    onTaskSelect={onTaskSelect}
                    onTaskStatusChange={onTaskStatusChange}
                    onDragStart={handleDragStart}
                  />
                ))}
              </div>
            </section>
          );
          })}
        </div>
      </div>
    </div>
  );
};

export default BoardView;