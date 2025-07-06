"use client";

import React from 'react';
import { FixedSizeList } from 'react-window';
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
  onDragStart: (e: React.DragEvent<HTMLElement>, taskId: string) => void;
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
               focus-within:ring-offset-1 focus-within:ring-offset-bg-secondary group
               data-[dragging=true]:opacity-50 data-[dragging=true]:ring-2 data-[dragging=true]:ring-accent-primary"
      tabIndex={0}
      role="button"
      aria-label={`Task: ${task.title}, Priority: ${task.priority}, Status: ${columnLabel}`}
      aria-grabbed="false"
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
      onDrag={() => {
        const element = document.querySelector(`[data-task-id="${task.id}"]`);
        if (element) {
          element.setAttribute('aria-grabbed', 'true');
        }
      }}
      onDragEnd={() => {
        const element = document.querySelector(`[data-task-id="${task.id}"]`);
        if (element) {
          element.setAttribute('aria-grabbed', 'false');
        }
      }}
      data-task-id={task.id}
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
          
          {/* Due date & Recurrence Icon */}
          <div className="flex items-center gap-2 mt-1">
            {task.dueDate && (
              <div className="text-xs text-text-secondary flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Due {new Date(task.dueDate).toLocaleDateString()}
              </div>
            )}
            {task.isRecurring && (
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className={`w-3.5 h-3.5 text-text-secondary ${task.dueDate ? '' : 'ml-0'}`} // Adjust margin if no due date
                title="Recurring task"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"></path>
              </svg>
            )}
          </div>
          
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

  const handleDragStart = (e: React.DragEvent<HTMLElement>, taskId: string) => {
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

  const handleDrop = (e: React.DragEvent<HTMLElement>, status: Task['status']) => {
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
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 h-full min-w-full md:min-w-fit">
          {columns.map((column) => {
            const columnTasks = tasksByStatus[column.id] || [];
            return (
              <section
                key={column.id}
                className="flex-1 min-w-[280px] md:min-w-[320px] bg-bg-secondary rounded-lg p-4 md:p-6
                         border border-border-default shadow-sm
                         data-[drag-over=true]:bg-bg-tertiary data-[drag-over=true]:border-accent-primary"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id as Task['status'])}
                role="region"
                aria-label={`${column.label} column with ${columnTasks.length} tasks`}
                aria-dropeffect="move"
                data-drag-over="false"
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.currentTarget.setAttribute('data-drag-over', 'true');
                }}
                onDragExit={(e) => {
                  e.preventDefault();
                  e.currentTarget.setAttribute('data-drag-over', 'false');
                }}
              >
                <header className="flex items-center justify-between mb-6">
                  <h2 className="heading-tertiary">{column.label}</h2>
                  <span className="text-xs bg-bg-tertiary text-text-secondary px-2 py-1 rounded-full">
                    {columnTasks.length}
                  </span>
                </header>
                <div className="space-y-3 min-h-[200px]">
                  {columnTasks.length > 0 ? (
                    <FixedSizeList
                      height={Math.min(columnTasks.length * 120, 600)}
                      width="100%"
                      itemCount={columnTasks.length}
                      itemSize={120}
                      className="overflow-auto"
                    >
                      {({ index, style }) => {
                        const task = columnTasks[index];
                        return (
                          <div style={style}>
                            <TaskCard
                              key={task.id}
                              task={task}
                              columnId={column.id}
                              columnLabel={column.label}
                              onTaskSelect={onTaskSelect}
                              onTaskStatusChange={onTaskStatusChange}
                              onDragStart={handleDragStart}
                            />
                          </div>
                        );
                      }}
                    </FixedSizeList>
                  ) : null}
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