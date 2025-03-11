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
  const [isRightPanelOpen, setIsRightPanelOpen] = React.useState(true);

  return (
    <div className="flex h-screen bg-bg-primary text-text-primary">
      {/* Left Navigation Panel - Collapsible on mobile */}
      <div className="hidden md:block w-panel-left min-w-[250px] max-w-[300px] border-r border-border-default bg-bg-secondary">
        {leftPanel}
      </div>

      {/* Main Task List Panel */}
      <div className="w-panel-main flex-1 min-w-[320px] bg-bg-primary overflow-y-auto">
        <div className="sticky top-0 z-10 md:hidden bg-bg-secondary p-4 border-b border-border-default">
          <button className="p-2 hover:bg-hover rounded-md">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        {mainPanel}
      </div>

      {/* Right Detail Panel - Collapsible */}
      <div className={`fixed md:relative right-0 top-0 h-full w-full md:w-panel-right 
                      min-w-[300px] max-w-[450px] border-l border-border-default bg-bg-secondary
                      transform transition-transform duration-300 ease-in-out shadow-lg md:shadow-none
                      ${isRightPanelOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0 md:w-0 md:min-w-0'}`}>
        <div className="h-full">
          {rightPanel}
        </div>
        {/* Panel Toggle Button */}
        <button
          onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
          className="absolute left-0 top-1/2 -translate-x-full transform bg-bg-secondary 
                     p-2 rounded-l-md border-t border-b border-l border-border-default
                     hidden md:flex items-center justify-center hover:bg-hover"
          aria-label={isRightPanelOpen ? 'Collapse panel' : 'Expand panel'}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isRightPanelOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Floating Action Button for Quick Add - Responsive positioning */}
      <button
        className="fixed right-4 md:right-6 bottom-4 md:bottom-6 w-12 md:w-14 h-12 md:h-14 
                   rounded-full bg-accent-primary text-white shadow-lg flex items-center 
                   justify-center hover:bg-opacity-90 transition-all duration-200 z-20"
        aria-label="Quick add task"
      >
        <svg
          className="w-5 h-5 md:w-6 md:h-6"
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