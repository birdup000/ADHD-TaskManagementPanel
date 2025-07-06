"use client";

import React from 'react';
import TaskPanelLayout from './components/layout/TaskPanelLayout';
import NavigationPanel from './components/layout/NavigationPanel';
import TaskList from './components/tasks/TaskList';
import BoardView from './components/tasks/BoardView';
import CalendarView from './components/tasks/CalendarView';
import MindMapView from './components/tasks/MindMapView';
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

// Helper to format date to YYYY-MM-DD for input[type="date"]
const formatDateForInput = (date: Date): string => {
  const offset = date.getTimezoneOffset();
  const adjustedDate = new Date(date.getTime() - (offset*60*1000));
  return adjustedDate.toISOString().split('T')[0];
};

// Helper function to calculate the next due date
const calculateNextDueDate = (currentDueDateStr: string, rule: Task['recurrenceRule']): string | null => {
  if (!rule || !currentDueDateStr) return null;

  // Parse currentDueDateStr as local date (YYYY-MM-DD)
  const parts = currentDueDateStr.split('-').map(Number);
  const currentDueDate = new Date(parts[0], parts[1] - 1, parts[2]);

  let nextDate = new Date(currentDueDate);
  const interval = rule.interval || 1;

  switch (rule.frequency) {
    case 'daily':
      nextDate.setDate(currentDueDate.getDate() + interval);
      break;
    case 'weekly':
      const dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
      if (!rule.daysOfWeek || rule.daysOfWeek.length === 0) {
        // If no specific days, advance by interval weeks from current day
        nextDate.setDate(currentDueDate.getDate() + 7 * interval);
      } else {
        // Start searching from the day *after* currentDueDate
        nextDate.setDate(currentDueDate.getDate() + 1);
        let attempts = 0;
        // Search for the next valid day within a reasonable range (e.g., 2 * interval * 7 days)
        while (attempts < (14 * Math.max(1,interval))) {
          const dayStr = dayMap[nextDate.getDay()];
          if (rule.daysOfWeek.includes(dayStr)) {
            // Check if this day is in a valid interval week
            // This simplified check assumes the first found valid day in a future week is acceptable for the interval.
            // A more precise interval check would be complex.

            // Calculate how many "full" weeks (of this rule's specific days) we've passed.
            // This is hard. Instead, let's find the *very next* occurrence of a valid day.
            // Then, if interval > 1, advance it by (interval - 1) weeks.

            // Simpler approach:
            // 1. Find the first occurrence of a day in daysOfWeek on or after currentDueDate + 1 day.
            // 2. Then, add (interval - 1) * 7 days to that date.

            let baseNextDate = new Date(currentDueDate);
            let foundInCycle = false;
            // Find the very next instance of one of the allowed days
            for(let i = 0; i < 7; i++) {
                baseNextDate.setDate(currentDueDate.getDate() + 1 + i); // Check starting from tomorrow
                if (rule.daysOfWeek.includes(dayMap[baseNextDate.getDay()])) {
                    foundInCycle = true;
                    break;
                }
            }
            if (!foundInCycle) { // Should not happen if daysOfWeek is populated
                 // Fallback: just add interval weeks if something went wrong
                 nextDate.setDate(currentDueDate.getDate() + 7 * interval);
                 break;
            }

            nextDate = new Date(baseNextDate); // baseNextDate is now the next occurrence in the cycle

            // Apply the interval (subtract 1 because we already found the "first" in the next cycle)
            if (interval > 1) {
                nextDate.setDate(nextDate.getDate() + (interval - 1) * 7);
            }
            break; // Found the next date
          }
          nextDate.setDate(nextDate.getDate() + 1);
          attempts++;
        }
        if (attempts >= (14 * Math.max(1,interval))) return null; // Failed to find
      }
      break;
    case 'monthly':
      if (rule.dayOfMonth) {
        nextDate = new Date(currentDueDate);
        // Move to the target month first
        nextDate.setMonth(currentDueDate.getMonth() + interval, 1); // Set day to 1 to avoid month overflow issues initially
        nextDate.setDate(rule.dayOfMonth);

        // If setting dayOfMonth caused month to jump (e.g. day 31 in Feb -> Mar 3)
        // OR if the resulting date is not after currentDueDate, advance by another interval.
        // This check is important if current date is like Jan 30, rule is "every month on 28th".
        // currentMonth + interval -> Feb. Feb 28. This is correct.
        // If current is Jan 15, rule "every month on 10th".
        // currentMonth + interval -> Feb. Feb 10. Correct.
        // If current is Jan 10, rule "every month on 10th".
        // currentMonth + interval -> Feb. Feb 10. Correct.

        // The issue is if currentDueDate.getDate() > rule.dayOfMonth, and we are in the *same* month after adding interval=0 (not typical)
        // Or if the calculated date is not actually in the future.
        if (nextDate.getTime() <= currentDueDate.getTime()) {
            // Advance to the next interval month
            nextDate.setMonth(currentDueDate.getMonth() + interval * 2, 1); // Try *2 initially if first was <=
             nextDate.setDate(rule.dayOfMonth);
             // A safer way:
             nextDate = new Date(currentDueDate);
             nextDate.setDate(1); // Start of month
             nextDate.setMonth(nextDate.getMonth() + interval);
             nextDate.setDate(rule.dayOfMonth);
             if(nextDate.getTime() <= currentDueDate.getTime()){
                 nextDate.setDate(1);
                 nextDate.setMonth(nextDate.getMonth() + interval); // Add one more interval
                 nextDate.setDate(rule.dayOfMonth);
             }
        }
      } else {
        return null; // dayOfMonth is required for monthly
      }
      break;
    case 'yearly':
      nextDate = new Date(currentDueDate);
      nextDate.setFullYear(currentDueDate.getFullYear() + interval);
      // Handles Feb 29 correctly by rolling to Mar 1 if next year is not leap.
      if (nextDate.getTime() <= currentDueDate.getTime()) {
        nextDate.setFullYear(currentDueDate.getFullYear() + interval * 2); // Should not be needed if interval >= 1
      }
      break;
    default:
      return null;
  }
  return formatDateForInput(nextDate);
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
      prevTasks.map(task => {
        if (task.id === taskId) {
          const updatedTask = { ...task, status };
          if (status === 'completed' && updatedTask.isRecurring && updatedTask.recurrenceRule && updatedTask.dueDate) {
            const nextDueDate = calculateNextDueDate(updatedTask.dueDate, updatedTask.recurrenceRule);
            if (nextDueDate) {
              // Reset task for next occurrence
              updatedTask.dueDate = nextDueDate;
              updatedTask.status = 'todo'; // Reset status
              // Do not change originalDueDate, it's fixed.
              // Progress and subtasks might also need resetting depending on desired behavior.
              // For now, only resetting status and advancing due date.
              updatedTask.progress = 0; // Example: reset progress
              updatedTask.subTasks = updatedTask.subTasks?.map(st => ({...st, isCompleted: false}));

            } else {
              // Could not calculate next due date, maybe make it non-recurring
              // Or, it implies the recurrence ended. For now, we'll just complete it as a one-off.
              // To make it non-recurring:
              // updatedTask.isRecurring = false;
              // delete updatedTask.recurrenceRule;
              // delete updatedTask.originalDueDate; // Or keep for history
            }
          }
          return updatedTask;
        }
        return task;
      })
    );
  };

  const handleTaskSave = (updatedTaskData: Task) => {
    setTasks(prevTasks => {
      const taskIndex = prevTasks.findIndex(t => t.id === updatedTaskData.id);
      let taskToSave = { ...updatedTaskData };

      // Manage recurrence settings
      if (taskToSave.isRecurring) {
        if (!taskToSave.originalDueDate && taskToSave.dueDate) {
          taskToSave.originalDueDate = taskToSave.dueDate;
        }
        // If due date or rule changed, and it's recurring, try to ensure dueDate is valid next occurrence
        // This might be complex if user manually sets dueDate on a recurring task to something not fitting the rule.
        // For now, assume TaskDetailPanel provides valid combination or this save is the source of truth.
        // If rule exists but dueDate is cleared, what happens? For now, we require a dueDate for recurrence.
        if (taskToSave.recurrenceRule && !taskToSave.dueDate) {
            // Cannot be recurring without a due date to base off of.
            // Default to today if setting recurrence and no due date? Or rely on validation in panel.
            // For now, assume panel ensures a due date if isRecurring is true.
        }

      } else {
        // If task is marked as not recurring, clear recurrence fields
        delete taskToSave.recurrenceRule;
        // delete taskToSave.originalDueDate; // Keep originalDueDate for history? Or clear? Clearing for now.
        // Let's keep originalDueDate if it was ever recurring.
        // No, if it's not recurring, originalDueDate has no meaning in context of active recurrence.
        // Let's clear it if isRecurring is explicitly set to false.
         if (updatedTaskData.isRecurring === false) { // Check explicit false, not just undefined
            delete taskToSave.originalDueDate;
         }
      }

      // Validate recurrence rule consistency (basic)
      if (taskToSave.isRecurring && taskToSave.recurrenceRule) {
        const rule = taskToSave.recurrenceRule;
        if (rule.frequency === 'weekly' && (!rule.daysOfWeek || rule.daysOfWeek.length === 0)) {
            // Invalidate weekly recurrence without days. Panel should prevent this.
            // If it gets here, perhaps default to original due date's day? Or clear recurrence.
            // For now, assume data from panel is somewhat clean.
        }
        if (rule.frequency === 'monthly' && !rule.dayOfMonth) {
            // Invalidate monthly recurrence without day of month.
        }
         if (!taskToSave.dueDate) {
            // Task is recurring but has no due date. This shouldn't happen if panel validates.
            // Make it non-recurring if this state is reached.
            taskToSave.isRecurring = false;
            delete taskToSave.recurrenceRule;
            delete taskToSave.originalDueDate;
        }
      }


      if (taskIndex === -1) {
        // Add new task
        return [...prevTasks, { ...taskToSave, id: `task-${Date.now()}` }];
      }
      // Update existing task
      return prevTasks.map(t => (t.id === taskToSave.id ? taskToSave : t));
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

  const handleMindMapTaskCreate = (partialTask: Partial<Task>) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: partialTask.title || '',
      description: partialTask.description || '',
      status: partialTask.status || 'todo',
      priority: partialTask.priority || 'medium',
      category: partialTask.category,
      tags: partialTask.tags || []
    };
    handleTaskSave(newTask);
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
                <button
                  onClick={() => handleViewChange('mindmap')}
                  className={`px-3 py-1.5 rounded-md ${
                    currentView === 'mindmap' 
                      ? 'bg-accent-primary text-white' 
                      : 'hover:bg-hover'
                  }`}
                >
                  Mind Map
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
              {currentView === 'mindmap' && (
                <MindMapView
                  tasks={filteredTasks}
                  onTaskSelect={handleTaskSelect}
                  onTaskCreate={handleMindMapTaskCreate}
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
