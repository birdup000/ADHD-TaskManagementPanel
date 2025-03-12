"use client";

import React from 'react';
import TaskPanelLayout from './components/layout/TaskPanelLayout';
import NavigationPanel from './components/layout/NavigationPanel';
import TaskList from './components/tasks/TaskList';
import BoardView from './components/tasks/BoardView';
import CalendarView from './components/tasks/CalendarView';
import TaskDetailPanel from './components/tasks/TaskDetailPanel';
import { Task } from './types/task';
import { useNavigation } from './hooks/useNavigation';
import { useSearchParams } from 'next/navigation';

// Sample data
const sampleTasks: Task[] = [
  {
    id: '4',
    title: 'Buy groceries',
    priority: 'medium',
    status: 'todo',
    dueDate: new Date().toISOString().split('T')[0], // Today
    category: 'Personal',
    tags: ['Priority'],
  },
  {
    id: '1',
    title: 'Complete project documentation',
    priority: 'high',
    status: 'todo',
    dueDate: '2025-03-15',
    category: 'Work',
    tags: ['Documentation', 'Priority'],
  },
  {
    id: '2',
    title: 'Review pull requests',
    priority: 'medium',
    status: 'in_progress',
    dueDate: '2025-03-12',
    category: 'Work',
    tags: ['Code Review'],
  },
  {
    id: '3',
    title: 'Update dependencies',
    priority: 'low',
    status: 'completed',
    dueDate: '2025-03-10',
    category: 'Maintenance',
    tags: ['Maintenance'],
  },
];

const sampleNavItems = {
  smartLists: [
    { id: 'all', label: 'All Tasks', count: 0 },
    { id: 'today', label: 'Today', count: 0 },
    { id: 'upcoming', label: 'Upcoming', count: 0 },
    { id: 'priority', label: 'Priority', count: 0 },
  ],
  categories: [
    { id: 'Work', label: 'Work', count: 8 },
    { id: 'Personal', label: 'Personal', count: 4 },
    { id: 'Learning', label: 'Learning', count: 6 },
  ],
  tags: [
    { id: 'Documentation', label: 'Documentation' },
    { id: 'Code Review', label: 'Code Review' },
    { id: 'Maintenance', label: 'Maintenance' },
    { id: 'Priority', label: 'Priority' },
  ],
};

type ViewMode = 'list' | 'board' | 'calendar';

export default function Home() {
  const searchParams = useSearchParams();
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);
  const {
    currentView,
    handleSmartListClick,
    handleCategoryClick,
    handleTagClick,
    handleViewChange,
  } = useNavigation();

  // Filter tasks based on URL parameters
  // Update navigation item counts based on tasks
  const navItemsWithCounts = React.useMemo(() => {
    const today = new Date();
    const inOneWeek = new Date();
    inOneWeek.setDate(today.getDate() + 7);
    
    return {
      ...sampleNavItems,
      smartLists: sampleNavItems.smartLists.map(item => ({
        ...item,
        count: sampleTasks.filter(task => {
          switch (item.id) {
            case 'all':
              return true;
            case 'today':
              return new Date(task.dueDate).toDateString() === today.toDateString();
            case 'upcoming':
              const dueDate = new Date(task.dueDate);
              return dueDate > today && dueDate <= inOneWeek;
            case 'priority':
              return task.priority === 'high';
            default:
              return false;
          }
        }).length
      })),
      categories: sampleNavItems.categories.map(category => ({
        ...category,
        count: sampleTasks.filter(task => task.category === category.id).length
      })),
      tags: sampleNavItems.tags.map(tag => ({
        ...tag,
        count: sampleTasks.filter(task => task.tags?.includes(tag.id)).length
      }))
    };
  }, [sampleTasks]);

  const filteredTasks = React.useMemo(() => {
    const smartList = searchParams.get('smartList');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');

    return sampleTasks.filter(task => {
      if (smartList) {
        switch (smartList) {
          case 'today':
            return new Date(task.dueDate).toDateString() === new Date().toDateString();
          case 'upcoming':
            const dueDate = new Date(task.dueDate);
            const today = new Date();
            const inOneWeek = new Date();
            inOneWeek.setDate(today.getDate() + 7);
            return dueDate > today && dueDate <= inOneWeek;
          case 'priority':
            return task.priority === 'high';
          case 'all':
            return true;
          default:
            return false;
        }
      }
      if (category && task.category !== category) return false;
      if (tag && !task.tags?.includes(tag)) return false;
      return true;
    });
  }, [searchParams, sampleTasks]);

  const selectedTask = React.useMemo(() => {
    if (!selectedTaskId) return null;
    return sampleTasks.find(task => task.id === selectedTaskId) || null;
  }, [selectedTaskId]);

  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const handleTaskStatusChange = (taskId: string, status: Task['status']) => {
    // In a real app, this would update the backend
    console.log('Updating task status:', taskId, status);
  };

  const handleTaskSave = (task: Task) => {
    // In a real app, this would update the backend
    console.log('Saving task:', task);
  };

  return (
    <main className="h-screen">
      <TaskPanelLayout
        leftPanel={
          <NavigationPanel
            categories={navItemsWithCounts.categories}
            smartLists={navItemsWithCounts.smartLists}
            tags={navItemsWithCounts.tags}
            activeSmartList={searchParams.get('smartList') || undefined}
            activeCategory={searchParams.get('category') || undefined}
            activeTag={searchParams.get('tag') || undefined}
            activeView={currentView}
            onSmartListClick={handleSmartListClick}
            onCategoryClick={handleCategoryClick}
            onTagClick={handleTagClick}
            onViewChange={handleViewChange}
          />
        }
        mainPanel={
          <div className="h-full flex flex-col">
            {/* View Mode Selector */}
            <div className="p-4 border-b border-border-default">
              {/* Header */}
              <div className="mb-4">
                {/* Show current filter */}
                {(searchParams.get('smartList') || searchParams.get('category') || searchParams.get('tag')) && (
                  <div className="flex items-center gap-4 text-sm text-text-secondary mb-2">
                    {searchParams.get('smartList') && (
                      <div className="flex items-center gap-2">
                        <span>Smart List: {navItemsWithCounts.smartLists.find(item => item.id === searchParams.get('smartList'))?.label}</span>
                        <button
                          onClick={() => handleSmartListClick(searchParams.get('smartList')!)}
                          className="p-1 hover:bg-hover rounded-md"
                          aria-label="Clear smart list filter"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                    {searchParams.get('category') && (
                      <div className="flex items-center gap-2">
                        <span>Category: {navItemsWithCounts.categories.find(item => item.id === searchParams.get('category'))?.label}</span>
                        <button
                          onClick={() => handleCategoryClick(searchParams.get('category')!)}
                          className="p-1 hover:bg-hover rounded-md"
                          aria-label="Clear category filter"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                    {searchParams.get('tag') && (
                      <div className="flex items-center gap-2">
                        <span>Tag: {navItemsWithCounts.tags.find(item => item.id === searchParams.get('tag'))?.label}</span>
                        <button
                          onClick={() => handleTagClick(searchParams.get('tag')!)}
                          className="p-1 hover:bg-hover rounded-md"
                          aria-label="Clear tag filter"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleViewChange('list')}
                  className={`px-3 py-1.5 rounded-md ${
                    currentView === 'list' ? 'bg-accent-primary text-white' : 'hover:bg-hover'
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => handleViewChange('board')}
                  className={`px-3 py-1.5 rounded-md ${
                    currentView === 'board' ? 'bg-accent-primary text-white' : 'hover:bg-hover'
                  }`}
                >
                  Board
                </button>
                <button
                  onClick={() => handleViewChange('calendar')}
                  className={`px-3 py-1.5 rounded-md ${
                    currentView === 'calendar' ? 'bg-accent-primary text-white' : 'hover:bg-hover'
                  }`}
                >
                  Calendar
                </button>
              </div>
            </div>

            {/* View Content */}
            <div className="flex-1">
              {currentView === 'list' && (
                <TaskList
                  tasks={filteredTasks}
                  onTaskSelect={handleTaskSelect}
                  onTaskStatusChange={handleTaskStatusChange}
                />
              )}
              {currentView === 'board' && (
                <BoardView
                  tasks={filteredTasks}
                  onTaskSelect={handleTaskSelect}
                  onTaskStatusChange={handleTaskStatusChange}
                />
              )}
              {currentView === 'calendar' && (
                <CalendarView
                  tasks={filteredTasks}
                  onTaskSelect={handleTaskSelect}
                />
              )}
            </div>
          </div>
        }
        rightPanel={
          <TaskDetailPanel
            task={selectedTask}
            onClose={() => setSelectedTaskId(null)}
            onSave={handleTaskSave}
          />
        }
      />
    </main>
  );
}
