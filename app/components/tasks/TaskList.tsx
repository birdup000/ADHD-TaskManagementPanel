"use client";

import React from 'react';
import { Task } from '../../types/task';
import TaskContextMenu from './TaskContextMenu';

interface TaskListProps {
  tasks: Task[];
  onTaskSelect: (taskId: string) => void;
  onTaskStatusChange: (taskId: string, status: Task['status']) => void;
  selectedTaskId?: string | null; // Added to highlight the selected task
  onNewTask?: () => void;
  onTaskDelete?: (taskId: string) => void;
}

const getPriorityColor = (priority: Task['priority']) => {
  const colors = {
    high: 'bg-priority-high',
    medium: 'bg-priority-medium',
    low: 'bg-priority-low'
  };
  return colors[priority];
};

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskSelect,
  onTaskStatusChange,
  selectedTaskId: currentSelectedTaskId, // Renamed prop to avoid conflict with local state
  onNewTask,
  onTaskDelete,
}) => {
  const [sortBy, setSortBy] = React.useState('priority');
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [viewMode, setViewMode] = React.useState<'list' | 'grid' | 'compact'>('list');
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [contextMenuTaskId, setContextMenuTaskId] = React.useState<string | null>(null); // For context menu
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<HTMLElement | null>(null);

  // Filter and sort tasks
  // Use useMemo to optimize filtering and sorting for large datasets
  const filteredTasks = React.useMemo(() => {
    return tasks.filter(task => {
      if (filterStatus === 'all') return true;
      return task.status === filterStatus;
    }).filter(task => {
      if (!searchQuery) return true;
      return task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             task.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    });
  }, [tasks, filterStatus, searchQuery]);

  // Sort tasks with useMemo for performance
  const sortedTasks = React.useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }, [filteredTasks, sortBy]);

  const handleMenuOpen = (event: React.MouseEvent, taskId: string) => {
    event.stopPropagation();
    setContextMenuTaskId(taskId);
    setMenuAnchorEl(event.currentTarget as HTMLElement);
    setMenuOpen(true);
  };

  const handleMenuClose = () => {
    setMenuOpen(false);
    setContextMenuTaskId(null);
    setMenuAnchorEl(null);
  };

  return (
    <div className="h-full flex flex-col min-h-0" role="region" aria-label="Task list" id="task-content">
      {/* Header with improved hierarchy and accessibility */}
      <header className="sticky top-0 bg-bg-primary px-6 py-5 border-b border-border-default z-10 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="heading-secondary">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'Task' : 'Tasks'}
            </h1>
            {searchQuery && (
              <span className="text-sm text-text-tertiary bg-bg-tertiary px-2 py-1 rounded-md">
                filtered by &ldquo;{searchQuery}&rdquo;
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onNewTask}
              className="btn-primary btn-md flex items-center gap-2 shadow-sm"
              aria-label="Create new task"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Task
            </button>
            
            {/* View Mode Toggle */}
            <div className="flex items-center bg-bg-tertiary rounded-lg p-1 border border-border-default" role="tablist" aria-label="View mode">
              <button
                className={`p-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-focus
                         ${viewMode === 'grid'
                           ? 'bg-accent-primary text-text-onAccent shadow-sm'
                           : 'text-text-secondary hover:bg-accent-muted hover:text-text-primary'
                         }`}
                onClick={() => setViewMode('grid')}
                role="tab"
                aria-selected={viewMode === 'grid'}
                aria-label="Switch to grid view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                className={`p-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-focus
                         ${viewMode === 'list'
                           ? 'bg-accent-primary text-text-onAccent shadow-sm'
                           : 'text-text-secondary hover:bg-accent-muted hover:text-text-primary'
                         }`}
                onClick={() => setViewMode('list')}
                role="tab"
                aria-selected={viewMode === 'list'}
                aria-label="Switch to list view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                className={`p-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-focus
                         ${viewMode === 'compact'
                           ? 'bg-accent-primary text-text-onAccent shadow-sm'
                           : 'text-text-secondary hover:bg-accent-muted hover:text-text-primary'
                         }`}
                onClick={() => setViewMode('compact')}
                role="tab"
                aria-selected={viewMode === 'compact'}
                aria-label="Switch to compact view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters - Enhanced for accessibility */}
        <section className="flex flex-col sm:flex-row gap-4 sm:items-center" role="search" aria-label="Task search and filters">
          <div className="relative flex-1">
            <label htmlFor="task-search" className="sr-only">Search tasks</label>
            <input
              id="task-search"
              type="text"
              placeholder="Search tasks by title, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base w-full pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-accent-focus"
              aria-describedby="search-help"
            />
            <svg
              className="absolute left-3 top-3.5 w-4 h-4 text-text-secondary pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p id="search-help" className="sr-only">
              Search across task titles, descriptions, and tags to quickly find specific tasks
            </p>
          </div>
          
          <div className="flex gap-3 flex-wrap sm:flex-nowrap">
            <div className="min-w-0">
              <label htmlFor="sort-select" className="sr-only">Sort tasks</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-base px-3 py-3 text-sm focus:ring-2 focus:ring-accent-focus min-w-[140px] cursor-pointer"
                aria-label="Sort tasks by"
              >
                <option value="priority">Sort by Priority</option>
                <option value="dueDate">Sort by Due Date</option>
                <option value="title">Sort by Title</option>
              </select>
            </div>
            
            <div className="min-w-0">
              <label htmlFor="filter-select" className="sr-only">Filter tasks</label>
              <select
                id="filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-base px-3 py-3 text-sm focus:ring-2 focus:ring-accent-focus min-w-[120px] cursor-pointer"
                aria-label="Filter tasks by status"
              >
                <option value="all">All Tasks</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </section>
      </header>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        {sortedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p className="text-lg mb-2">No tasks found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2'
              : viewMode === 'compact'
                ? 'space-y-1'
                : 'space-y-2'
          }>
            {sortedTasks.map((task) => (
              viewMode === 'compact' ? (
                <div
                  key={task.id}
                  className={`group flex items-center gap-3 p-2 rounded-lg transition-all duration-200 cursor-pointer
                           border hover:border-accent-primary
                           ${task.status === 'completed' ? 'opacity-60 bg-bg-tertiary border-border-default' : 'bg-bg-secondary border-border-default'}
                           ${currentSelectedTaskId === task.id ? 'bg-accent-muted border-accent-primary shadow-md' : ''}
                           `}
                  onClick={() => onTaskSelect(task.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Task: ${task.title}, Status: ${task.status}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onTaskSelect(task.id);
                    }
                  }}
                >
                  {/* Checkbox */}
                  <button
                    className={`w-4 h-4 rounded-full border-2 border-border-default flex items-center justify-center
                            hover:border-accent-primary transition-colors duration-200
                            ${task.status === 'completed' ? 'bg-priority-completed' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskStatusChange(
                        task.id,
                        task.status === 'completed' ? 'todo' : 'completed'
                      );
                    }}
                  >
                    {task.status === 'completed' && (
                      <svg className="w-2.5 h-2.5 text-text-primary" viewBox="0 0 12 12">
                        <path
                          d="M3.5 6L5 7.5L8.5 4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Priority Indicator */}
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />

                  {/* Recurrence Icon for Compact View */}
                  {task.isRecurring && (
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      className="w-3 h-3 text-text-secondary"
                      title="Recurring task"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"></path>
                    </svg>
                  )}

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-medium truncate ${
                      task.status === 'completed' ? 'line-through text-text-secondary' : ''
                    }`}>
                      {task.title}
                    </h3>
                  </div>

                  {/* Actions */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
                    <button
                      onClick={(e) => handleMenuOpen(e, task.id)}
                      className="p-1 hover:bg-hover rounded-md text-text-secondary
                               hover:text-text-primary transition-colors duration-200"
                      aria-label="Task options"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  key={task.id}
                  className={`group flex items-start gap-4 p-4 rounded-lg transition-all duration-200 cursor-pointer
                           border hover:border-accent-primary
                           ${task.status === 'completed' ? 'opacity-60 bg-bg-tertiary border-border-default' : 'bg-bg-secondary border-border-default'}
                           ${currentSelectedTaskId === task.id ? 'bg-accent-muted border-accent-primary shadow-lg' : ''}
                           `}
                  onClick={() => onTaskSelect(task.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Task: ${task.title}, Status: ${task.status}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onTaskSelect(task.id);
                    }
                  }}
                >
                  {/* Checkbox */}
                  <button
                    className={`w-5 h-5 rounded-full border-2 border-border-default flex items-center justify-center
                            hover:border-accent-primary transition-colors duration-200
                            ${task.status === 'completed' ? 'bg-priority-completed' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskStatusChange(
                        task.id,
                        task.status === 'completed' ? 'todo' : 'completed'
                      );
                    }}
                  >
                    {task.status === 'completed' && (
                      <svg className="w-3 h-3 text-text-primary" viewBox="0 0 12 12">
                        <path
                          d="M3.5 6L5 7.5L8.5 4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Priority Indicator */}
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)} mt-1`} />

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-base font-medium truncate ${
                      task.status === 'completed' ? 'line-through text-text-secondary' : ''
                    }`}>
                      {task.title}
                    </h3>
                    
                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {task.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full bg-bg-tertiary text-xs truncate"
                          >
                            {tag}
                          </span>
                        ))}
                        {task.tags.length > 3 && (
                          <span className="text-xs text-text-secondary">+{task.tags.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Due Date & Recurrence Icon for List/Grid View */}
                    {task.dueDate && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-text-secondary">
                          Due {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                        {task.isRecurring && (
                           <svg
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                            className="w-3.5 h-3.5 text-text-secondary"
                            title="Recurring task"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"></path>
                          </svg>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
                    <button
                      onClick={(e) => handleMenuOpen(e, task.id)}
                      className="p-2 hover:bg-hover rounded-md text-text-secondary
                               hover:text-text-primary transition-colors duration-200"
                      aria-label="Task options"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
        
        {/* Context Menu */}
        <TaskContextMenu
          isOpen={menuOpen}
          onClose={handleMenuClose}
          anchorEl={menuAnchorEl}
          task={tasks.find(t => t.id === contextMenuTaskId)} // Pass the specific task for context
          onDelete={() => {
            if (contextMenuTaskId && onTaskDelete) {
              onTaskDelete(contextMenuTaskId);
            }
            handleMenuClose(); // Ensure menu closes after action
          }}
          onDuplicate={() => {
            // Implement duplicate logic here or call a prop
            alert(`Duplicate task: ${contextMenuTaskId}`);
            handleMenuClose();
          }}
          onCopyLink={() => {
            // Implement copy link logic
            navigator.clipboard.writeText(`${window.location.origin}/task/${contextMenuTaskId}`);
            alert(`Link copied for task: ${contextMenuTaskId}`);
            handleMenuClose();
          }}
        />
      </div>

      {/* Task Count Summary */}
      <div className="px-6 py-3 border-t border-border-default bg-bg-secondary">
        <div className="flex justify-between text-sm font-medium text-text-secondary">
          <span>{sortedTasks.length} tasks</span>
          <span>{tasks.filter(t => t.status === 'completed').length} completed</span>
        </div>
      </div>
    </div>
  );
};

export default TaskList;