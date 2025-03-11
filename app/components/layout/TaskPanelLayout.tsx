"use client";

import React, { ReactNode } from 'react';

interface TaskPanelLayoutProps {
  leftPanel: ReactNode;
  mainPanel: ReactNode;
  rightPanel: ReactNode;
}

const TaskPanelLayout: React.FC<TaskPanelLayoutProps> = ({
  leftPanel,
  mainPanel,
  rightPanel,
}) => {
  return (
    <div className="flex h-screen bg-bg-primary text-text-primary">
      {/* Left Navigation Panel */}
      <div className="w-panel-left min-w-[250px] border-r border-border-default bg-bg-secondary">
        {leftPanel}
      </div>

      {/* Main Task List Panel */}
      <div className="w-panel-main flex-1 min-w-[400px] bg-bg-primary overflow-y-auto">
        {mainPanel}
      </div>

      {/* Right Detail Panel */}
      <div className="w-panel-right min-w-[300px] border-l border-border-default bg-bg-secondary">
        {rightPanel}
      </div>

      {/* Floating Action Button for Quick Add */}
      <button
        className="fixed right-6 bottom-6 w-14 h-14 rounded-full bg-accent-primary text-white shadow-lg 
                   flex items-center justify-center hover:bg-opacity-90 transition-all duration-200"
        aria-label="Quick add task"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
    </div>
  );
};

export default TaskPanelLayout;