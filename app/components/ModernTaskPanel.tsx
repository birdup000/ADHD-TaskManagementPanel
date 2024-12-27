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
import { useSearch } from '../hooks/useSearch';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

interface ModernTaskPanelProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onAddTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onReorderTasks: (tasks: Task[]) => void;
  lists: any[];
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
  const [currentView, setCurrentView] = useState<'board' | 'matrix'>('board');

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
    onDelete: () => {},
    onDeleteTask: () => {}
  });

  // Drag and drop handling
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const task = tasks.find(t => t.id === draggableId);
    
    if (!task) return;

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

  return (
    <div className="min-h-screen bg-[#111111] text-white p-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Task Dashboard</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsAGiXTConfigOpen(true)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            AGiXT Config
          </button>
          <button
            onClick={() => setCurrentView(currentView === 'board' ? 'matrix' : 'board')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            {currentView === 'board' ? 'Show Matrix' : 'Show Board'}
          </button>
          <button
            onClick={() => setIsEditorOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            New Task
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
                <div className="bg-gray-800 rounded-lg p-4">
                  <h2 className="text-xl font-semibold mb-4">To Do</h2>
                  <TaskList
                    droppableId="todo"
                    tasks={filteredAndSortedTasks().filter(task => task.status === 'todo')}
                    onUpdateTask={onUpdateTask}
                    onTaskClick={setSelectedTask}
                    onDeleteTask={onDeleteTask}
                    onReorderTasks={onReorderTasks}
                    listId="default"
                  />
                </div>

                {/* In Progress Column */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h2 className="text-xl font-semibold mb-4">In Progress</h2>
                  <TaskList
                    droppableId="in-progress"
                    tasks={filteredAndSortedTasks().filter(task => task.status === 'in-progress')}
                    onUpdateTask={onUpdateTask}
                    onTaskClick={setSelectedTask}
                    onDeleteTask={onDeleteTask}
                    onReorderTasks={onReorderTasks}
                    listId="default"
                  />
                </div>

                {/* Done Column */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h2 className="text-xl font-semibold mb-4">Done</h2>
                  <TaskList
                    droppableId="done"
                    tasks={filteredAndSortedTasks().filter(task => task.status === 'done')}
                    onUpdateTask={onUpdateTask}
                    onTaskClick={setSelectedTask}
                    onDeleteTask={onDeleteTask}
                    onReorderTasks={onReorderTasks}
                    listId="default"
                  />
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

      {/* Modals */}
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