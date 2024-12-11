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
import { Task } from '../types/task';
import { Comment } from './CommentSection';
import { colors } from '../../tailwind.config';

type ViewType = 'kanban' | 'list' | 'calendar';
type ThemeType = typeof colors.dark;

const TaskPanel: React.FC = () => {
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [showIntegrations, setShowIntegrations] = React.useState(false);
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const { tasks, addTask, updateTask, deleteTask, reorderTasks } = useTasks();
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
  const [currentView, setCurrentView] = React.useState<ViewType>('kanban');
  const [theme, setTheme] = React.useState<ThemeType>(colors.dark);

  useKeyboardShortcuts({
    onNewTask: () => setIsEditorOpen(true),
    onSearch: () => searchInputRef.current?.focus(),
    onToggleView: () => {
      setCurrentView((current) => {
        const views: ViewType[] = ['kanban', 'list', 'calendar'];
        const currentIndex = views.indexOf(current);
        return views[(currentIndex + 1) % views.length];
      });
    },
  });
  const [showLogin, setShowLogin] = React.useState(false);
  const [showAI, setShowAI] = React.useState(false);

  const sampleTask = {
    id: '1',
    title: 'Implement Dark Mode',
    description: 'Add dark mode support with multiple theme options',
    priority: 'high' as const,
    status: 'in-progress' as const,
    dueDate: new Date('2024-03-01'),
    assignees: ['John', 'Alice'],
    tags: ['UI', 'Feature']
  };

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
              <h1 className="text-2xl font-bold">Midnight Eclipse</h1>
              <div className="relative group">
                <ViewSelector currentView={currentView} onViewChange={setCurrentView} />
                <span className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded whitespace-nowrap">
                  Press Ctrl+V to toggle view
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <ThemeSelector currentTheme={theme} onThemeChange={setTheme} />
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowAI(true)}
                    className="p-2 rounded-lg bg-[#2A2A2A] hover:bg-[#333333] transition-colors"
                    title="AI Assistant"
                  >
                    🤖
                  </button>
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
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              sortBy={sortBy}
              onSortChange={setSortBy}
              filterPriority={filterPriority}
              onFilterChange={setFilterPriority}
            />
          </header>
          
          <DragDropContext onDragEnd={onDragEnd}>
            <main className={currentView === 'calendar' ? '' : 'grid grid-cols-1 md:grid-cols-3 gap-6'}>
              {/* Todo Column */}
              <div className="bg-[#2A2A2A] rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">To Do</h2>
                <TaskList
                  droppableId="todo"
                  tasks={filteredAndSortedTasks().filter(task => task.status === 'todo')}
                  onUpdateTask={updateTask}
                  onTaskClick={(task: Task) => setSelectedTask(task)}
                  onReorderTasks={reorderTasks}
                />
              </div>

              {/* In Progress Column */}
              <div className="bg-[#2A2A2A] rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">In Progress</h2>
                <TaskCard {...sampleTask} onClick={() => setSelectedTask(sampleTask)} />
                <TaskList
                  droppableId="in-progress"
                  tasks={filteredAndSortedTasks().filter(task => task.status === 'in-progress')}
                  onUpdateTask={updateTask}
                  onTaskClick={(task: Task) => setSelectedTask(task)}
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
                <h2 className="text-xl font-semibold mb-4">Done</h2>
                <TaskList
                  droppableId="done"
                  tasks={filteredAndSortedTasks().filter(task => task.status === 'done')}
                  onUpdateTask={updateTask}
                  onTaskClick={(task: Task) => setSelectedTask(task)}
                  onReorderTasks={reorderTasks}
                />
              </div>

              {/* Task Details Modal */}
              {selectedTask && (
                <TaskDetails
                  task={selectedTask}
                  onClose={() => setSelectedTask(null)}
                  onUpdateTask={(updatedTask) => {
                    updateTask(updatedTask);
                    setSelectedTask(updatedTask);
                  }}
                  comments={comments[selectedTask.id] || []}
                  onAddComment={(taskId, comment) => {
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

              {currentView === 'list' && (
                <ListView
                  tasks={[...tasks, sampleTask]}
                  onTaskClick={(task) => {
                    // Handle task click in list view
                    console.log('Task clicked:', task);
                  }}
                />
              )}
              {currentView === 'calendar' && (
                <CalendarView
                  tasks={[...tasks, sampleTask]}
                  onTaskClick={(task) => {
                    // Handle task click in calendar view
                    console.log('Task clicked:', task);
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

          {showLogin && <LoginForm />}
          {showAI && <AIAssistant onClose={() => setShowAI(false)} />}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default TaskPanel;
