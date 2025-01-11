"use client";

import { useState, useEffect } from 'react';
import { loadPuter } from '../lib/puter';
import { Task } from './TaskPanel';

const NOTIFICATION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const useNotificationSystem = () => {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'deadline' | 'progress' | 'blocker' | 'escalation';
    message: string;
    taskId: string;
    timestamp: Date;
    read: boolean;
  }>>([]);

  const addNotification = (notification: Omit<typeof notifications[0], 'id' | 'timestamp' | 'read'>) => {
    setNotifications(prev => [
      ...prev,
      {
        ...notification,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        read: false,
      }
    ]);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const checkDeadlines = (tasks: Task[]) => {
    const now = new Date();
    tasks.forEach(task => {
      if (task.dueDate && !task.completed) {
        // Check if due within 24 hours
        const timeUntilDue = task.dueDate.getTime() - now.getTime();
        const hoursUntilDue = timeUntilDue / (1000 * 60 * 60);

        if (hoursUntilDue <= 24 && hoursUntilDue > 0) {
          addNotification({
            type: 'deadline',
            message: `Task "${task.title}" is due in ${Math.round(hoursUntilDue)} hours`,
            taskId: task.id,
          });
        } else if (timeUntilDue < 0) {
          addNotification({
            type: 'deadline',
            message: `Task "${task.title}" is overdue`,
            taskId: task.id,
          });
        }
      }
    });
  };

  const checkProgress = (tasks: Task[]) => {
    tasks.forEach(task => {
      if (!task.completed && task.subtasks && task.subtasks.length > 0) {
        const progress = Math.round(
          (task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100
        );

        // Notify if task is stalled (no progress in last check)
        if (progress < 100 && task.lastUpdate) {
          const daysSinceUpdate = (new Date().getTime() - task.lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceUpdate >= 2) {
            addNotification({
              type: 'progress',
              message: `No progress on "${task.title}" for ${Math.round(daysSinceUpdate)} days`,
              taskId: task.id,
            });
          }
        }
      }
    });
  };

  const checkBlockers = async (tasks: Task[]) => {
    const puter = await loadPuter();
    
    // AI analysis of potential blockers
    for (const task of tasks) {
      if (!task.completed && task.blockers && task.blockers.length > 0) {
        const prompt = `
          Analyze the following task blockers and determine if escalation is needed:
          Task: ${task.title}
          Description: ${task.description}
          Blockers: ${task.blockers.join(', ')}
          Last Update: ${task.lastUpdate?.toISOString()}
          
          Respond with a JSON object: { "needsEscalation": boolean, "reason": string }
        `;

        try {
          const response = await puter.ai.chat(prompt, {
            model: 'gpt-4o-mini',
            stream: false,
          });
          
          const analysis = JSON.parse(response);
          
          if (analysis.needsEscalation) {
            addNotification({
              type: 'escalation',
              message: `Task "${task.title}" needs attention: ${analysis.reason}`,
              taskId: task.id,
            });
          }
        } catch (err) {
          console.error('Error analyzing blockers:', err);
        }
      }
    }
  };

  useEffect(() => {
    const storageKey = 'taskNotifications';
    const savedNotifications = localStorage.getItem(storageKey);
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications);
      setNotifications(parsed.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      })));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('taskNotifications', JSON.stringify(notifications));
  }, [notifications]);

  return {
    notifications,
    addNotification,
    markAsRead,
    checkDeadlines,
    checkProgress,
    checkBlockers,
  };
};

interface NotificationSystemProps {
  tasks: Task[];
}

export default function NotificationSystem({ tasks }: NotificationSystemProps) {
  const {
    notifications,
    markAsRead,
    checkDeadlines,
    checkProgress,
    checkBlockers,
  } = useNotificationSystem();

  useEffect(() => {
    // Initial check
    checkDeadlines(tasks);
    checkProgress(tasks);
    checkBlockers(tasks);

    // Set up interval for periodic checks
    const interval = setInterval(() => {
      checkDeadlines(tasks);
      checkProgress(tasks);
      checkBlockers(tasks);
    }, NOTIFICATION_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [tasks]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <div className="fixed bottom-4 right-4 z-50">
        <div className="relative">
          <button className="p-3 bg-accent text-white rounded-full shadow-lg hover:bg-accent/80 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {notifications.length > 0 && (
        <div className="fixed bottom-20 right-4 w-96 max-h-[70vh] overflow-y-auto bg-background rounded-lg shadow-xl border border-border z-50">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Notifications</h3>
          </div>
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 ${notification.read ? 'opacity-50' : ''} hover:bg-accent/5`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`rounded-full p-2 ${
                      notification.type === 'deadline'
                        ? 'bg-yellow-100 text-yellow-800'
                        : notification.type === 'progress'
                        ? 'bg-blue-100 text-blue-800'
                        : notification.type === 'escalation'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {notification.type === 'deadline' && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {notification.type === 'progress' && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    )}
                    {notification.type === 'escalation' && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}