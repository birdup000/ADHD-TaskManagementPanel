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
  const [isSmartListsCollapsed, setIsSmartListsCollapsed] = React.useState(false);
  const [isCategoriesCollapsed, setIsCategoriesCollapsed] = React.useState(false);
  const [isTagsCollapsed, setIsTagsCollapsed] = React.useState(true); // Tags collapsed by default for simplicity

  return (
    <nav className="h-full flex flex-col text-text-primary" role="navigation" aria-label="Task navigation">
      {/* Header */}
      <header className="mb-8 px-4 pt-2">
        <h1 className="heading-secondary">Tasks</h1>
      </header>

      {/* Smart Lists */}
      <section className="mb-8 px-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="label-secondary uppercase tracking-wide">Smart Lists</h2>
          <button
            onClick={() => setIsSmartListsCollapsed(!isSmartListsCollapsed)}
            className="p-1 rounded-md hover:bg-accent-muted focus:outline-none focus:ring-2 focus:ring-accent-focus"
            aria-label={isSmartListsCollapsed ? 'Expand Smart Lists' : 'Collapse Smart Lists'}
            aria-expanded={!isSmartListsCollapsed}
          >
            <svg
              className={`w-4 h-4 transition-transform ${isSmartListsCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        {!isSmartListsCollapsed && (
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
        )}
      </section>

      {/* Categories */}
      <section className="mb-8 px-4">
        <div className="flex justify-between items-center mb-4">
          {renderCategoryHeader ? (
            renderCategoryHeader()
          ) : (
            <h2 className="label-secondary uppercase tracking-wide">Categories</h2>
          )}
          <button
            onClick={() => setIsCategoriesCollapsed(!isCategoriesCollapsed)}
            className="p-1 rounded-md hover:bg-accent-muted focus:outline-none focus:ring-2 focus:ring-accent-focus"
            aria-label={isCategoriesCollapsed ? 'Expand Categories' : 'Collapse Categories'}
            aria-expanded={!isCategoriesCollapsed}
          >
            <svg
              className={`w-4 h-4 transition-transform ${isCategoriesCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        {!isCategoriesCollapsed && (
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
        )}
      </section>

      {/* Tags */}
      <section className="mb-8 px-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="label-secondary uppercase tracking-wide">Tags</h2>
          <div className="flex items-center gap-2">
            <button
              className="p-1 rounded-md hover:bg-accent-muted focus:outline-none focus:ring-2 focus:ring-accent-focus"
              aria-label="Customize navigation options"
              title="Customize navigation (feature coming soon)"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317C10.751 2.561 13.249 2.561 13.675 4.317C13.738 4.58 13.903 4.81 14.14 4.987C14.466 5.205 14.75 5.556 14.75 6V8.25M16.25 8.25C16.596 8.25 16.875 8.529 16.875 8.875C16.875 9.221 16.596 9.5 16.25 9.5H7.75C7.404 9.5 7.125 9.221 7.125 8.875C7.125 8.529 7.404 8.25 7.75 8.25H9.25M9.25 8.25V6C9.25 5.556 9.534 5.205 9.86 4.987C10.097 4.81 10.262 4.58 10.325 4.317M9.25 12.75H7.75C7.404 12.75 7.125 13.029 7.125 13.375C7.125 13.721 7.404 14 7.75 14H16.25C16.596 14 16.875 13.721 16.875 13.375C16.875 13.029 16.596 12.75 16.25 12.75H14.75M14.75 12.75V11C14.75 10.586 14.486 10.276 14.087 10.087C13.688 9.897 13.231 9.897 12.913 10.087C12.595 10.276 12.25 10.586 12.25 11V12.75M12.25 12.75H9.25M9.25 12.75V11C9.25 10.586 8.986 10.276 8.587 10.087C8.189 9.897 7.731 9.897 7.413 10.087C7.095 10.276 6.75 10.586 6.75 11V12.75M6.75 17.25H8.25C8.596 17.25 8.875 17.529 8.875 17.875C8.875 18.221 8.596 18.5 8.25 18.5H15.75C16.096 18.5 16.375 18.221 16.375 17.875C16.375 17.529 16.096 17.25 15.75 17.25H17.25C17.664 17.25 18 16.914 18 16.5C18 16.086 17.664 15.75 17.25 15.75H6.75C6.336 15.75 6 16.086 6 16.5C6 16.914 6.336 17.25 6.75 17.25Z" />
              </svg>
            </button>
            <button
              onClick={() => setIsTagsCollapsed(!isTagsCollapsed)}
              className="p-1 rounded-md hover:bg-accent-muted focus:outline-none focus:ring-2 focus:ring-accent-focus"
              aria-label={isTagsCollapsed ? 'Expand Tags' : 'Collapse Tags'}
              aria-expanded={!isTagsCollapsed}
            >
              <svg
                className={`w-4 h-4 transition-transform ${isTagsCollapsed ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
        {!isTagsCollapsed && (
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
        )}
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