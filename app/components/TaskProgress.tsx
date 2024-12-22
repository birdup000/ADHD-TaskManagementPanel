"use client";

import React from 'react';
import { Task } from '../types/task';

interface TaskProgressProps {
  task: Task;
  className?: string;
}

interface Milestone {
  date: Date;
  title: string;
  type: 'creation' | 'update' | 'checkpoint' | 'completion';
  description?: string;
}

const TaskProgress: React.FC<TaskProgressProps> = ({ task, className = '' }) => {
  const getMilestones = (task: Task): Milestone[] => {
    const milestones: Milestone[] = [
      {
        date: new Date(task.createdAt),
        title: 'Task Created',
        type: 'creation',
        description: `Task "${task.title}" was created`,
      },
    ];

    // Add checkpoints as milestones
    if (task.checkpoints) {
      task.checkpoints.forEach(checkpoint => {
        milestones.push({
          date: new Date(checkpoint.createdAt),
          title: checkpoint.title,
          type: 'checkpoint',
          description: checkpoint.description,
        });
      });
    }

    // Add significant updates from activity log
    if (task.activityLog) {
      task.activityLog.forEach(activity => {
        if (activity.action === 'status_changed') {
          milestones.push({
            date: new Date(activity.timestamp),
            title: 'Status Changed',
            type: 'update',
            description: `Task status was updated`,
          });
        }
      });
    }

    // Add completion milestone if task is done
    if (task.status === 'done' && task.completedAt) {
      milestones.push({
        date: new Date(task.completedAt),
        title: 'Task Completed',
        type: 'completion',
        description: `Task completed with ${task.progress}% progress`,
      });
    }

    // Sort milestones by date
    return milestones.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeColor = (type: Milestone['type']) => {
    switch (type) {
      case 'creation':
        return 'bg-blue-500';
      case 'update':
        return 'bg-yellow-500';
      case 'checkpoint':
        return 'bg-indigo-500';
      case 'completion':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const milestones = getMilestones(task);

  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-medium mb-6">Progress Timeline</h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-700" />

        {/* Milestones */}
        <div className="space-y-6">
          {milestones.map((milestone, index) => (
            <div key={index} className="relative flex items-start ml-4 pl-6">
              {/* Milestone dot */}
              <div
                className={`absolute -left-3 w-3 h-3 rounded-full ${getTypeColor(
                  milestone.type
                )}`}
              />
              
              {/* Milestone content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium">{milestone.title}</h4>
                  <span className="text-sm text-gray-400">
                    {formatDate(milestone.date)}
                  </span>
                </div>
                {milestone.description && (
                  <p className="text-sm text-gray-400">{milestone.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Progress indicator */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-gray-400">{task.progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-indigo-600 rounded-full h-2 transition-all duration-300"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>

        {/* Time remaining */}
        {task.dueDate && (
          <div className="mt-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Time Remaining</span>
              <span className={`font-medium ${
                new Date(task.dueDate) < new Date()
                  ? 'text-red-400'
                  : 'text-green-400'
              }`}>
                {new Date(task.dueDate) < new Date()
                  ? 'Overdue'
                  : `${Math.ceil(
                      (new Date(task.dueDate).getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )} days left`}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskProgress;
