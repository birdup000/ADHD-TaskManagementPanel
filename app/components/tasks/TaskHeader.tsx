"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Task } from '../../types/task';
import { debounce } from 'lodash';

interface TaskHeaderProps {
  task: Task;
  onUpdateTask: (updatedFields: Partial<Task>) => Promise<void>;
  onClosePanel?: () => void; // Optional: if a close button is part of the header
}

const TaskHeader: React.FC<TaskHeaderProps> = ({ task, onUpdateTask, onClosePanel }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(task.title);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

  useEffect(() => {
    setCurrentTitle(task.title);
  }, [task.title]);

  const debouncedUpdateTitle = useCallback(
    debounce(async (newTitle: string) => {
      if (newTitle.trim() && newTitle.trim() !== task.title) {
        await onUpdateTask({ title: newTitle.trim() });
      }
    }, 500),
    [task.title, onUpdateTask]
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTitle(e.target.value);
    debouncedUpdateTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (currentTitle.trim() === '') {
      setCurrentTitle(task.title); // Reset if title is empty
    } else if (currentTitle.trim() !== task.title) {
      debouncedUpdateTitle.flush();
    }
  };

  const handleCheckboxChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = e.target.checked ? 'completed' : 'todo';
    const newProgress = e.target.checked ? 100 : (task.progress === 100 ? 0 : task.progress);
    await onUpdateTask({ status: newStatus, progress: newProgress });
  };

  const toggleHeaderCollapse = () => {
    setIsHeaderCollapsed(!isHeaderCollapsed);
  };

  // This scroll detection logic is simplified.
  // A more robust implementation would use a ref on the NewTaskView's scrollable content area.
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50 && !isHeaderCollapsed) {
        // This is a simplified example. In a real app, this would be tied to the scrollable container of the task view itself.
        // setIsHeaderCollapsed(true);
      } else if (window.scrollY <= 50 && isHeaderCollapsed) {
        // setIsHeaderCollapsed(false);
      }
    };
    // Assuming the task view itself is scrollable, listen on that element
    // For now, using window scroll as a placeholder
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHeaderCollapsed]);


  return (
    <header className={`p-4 md:p-6 border-b border-border-default bg-bg-secondary sticky top-0 z-10 transition-all duration-300 ${isHeaderCollapsed ? 'py-2 shadow-md' : 'py-4'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative">
              <input
                type="checkbox"
                id={`task-complete-${task.id}`}
                checked={task.status === 'completed'}
                onChange={handleCheckboxChange}
                className="opacity-0 absolute h-6 w-6 md:h-7 md:w-7 cursor-pointer" // Hidden but focusable
                aria-label={`Mark task ${task.title} as complete`}
              />
              <div className={`h-6 w-6 md:h-7 md:w-7 flex items-center justify-center rounded-md border-2 transition-all duration-150
                ${task.status === 'completed' ? 'bg-accent-primary border-accent-primary' : 'border-border-light hover:border-accent-primary'}
                cursor-pointer group-focus-within:ring-2 group-focus-within:ring-accent-focus group-focus-within:ring-offset-2 group-focus-within:ring-offset-bg-secondary`}
                onClick={() => document.getElementById(`task-complete-${task.id}`)?.click()} // Click the hidden checkbox
              >
                {task.status === 'completed' && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5 text-text-onAccent">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>

          {isEditingTitle ? (
            <input
              type="text"
              value={currentTitle}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') e.currentTarget.blur();}}
              className="heading-secondary bg-transparent border-b-2 border-accent-primary focus:outline-none flex-1 min-w-0 py-1"
              autoFocus
              aria-label="Task title input"
            />
          ) : (
            <h1
              id="task-view-title"
              className={`heading-secondary truncate cursor-text hover:text-accent-primaryHover transition-colors ${isHeaderCollapsed ? 'text-lg md:text-xl' : ''}`}
              onClick={() => setIsEditingTitle(true)}
              title={task.title} // Accessibility: shows full title on hover if truncated
            >
              {task.title}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleHeaderCollapse}
            className="p-2 rounded-md hover:bg-bg-tertiary text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-focus"
            aria-label={isHeaderCollapsed ? "Expand header" : "Collapse header"}
            title={isHeaderCollapsed ? "Expand header (Chevron)" : "Collapse header (Chevron)"}
            aria-expanded={!isHeaderCollapsed}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 transition-transform duration-200 ${isHeaderCollapsed ? '' : 'rotate-180'}`}> {/* Adjusted rotation for typical chevron */}
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </button>
          <button
            onClick={() => alert("Link task clicked - implement linking functionality.")}
            className="p-2 rounded-md hover:bg-bg-tertiary text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-focus"
            aria-label="Link task"
            title="Link task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
          </button>
          {onClosePanel && (
             <button
                onClick={onClosePanel}
                className="p-2 rounded-md hover:bg-bg-tertiary text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-focus"
                aria-label="Close task view"
                title="Close task view"
              >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Collapsible content - for demonstration, actual content might differ */}
      {!isHeaderCollapsed && task.category && (
        <div className="mt-2 md:mt-3 pl-8 md:pl-10">
          <span className="text-xs px-2 py-1 bg-accent-muted text-accent-primary rounded-full">
            Category: {task.category} {/* Assuming category is a string ID, fetch actual name if needed */}
          </span>
        </div>
      )}
    </header>
  );
};

export default TaskHeader;
