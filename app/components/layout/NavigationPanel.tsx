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
}

const NavigationPanel: React.FC<NavigationPanelProps> = ({
  categories,
  smartLists,
  tags,
}) => {
  return (
    <nav className="h-full flex flex-col p-4 text-text-primary">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-text-primary">Tasks</h1>
      </div>

      {/* Smart Lists */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-text-secondary mb-2">SMART LISTS</h2>
        <ul className="space-y-1">
          {smartLists.map((item) => (
            <li key={item.id}>
              <button
                className="w-full text-left px-3 py-2 rounded-md hover:bg-hover 
                         flex items-center justify-between transition-colors duration-200"
              >
                <span>{item.label}</span>
                {item.count && (
                  <span className="text-xs text-text-secondary">{item.count}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-text-secondary mb-2">CATEGORIES</h2>
        <ul className="space-y-1">
          {categories.map((category) => (
            <li key={category.id}>
              <button
                className="w-full text-left px-3 py-2 rounded-md hover:bg-hover 
                         flex items-center justify-between transition-colors duration-200"
              >
                <span>{category.label}</span>
                {category.count && (
                  <span className="text-xs text-text-secondary">{category.count}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Tags */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-text-secondary mb-2">TAGS</h2>
        <div className="flex flex-wrap gap-2 px-3">
          {tags.map((tag) => (
            <button
              key={tag.id}
              className="px-3 py-1 rounded-full text-xs bg-bg-tertiary hover:bg-accent-primary 
                       hover:bg-opacity-10 transition-colors duration-200"
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* View Options */}
      <div className="mt-auto">
        <h2 className="text-sm font-medium text-text-secondary mb-2">VIEW</h2>
        <div className="bg-bg-tertiary rounded-md p-2 flex gap-2">
          <button
            className="flex-1 px-3 py-2 rounded bg-accent-primary text-white text-sm"
            aria-label="List view"
          >
            List
          </button>
          <button
            className="flex-1 px-3 py-2 rounded hover:bg-hover text-sm"
            aria-label="Board view"
          >
            Board
          </button>
          <button
            className="flex-1 px-3 py-2 rounded hover:bg-hover text-sm"
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