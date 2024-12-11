import React from 'react';

type ViewType = 'kanban' | 'list' | 'calendar';

interface ViewSelectorProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const ViewSelector: React.FC<ViewSelectorProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="flex bg-[#2A2A2A] rounded-lg p-1">
      <button
        onClick={() => onViewChange('kanban')}
        className={`px-3 py-1.5 rounded text-sm transition-colors ${
          currentView === 'kanban'
            ? 'bg-indigo-600 text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        📊 Kanban
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`px-3 py-1.5 rounded text-sm transition-colors ${
          currentView === 'list'
            ? 'bg-indigo-600 text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        📝 List
      </button>
      <button
        onClick={() => onViewChange('calendar')}
        className={`px-3 py-1.5 rounded text-sm transition-colors ${
          currentView === 'calendar'
            ? 'bg-indigo-600 text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        📅 Calendar
      </button>
    </div>
  );
};

export default ViewSelector;