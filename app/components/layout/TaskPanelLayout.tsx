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
  const [isFocusMode, setIsFocusMode] = React.useState(false);

  // Update right panel state when visibility changes
  React.useEffect(() => {
    setIsRightPanelOpen(isRightPanelVisible);
  }, [isRightPanelVisible]);

  return (
    <div className={`flex h-[100dvh] bg-bg-primary text-text-primary overflow-hidden ${isFocusMode ? 'focus-mode' : ''}`} role="application" aria-label="Task management panel">
      {/* Mobile Navigation Toggle */}
      <div className="fixed top-4 left-4 md:hidden z-40">
        <button
          onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
          className="p-3 bg-bg-secondary rounded-md hover:bg-accent-muted border border-border-default
                   shadow-md focus:outline-none focus:ring-2 focus:ring-accent-focus focus:ring-offset-1 focus:ring-offset-bg-primary
                   transition-colors duration-200"
          aria-label={isLeftPanelOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isLeftPanelOpen}
          aria-controls="navigation-panel"
        >
          <svg
            className={`w-6 h-6 transition-transform duration-200 ${isLeftPanelOpen ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {isLeftPanelOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
      
      {/* Focus Mode Toggle */}
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={() => setIsFocusMode(!isFocusMode)}
          className="p-3 bg-bg-secondary rounded-md hover:bg-accent-muted border border-border-default
                   shadow-md focus:outline-none focus:ring-2 focus:ring-accent-focus focus:ring-offset-1 focus:ring-offset-bg-primary
                   transition-colors duration-200"
          aria-label={isFocusMode ? 'Exit focus mode' : 'Enter focus mode'}
          aria-pressed={isFocusMode}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {isFocusMode ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation Backdrop */}
      {isLeftPanelOpen && (
        <div
          className="fixed inset-0 bg-bg-overlay z-30 md:hidden animate-fade-in"
          onClick={() => setIsLeftPanelOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left Navigation Panel */}
      <nav
        id="navigation-panel"
        className={`fixed md:relative left-0 top-0 h-full bg-bg-secondary
                   w-80 md:w-72 lg:w-80 border-r border-border-default transform md:translate-x-0
                   panel-transition duration-300 ease-in-out z-30 md:z-10 ${
                     isLeftPanelOpen && !isFocusMode ? 'translate-x-0 shadow-xl md:shadow-none' : '-translate-x-full md:translate-x-0'
                   }`}
        role="navigation"
        aria-label="Main navigation"
        aria-hidden={!isLeftPanelOpen ? 'true' : 'false'}
      >
        <div className="h-full overflow-y-auto py-6 px-4 md:px-3">
          {leftPanel}
        </div>
        
        {/* Close button for mobile - better accessibility */}
        <button
          onClick={() => setIsLeftPanelOpen(false)}
          className="absolute top-4 right-4 md:hidden p-2 bg-bg-tertiary rounded-md hover:bg-accent-muted
                   focus:outline-none focus:ring-2 focus:ring-accent-focus transition-colors"
          aria-label="Close navigation panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </nav>

      {/* Main Task List Panel */}
      <main
        className={`flex-1 min-w-0 bg-bg-primary overflow-hidden transition-all duration-300
                   ${isRightPanelOpen && !isFocusMode ? 'md:mr-[400px] lg:mr-[420px]' : 'md:mr-0'}`}
        role="main"
        aria-label="Task list"
      >
        <div className="h-full overflow-y-auto pt-20 md:pt-6 px-4 md:px-6 flex flex-col">
          {mainPanel}
        </div>
      </main>

      {/* Right Detail Panel */}
      <aside
        className={`fixed right-0 top-0 h-full bg-bg-secondary
                   w-[90vw] max-w-[400px] md:w-[400px] lg:w-[420px]
                   border-l border-border-default transform panel-transition z-20
                   shadow-xl md:shadow-none ${
                     isRightPanelOpen && !isFocusMode ? 'translate-x-0' : 'translate-x-full'
                   }`}
        role="complementary"
        aria-label="Task details panel"
        aria-expanded={isRightPanelOpen}
        aria-hidden={!isRightPanelOpen}
      >
        <div className="h-full overflow-y-auto py-6 px-4 md:px-6">
          {rightPanel}
        </div>
        
        {/* Panel Toggle Button - Enhanced for accessibility */}
        <button
          onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
          className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2
                   bg-bg-secondary p-3 rounded-l-lg border-t border-b border-l border-border-default
                   flex items-center justify-center hover:bg-accent-muted transition-colors duration-200
                   focus:outline-none focus:ring-2 focus:ring-accent-focus focus:ring-offset-1 focus:ring-offset-bg-primary
                   shadow-md"
          aria-label={isRightPanelOpen ? 'Collapse task details panel' : 'Expand task details panel'}
          aria-expanded={isRightPanelOpen}
        >
          <svg
            className={`w-5 h-5 transition-transform duration-200 text-text-secondary ${
              isRightPanelOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </aside>
    </div>
  );
};

export default TaskPanelLayout;