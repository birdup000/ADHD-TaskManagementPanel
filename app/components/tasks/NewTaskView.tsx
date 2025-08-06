"use client";

import React, { useEffect, useState } from 'react';
import { Task } from '../../types/task';
// import { User } from '../../types/user'; // Assuming a User type might be needed later
import { useTasks } from '../../hooks/useTasks'; // To interact with tasks

// Placeholder for sub-components that will be created in later steps
import TaskHeader from './TaskHeader';
import TaskDescription from './TaskDescription';
import SubTasksList from './SubTasksList';
import TaskComments from './TaskComments';
// import TaskAssignment from './TaskAssignment'; // TaskAssignment is now part of TaskAttributesSidebar
import TaskAttributesSidebar from './TaskAttributesSidebar';

interface NewTaskViewProps {
  taskId: string | null;
  onClose: () => void;
}

const NewTaskView: React.FC<NewTaskViewProps> = ({ taskId, onClose }) => {
  const { tasks, updateTask } = useTasks();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Ref for the main scrollable container to manage focus and scroll for navigation.
  const mainContentRef = React.useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (taskId) {
      setLoading(true);
      setError(null);
      const currentTask = tasks.find(t => t.id === taskId);
      if (currentTask) {
        setTask(currentTask);
        // Focus the main content area when a new task is loaded for keyboard navigation
        mainContentRef.current?.focus();
      } else {
        setError('Task not found.');
      }
      setLoading(false);
    } else {
      setTask(null);
    }
  }, [taskId, tasks]);

  const handleUpdateTask = async (updatedFields: Partial<Task>) => {
    if (task) {
      const updatedTaskData = { ...task, ...updatedFields };
      // Optimistic update
      setTask(updatedTaskData);
      try {
        await updateTask(updatedTaskData);
        // Optionally re-fetch or confirm save
      } catch {
        setError('Failed to update task.');
        // Revert optimistic update if necessary
        setTask(tasks.find(t => t.id === task.id) || null);
      }
    }
  };

  // Keyboard navigation handler
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!mainContentRef.current) return;

    // Using J for down, K for up (like Vim)
    // This is a basic implementation. A more robust solution would involve
    // identifying focusable elements within sections and moving between them.
    if (event.key === 'j') {
      event.preventDefault();
      mainContentRef.current.scrollBy({ top: 100, behavior: 'smooth' }); // Scroll down
    } else if (event.key === 'k') {
      event.preventDefault();
      mainContentRef.current.scrollBy({ top: -100, behavior: 'smooth' }); // Scroll up
    } else if (event.key === 'Escape') {
        // Check if any input/textarea is focused, if so, let them handle Esc first (e.g. to blur)
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
            (activeElement as HTMLElement).blur();
        } else {
            onClose(); // Close panel if no input is focused
        }
    }
    // Other shortcuts can be added here:
    // 'e' to edit description/title, 'c' to comment, etc.
  };

  if (!taskId) {
    return null; // Or a message indicating no task is selected
  }

  if (loading) {
    return <div className="p-6 text-center">Loading task details...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  if (!task) {
    return <div className="p-6 text-center">Select a task to view its details.</div>;
  }

  return (
    // Add onKeyDown to the outermost div of the task view that should capture these events.
    // It might be better on the `main` element if the sidebar shouldn't capture these.
    <div
      className="flex flex-col md:flex-row h-full bg-bg-primary text-text-primary focus:outline-none"  // Added focus:outline-none
      role="main"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      ref={mainContentRef}
    >
      {/* Main Content Area (Left/Center) */}
      <div className="flex-1 flex flex-col min-w-0 max-h-full"> {/* Ensure max-h-full for proper scrolling */}
        <TaskHeader task={task} onUpdateTask={handleUpdateTask} onClosePanel={onClose} />

        <main
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 divide-y divide-border-default/50 focus:outline-none custom-scrollbar" // Softer divider, custom scrollbar
        >
          <TaskDescription task={task} onUpdateTask={handleUpdateTask} />
          <SubTasksList parentTask={task} onUpdateParentTask={handleUpdateTask} />
          <TaskComments taskId={task.id} currentUser={{id: 'user-1', name: 'Current User', avatarUrl: 'https://i.pravatar.cc/150?u=current'}} />
        </main>

        {/* Removed redundant Quick Actions bar, as they are now contextual */}
      </div>

      {/* Attributes Sidebar (Right) */}
      <TaskAttributesSidebar task={task} onUpdateTask={handleUpdateTask} />
      {/*
        Original structure idea:
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            <TaskDescription task={task} onUpdateTask={handleUpdateTask} />
            <SubTasksList task={task} onUpdateTask={handleUpdateTask} />
            <TaskComments taskId={task.id} />
          </main>
          <TaskAttributesSidebar task={task} onUpdateTask={handleUpdateTask} />
        </div>
        // Quick actions could be part of the header or a separate bar
      */}
    </div>
  );
};

export default NewTaskView;
