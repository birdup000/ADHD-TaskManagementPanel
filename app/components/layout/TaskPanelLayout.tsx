"use client";

import React, { ReactNode } from 'react';

interface TaskPanelLayoutProps {
  leftPanel: ReactNode;
  mainPanel: ReactNode;
  rightPanel: ReactNode;
  isRightPanelVisible?: boolean;
}

const TaskPanelLayout: React.FC<TaskPanelLayoutProps> = ({
  leftPanel,
  mainPanel,
  rightPanel,
  isRightPanelVisible = false,
}) => {
  const [isLeftPanelOpen, setIsLeftPanelOpen] = React.useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = React.useState(false);

  // Update right panel state when visibility changes
  React.useEffect(() => {
    setIsRightPanelOpen(isRightPanelVisible);
  }, [isRightPanelVisible]);

  return (
    <div className="flex h-[100dvh] bg-bg-primary text-text-primary overflow-hidden">
      {/* Mobile Navigation Toggle */}
      <div className="fixed top-4 left-4 md:hidden z-30 ml-2">
        <button
          onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
          className="p-2 bg-bg-secondary rounded-md hover:bg-hover border border-border-default"
          aria-label={isLeftPanelOpen ? 'Close navigation' : 'Open navigation'}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Left Navigation Panel */}
      <div
        className={`fixed md:relative left-0 top-0 h-full bg-bg-secondary md:block
                   w-64 md:w-72 border-r border-border-default transform md:translate-x-0
                   panel-transition z-20 ${
                     isLeftPanelOpen ? 'translate-x-0 shadow-lg md:shadow-none' : '-translate-x-full md:translate-x-0'
                   }`}
      >
        <div className="h-full overflow-y-auto py-4 px-2">
          {leftPanel}
        </div>
      </div>

      {/* Main Task List Panel */}
      <div className={`flex-1 min-w-0 bg-bg-primary overflow-hidden transition-all duration-300 
                     ${isRightPanelOpen ? 'md:mr-[380px]' : 'md:mr-0'}`}
      >
        <div className="h-full overflow-y-auto pt-16 md:pt-4 px-4 flex flex-col">
          {mainPanel}
        </div>
      </div>

      {/* Right Detail Panel */}
      <div
        className={`fixed right-0 top-0 h-full bg-bg-secondary
                   w-[320px] max-w-[85vw] md:w-[380px] border-l border-border-default
                   transform panel-transition z-20 shadow-lg md:shadow-none
                   ${isRightPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="h-full overflow-y-auto py-4 px-2">
          {rightPanel}
        </div>
        {/* Panel Toggle Button */}
        <button
          onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
          className="absolute left-0 top-1/2 -translate-x-full transform bg-bg-secondary p-2 rounded-l-md 
                   border-t border-b border-l border-border-default hidden items-center justify-center hover:bg-hover"
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

      {/* Backdrop for mobile navigation */}
      {isLeftPanelOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden panel-transition"
          onClick={() => setIsLeftPanelOpen(false)}
        />
      )}
    </div>
  );
};

export default TaskPanelLayout;