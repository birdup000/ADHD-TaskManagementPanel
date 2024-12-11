import React from 'react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: 'dueDate' | 'priority' | 'title';
  onSortChange: (sort: 'dueDate' | 'priority' | 'title') => void;
  filterPriority: 'all' | 'high' | 'medium' | 'low';
  onFilterChange: (priority: 'all' | 'high' | 'medium' | 'low') => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  filterPriority,
  onFilterChange,
}) => {
  return (
    <div className="flex flex-wrap gap-4 mb-6 p-4 bg-[#2A2A2A] rounded-lg">
      <div className="flex-1 min-w-[200px]">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks..."
          className="w-full px-4 py-2 bg-[#333333] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 relative group"
          title="Press Ctrl+K to focus search"
        />
      </div>
      
      <div className="flex gap-4">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as any)}
          className="px-4 py-2 bg-[#333333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="dueDate">Sort by Due Date</option>
          <option value="priority">Sort by Priority</option>
          <option value="title">Sort by Title</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => onFilterChange(e.target.value as any)}
          className="px-4 py-2 bg-[#333333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>
      </div>
    </div>
  );
};

export default SearchBar;