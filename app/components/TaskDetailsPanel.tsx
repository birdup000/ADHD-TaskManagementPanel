"use client";

import React from 'react';
import { Task } from '../types/task';
import NotesEditor from './NotesEditor';
import TaskProgress from './TaskProgress';
import TaskComments from './TaskComments';
import TaskAttachments from './TaskAttachments';
import TaskTimer from './TaskTimer';
import TaskNotifications from './TaskNotifications';
import TaskRecurrence from './TaskRecurrence';
import TaskHistory from './TaskHistory';
import TaskLabels from './TaskLabels';
import TaskDependencies from './TaskDependencies';
import AIEnhancedRichTextEditor from './AIEnhancedRichTextEditor';
import VoiceTaskAssistant from './VoiceTaskAssistant';

interface TaskDetailsPanelProps {
  task: Task | null;
  onClose: () => void;
  onUpdateTask: (task: Task) => void;
  onAddTask?: (task: Task) => void;
  allTasks: Task[];
  className?: string;
}

const TaskDetailsPanel: React.FC<TaskDetailsPanelProps> = ({
  task,
  onClose,
  onUpdateTask,
  allTasks,
  className = '',
}) => {
  if (!task) return null;

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleProgressChange = (value: number) => {
    onUpdateTask({
      ...task,
      progress: value,
      status: value === 100 ? 'done' : value > 0 ? 'in-progress' : task.status,
      activityLog: [
        ...task.activityLog,
        {
          id: Date.now().toString(),
          taskId: task.id,
          userId: 'current-user',
          action: 'updated',
          timestamp: new Date(),
        },
      ],
    });
  };

  const handleStatusChange = (status: Task['status']) => {
    onUpdateTask({
      ...task,
      status,
      progress: status === 'done' ? 100 : task.progress,
      activityLog: [
        ...task.activityLog,
        {
          id: Date.now().toString(),
          taskId: task.id,
          userId: 'current-user',
          action: 'status_changed',
          timestamp: new Date(),
        },
      ],
    });
  };

  const handlePriorityChange = (priority: Task['priority']) => {
    onUpdateTask({
      ...task,
      priority,
      activityLog: [
        ...task.activityLog,
        {
          id: Date.now().toString(),
          taskId: task.id,
          userId: 'current-user',
          action: 'updated',
          timestamp: new Date(),
        },
      ],
    });
  };

  return (
    <div className={`fixed inset-y-0 right-0 w-[32rem] bg-gradient-to-b from-gray-800 to-gray-900 shadow-xl overflow-y-auto ${className}`}>
      <div className="sticky top-0 bg-gradient-to-b from-gray-800 to-gray-900 p-6 border-b border-gray-700 z-10">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${
              task.status === 'done' 
                ? 'bg-green-400' 
                : task.status === 'in-progress' 
                  ? 'bg-blue-400' 
                  : 'bg-gray-400'
            }`} />
            <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Task Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div>
          <h3 className="text-xl font-bold mb-2">{task.title}</h3>
          <p className="text-gray-400 text-sm">{task.description}</p>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            task.priority === 'high' 
              ? 'bg-red-500/20 text-red-300' 
              : task.priority === 'medium'
                ? 'bg-yellow-500/20 text-yellow-300'
                : 'bg-green-500/20 text-green-300'
          }`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
          </div>
          {task.dueDate && (
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              new Date(task.dueDate) < new Date() ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'
            }`}>
              Due {formatDate(task.dueDate)}
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Quick Actions */}
        <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Status
            </label>
            <div className="flex gap-2">
              {(['todo', 'in-progress', 'done'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    task.status === status
                      ? status === 'done'
                        ? 'bg-green-500/20 text-green-300 ring-2 ring-green-500/50'
                        : status === 'in-progress'
                          ? 'bg-blue-500/20 text-blue-300 ring-2 ring-blue-500/50'
                          : 'bg-gray-500/20 text-gray-300 ring-2 ring-gray-500/50'
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {status === 'todo' ? '📋 To Do' : status === 'in-progress' ? '🔄 In Progress' : '✓ Done'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Priority Level
            </label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((priority) => (
                <button
                  key={priority}
                  onClick={() => handlePriorityChange(priority)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                    task.priority === priority
                      ? priority === 'high'
                        ? 'bg-red-500/20 text-red-300 ring-2 ring-red-500/50'
                        : priority === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-300 ring-2 ring-yellow-500/50'
                          : 'bg-green-500/20 text-green-300 ring-2 ring-green-500/50'
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {priority === 'low' ? '🟢' : priority === 'medium' ? '🟡' : '🔴'}
                  {priority}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Progress
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    task.progress === 100 
                      ? 'bg-green-500' 
                      : task.progress > 66 
                        ? 'bg-blue-500'
                        : task.progress > 33
                          ? 'bg-yellow-500'
                          : 'bg-gray-500'
                  }`}
                  style={{ width: `${task.progress}%` }}
                />
              </div>
              <input
                type="number"
                min="0"
                max="100"
                value={task.progress}
                onChange={(e) => handleProgressChange(Number(e.target.value))}
                className="w-16 px-2 py-1 bg-gray-700 rounded text-sm text-white text-center"
              />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Timeline
          </h4>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Created</p>
                <p className="text-gray-400">{formatDate(task.createdAt)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Last Updated</p>
                <p className="text-gray-400">{formatDate(task.updatedAt)}</p>
              </div>
            </div>

            {task.completedAt && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Completed</p>
                  <p className="text-gray-400">{formatDate(task.completedAt)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {task.subtasks && task.subtasks.length > 0 && (
          <div className="border-t border-gray-700 pt-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Subtasks</h4>
            <div className="space-y-2">
              {task.subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => {
                      const updatedSubtasks = task.subtasks?.map((st) =>
                        st.id === subtask.id
                          ? { ...st, completed: !st.completed }
                          : st
                      );
                      onUpdateTask({
                        ...task,
                        subtasks: updatedSubtasks,
                        activityLog: [
                          ...task.activityLog,
                          {
                            id: Date.now().toString(),
                            taskId: task.id,
                            userId: 'current-user',
                            action: 'updated',
                            timestamp: new Date(),
                          },
                        ],
                      });
                    }}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className={subtask.completed ? 'line-through text-gray-500' : ''}>
                    {subtask.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-gray-700 pt-4">
          <TaskLabels task={task} onUpdateTask={onUpdateTask} />
        </div>

        <div className="border-t border-gray-700 pt-4">
          <TaskDependencies task={task} allTasks={allTasks} onUpdateTask={onUpdateTask} />
        </div>

        <div className="border-t border-gray-700 pt-4">
          <TaskNotifications task={task} onUpdateTask={onUpdateTask} />
        </div>

        <div className="border-t border-gray-700 pt-4">
          <TaskTimer task={task} onUpdateTask={onUpdateTask} />
        </div>

        <div className="border-t border-gray-700 pt-4">
          <TaskAttachments task={task} onUpdateTask={onUpdateTask} />
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Recurrence
          </h4>
          <TaskRecurrence
            task={task}
            onUpdateTask={onUpdateTask}
          />
        </div>

        <div className="border-t border-gray-700 pt-4">
          <TaskComments task={task} onUpdateTask={onUpdateTask} />
        </div>

        <div className="border-t border-gray-700 pt-4">
          <TaskHistory task={task} />
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            Voice Assistant
          </h4>
          <VoiceTaskAssistant
            onTaskUpdate={onUpdateTask}
            selectedTask={task}
          />
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Notes
          </h4>
          <div className="space-y-4">
            <NotesEditor
              initialNotes={task.notes || []}
              tasks={allTasks}
              onLinkTask={(noteId, taskId) => {
                const updatedNotes = task.notes?.map(note =>
                  note.id === noteId
                    ? { ...note, linkedTaskIds: [...(note.linkedTaskIds || []), taskId] }
                    : note
                );
                onUpdateTask({
                  ...task,
                  notes: updatedNotes,
                  activityLog: [
                    ...task.activityLog,
                    {
                      id: Date.now().toString(),
                      taskId: task.id,
                      userId: 'current-user',
                      action: 'linked_note',
                      timestamp: new Date(),
                    },
                  ],
                });
              }}
            />
            <AIEnhancedRichTextEditor
              initialContent={task.description}
              onChange={(content) => onUpdateTask({
                ...task,
                description: content,
                updatedAt: new Date(),
              })}
              onCreateTask={(title, description) => {
                // Handle task creation from AI suggestions
                // This would typically be handled by the parent component
                console.log('AI suggested new task:', { title, description });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsPanel;
