"use client";

import React from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { TaskList } from './TaskList';
import { ThemeProvider } from '../hooks/useTheme';
import { useTasks } from '../hooks/useTasks';
import { useSearch } from '../hooks/useSearch';
import SearchBar from './SearchBar';
import TaskCard from './TaskCard';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import ThemeSelector from './ThemeSelector';
import TaskForm from './TaskForm';
import ViewSelector from './ViewSelector';
import CalendarView from './CalendarView';
import ListView from './ListView';
import IntegrationButton from './IntegrationButton';
import TaskDetails from './TaskDetails';
import LoginForm from './LoginForm';
import AIAssistant from './AIAssistant';
import ShortcutsDialog from './ShortcutsDialog';
import { Task } from '../types/task';
import { Comment } from './CommentSection';
import { colors } from '../../tailwind.config';
import TaskStats from './TaskStats';
import NotesEditor from './NotesEditor';

type ViewType = 'board' | 'calendar' | 'notes' | 'project';
type ThemeType = typeof colors.dark;

const TaskPanel: React.FC = () => {
  const handleTaskDelete = (task: Task) => {
    setTaskToDelete(task);
    setShowConfirmDelete(true);
  };

  const handleBatchComplete = () => {
    const selectedTasks = tasks.filter(task => task.status !== 'done');
    selectedTasks.forEach(task => {
      updateTask({ ...task, status: 'done' });
    });
  };

  const handleArchiveDone = () => {
    const doneTasks = tasks.filter(task => task.status === 'done');
    doneTasks.forEach(task => {
      deleteTask(task.id);
    });
  };
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [currentTab, setCurrentTab] = React.useState<'tasks' | 'notes'>('tasks');
  const [showIntegrations, setShowIntegrations] = React.useState(false);
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const { tasks, addTask, updateTask, deleteTask, reorderTasks, importTasks } = useTasks();
  const {
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    filterPriority,
    setFilterPriority,
    filteredAndSortedTasks
  } = useSearch(tasks);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [comments, setComments] = React.useState<Record<string, Comment[]>>({});
  const [currentView, setCurrentView] = React.useState<ViewType>('board');
  const [theme, setTheme] = React.useState<ThemeType>(colors.dark);
  const [showConfirmDelete, setShowConfirmDelete] = React.useState(false);
  const [taskToDelete, setTaskToDelete] = React.useState<Task | null>(null);

  useKeyboardShortcuts({
    onNewTask: () => setIsEditorOpen(true),
    onSearch: () => searchInputRef.current?.focus(),
    onToggleView: () => {
      setCurrentView(current => current === 'board' ? 'calendar' : 'board');
    },
    onDelete: () => {
      if (selectedTask) {
        setTaskToDelete(selectedTask);
        setShowConfirmDelete(true);
      }
    },
    onDeleteTask: () => {
      if (selectedTask) {
        setTaskToDelete(selectedTask);
        setShowConfirmDelete(true);
      }
    }
  });
  const [showLogin, setShowLogin] = React.useState(false);
  const [showAI, setShowAI] = React.useState(false);
  const [showShortcuts, setShowShortcuts] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        setShowShortcuts(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceStatus = result.source.droppableId;
    const destinationStatus = result.destination.droppableId;
    const taskId = result.draggableId;

    if (sourceStatus === destinationStatus) {
      // Reordering within the same list
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
      // Moving between lists
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const updatedTask = {
        ...task,
        status: destinationStatus as Task['status'],
      };

      updateTask(updatedTask);
    }
  };

  return (
    <ThemeProvider value={{ theme, setTheme }}>
      <div style={{ backgroundColor: theme.primary }} className="min-h-screen text-white">
        <div className="container mx-auto p-4">
          <header className="flex flex-col gap-4 mb-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">Midnight Eclipse</h1>
                <div className="text-sm text-gray-400">
                  Press "?" for keyboard shortcuts
                </div>
              </div>
              <div className="relative group">
                <ViewSelector currentView={currentView} onViewChange={setCurrentView} />
                <span className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded whitespace-nowrap">
                  Press Ctrl+V to toggle view
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <ThemeSelector currentTheme={theme} onThemeChange={setTheme} />
                <div className="flex items-center space-x-2">
                  <div className="relative group">
                    <button
                      onClick={() => setShowAI(true)}
                      className="p-2 rounded-lg bg-[#2A2A2A] hover:bg-[#333333] transition-colors"
                      title="AI Assistant"
                    >
                      🤖
                    </button>
                    <span className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded whitespace-nowrap">
                      AI Assistant
                    </span>
                  </div>
                  
                  <button
                    onClick={() => setShowIntegrations(true)}
                    className="p-2 rounded-lg bg-[#2A2A2A] hover:bg-[#333333] transition-colors"
                    title="Integrations"
                  >
                    🔌
                  </button>
                  <button
                    onClick={() => setShowLogin(true)}
                    className="p-2 rounded-lg bg-[#2A2A2A] hover:bg-[#333333] transition-colors"
                    title="Account"
                  >
                    👤
                  </button>
                  <button 
                    onClick={() => setIsEditorOpen(true)}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors group relative"
                  >
                    New Task
                    <span className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded whitespace-nowrap">
                      Press Ctrl+N
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <TaskStats tasks={tasks} />
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBatchComplete}
                  className="px-3 py-1.5 rounded text-sm bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 transition-colors"
                  title="Complete all visible tasks"
                >
                  Complete All
                </button>
                <button
                  onClick={() => {
                    const selectedTasks = filteredAndSortedTasks().filter(t => t.status === 'todo');
                    selectedTasks.forEach(task => {
                      updateTask({ ...task, status: 'in-progress' });
                    });
                  }}
                  className="px-3 py-1.5 rounded text-sm bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 transition-colors"
                  title="Start all todo tasks"
                >
                  Start All
                </button>
                <button
                  onClick={() => {
                    // Create recurring tasks
                    const template = filteredAndSortedTasks()
                      .filter(t => t.recurring)
                      .map(t => ({
                        ...t,
                        id: crypto.randomUUID(),
                        status: 'todo' as const,
                        completedAt: undefined,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                      }));
                    template.forEach(addTask);
                  }}
                  className="px-3 py-1.5 rounded text-sm bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 transition-colors"
                  title="Create recurring tasks"
                >
                  Create Recurring
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                    type="file"
                    id="importFile"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const csv = event.target?.result as string;
                          const lines = csv.split('\n');
                          const importedTasks = lines.map(line => {
                            const [title, description, status, priority, dueDate, tags, assignees] = line.split(',');
                            return {
                              id: crypto.randomUUID(),
                              title,
                              description,
                              status: status as Task['status'],
                              priority: priority as Task['priority'],
                              dueDate: dueDate ? new Date(dueDate) : undefined,
                              tags: tags ? tags.split(', ').filter(t => t) : undefined,
                              assignees: assignees ? assignees.split(', ').filter(a => a) : undefined,
                              createdAt: new Date(),
                              updatedAt: new Date()
                            };
                          });
                          importTasks(importedTasks);
                          e.target.value = ''; // Reset file input
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                  <button
                    onClick={() => document.getElementById('importFile')?.click()}
                    className="px-3 py-1.5 rounded text-sm bg-gray-600/20 text-gray-300 hover:bg-gray-600/30 transition-colors"
                    title="Import tasks from CSV"
                  >
                    Import
                  </button>
                  <button
                    onClick={() => {
                      const csv = tasks.map(t => {
                        return [
                          t.title,
                          t.description,
                          t.status,
                          t.priority,
                          t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '',
                          t.tags?.join(', ') || '',
                          t.assignees?.join(', ') || ''
                        ].join(',');
                      }).join('\n');
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'tasks.csv';
                      a.click();
                    }}
                    className="px-3 py-1.5 rounded text-sm bg-gray-600/20 text-gray-300 hover:bg-gray-600/30 transition-colors"
                    title="Export tasks as CSV"
                  >
                    Export
                  </button>
                <button
                  onClick={() => {
                    // Save current tasks as template
                    const template = {
                      name: 'My Template',
                      tasks: tasks.map(t => ({
                        title: t.title,
                        description: t.description,
                        priority: t.priority,
                        tags: t.tags,
                      }))
                    };
                    localStorage.setItem('taskTemplate', JSON.stringify(template));
                  }}
                  className="px-3 py-1.5 rounded text-sm bg-gray-600/20 text-gray-300 hover:bg-gray-600/30 transition-colors"
                  title="Save as template"
                >
                  Save Template
                </button>
              </div>
            </div>
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              sortBy={sortBy}
              onSortChange={setSortBy}
              filterPriority={filterPriority}
              onFilterChange={setFilterPriority}
            />
          </header>
          
          {currentTab === 'tasks' ? (
            <DragDropContext onDragEnd={onDragEnd}>
            <main className={currentView === 'calendar' ? '' : 'grid grid-cols-1 md:grid-cols-3 gap-6'}>
              {/* Todo Column */}
              <div className="bg-[#2A2A2A] rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">To Do</h2>
                  <span className="text-sm text-gray-400">
                    {filteredAndSortedTasks().filter(t => t.status === 'todo').length} tasks
                  </span>
                </div>
                <TaskList
                  droppableId="todo"
                  tasks={filteredAndSortedTasks().filter(task => task.status === 'todo')}
                  onUpdateTask={updateTask}
                  onTaskClick={(task: Task) => setSelectedTask(task)}
                  onDeleteTask={(task: Task) => deleteTask(task.id)}
                  onReorderTasks={reorderTasks}
                />
              </div>

              {/* In Progress Column */}
              <div className="bg-[#2A2A2A] rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">In Progress</h2>
                  <span className="text-sm text-gray-400">
                    {filteredAndSortedTasks().filter(t => t.status === 'in-progress').length} tasks
                  </span>
                </div>
                
                <TaskList
                  droppableId="in-progress"
                  tasks={filteredAndSortedTasks().filter(task => task.status === 'in-progress')}
                  onUpdateTask={updateTask}
                  onTaskClick={(task: Task) => setSelectedTask(task)}
                  onDeleteTask={(task: Task) => deleteTask(task.id)}
                  onReorderTasks={reorderTasks}
                />
              </div>
              
              {isEditorOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-[#212121] p-6 rounded-lg w-full max-w-2xl mx-4">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">Create New Task</h2>
                      <button 
                        onClick={() => setIsEditorOpen(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                    <TaskForm 
                      onSubmit={(task) => {
                        addTask(task);
                        setIsEditorOpen(false);
                      }}
                      onCancel={() => setIsEditorOpen(false)}
                    />
                  </div>
                </div>
              )}

              {/* Done Column */}
              <div className="bg-[#2A2A2A] rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">Done</h2>
                    <span className="text-sm text-gray-400">
                      {filteredAndSortedTasks().filter(t => t.status === 'done').length} tasks
                    </span>
                  </div>
                  <button
                    onClick={handleArchiveDone}
                    className="text-sm text-gray-400 hover:text-white"
                    title="Archive completed tasks"
                  >
                    Archive
                  </button>
                </div>
                <TaskList
                  droppableId="done"
                  tasks={filteredAndSortedTasks().filter(task => task.status === 'done')}
                  onUpdateTask={updateTask}
                  onTaskClick={(task: Task) => setSelectedTask(task)}
                  onDeleteTask={(task: Task) => deleteTask(task.id)}
                  onReorderTasks={reorderTasks}
                />
              </div>

              {/* Task Details Modal */}
              {selectedTask && (
                <TaskDetails
                  task={selectedTask}
                  onClose={() => setSelectedTask(null)}
                  onUpdateTask={(updatedTask: Task) => {
                    updateTask(updatedTask);
                    setSelectedTask(updatedTask);
                  }}
                  onDeleteTask={(task: Task) => {
                    deleteTask(task.id);
                    setSelectedTask(null);
                  }}
                  comments={comments[selectedTask.id] || []}
                  onAddComment={(taskId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => {
                    const newComment = {
                      ...comment,
                      id: Date.now().toString(),
                      createdAt: new Date(),
                    };
                    setComments({
                      ...comments,
                      [taskId]: [...(comments[taskId] || []), newComment],
                    });
                  }}
                />
              )}

              {currentView === 'calendar' && (
                <CalendarView
                  tasks={tasks}
                  onTaskClick={(task: Task) => setSelectedTask(task)}
                  onDeleteTask={(task: Task) => {
                    deleteTask(task.id);
                    setSelectedTask(null);
                  }}
                />
              )}

              {/* Integrations Modal */}
              {showIntegrations && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-[#212121] p-6 rounded-lg w-full max-w-md mx-4">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold">Integrations</h2>
                      <button
                        onClick={() => setShowIntegrations(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="space-y-4">
                      <IntegrationButton
                        type="google"
                        onClick={() => {
                          console.log('Connecting to Google Calendar...');
                          // Implement Google Calendar OAuth flow
                        }}
                      />
                      <IntegrationButton
                        type="slack"
                        onClick={() => {
                          console.log('Connecting to Slack...');
                          // Implement Slack OAuth flow
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </main>
          </DragDropContext>
          ) : (
            <main className="bg-[#212121] rounded-lg overflow-hidden h-[calc(100vh-12rem)]">
              <NotesEditor />
            </main>
          )}

          {/* Delete Confirmation Modal */}
          {showConfirmDelete && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-[#212121] p-6 rounded-lg w-full max-w-md mx-4">
                <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to delete "{taskToDelete?.title}"? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowConfirmDelete(false)}
                    className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (taskToDelete) {
                        deleteTask(taskToDelete.id);
                        setShowConfirmDelete(false);
                        setTaskToDelete(null);
                        if (selectedTask?.id === taskToDelete.id) {
                          setSelectedTask(null);
                        }
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {showLogin && <LoginForm />}
          {showAI && <AIAssistant onClose={() => setShowAI(false)} />}
          {showShortcuts && <ShortcutsDialog onClose={() => setShowShortcuts(false)} />}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default TaskPanel;
