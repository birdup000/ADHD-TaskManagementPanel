"use client";

import React from 'react';
import { Task } from '../types/task';
import TaskCard from './TaskCard';

interface ListViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const ListView: React.FC<ListViewProps> = ({ tasks, onTaskClick }) => {
  const sortedTasks = [...tasks].sort((a, b) => {
    // Sort by priority first
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    
    // Then by due date if exists
    if (a.dueDate && b.dueDate) {
      return a.dueDate.getTime() - b.dueDate.getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    
    // Finally by title
    return a.title.localeCompare(b.title);
  });

  const tasksByStatus = {
    todo: sortedTasks.filter(task => task.status === 'todo'),
    'in-progress': sortedTasks.filter(task => task.status === 'in-progress'),
    done: sortedTasks.filter(task => task.status === 'done'),
  };

  return (
    <div className="space-y-8">
      <div className="bg-[#2A2A2A] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">To Do</h2>
          <span className="text-sm text-gray-400">{tasksByStatus.todo.length} tasks</span>
        </div>
        <div className="space-y-2">
          {tasksByStatus.todo.map(task => (
            <div key={task.id} onClick={() => onTaskClick(task)}>
              <TaskCard {...task} />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#2A2A2A] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">In Progress</h2>
          <span className="text-sm text-gray-400">{tasksByStatus['in-progress'].length} tasks</span>
        </div>
        <div className="space-y-2">
          {tasksByStatus['in-progress'].map(task => (
            <div key={task.id} onClick={() => onTaskClick(task)}>
              <TaskCard {...task} />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#2A2A2A] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Done</h2>
          <span className="text-sm text-gray-400">{tasksByStatus.done.length} tasks</span>
        </div>
        <div className="space-y-2">
          {tasksByStatus.done.map(task => (
            <div key={task.id} onClick={() => onTaskClick(task)}>
              <TaskCard {...task} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListView;