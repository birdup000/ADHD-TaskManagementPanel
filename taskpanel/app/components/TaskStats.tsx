"use client";

import React from 'react';
import { Task } from '../types/task';

interface TaskStatsProps {
  tasks: Task[];
}

const TaskStats: React.FC<TaskStatsProps> = ({ tasks }) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const todo = tasks.filter(t => t.status === 'todo').length;
  const overdue = tasks.filter(t => 
    t.dueDate && 
    new Date(t.dueDate) < new Date() && 
    t.status !== 'done'
  ).length;

  const completionRate = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div className="bg-[#2A2A2A] p-4 rounded-lg">
        <div className="text-sm text-gray-400">Total Tasks</div>
        <div className="text-2xl font-bold">{total}</div>
      </div>
      <div className="bg-[#2A2A2A] p-4 rounded-lg">
        <div className="text-sm text-gray-400">Completed</div>
        <div className="text-2xl font-bold text-green-400">{completed}</div>
      </div>
      <div className="bg-[#2A2A2A] p-4 rounded-lg">
        <div className="text-sm text-gray-400">In Progress</div>
        <div className="text-2xl font-bold text-blue-400">{inProgress}</div>
      </div>
      <div className="bg-[#2A2A2A] p-4 rounded-lg">
        <div className="text-sm text-gray-400">To Do</div>
        <div className="text-2xl font-bold text-gray-300">{todo}</div>
      </div>
      <div className="bg-[#2A2A2A] p-4 rounded-lg">
        <div className="text-sm text-gray-400">Completion Rate</div>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold">{completionRate}%</div>
          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
        {overdue > 0 && (
          <div className="text-sm text-red-400 mt-1">
            {overdue} task{overdue > 1 ? 's' : ''} overdue
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskStats;