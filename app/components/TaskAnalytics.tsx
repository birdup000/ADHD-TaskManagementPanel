"use client";

import React from 'react';
import { Task } from '../types/task';

interface TaskAnalyticsProps {
  tasks: Task[];
  className?: string;
}

const TaskAnalytics: React.FC<TaskAnalyticsProps> = ({ tasks, className = '' }) => {
  // Calculate analytics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const todoTasks = tasks.filter(task => task.status === 'todo').length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && task.status !== 'done';
  }).length;

  const getProductivityScore = () => {
    if (totalTasks === 0) return 0;
    
    const weights = {
      completed: 1,
      inProgress: 0.5,
      onTime: 0.3,
      highPriority: -0.2
    };

    const score = (
      (completedTasks * weights.completed) +
      (inProgressTasks * weights.inProgress) -
      (overdueTasks * weights.onTime) -
      (highPriorityTasks * weights.highPriority)
    ) / totalTasks * 100;

    return Math.max(0, Math.min(100, score));
  };

  const productivityScore = getProductivityScore();

  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-6">Task Analytics</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400">Total Tasks</div>
          <div className="text-2xl font-bold">{totalTasks}</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400">Completed</div>
          <div className="text-2xl font-bold text-green-500">{completedTasks}</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400">In Progress</div>
          <div className="text-2xl font-bold text-yellow-500">{inProgressTasks}</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400">To Do</div>
          <div className="text-2xl font-bold text-blue-500">{todoTasks}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Progress Overview</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completion Rate</span>
              <span>{completionRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 rounded-full h-2 transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Productivity Score</span>
              <span>{productivityScore.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 rounded-full h-2 transition-all duration-300"
                style={{ width: `${productivityScore}%` }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Attention Required</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">High Priority Tasks</span>
              <span className="px-3 py-1 bg-red-900/50 text-red-200 rounded-full text-sm">
                {highPriorityTasks}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Overdue Tasks</span>
              <span className="px-3 py-1 bg-yellow-900/50 text-yellow-200 rounded-full text-sm">
                {overdueTasks}
              </span>
            </div>
          </div>
        </div>
      </div>

      {tasks.length === 0 && (
        <div className="text-center text-gray-400 mt-4">
          No tasks available. Create some tasks to see analytics.
        </div>
      )}
    </div>
  );
};

export default TaskAnalytics;
