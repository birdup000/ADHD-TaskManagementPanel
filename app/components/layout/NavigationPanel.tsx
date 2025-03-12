"use client";

import React from 'react';

interface NavItem {
  id: string;
  label: string;
  icon?: string;
  count?: number;
}

interface NavigationPanelProps {
  categories: NavItem[];
  smartLists: NavItem[];
  tags: NavItem[];
  activeSmartList?: string;
  activeCategory?: string;
  activeTag?: string;
  activeView?: string;
  onSmartListClick?: (id: string) => void;
  onCategoryClick?: (id: string) => void;
  onTagClick?: (id: string) => void;
  renderCategoryHeader?: () => React.ReactNode;
  onViewChange?: (view: 'list' | 'board' | 'calendar') => void;
}

const NavigationPanel: React.FC<NavigationPanelProps> = ({
  categories,
  smartLists,
  tags,
  activeSmartList,
  activeCategory,
  activeTag,
  activeView = 'list',
  renderCategoryHeader,
  onSmartListClick = () => {},
  onCategoryClick = () => {},
  onTagClick = () => {},
  onViewChange = () => {},
}) => {
  return (
    <nav className="h-full flex flex-col text-text-primary">
      {/* Header */}
      <div className="mb-6 px-4">
        <h1 className="text-xl font-semibold text-text-primary">Tasks</h1>
      </div>

      {/* Smart Lists */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-text-secondary mb-2">SMART LISTS</h2>
        <ul className="space-y-1">
          {smartLists.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onSmartListClick(item.id)}
                className={`w-full text-left px-4 py-2.5 rounded-md hover:bg-hover 
                         flex items-center justify-between transition-colors duration-200
                         ${activeSmartList === item.id ? 'bg-accent-primary bg-opacity-10' : ''}`}
              >
                <span>{item.label}</span>
                {item.count && (
                  <span className="text-xs font-medium text-text-secondary">{item.count}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Categories */}
      <div className="mb-8">
        {renderCategoryHeader ? renderCategoryHeader() : <h2 className="text-sm font-medium text-text-secondary mb-2">CATEGORIES</h2>}
        <ul className="space-y-1">
          {categories.map((category) => (
            <li key={category.id}>
              <button
                onClick={() => onCategoryClick(category.id)}
                className={`w-full text-left px-4 py-2.5 rounded-md hover:bg-hover 
                         flex items-center justify-between transition-colors duration-200
                         ${activeCategory === category.id ? 'bg-accent-primary bg-opacity-10' : ''}`}
              >
                <span>{category.label}</span>
                {category.count && (
                  <span className="text-xs font-medium text-text-secondary">{category.count}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Tags */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-text-secondary mb-2">TAGS</h2>
        <div className="flex flex-wrap gap-2 px-4">
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => onTagClick(tag.id)}
              className={`px-3 py-1.5 rounded-full text-xs hover:bg-accent-primary 
                       hover:bg-opacity-10 transition-colors duration-200
                       ${activeTag === tag.id ? 'bg-accent-primary bg-opacity-10' : 'bg-bg-tertiary'}`}
            >
              <span className="flex items-center gap-2">
                {tag.label}
                {tag.count && <span className="text-text-secondary text-xs ml-1">({tag.count})</span>}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* View Options */}
      <div className="mt-auto px-4 pb-4">
        <h2 className="text-sm font-medium text-text-secondary mb-2">VIEW</h2>
        <div className="bg-bg-tertiary rounded-md p-2 flex gap-2">
          <button
            onClick={() => onViewChange('list')}
            className={`flex-1 px-3 py-2.5 rounded text-sm font-medium ${
              activeView === 'list' ? 'bg-accent-primary text-white' : 'hover:bg-hover'
            }`}
            aria-label="List view"
          >
            List
          </button>
          <button
            onClick={() => onViewChange('board')}
            className={`flex-1 px-3 py-2.5 rounded text-sm font-medium ${
              activeView === 'board' ? 'bg-accent-primary text-white' : 'hover:bg-hover'
            }`}
            aria-label="Board view"
          >
            Board
          </button>
          <button
            onClick={() => onViewChange('calendar')}
            className={`flex-1 px-3 py-2.5 rounded text-sm font-medium ${
              activeView === 'calendar' ? 'bg-accent-primary text-white' : 'hover:bg-hover'
            }`}
            aria-label="Calendar view"
          >
            Calendar
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavigationPanel;