"use client";

import React from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import ExportMenu from './ExportMenu';
import { TaskList as TaskListComponent } from './TaskList';
import { ThemeProvider } from '../hooks/useTheme';
import { useTasks } from '../hooks/useTasks';
import { useSearch } from '../hooks/useSearch';
import SearchBar from './SearchBar';
import { TaskCard } from './TaskCard';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import ThemeSelector from './ThemeSelector';
import TaskForm from './TaskForm';
import CalendarView from './CalendarView';
import ListView from './ListView';
import IntegrationButton from './IntegrationButton';
import TaskDetails from './TaskDetails';
import LoginForm from './LoginForm';
import AIAssistant from './AIAssistant';
import ShortcutsDialog from './ShortcutsDialog';
import { Task, TaskList } from '../types/task';
import { StorageConfig } from '../types/storage';
import { Comment } from './CommentSection';
import { colors } from '../../tailwind.config';
import TaskStats from './TaskStats';
import NotesEditor from './NotesEditor';
import { WorkspacePanel } from './WorkspacePanel';
import { ViewType, LayoutType } from '../types/view';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { initializeAGiXT, getAgents, handleGenerateSubtasks, handleRunChain, updateConversationLog } from '../utils/agixt';
import AGiXTConfig from './AGiXTConfig';

type ThemeType = typeof colors.dark;

interface Agent {
  name: string;
}

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
  const [currentTab, setCurrentTab] = React.useState<'tasks' | 'notes' | 'workspaces'>('tasks');
  const [showCompletedRecurring, setShowCompletedRecurring] = React.useState(true);
  const [showIntegrations, setShowIntegrations] = React.useState(false);
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [storageConfig, setStorageConfig] = React.useState<StorageConfig>(() => {
    const email = localStorage.getItem('email');
    const userId = email || 'anonymous';
    return {
      remoteEnabled: localStorage.getItem('remoteStorageEnabled') === 'true',
      apiKey: localStorage.getItem('remoteStorageApiKey') || undefined,
      userId
    };
  });

  const { 
    tasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    reorderTasks, 
    importTasks, 
    lists, 
    addList, 
    updateList, 
    deleteList,
    sync,
    isLoading
  } = useTasks(storageConfig);

  const [isSyncing, setIsSyncing] = React.useState(false);
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
  const [currentList, setCurrentList] = React.useState<string>('default');
  const [currentLayout, setCurrentLayout] = React.useState<LayoutType>('default');
  const [isRenamingList, setIsRenamingList] = React.useState(false);
  const [renamingListId, setRenamingListId] = React.useState<string | null>(null);
  const [renamingListName, setRenamingListName] = React.useState('');
  const [isRenamingProject, setIsRenamingProject] = React.useState(false);
  const [renamingProjectName, setRenamingProjectName] = React.useState('Midnight Eclipse');
  const [showProjectActions, setShowProjectActions] = React.useState(false);
  const projectActionsRef = React.useRef<HTMLDivElement>(null);
  const [showListActions, setShowListActions] = React.useState(false);
  const [showExportMenu, setShowExportMenu] = React.useState(false);
  const listActionsRef = React.useRef<HTMLDivElement>(null);
  const exportMenuRef = React.useRef<HTMLDivElement>(null);
  // AGiXT state
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = React.useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = React.useState(false);
  const [showAGiXTConfig, setShowAGiXTConfig] = React.useState(false);
  const router = useRouter();

  const handleSaveAGiXTConfig = ({ backendUrl, authToken }: { backendUrl: string; authToken: string }) => {
    localStorage.setItem('agixtapi', backendUrl);
    localStorage.setItem('agixtkey', authToken);
    initAGiXT();
  };

  const initAGiXT = async () => {
    const backendUrl = localStorage.getItem('agixtapi');
    const authToken = localStorage.getItem('agixtkey');
    
    if (backendUrl && authToken) {
      try {
        const agentList = await getAgents(backendUrl, authToken);
        if (agentList && agentList.length > 0) {
          setAgents(agentList);
          setSelectedAgent(agentList[0].name);
        }
      } catch (error) {
        console.error('Error initializing AGiXT:', error);
        setShowAGiXTConfig(true);
      }
    } else {
      setShowAGiXTConfig(true);
    }
  };

  React.useEffect(() => {
    initAGiXT();
  }, []);

  const generateSubtasks = async (task: Task) => {
    const backendUrl = localStorage.getItem('agixtapi');
    const authToken = localStorage.getItem('authToken');

    if (!backendUrl || !authToken || !selectedAgent) {
      console.error('AGiXT configuration missing');
      return;
    }

    setIsLoadingAI(true);
    try {
      const updatedTask = await handleGenerateSubtasks(task, selectedAgent, backendUrl, authToken);
      if (updatedTask) {
        updateTask(updatedTask);
      }
    } catch (error) {
      console.error('Error generating subtasks:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const runChain = async (task: Task) => {
    const backendUrl = localStorage.getItem('agixtapi');
    const authToken = localStorage.getItem('authToken');

    if (!backendUrl || !authToken || !selectedAgent) {
      console.error('AGiXT configuration missing');
      return;
    }

    setIsLoadingAI(true);
    try {
      const updatedTask = await handleRunChain(task, selectedAgent, backendUrl, authToken);
      if (updatedTask) {
        updateTask(updatedTask);
      }
    } catch (error) {
      console.error('Error running chain:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

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

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (projectActionsRef.current && !projectActionsRef.current.contains(event.target as Node)) {
        setShowProjectActions(false);
      }
      if (listActionsRef.current && !listActionsRef.current.contains(event.target as Node)) {
        setShowListActions(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  const filteredTasks = () => {
    return filteredAndSortedTasks().filter(task => task.listId === currentList);
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('noAuth');
    router.push('/');
  };

  const email = localStorage.getItem('email');
  const authToken = localStorage.getItem('authToken');
  const noAuth = localStorage.getItem('noAuth');

  return (
    <ThemeProvider value={{ theme, setTheme }}>
      <div style={{ backgroundColor: theme.primary }} className="min-h-screen text-white">
        <div className="container mx-auto p-4">
          <header className="flex flex-col gap-4 mb-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{renamingProjectName}</h1>
                    <button
                      onClick={() => setShowProjectActions(!showProjectActions)}
                      className="text-gray-400 hover:text-white focus:outline-none"
                      title="Project Actions"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                        />
                      </svg>
                    </button>
                  </div>
                  {showProjectActions && (
                    <div
                      ref={projectActionsRef}
                      className="absolute top-full mt-2 right-0 bg-[#2A2A2A] rounded-md shadow-lg z-10"
                    >
                      <button
                        onClick={() => {
                          setIsRenamingProject(true);
                          setShowProjectActions(false);
                        }}
                        className="block px-4 py-2 text-white hover:bg-[#333333] w-full text-left"
                      >
                        Rename
                      </button>
                      {/* Add other project actions here */}
                    </div>
                  )}
                  {isRenamingProject && (
                    <input
                      type="text"
                      value={renamingProjectName}
                      onChange={(e) => setRenamingProjectName(e.target.value)}
                      onBlur={() => setIsRenamingProject(false)}
                      className="text-2xl font-bold bg-[#2A2A2A] rounded-md px-2 py-1 focus:outline-none absolute top-0 left-0"
                      style={{ width: '100%' }}
                    />
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentTab('tasks')}
                    className={`px-4 py-2 rounded-md ${currentTab === 'tasks' ? 'bg-indigo-600' : 'bg-[#2A2A2A] hover:bg-[#333333]'} transition-colors`}
                  >
                    Tasks
                  </button>
                  <button
                    onClick={() => setCurrentTab('notes')}
                    className={`px-4 py-2 rounded-md ${currentTab === 'notes' ? 'bg-indigo-600' : 'bg-[#2A2A2A] hover:bg-[#333333]'} transition-colors`}
                  >
                    Notes
                  </button>
                  <button
                    onClick={() => setCurrentTab('workspaces')}
                    className={`px-4 py-2 rounded-md ${currentTab === 'workspaces' ? 'bg-indigo-600' : 'bg-[#2A2A2A] hover:bg-[#333333]'} transition-colors`}
                  >
                    Workspaces
                  </button>
                </div>
                <div className="text-sm text-gray-400">
                  Press "?" for keyboard shortcuts
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {currentTab === 'tasks' && (
                  <div className="flex bg-[#2A2A2A] rounded-lg p-1">
                    <button
                      onClick={() => setCurrentView('board')}
                      className={`px-4 py-2 rounded-md ${currentView === 'board' ? 'bg-indigo-600' : 'hover:bg-[#333333]'} transition-colors`}
                    >
                      Board
                    </button>
                    <button
                      onClick={() => setCurrentView('calendar')}
                      className={`px-4 py-2 rounded-md ${currentView === 'calendar' ? 'bg-indigo-600' : 'hover:bg-[#333333]'} transition-colors`}
                    >
                      Calendar
                    </button>
                  </div>
                )}
                <ThemeSelector currentTheme={theme} onThemeChange={setTheme} />
                <div className="flex items-center space-x-2">
                  <div className="flex items-center gap-2">
                    {agents.length > 0 ? (
                      <select
                        value={selectedAgent}
                        onChange={(e) => setSelectedAgent(e.target.value)}
                        className="p-2 rounded-lg bg-[#2A2A2A] hover:bg-[#333333] transition-colors text-sm"
                        title="Select AI Agent"
                      >
                        {agents.map((agent) => (
                          <option key={agent.name} value={agent.name}>
                            {agent.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <button
                        onClick={() => setShowAGiXTConfig(true)}
                        className="p-2 rounded-lg bg-[#2A2A2A] hover:bg-[#333333] transition-colors text-sm"
                        title="Configure AGiXT"
                      >
                        Configure AGiXT
                      </button>
                    )}
                    <div className="relative group">
                      <button
                        onClick={() => setShowAI(true)}
                        className="p-2 rounded-lg bg-[#2A2A2A] hover:bg-[#333333] transition-colors"
                        title="AI Assistant"
                        disabled={isLoadingAI}
                      >
                        {isLoadingAI ? (
                          <span className="animate-spin">⚙️</span>
                        ) : (
                          <span>🤖</span>
                        )}
                      </button>
                      <span className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded whitespace-nowrap">
                        AI Assistant
                      </span>
                    </div>
                    <div className="relative group">
                      <button
                        onClick={() => setCurrentTab('workspaces')}
                        className="p-2 rounded-lg bg-[#2A2A2A] hover:bg-[#333333] transition-colors"
                        title="Workspaces"
                      >
                        <span>📦</span>
                      </button>
                      <span className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded whitespace-nowrap">
                        Workspaces
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowIntegrations(true)}
                    className="p-2 rounded-lg bg-[#2A2A2A] hover:bg-[#333333] transition-colors"
                    title="Integrations"
                  >
                    🔌
                  </button>
                  {storageConfig.remoteEnabled && (
                    <div className="relative group">
                      <button
                        onClick={async () => {
                          try {
                            setIsSyncing(true);
                            const userId = storageConfig.userId || 'anonymous';
                            setStorageConfig(prev => ({ ...prev, userId }));
                            await sync();
                          } catch (error) {
                            console.error('Sync failed:', error);
                          } finally {
                            setIsSyncing(false);
                          }
                        }}
                        className="p-2 rounded-lg bg-[#2A2A2A] hover:bg-[#333333] transition-colors"
                        title="Sync Tasks"
                        disabled={isSyncing || isLoading}
                      >
                        {isSyncing ? '⏳' : '🔄'}
                      </button>
                      <span className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded whitespace-nowrap">
                        {isSyncing ? 'Syncing...' : 'Sync Tasks'}
                      </span>
                    </div>
                  )}
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
                {(authToken || noAuth) && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">
                      {email ? `Logged in as ${email}` : 'Logged in'}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1.5 rounded text-sm bg-red-600/20 text-red-300 hover:bg-red-600/30 transition-colors"
                      title="Logout"
                    >
                      Logout
                    </button>
                  </div>
                )}
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
                    const selectedTasks = filteredTasks().filter(t => t.status === 'todo');
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
                    const template = filteredTasks()
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
                          const userId = storageConfig.userId || 'anonymous';
                          const importedTasks = lines.map(line => {
                            const [title, description, status, priority, dueDate, tags, assignees] = line.split(',');
                            const task: Task = {
                              id: crypto.randomUUID(),
                              title: title || 'Untitled Task',
                              description: description || '',
                              status: (status as Task['status']) || 'todo',
                              priority: (priority as Task['priority']) || 'medium',
                              dueDate: dueDate ? new Date(dueDate) : undefined,
                              tags: tags ? tags.split(', ').filter(t => t) : undefined,
                              assignees: assignees ? assignees.split(', ').filter(a => a) : undefined,
                              createdAt: new Date(),
                              updatedAt: new Date(),
                              listId: currentList,
                              owner: userId,
                              collaborators: [],
                              activityLog: [],
                              comments: [],
                              version: 1
                            };
                            return task;
                          });
                          importTasks(importedTasks, currentList);
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
                  <div className="relative">
                    <button
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      className="px-3 py-1.5 rounded text-sm bg-gray-600/20 text-gray-300 hover:bg-gray-600/30 transition-colors flex items-center gap-2"
                      title="Export options"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      Export
                    </button>
                    {showExportMenu && (
                      <div ref={exportMenuRef}>
                        <ExportMenu
                          tasks={filteredTasks()}
                          onClose={() => setShowExportMenu(false)}
                        />
                      </div>
                    )}
                  </div>
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
            <div className="flex items-center justify-between mb-4">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                sortBy={sortBy}
                onSortChange={setSortBy}
                filterPriority={filterPriority}
                onFilterChange={setFilterPriority}
              />
              <div className="flex items-center gap-2 relative">
                {isRenamingList && renamingListId ? (
                  <input
                    type="text"
                    value={renamingListName}
                    onChange={(e) => setRenamingListName(e.target.value)}
                    onBlur={() => {
                      const list = lists.find(l => l.id === renamingListId);
                      if (list) {
                        updateList({ ...list, name: renamingListName });
                      }
                      setIsRenamingList(false);
                      setRenamingListId(null);
                      setRenamingListName('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const list = lists.find(l => l.id === renamingListId);
                        if (list) {
                          updateList({ ...list, name: renamingListName });
                        }
                        setIsRenamingList(false);
                        setRenamingListId(null);
                        setRenamingListName('');
                      }
                    }}
                    className="px-3 py-1.5 rounded text-sm bg-[#2A2A2A] text-white hover:bg-[#333333] transition-colors"
                  />
                ) : (
                  <select
                    value={currentList}
                    onChange={(e) => {
                      setCurrentList(e.target.value);
                      setIsRenamingList(false);
                      setRenamingListId(null);
                      setRenamingListName('');
                    }}
                    className="px-3 py-1.5 rounded text-sm bg-[#2A2A2A] text-white hover:bg-[#333333] transition-colors"
                  >
                    {lists.map(list => (
                      <option key={list.id} value={list.id} onDoubleClick={() => {
                        setIsRenamingList(true);
                        setRenamingListId(list.id);
                        setRenamingListName(list.name);
                      }}>{list.name}</option>
                    ))}
                  </select>
                )}
                <div className="relative">
                  <button
                    onClick={() => setShowListActions(!showListActions)}
                    className="px-3 py-1.5 rounded text-sm bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 transition-colors flex items-center gap-1"
                    title="List Actions"
                  >
                    List Actions
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {showListActions && (
                    <div
                      ref={listActionsRef}
                      className="absolute top-full mt-2 left-0 bg-[#2A2A2A] rounded-md shadow-lg z-10"
                    >
                      <button
                        onClick={() => {
                          const newListId = crypto.randomUUID();
                          addList({ id: newListId, name: 'New List' });
                          
                          // Create a default task for the new list
                          const userId = storageConfig.userId || 'anonymous';
                          const newTask: Task = {
                            id: crypto.randomUUID(),
                            title: 'New Task',
                            description: 'This is a default task for the new list.',
                            status: 'todo',
                            priority: 'medium',
                            listId: newListId,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            owner: userId,
                            collaborators: [],
                            activityLog: [],
                            comments: [],
                            version: 1
                          };
                          addTask(newTask);
                          
                          setCurrentList(newListId);
                          setShowListActions(false);
                        }}
                        className="block px-4 py-2 text-white hover:bg-[#333333] w-full text-left flex items-center gap-2"
                      >
                        <PlusIcon className="h-4 w-4" />
                        Add List
                      </button>
                      <button
                        onClick={() => {
                          setIsRenamingList(true);
                          setRenamingListId(currentList);
                          const list = lists.find(l => l.id === currentList);
                          if (list) {
                            setRenamingListName(list.name);
                          }
                          setShowListActions(false);
                        }}
                        className="block px-4 py-2 text-white hover:bg-[#333333] w-full text-left flex items-center gap-2"
                      >
                        <PencilIcon className="h-4 w-4" />
                        Rename List
                      </button>
                      <button
                        onClick={() => {
                          if (currentList !== 'default') {
                            deleteList(currentList);
                            setCurrentList('default');
                          }
                          setShowListActions(false);
                        }}
                        className="block px-4 py-2 text-white hover:bg-[#333333] w-full text-left flex items-center gap-2"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Delete List
                      </button>
                    </div>
                  )}
                </div>
                <select
                  value={currentLayout}
                  onChange={(e) => setCurrentLayout(e.target.value as LayoutType)}
                  className="px-3 py-1.5 rounded text-sm bg-[#2A2A2A] text-white hover:bg-[#333333] transition-colors"
                >
                  <option value="default">Default</option>
                  <option value="developer">Developer</option>
                </select>
              </div>
            </div>
          </header>
          
          {currentTab === 'tasks' ? (
            <DragDropContext onDragEnd={onDragEnd}>
              <main className={`task-board ${currentLayout === 'developer' ? 'flex' : (currentView === 'calendar' ? '' : 'grid grid-cols-1 md:grid-cols-3 gap-6')}`}>
                {currentLayout === 'developer' ? (
                  <div className="bg-[#2A2A2A] rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-4">Developer Layout</h2>
                    <p className="text-gray-400">
                      This is a placeholder for the developer layout.
                      <br />
                      Repository information and feature requests will be displayed here.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Task Columns */}
                    <div className="bg-[#2A2A2A] rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">To Do</h2>
                        <span className="text-sm text-gray-400">
                          {filteredTasks().filter(t => t.status === 'todo').length} tasks
                        </span>
                      </div>
                      <TaskListComponent
                        droppableId="todo"
                        tasks={filteredTasks().filter(task => task.status === 'todo')}
                        onUpdateTask={updateTask}
                        onTaskClick={(task: Task) => setSelectedTask(task)}
                        onDeleteTask={(task: Task) => deleteTask(task.id)}
                        onReorderTasks={reorderTasks}
                        listId={currentList}
                      />
                      
                      {/* Completed Recurring Tasks Section */}
                      {filteredTasks().some(t => t.recurring && t.status === 'done') && (
                        <div className="mt-6 border-t border-[#444444] pt-4">
                          <div 
                            className="flex items-center gap-2 mb-4 cursor-pointer hover:text-gray-300 transition-colors"
                            onClick={() => setShowCompletedRecurring(!showCompletedRecurring)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className={`h-4 w-4 transform transition-transform ${showCompletedRecurring ? 'rotate-90' : ''}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                            <h3 className="text-md font-medium text-gray-400">Completed Recurring Tasks</h3>
                            <span className="text-sm text-gray-500">
                              ({filteredTasks().filter(t => t.recurring && t.status === 'done').length})
                            </span>
                          </div>
                          <div className={`transition-all duration-200 ${showCompletedRecurring ? 'block' : 'hidden'}`}>
                            <TaskListComponent
                              droppableId="completed-recurring"
                              tasks={filteredTasks().filter(task => task.recurring && task.status === 'done')}
                              onUpdateTask={updateTask}
                              onTaskClick={(task: Task) => setSelectedTask(task)}
                              onDeleteTask={(task: Task) => deleteTask(task.id)}
                              onReorderTasks={reorderTasks}
                              listId={currentList}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-[#2A2A2A] rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">In Progress</h2>
                        <span className="text-sm text-gray-400">
                          {filteredTasks().filter(t => t.status === 'in-progress').length} tasks
                        </span>
                      </div>
                      <TaskListComponent
                        droppableId="in-progress"
                        tasks={filteredTasks().filter(task => task.status === 'in-progress')}
                        onUpdateTask={updateTask}
                        onTaskClick={(task: Task) => setSelectedTask(task)}
                        onDeleteTask={(task: Task) => deleteTask(task.id)}
                        onReorderTasks={reorderTasks}
                        listId={currentList}
                      />
                    </div>

                    <div className="bg-[#2A2A2A] rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-semibold">Done</h2>
                          <span className="text-sm text-gray-400">
                            {filteredTasks().filter(t => t.status === 'done').length} tasks
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
                      <TaskListComponent
                        droppableId="done"
                        tasks={filteredTasks().filter(task => task.status === 'done')}
                        onUpdateTask={updateTask}
                        onTaskClick={(task: Task) => setSelectedTask(task)}
                        onDeleteTask={(task: Task) => deleteTask(task.id)}
                        onReorderTasks={reorderTasks}
                        listId={currentList}
                      />
                    </div>
                  </>
                )}
                
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
                        lists={lists}
                      />
                    </div>
                  </div>
                )}
              </main>
            </DragDropContext>
          ) : (
            <main className="bg-[#212121] rounded-lg overflow-hidden h-[calc(100vh-12rem)]">
              {currentTab === 'notes' ? (
                <NotesEditor />
              ) : (
                <WorkspacePanel />
              )}
            </main>
          )}

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
          {showAI && (
            <AIAssistant 
              onClose={() => setShowAI(false)}
              selectedAgent={selectedAgent}
              onGenerateSubtasks={generateSubtasks}
              onRunChain={runChain}
              isLoading={isLoadingAI}
            />
          )}
          {showAGiXTConfig && (
            <AGiXTConfig
              onClose={() => setShowAGiXTConfig(false)}
              onSave={handleSaveAGiXTConfig}
            />
          )}
          {showShortcuts && <ShortcutsDialog onClose={() => setShowShortcuts(false)} />}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default TaskPanel;
