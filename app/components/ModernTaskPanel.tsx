"use client";

import React, { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Task } from '../types/task';
import TaskPriorityMatrix from './TaskPriorityMatrix';
import TaskStats from './TaskStats';
import SearchBar from './SearchBar';
import { TaskList } from './TaskList';
import TaskDetailsPanel from './TaskDetailsPanel';
import TaskForm from './TaskForm';
import AGiXTConfig from './AGiXTConfig';
import AIAssistantPanel from './AIAssistantPanel';
import VoiceTaskAssistant from './VoiceTaskAssistant';
import { useSearch } from '../hooks/useSearch';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import LayoutSettingsPanel from './LayoutSettingsPanel';
import GroupingSettingsPanel from './GroupingSettingsPanel';
import GeminiConfig from './GeminiConfig';

interface ModernTaskPanelProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onAddTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void; // Updated type
  onReorderTasks: (tasks: Task[]) => void;
  lists: any[];
}

interface LayoutSettings {
  selectedLayout: 'board' | 'matrix' | 'list' | 'calendar';
  columnVisibility: {
    title: boolean;
    description: boolean;
    dueDate: boolean;
    priority: boolean;
    tags: boolean;
    assignees: boolean;
    subtasks: boolean;
    status: boolean;
  };
}

interface GroupingSettings {
  groupBy: 'list' | 'tag' | 'project' | 'none';
}

const ModernTaskPanel: React.FC<ModernTaskPanelProps> = ({
  tasks,
  onUpdateTask,
  onAddTask,
  onDeleteTask,
  onReorderTasks,
  lists,
}) => {
  // State management
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isAGiXTConfigOpen, setIsAGiXTConfigOpen] = useState(false);
  const [agixtConfig, setAgixtConfig] = useState({ backendUrl: '', authToken: '' });
  const [geminiConfig, setGeminiConfig] = useState({ apiKey: '', model: 'gemini-pro' });
  const [isGeminiConfigOpen, setIsGeminiConfigOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'board' | 'matrix'>('board');
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>({
    selectedLayout: 'board',
    columnVisibility: {
      title: true,
      description: true,
      dueDate: true,
      priority: true,
      tags: true,
      assignees: true,
      subtasks: true,
      status: true,
    },
  });
  const [groupingSettings, setGroupingSettings] = useState<GroupingSettings>({
    groupBy: 'none',
  });
  const [isLayoutSettingsOpen, setIsLayoutSettingsOpen] = useState(false);
  const [isGroupingSettingsOpen, setIsGroupingSettingsOpen] = useState(false);

  // Search and filter functionality
  const {
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    filterPriority,
    setFilterPriority,
    filteredAndSortedTasks
  } = useSearch(tasks);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewTask: () => setIsEditorOpen(true),
    onSearch: () => document.getElementById('search-input')?.focus(),
    onToggleView: () => setCurrentView(currentView === 'board' ? 'matrix' : 'board'),
    onDelete: () => selectedTask && onDeleteTask(selectedTask),
    onDeleteTask: () => selectedTask && onDeleteTask(selectedTask)
  });

  // Drag and drop handling
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const task = tasks.find(t => t.id === draggableId);
    if (!task || !destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      // Reorder within same status
      const statusTasks = tasks.filter(t => t.status === source.droppableId);
      const [movedTask] = statusTasks.splice(source.index, 1);
      statusTasks.splice(destination.index, 0, movedTask);

      const updatedTasks = tasks.map(t => {
        if (t.status === source.droppableId) {
          const reorderedTask = statusTasks.find(rt => rt.id === t.id);
          return reorderedTask || t;
        }
        return t;
      });

      onReorderTasks(updatedTasks);
    } else {
      // Move to different status
      onUpdateTask({
        ...task,
        status: destination.droppableId as Task['status'],
      });
    }
  };

  // Helper function to get grouped tasks
  const getGroupedTasks = (status: 'todo' | 'in-progress' | 'done') => {
    const filteredTasks = filteredAndSortedTasks().filter(task => task.status === status);

    if (groupingSettings.groupBy === 'none') {
      return filteredTasks;
    }

    const grouped: { [key: string]: Task[] } = {};
    const groupByKey = groupingSettings.groupBy as keyof Task;
    filteredTasks.forEach(task => {
      const groupKey = (task[groupByKey] as string) || 'Other';
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(task);
    });

    if (groupingSettings.groupBy === 'list') {
      // Sort groups by list order
      return Object.entries(grouped)
        .sort(([keyA], [keyB]) => {
          const indexA = lists.findIndex(list => list.id === keyA);
          const indexB = lists.findIndex(list => list.id === keyB);
          return indexA - indexB;
        })
        .flatMap(([, tasks]) => tasks);
    }

    return Object.values(grouped).flat();
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white p-6">
      <div className="flex flex-col h-full">
        {/* Top Bar */}
      <div className="flex items-center justify-between mb-8 bg-gray-900 p-6 rounded-lg shadow-lg">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Task Dashboard
          </h1>
          <div className="flex items-center space-x-2 ml-8">
            <div className="px-3 py-1 bg-gray-800 rounded-lg">
              <span className="text-gray-400 text-sm">Total Tasks: </span>
              <span className="text-white font-medium">{tasks.length}</span>
            </div>
            <div className="px-3 py-1 bg-gray-800 rounded-lg">
              <span className="text-gray-400 text-sm">Active: </span>
              <span className="text-white font-medium">{tasks.filter(t => t.status === 'in-progress').length}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentView(currentView === 'board' ? 'matrix' : 'board')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>{currentView === 'board' ? '📊 Matrix View' : '📋 Board View'}</span>
          </button>
          <button
            onClick={() => setIsLayoutSettingsOpen(true)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>⚙️ Layout Settings</span>
          </button>
          <button
            onClick={() => setIsGroupingSettingsOpen(true)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>🔀 Grouping Settings</span>
          </button>
          <button
            onClick={() => setIsAGiXTConfigOpen(true)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>⚙️ AGiXT Config</span>
          </button>
          <button
            onClick={() => setIsGeminiConfigOpen(true)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>🤖 Gemini Config</span>
          </button>
          <button
            onClick={() => setIsEditorOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg transition-colors flex items-center space-x-2 shadow-lg"
          >
            <span>➕ New Task</span>
          </button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="mb-8 space-y-6">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
          filterPriority={filterPriority}
          onFilterChange={setFilterPriority}
        />
        <TaskStats tasks={tasks} />
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Task Lists */}
        <div className="flex-1">
          {currentView === 'board' ? (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Todo Column */}
                <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-xl">
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold flex items-center space-x-2">
                        <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                        <span>To Do</span>
                      </h2>
                      <span className="text-gray-400 text-sm px-2 py-1 bg-gray-700 rounded-lg">
                        {getGroupedTasks('todo').length} tasks
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <TaskList
                      droppableId="todo"
                      tasks={getGroupedTasks('todo')}
                      onUpdateTask={onUpdateTask}
                      onTaskClick={setSelectedTask}
                      onDeleteTask={onDeleteTask}
                      onReorderTasks={onReorderTasks}
                      listId="default"
                    />
                  </div>
                </div>

                {/* In Progress Column */}
                <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-xl">
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold flex items-center space-x-2">
                        <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
                        <span>In Progress</span>
                      </h2>
                      <span className="text-gray-400 text-sm px-2 py-1 bg-gray-700 rounded-lg">
                        {getGroupedTasks('in-progress').length} tasks
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <TaskList
                      droppableId="in-progress"
                      tasks={getGroupedTasks('in-progress')}
                      onUpdateTask={onUpdateTask}
                      onTaskClick={setSelectedTask}
                      onDeleteTask={onDeleteTask}
                      onReorderTasks={onReorderTasks}
                      listId="default"
                    />
                  </div>
                </div>

                {/* Done Column */}
                <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-xl">
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold flex items-center space-x-2">
                        <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                        <span>Done</span>
                      </h2>
                      <span className="text-gray-400 text-sm px-2 py-1 bg-gray-700 rounded-lg">
                        {getGroupedTasks('done').length} tasks
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <TaskList
                      droppableId="done"
                      tasks={getGroupedTasks('done')}
                      onUpdateTask={onUpdateTask}
                      onTaskClick={setSelectedTask}
                      onDeleteTask={onDeleteTask}
                      onReorderTasks={onReorderTasks}
                      listId="default"
                    />
                  </div>
                </div>
              </div>
            </DragDropContext>
          ) : (
            <TaskPriorityMatrix
              tasks={filteredAndSortedTasks()}
              onTaskClick={setSelectedTask}
              onUpdateTask={onUpdateTask}
            />
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-80 space-y-6">
          {geminiConfig.apiKey && agixtConfig.backendUrl && agixtConfig.authToken && (
            <VoiceTaskAssistant
              onTaskUpdate={onUpdateTask}
              onNewTask={onAddTask}
              geminiApiKey={geminiConfig.apiKey}
              selectedTask={selectedTask}
              agixtConfig={agixtConfig}
            />
          )}
          {agixtConfig.backendUrl && agixtConfig.authToken && (
            <AIAssistantPanel
              backendUrl={agixtConfig.backendUrl}
              authToken={agixtConfig.authToken}
              onTaskSuggestion={(suggestion) => {
                const newTask: Task = {
                  id: Date.now().toString(),
                  title: suggestion.title || '',
                  description: suggestion.description || '',
                  priority: suggestion.priority || 'medium',
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
                onAddTask(newTask);
              }}
              onTaskOptimization={(taskIds) => {
                const optimizedTasks = taskIds
                  .map(id => tasks.find(t => t.id === id))
                  .filter(Boolean) as Task[];
                onReorderTasks(optimizedTasks);
              }}
              tasks={tasks}
              selectedTask={selectedTask}
            />
          )}
        </div>
      </div>
      </div>

      {/* Modals */}
      {isLayoutSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <LayoutSettingsPanel
            layoutSettings={layoutSettings}
            onSave={(newSettings: LayoutSettings) => {
              setLayoutSettings(newSettings);
              setIsLayoutSettingsOpen(false);
            }}
            onClose={() => setIsLayoutSettingsOpen(false)}
          />
        </div>
      )}

      {isGroupingSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <GroupingSettingsPanel
            groupingSettings={groupingSettings}
            onSave={(newSettings: GroupingSettings) => {
              setGroupingSettings(newSettings);
              setIsGroupingSettingsOpen(false);
            }}
            onClose={() => setIsGroupingSettingsOpen(false)}
          />
        </div>
      )}

      {isAGiXTConfigOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <AGiXTConfig
            onClose={() => setIsAGiXTConfigOpen(false)}
            onSave={(config) => {
              setAgixtConfig(config);
              setIsAGiXTConfigOpen(false);
            }}
          />
        </div>
      )}

      {isGeminiConfigOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <GeminiConfig
            onClose={() => setIsGeminiConfigOpen(false)}
            onSave={(config) => {
              setGeminiConfig(config);
              setIsGeminiConfigOpen(false);
            }}
          />
        </div>
      )}

      {isEditorOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <TaskForm
            onSubmit={(task) => {
              onAddTask(task);
              setIsEditorOpen(false);
            }}
            onCancel={() => setIsEditorOpen(false)}
            lists={lists}
          />
        </div>
      )}

      {selectedTask && (
        <TaskDetailsPanel
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={onUpdateTask}
          allTasks={tasks}
          className="fixed inset-y-0 right-0 w-[32rem] shadow-xl"
        />
      )}
    </div>
  );
};

export default ModernTaskPanel;