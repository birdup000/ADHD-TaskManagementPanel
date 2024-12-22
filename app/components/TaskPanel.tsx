"use client";

import React, { useEffect, useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import ExportMenu from './ExportMenu';
import { TaskList as TaskListComponent } from './TaskList';
import { ThemeProvider, useTheme, ThemeType } from '../hooks/useTheme';
import { useTasks } from '../hooks/useTasks';
import { useSearch } from '../hooks/useSearch';
import SearchBar from './SearchBar';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import ThemeSelector from './ThemeSelector';
import TaskForm from './TaskForm';
import AIAssistantPanel from './AIAssistantPanel';
import TaskAnalytics from './TaskAnalytics';
import TaskAutomation from './TaskAutomation';
import TaskDependencyGraph from './TaskDependencyGraph';
import TaskDetailsPanel from './TaskDetailsPanel';
import { useAuthContext } from '../providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { Task } from '../types/task';
import { colors } from '../config/colors';
import AGiXTConfig from './AGiXTConfig';

const defaultTheme: ThemeType = {
  primary: colors.primary.DEFAULT,
  background: colors.background,
  foreground: colors.foreground,
  gray: {
    '50': '#f9fafb',
    '100': '#f3f4f6',
    '200': '#e5e7eb',
    '300': '#d1d5db',
    '400': '#9ca3af',
    '500': '#6b7280',
    '600': '#4b5563',
    '700': '#374151',
    '800': '#1f2937',
    '900': '#111827'
  }
};

const TaskPanel: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { token, noAuth } = useAuthContext();
  const [theme, setTheme] = useState<ThemeType>(defaultTheme);

  // Task management state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isAGiXTConfigOpen, setIsAGiXTConfigOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [agixtConfig, setAgixtConfig] = useState({ backendUrl: '', authToken: '' });
  
  const { tasks, addTask, updateTask, deleteTask, reorderTasks, lists } = useTasks({
    remoteEnabled: false,
    userId: 'anonymous'
  });
  
  const {
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    filterPriority,
    setFilterPriority,
    filteredAndSortedTasks
  } = useSearch(tasks);

  useEffect(() => {
    const initializePanel = async () => {
      try {
        setMounted(true);
        console.log('TaskPanel: Initializing with auth state:', { token, noAuth });

        if (!token && !noAuth) {
          console.log('TaskPanel: No auth detected, redirecting to login');
          router.push('/');
          return;
        }

        await new Promise(resolve => setTimeout(resolve, 100));
        setIsInitialized(true);
        console.log('TaskPanel: Initialization complete');
      } catch (err) {
        console.error('TaskPanel: Initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize task panel');
      }
    };

    initializePanel();
  }, [token, noAuth, router]);

  useKeyboardShortcuts({
    onNewTask: () => setIsEditorOpen(true),
    onSearch: () => document.getElementById('search-input')?.focus(),
    onToggleView: () => {},
    onDelete: () => {},
    onDeleteTask: () => {}
  });

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceStatus = result.source.droppableId;
    const destinationStatus = result.destination.droppableId;
    const taskId = result.draggableId;

    if (sourceStatus === destinationStatus) {
      const listTasks = tasks.filter(t => t.status === sourceStatus);
      const [movedTask] = listTasks.splice(result.source.index, 1);
      listTasks.splice(result.destination.index, 0, movedTask);

      const updatedTasks = tasks.map(t => {
        if (t.status === sourceStatus) {
          const reorderedTask = listTasks.find(rt => rt.id === t.id);
          return reorderedTask || t;
        }
        return t;
      });

      reorderTasks(updatedTasks);
    } else {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const updatedTask = {
        ...task,
        status: destinationStatus as Task['status'],
      };

      updateTask(updatedTask);
    }
  };

  const handleTaskSuggestion = (taskSuggestion: Partial<Task>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskSuggestion.title || '',
      description: taskSuggestion.description || '',
      priority: taskSuggestion.priority || 'medium',
      status: 'todo',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: 'current-user',
      collaborators: [],
      activityLog: [],
      comments: [],
      version: 1,
      listId: lists[0]?.id || 'default',
    };
    addTask(newTask);
  };

  const handleTaskOptimization = (taskIds: string[]) => {
    const optimizedTasks = taskIds.map(id => tasks.find(t => t.id === id)).filter(Boolean) as Task[];
    reorderTasks(optimizedTasks);
  };

  if (!mounted || !isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#111111] text-white">
        <div className="text-center">
          <div className="text-lg mb-2">Loading Task Panel...</div>
          <div className="text-sm text-gray-400">Please wait while we set things up</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#111111] text-white">
        <div className="text-center">
          <div className="text-lg mb-2 text-red-500">Error Loading Task Panel</div>
          <div className="text-sm text-gray-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider value={{ theme, setTheme }}>
      <div className="min-h-screen bg-[#111111] text-white p-4">
        <div className="flex">
          <div className="flex-1 max-w-7xl mx-auto">
            <header className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Task Panel</h1>
                <div className="flex items-center space-x-4">
                  <ThemeSelector currentTheme={theme} onThemeChange={setTheme} />
                  <button
                    onClick={() => setIsAGiXTConfigOpen(true)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    AGiXT Config
                  </button>
                  <button
                    onClick={() => setIsEditorOpen(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                  >
                    New Task
                  </button>
                </div>
              </div>
              {isAGiXTConfigOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-gray-800 p-6 rounded-lg w-full max-w-2xl mx-4">
                    <AGiXTConfig 
                      onClose={() => setIsAGiXTConfigOpen(false)} 
                      onSave={(config) => {
                        setAgixtConfig(config);
                        setIsAGiXTConfigOpen(false);
                      }} 
                    />
                  </div>
                </div>
              )}
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                sortBy={sortBy}
                onSortChange={setSortBy}
                filterPriority={filterPriority}
                onFilterChange={setFilterPriority}
              />
            </header>

            <div className="space-y-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TaskAnalytics tasks={tasks} />
                <TaskAutomation tasks={tasks} onUpdateTask={updateTask} />
              </div>
              <TaskDependencyGraph 
                tasks={tasks}
                onTaskClick={setSelectedTask}
              />
            </div>
            
            <DragDropContext onDragEnd={onDragEnd}>
              <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h2 className="text-xl font-semibold mb-4">To Do</h2>
                  <TaskListComponent
                    droppableId="todo"
                    tasks={filteredAndSortedTasks().filter(task => task.status === 'todo')}
                    onUpdateTask={updateTask}
                    onTaskClick={(task) => setSelectedTask(task)}
                    onDeleteTask={(task) => deleteTask(task.id)}
                    onReorderTasks={reorderTasks}
                    listId="default"
                  />
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h2 className="text-xl font-semibold mb-4">In Progress</h2>
                  <TaskListComponent
                    droppableId="in-progress"
                    tasks={filteredAndSortedTasks().filter(task => task.status === 'in-progress')}
                    onUpdateTask={updateTask}
                    onTaskClick={(task) => setSelectedTask(task)}
                    onDeleteTask={(task) => deleteTask(task.id)}
                    onReorderTasks={reorderTasks}
                    listId="default"
                  />
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h2 className="text-xl font-semibold mb-4">Done</h2>
                  <TaskListComponent
                    droppableId="done"
                    tasks={filteredAndSortedTasks().filter(task => task.status === 'done')}
                    onUpdateTask={updateTask}
                    onTaskClick={(task) => setSelectedTask(task)}
                    onDeleteTask={(task) => deleteTask(task.id)}
                    onReorderTasks={reorderTasks}
                    listId="default"
                  />
                </div>
              </main>
            </DragDropContext>

            {isEditorOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-gray-800 p-6 rounded-lg w-full max-w-2xl mx-4">
                  <TaskForm
                    onSubmit={(task) => {
                      addTask(task);
                      setIsEditorOpen(false);
                    }}
                    onCancel={() => setIsEditorOpen(false)}
                    lists={lists}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col">
            {agixtConfig.backendUrl && agixtConfig.authToken && (
              <AIAssistantPanel
                backendUrl={agixtConfig.backendUrl}
                authToken={agixtConfig.authToken}
                onTaskSuggestion={handleTaskSuggestion}
                onTaskOptimization={handleTaskOptimization}
                tasks={tasks}
                selectedTask={selectedTask}
                className="ml-4"
              />
            )}
            {selectedTask && (
              <TaskDetailsPanel
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
                onUpdateTask={updateTask}
                allTasks={tasks}
                className="ml-4 mt-4"
              />
            )}
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default TaskPanel;
