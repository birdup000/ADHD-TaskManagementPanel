"use client";

import React from 'react';
import TaskPanelLayout from './components/layout/TaskPanelLayout';
import NavigationPanel from './components/layout/NavigationPanel';
import TaskList from './components/tasks/TaskList';
import TaskDetailPanel from './components/tasks/TaskDetailPanel';
import { Task } from './types/task';

// Sample data
const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Complete project documentation',
    priority: 'high',
    status: 'todo',
    dueDate: '2025-03-15',
    tags: ['Documentation', 'Priority'],
  },
  {
    id: '2',
    title: 'Review pull requests',
    priority: 'medium',
    status: 'in_progress',
    dueDate: '2025-03-12',
    tags: ['Code Review'],
  },
  {
    id: '3',
    title: 'Update dependencies',
    priority: 'low',
    status: 'completed',
    dueDate: '2025-03-10',
    tags: ['Maintenance'],
  },
];

const sampleNavItems = {
  smartLists: [
    { id: 'today', label: 'Today', count: 5 },
    { id: 'upcoming', label: 'Upcoming', count: 12 },
    { id: 'priority', label: 'Priority', count: 3 },
  ],
  categories: [
    { id: 'work', label: 'Work', count: 8 },
    { id: 'personal', label: 'Personal', count: 4 },
    { id: 'learning', label: 'Learning', count: 6 },
  ],
  tags: [
    { id: 'documentation', label: 'Documentation' },
    { id: 'code-review', label: 'Code Review' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'priority', label: 'Priority' },
  ],
};

export default function Home() {
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);
  const selectedTask = React.useMemo(() => {
    if (!selectedTaskId) return null;
    return sampleTasks.find(task => task.id === selectedTaskId) || null;
  }, [selectedTaskId]);

  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const handleTaskStatusChange = (taskId: string, status: Task['status']) => {
    // In a real app, this would update the backend
    console.log('Updating task status:', taskId, status);
  };

  const handleTaskSave = (task: Task) => {
    // In a real app, this would update the backend
    console.log('Saving task:', task);
  };

  return (
    <main className="h-screen">
      <TaskPanelLayout
        leftPanel={
          <NavigationPanel
            categories={sampleNavItems.categories}
            smartLists={sampleNavItems.smartLists}
            tags={sampleNavItems.tags}
          />
        }
        mainPanel={
          <TaskList
            tasks={sampleTasks}
            onTaskSelect={handleTaskSelect}
            onTaskStatusChange={handleTaskStatusChange}
          />
        }
        rightPanel={
          <TaskDetailPanel
            task={selectedTask}
            onClose={() => setSelectedTaskId(null)}
            onSave={handleTaskSave}
          />
        }
      />
    </main>
  );
}
