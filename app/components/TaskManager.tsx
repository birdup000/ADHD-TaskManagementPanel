"use client";

import React from 'react';
import TaskList from './tasks/TaskList';
import BoardView from './tasks/BoardView';
import MindMapView from './tasks/MindMapView';
// import TaskDetailPanel from './tasks/TaskDetailPanel'; // To be replaced
import NewTaskView from './tasks/NewTaskView'; // Import the new task view
import { Task } from '../types/task';
import { useTasks } from '../hooks/useTasks';

type ViewMode = 'list' | 'board' | 'mindmap';

const TaskManager: React.FC = () => {
  const {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus
  } = useTasks();

  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<ViewMode>('list');

  const selectedTask = React.useMemo(() => {
    return tasks.find(task => task.id === selectedTaskId) || null;
  }, [tasks, selectedTaskId]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden"> {/* Ensure overflow is handled */}
      {/* Main Task List / Board / MindMap Area */}
      {/* This part will dynamically take less space if a task is selected, or full width if not */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-y-auto custom-scrollbar
                    ${selectedTaskId ? 'md:w-[calc(100%-360px)] lg:w-[calc(100%-400px)]' : 'w-full'}`}
      >
        {/* View Toggle Buttons */}
        <div className="p-4 border-b border-border-default sticky top-0 bg-bg-primary z-10">
          <div className="flex items-center gap-2 md:gap-4">
            {(['list', 'board', 'mindmap'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`btn ${viewMode === mode ? 'btn-primary' : 'btn-ghost'} btn-sm capitalize`}
                aria-pressed={viewMode === mode}
              >
                {mode} View
              </button>
            ))}
          </div>
        </div>

        {/* Conditional Task Views */}
        <div className="flex-1 p-2 md:p-4"> {/* Added padding for content within scrollable area */}
          {viewMode === 'list' && (
            <TaskList
              tasks={tasks}
              onTaskSelect={setSelectedTaskId}
              onTaskStatusChange={updateTaskStatus}
              selectedTaskId={selectedTaskId} // Pass selectedTaskId for highlighting
            />
          )}
          {viewMode === 'board' && (
            <BoardView
              tasks={tasks}
              onTaskSelect={setSelectedTaskId}
              onTaskStatusChange={updateTaskStatus}
            />
          )}
          {viewMode === 'mindmap' && (
            <MindMapView
              tasks={tasks}
              onTaskSelect={setSelectedTaskId}
              onTaskCreate={addTask}
            />
          )}
        </div>
      </div>

      {/* New Task View (Task Detail Panel) - slides in or is present */}
      {/* The NewTaskView itself handles its width (md:w-[320px] lg:w-[360px]) */}
      {/* We control its visibility and animation here */}
      <div
        className={`fixed inset-y-0 right-0 md:relative md:inset-auto bg-bg-secondary border-l border-border-default shadow-xl md:shadow-none
                    transform transition-transform duration-300 ease-in-out z-20
                    ${selectedTaskId ? 'translate-x-0' : 'translate-x-full md:translate-x-0 md:hidden'}`} // Control visibility and slide-in
        style={{ width: selectedTaskId ? 'clamp(320px, 90vw, 420px)' : '0px' }} // Dynamic width for mobile overlay, fixed for desktop
      >
        {selectedTaskId && ( // Only render if a task is selected
          <NewTaskView
            taskId={selectedTaskId}
            onClose={() => setSelectedTaskId(null)}
            // onSave={updateTask} // NewTaskView handles its own saving via its sub-components & useTasks hook
            // onDelete={deleteTask} // Similarly, can be handled within or passed if preferred
          />
        )}
      </div>
    </div>
  );
};

export default TaskManager;