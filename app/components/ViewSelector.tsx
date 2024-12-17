import React from 'react';
import { ViewType } from '../types/view';

interface ViewSelectorProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onTabChange: (tab: 'tasks' | 'notes') => void;
}

const ViewSelector: React.FC<ViewSelectorProps> = ({ currentView, onViewChange, onTabChange }) => {
  return (
    <div className="relative inline-block">
      <select
        value={currentView}
        onChange={(e) => {
          const newView = e.target.value as ViewType;
          onViewChange(newView);
          if (newView === 'notes') {
            onTabChange('notes');
          }
        }}
        className="block appearance-none w-full bg-[#2A2A2A] border border-gray-700 text-white py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:bg-[#333333] focus:border-gray-500"
      >
        <option value="board">Board</option>
        <option value="calendar">Calendar</option>
        <option value="notes">Notes</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
    </div>
  );
};

export default ViewSelector;
