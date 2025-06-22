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
    <nav className="h-full flex flex-col text-text-primary" role="navigation" aria-label="Task navigation">
      {/* Header */}
      <header className="mb-8 px-4 pt-2">
        <h1 className="heading-secondary">Tasks</h1>
      </header>

      {/* Smart Lists */}
      <section className="mb-8 px-4">
        <h2 className="label-secondary uppercase tracking-wide mb-4">Smart Lists</h2>
        <ul className="space-y-1" role="menu" aria-label="Smart lists">
          {smartLists.map((item) => (
            <li key={item.id} role="none">
              <button
                onClick={() => onSmartListClick(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg hover:bg-accent-muted
                         flex items-center justify-between transition-colors duration-200
                         focus:outline-none focus:ring-2 focus:ring-accent-focus focus:ring-offset-1 focus:ring-offset-bg-secondary
                         ${activeSmartList === item.id
                           ? 'bg-accent-primary bg-opacity-20 text-accent-primary font-medium border border-accent-primary border-opacity-30'
                           : 'text-text-primary hover:text-text-primary'
                         }`}
                role="menuitem"
                aria-current={activeSmartList === item.id ? 'page' : undefined}
              >
                <span className="font-medium">{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activeSmartList === item.id
                      ? 'bg-accent-primary text-text-onAccent'
                      : 'bg-bg-tertiary text-text-secondary'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Categories */}
      <section className="mb-8 px-4">
        {renderCategoryHeader ? (
          renderCategoryHeader()
        ) : (
          <h2 className="label-secondary uppercase tracking-wide mb-4">Categories</h2>
        )}
        <ul className="space-y-1" role="menu" aria-label="Categories">
          {categories.map((category) => (
            <li key={category.id} role="none">
              <button
                onClick={() => onCategoryClick(category.id)}
                className={`w-full text-left px-4 py-3 rounded-lg hover:bg-accent-muted
                         flex items-center justify-between transition-colors duration-200
                         focus:outline-none focus:ring-2 focus:ring-accent-focus focus:ring-offset-1 focus:ring-offset-bg-secondary
                         ${activeCategory === category.id
                           ? 'bg-accent-primary bg-opacity-20 text-accent-primary font-medium border border-accent-primary border-opacity-30'
                           : 'text-text-primary hover:text-text-primary'
                         }`}
                role="menuitem"
                aria-current={activeCategory === category.id ? 'page' : undefined}
              >
                <span className="font-medium">{category.label}</span>
                {category.count !== undefined && category.count > 0 && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activeCategory === category.id
                      ? 'bg-accent-primary text-text-onAccent'
                      : 'bg-bg-tertiary text-text-secondary'
                  }`}>
                    {category.count}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Tags */}
      <section className="mb-8 px-4">
        <h2 className="label-secondary uppercase tracking-wide mb-4">Tags</h2>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Tag filters">
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => onTagClick(tag.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                       focus:outline-none focus:ring-2 focus:ring-accent-focus focus:ring-offset-1 focus:ring-offset-bg-secondary
                       ${activeTag === tag.id
                         ? 'bg-accent-primary text-text-onAccent shadow-sm'
                         : 'bg-bg-tertiary text-text-secondary hover:bg-accent-muted hover:text-text-primary border border-border-default'
                       }`}
              aria-pressed={activeTag === tag.id}
            >
              <span className="flex items-center gap-2">
                {tag.label}
                {tag.count !== undefined && tag.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    activeTag === tag.id
                      ? 'bg-white bg-opacity-20'
                      : 'bg-bg-primary text-text-tertiary'
                  }`}>
                    {tag.count}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* View Options */}
      <section className="mt-auto px-4 pb-6">
        <h2 className="label-secondary uppercase tracking-wide mb-4">View</h2>
        <div className="bg-bg-tertiary rounded-lg p-1 border border-border-default" role="tablist" aria-label="View options">
          <button
            onClick={() => onViewChange('list')}
            className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-colors duration-200
                     focus:outline-none focus:ring-2 focus:ring-accent-focus focus:ring-offset-1 focus:ring-offset-bg-tertiary
                     ${activeView === 'list'
                       ? 'bg-accent-primary text-text-onAccent shadow-sm'
                       : 'text-text-secondary hover:bg-accent-muted hover:text-text-primary'
                     }`}
            role="tab"
            aria-selected={activeView === 'list'}
            aria-controls="task-content"
            aria-label="Switch to list view"
          >
            List
          </button>
          <button
            onClick={() => onViewChange('board')}
            className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-colors duration-200
                     focus:outline-none focus:ring-2 focus:ring-accent-focus focus:ring-offset-1 focus:ring-offset-bg-tertiary
                     ${activeView === 'board'
                       ? 'bg-accent-primary text-text-onAccent shadow-sm'
                       : 'text-text-secondary hover:bg-accent-muted hover:text-text-primary'
                     }`}
            role="tab"
            aria-selected={activeView === 'board'}
            aria-controls="task-content"
            aria-label="Switch to board view"
          >
            Board
          </button>
          <button
            onClick={() => onViewChange('calendar')}
            className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-colors duration-200
                     focus:outline-none focus:ring-2 focus:ring-accent-focus focus:ring-offset-1 focus:ring-offset-bg-tertiary
                     ${activeView === 'calendar'
                       ? 'bg-accent-primary text-text-onAccent shadow-sm'
                       : 'text-text-secondary hover:bg-accent-muted hover:text-text-primary'
                     }`}
            role="tab"
            aria-selected={activeView === 'calendar'}
            aria-controls="task-content"
            aria-label="Switch to calendar view"
          >
            Calendar
          </button>
        </div>
      </section>
    </nav>
  );
};

export default NavigationPanel;