"use client";

import React from 'react';
import { Task } from '../../types/task';

interface TaskListProps {
  tasks: Task[];
  onTaskSelect: (taskId: string) => void;
  onTaskStatusChange: (taskId: string, status: Task['status']) => void;
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
}) => {
  const [sortBy, setSortBy] = React.useState('priority');
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [viewMode, setViewMode] = React.useState<'list' | 'grid'>('list');

  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
    if (filterStatus === 'all') return true;
    return task.status === filterStatus;
  }).filter(task => {
    if (!searchQuery) return true;
    return task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           task.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
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

  return (
    <div className="h-full flex flex-col">
      {/* Header with search, sorting and view options */}
      <div className="sticky top-0 bg-bg-primary p-4 border-b border-border-default z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{`${filteredTasks.length} ${
            filteredTasks.length === 1 ? 'Task' : 'Tasks'
          }`}</h2>
          <div className="flex items-center gap-2">
            <button 
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-hover' : 'hover:bg-hover'}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button 
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-hover' : 'hover:bg-hover'}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-bg-tertiary text-text-primary border border-border-default rounded-md 
                       pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-accent-primary"
            />
            <svg
              className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-bg-tertiary text-text-primary border border-border-default rounded-md 
                       px-3 py-2 text-sm focus:outline-none focus:border-accent-primary"
            >
              <option value="priority">Sort by Priority</option>
              <option value="dueDate">Sort by Due Date</option>
              <option value="title">Sort by Title</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-bg-tertiary text-text-primary border border-border-default rounded-md 
                       px-3 py-2 text-sm focus:outline-none focus:border-accent-primary"
            >
              <option value="all">All Tasks</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4">
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
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}>
            {sortedTasks.map((task) => (
              <div
                key={task.id}
                className={`group flex items-center gap-4 p-4 rounded-lg bg-bg-secondary 
                         hover:bg-bg-tertiary transition-colors duration-200 cursor-pointer
                         ${task.status === 'completed' ? 'opacity-60' : ''}`}
                onClick={() => onTaskSelect(task.id)}
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
                <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  <h3 className={`text-base font-medium truncate ${
                    task.status === 'completed' ? 'line-through' : ''
                  }`}>
                    {task.title}
                  </h3>
                  
                  {/* Tags */}
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {task.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-bg-tertiary text-xs truncate"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Due Date */}
                  {task.dueDate && (
                    <span className="text-sm text-text-secondary block mt-1">
                      Due {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
                  <button
                    className="p-2 hover:bg-hover rounded-md text-text-secondary 
                             hover:text-text-primary transition-colors duration-200"
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
            ))}
          </div>
        )}
      </div>

      {/* Task Count Summary */}
      <div className="p-4 border-t border-border-default">
        <div className="flex justify-between text-sm text-text-secondary">
          <span>{sortedTasks.length} tasks</span>
          <span>{tasks.filter(t => t.status === 'completed').length} completed</span>
        </div>
      </div>
    </div>
  );
};

export default TaskList;