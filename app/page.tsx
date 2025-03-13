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
import { useAsyncStorage } from './hooks/useAsyncStorage';
import { useSearchParams } from 'next/navigation';
import { useCategories } from './hooks/useCategories';
import CategoryModal from './components/categories/CategoryModal';

interface NavItem {
  id: string;
  label: string;
  count?: number;
}

// Initial empty navigation structure
const emptyNavItems: { smartLists: NavItem[]; categories: NavItem[]; tags: NavItem[] } = {
  smartLists: [
    { id: 'all', label: 'All Tasks', count: 0 },
    { id: 'today', label: 'Today', count: 0 },
    { id: 'upcoming', label: 'Upcoming', count: 0 },
    { id: 'priority', label: 'Priority', count: 0 },
  ],
  categories: [],
  tags: [],
};

const TASKS_STORAGE_KEY = 'adhd-panel-tasks';

// Function to extract unique tags from tasks
const extractTagsFromTasks = (tasks: Task[]): string[] => {
  return Array.from(new Set(tasks.flatMap(t => t.tags || [])));
};

export default function Home() {
  const searchParams = useSearchParams();
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = React.useState(false);
  const { categories, addCategory } = useCategories();
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const storage = useAsyncStorage();
  const {
    currentView,
    handleSmartListClick,
    handleCategoryClick,
    handleTagClick,
    handleViewChange,
  } = useNavigation();

  // Load tasks from storage on component mount
  React.useEffect(() => {
    const loadTasks = async () => {
      const storedTasks = await storage.getItem(TASKS_STORAGE_KEY);
      if (storedTasks) {
        try {
          setTasks(JSON.parse(storedTasks));
        } catch (error) {
          console.error('Error parsing stored tasks:', error);
          // Initialize with empty array if parsing fails
          setTasks([]);
          await storage.setItem(TASKS_STORAGE_KEY, JSON.stringify([]));
        }
      } else {
        await storage.setItem(TASKS_STORAGE_KEY, JSON.stringify([]));
      }
    };

    loadTasks();
  }, []);

  // Save tasks to storage whenever they change
  React.useEffect(() => {
    storage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // Update navigation item counts based on tasks
  const navItemsWithCounts = React.useMemo(() => {
    const today = new Date();
    const inOneWeek = new Date();
    inOneWeek.setDate(today.getDate() + 7);
    const tags = extractTagsFromTasks(tasks);
    
    return {
      ...emptyNavItems,
      categories: categories.map((category): NavItem => ({
        id: category.id,
        label: category.name,
        count: tasks.filter(task => task.category === category.id).length
      })),
      tags: tags.map((tag): NavItem => ({
        id: tag,
        label: tag,
        count: tasks.filter(task => task.tags?.includes(tag)).length
      })),
      smartLists: emptyNavItems.smartLists.map((item): NavItem => ({
        ...item,
        count: tasks.filter(task => {
          switch (item.id) {
            case 'all':
              return true;
            case 'today':
              return task.dueDate ? new Date(task.dueDate).toDateString() === today.toDateString() : false;
            case 'upcoming':
              const dueDate = task.dueDate ? new Date(task.dueDate) : null;
              return dueDate ? dueDate > today && dueDate <= inOneWeek : false;
            case 'priority':
              return task.priority === 'high';
            default:
              return false;
          }
        }).length
      }))
    };
  }, [tasks, categories]);

  const filteredTasks = React.useMemo(() => {
    const smartList = searchParams.get('smartList');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');

    return tasks.filter(task => {
      if (smartList) {
        switch (smartList) {
          case 'today':
            return task.dueDate ? new Date(task.dueDate).toDateString() === new Date().toDateString() : false;
          case 'upcoming':
            const dueDate = task.dueDate ? new Date(task.dueDate) : null;
            const today = new Date();
            const inOneWeek = new Date(today);
            inOneWeek.setDate(today.getDate() + 7);
            return dueDate ? dueDate > today && dueDate <= inOneWeek : false;
          case 'priority':
            return task.priority === 'high';
          case 'all':
            return true;
          default:
            return false;
        }
      }
      if (category && (!task.category || task.category !== category)) return false;
      if (tag && !task.tags?.includes(tag)) return false;
      return true;
    });
  }, [searchParams, tasks]);

  const selectedTask = React.useMemo(() => {
    if (!selectedTaskId) return null;
    return tasks.find(task => task.id === selectedTaskId) || null;
  }, [selectedTaskId, tasks]);

  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const handleTaskStatusChange = (taskId: string, status: Task['status']) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, status } : task
      )
    );
  };

  const handleTaskSave = (updatedTask: Task) => {
    setTasks(prevTasks => {
      const taskIndex = prevTasks.findIndex(t => t.id === updatedTask.id);
      if (taskIndex === -1) {
        // Add new task
        return [...prevTasks, { ...updatedTask, id: Date.now().toString() }];
      }
      // Update existing task
      return prevTasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    });
  };

  const handleTaskDelete = async (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    await storage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));
    setSelectedTaskId(null);
  };


  const handleNewTask = () => {
    const emptyTask: Task = {
      id: `new-${Date.now()}`,
      title: '',
      priority: 'medium',
      status: 'todo',
      category: searchParams.get('category') || undefined,
      tags: searchParams.get('tag') ? [searchParams.get('tag')!] : []
    };
    setTasks(prevTasks => [...prevTasks, emptyTask]);
    setSelectedTaskId(emptyTask.id);
  };

  return (
    <main className="h-screen">
      <TaskPanelLayout
        isRightPanelVisible={Boolean(selectedTaskId)}
        leftPanel={
          <NavigationPanel
            categories={navItemsWithCounts.categories}
            renderCategoryHeader={() => (
              <div className="flex items-center justify-between px-4 mb-2">
                <h2 className="text-sm font-medium text-text-secondary">CATEGORIES</h2>
                <button
                  onClick={() => setIsNewCategoryModalOpen(true)}
                  className="p-1 hover:bg-hover rounded-md text-text-secondary 
                           hover:text-text-primary transition-colors duration-200"
                  aria-label="Add new category"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            )}
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
                  onNewTask={handleNewTask}
                  onTaskDelete={handleTaskDelete}
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
            onDelete={handleTaskDelete}
          />
        }
      />

      {/* Category Modal */}
      <CategoryModal
        isOpen={isNewCategoryModalOpen}
        onClose={() => setIsNewCategoryModalOpen(false)}
        onSave={addCategory}
        initialData={{}}
      />
    </main>
  );
}
