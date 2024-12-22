"use client";

import React from 'react';
import { Task } from '../types/task';
import { ActivityLog } from '../types/collaboration';

interface TaskHistoryProps {
  task: Task;
  className?: string;
}

const TaskHistory: React.FC<TaskHistoryProps> = ({
  task,
  className = '',
}) => {
  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatActivityMessage = (activity: ActivityLog) => {
    switch (activity.action) {
      case 'created':
        return 'created this task';
      case 'updated':
        return 'updated this task';
      case 'commented':
        return 'commented on this task';
      case 'status_changed':
        return 'changed the status';
      case 'assigned':
        return 'updated task assignments';
      default:
        return 'performed an action';
    }
  };

  const getActivityIcon = (action: ActivityLog['action']) => {
    switch (action) {
      case 'created':
        return '✨';
      case 'updated':
        return '📝';
      case 'commented':
        return '💬';
      case 'status_changed':
        return '🔄';
      case 'assigned':
        return '👥';
      default:
        return '📋';
    }
  };

  const groupActivitiesByDate = (activities: ActivityLog[]) => {
    const groups: { [key: string]: ActivityLog[] } = {};
    
    activities.forEach(activity => {
      const date = new Date(activity.timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });

    return Object.entries(groups).sort((a, b) => 
      new Date(b[0]).getTime() - new Date(a[0]).getTime()
    );
  };

  const groupedActivities = groupActivitiesByDate([...task.activityLog].reverse());

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-300">Activity History</h4>
        <span className="text-xs text-gray-400">
          {task.activityLog.length} activities
        </span>
      </div>

      <div className="space-y-6">
        {groupedActivities.map(([date, activities]) => (
          <div key={date}>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-gray-700" />
              <span className="text-xs text-gray-400">{date}</span>
              <div className="h-px flex-1 bg-gray-700" />
            </div>

            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 group"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm" role="img" aria-label={activity.action}>
                      {getActivityIcon(activity.action)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium truncate">
                          {activity.userId}
                        </span>
                        <span className="text-sm text-gray-400">
                          {formatActivityMessage(activity)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatDateTime(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {task.activityLog.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            <p>No activity yet</p>
            <p className="text-sm">Actions on this task will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskHistory;
