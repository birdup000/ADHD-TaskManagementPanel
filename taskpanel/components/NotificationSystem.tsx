'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNotificationVolume } from '../hooks/useNotificationVolume';
import { loadPuter, Puter } from '../lib/puter';
import { playNotificationSound } from '../utils/notificationUtils';
import { Task } from './TaskPanel';

interface QueuedNotification {
  notification: Omit<Notification, 'id' | 'timestamp' | 'read'>;
  volume: number;
}

const NOTIFICATION_CHECK_INTERVAL = 2 * 60 * 1000; // 2 minutes
const NOTIFICATION_CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
const MAX_NOTIFICATIONS = 50; // Maximum stored notifications

export interface Notification {
  id: string;
  type: 'deadline' | 'progress' | 'blocker' | 'escalation';
  message: string;
  taskId: string;
  timestamp: Date;
  read: boolean;
}

export const useNotificationSystem = () => {
  const { volume, setNotificationVolume } = useNotificationVolume();
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'deadline' | 'progress' | 'blocker' | 'escalation';
    message: string;
    taskId: string;
    timestamp: Date;
    read: boolean;
  }>>([]);

  // Add a state to track which notifications have been shown
  const [shownNotifications, setShownNotifications] = useState<Set<string>>(new Set());
  const [notificationQueue, setNotificationQueue] = useState<QueuedNotification[]>([]);
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  const processNotificationQueue = useCallback(async () => {
    if (isTtsPlaying) return;

    const nextNotification = notificationQueue[0];
    if (!nextNotification) return;

    setIsTtsPlaying(true);
    const { notification, volume } = nextNotification;
    const puter = await loadPuter();

    if (puter && volume > 0 && ttsEnabled) {
      puter.ai.txt2speech(notification.message).then((audio: HTMLAudioElement) => {
        audio.play();
        audio.onended = () => {
          setNotificationQueue(prev => prev.slice(1));
          setIsTtsPlaying(false);
          processNotificationQueue();
        };
      });
    } else {
      setNotificationQueue(prev => prev.slice(1));
      setIsTtsPlaying(false);
      processNotificationQueue();
    }
  }, [notificationQueue, isTtsPlaying, ttsEnabled]);

  const playTestTts = useCallback(async (testVolume: number) => {
    if (!ttsEnabled) return;
    const puter = await loadPuter();
    if (puter && testVolume > 0) {
      puter.ai.txt2speech("Test notification sound").then((audio: HTMLAudioElement) => {
        audio.play();
      });
    }
  }, [ttsEnabled]);


  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>, volume: number) => {
    // Create a unique key for this notification based on type and taskId
    const notificationKey = `${notification.type}-${notification.taskId}`;

    // Only add if we haven't shown this notification yet
    if (!shownNotifications.has(notificationKey)) {
      setNotifications(prev => [
        ...prev,
        {
          ...notification,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
          read: false,
        }
      ]);

      // Mark this notification as shown
      setShownNotifications(prev => new Set([...prev, notificationKey]));
      setNotificationQueue(prev => [...prev, { notification, volume }]);
      processNotificationQueue();
    }
  };

  const markAsRead = async (notificationId: string) => {
    const puter = await loadPuter();
    setNotifications(prev => {
      const updatedNotifications = prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      // Remove read notifications after marking them as read
      const filteredNotifications = updatedNotifications.filter(n => !n.read);
      
      // Remove the notification from puter kv
      const notificationToRemove = updatedNotifications.find(n => n.id === notificationId);
      if (notificationToRemove && puter.kv) {
        puter.kv.del(`notification-${notificationToRemove.id}`);
      }
      return filteredNotifications;
    });
  };

  const checkDeadlines = useCallback((tasks: Task[]) => {
    const now = new Date();
    tasks.forEach(task => {
      if (task.dueDate && !task.completed) {
        const timeUntilDue = task.dueDate.getTime() - now.getTime();
        const hoursUntilDue = timeUntilDue / (1000 * 60 * 60);

        // Only check for notifications that haven't been shown yet
        const notificationKey = `deadline-${task.id}`;
        
        if (hoursUntilDue <= 24 && hoursUntilDue > 0 && !shownNotifications.has(notificationKey)) {
          addNotification({
            type: 'deadline',
            message: `Task "${task.title}" is due in ${Math.round(hoursUntilDue)} hours`,
            taskId: task.id,
          }, volume);
        } else if (timeUntilDue < 0 && !shownNotifications.has(notificationKey)) {
          addNotification({
            type: 'deadline',
            message: `Task "${task.title}" is overdue`,
            taskId: task.id,
          }, volume);
        }
      }
    });
  }, [shownNotifications, volume]);

  const checkProgress = useCallback((tasks: Task[]) => {
    tasks.forEach(task => {
      if (!task.completed && task.subtasks && task.subtasks.length > 0) {
        const progress = Math.round(
          (task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100
        );

        const notificationKey = `progress-${task.id}`;

        if (progress < 100 && task.lastUpdate) {
          const daysSinceUpdate = (new Date().getTime() - task.lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceUpdate >= 2 && !shownNotifications.has(notificationKey)) {
            addNotification({
              type: 'progress',
              message: `No progress on "${task.title}" for ${Math.round(daysSinceUpdate)} days`,
              taskId: task.id,
            }, volume);
          }
        }
      }
    });
  }, [shownNotifications, volume]);

  const checkBlockers = useCallback(async (tasks: Task[]) => {
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
          
          const existingNotification = notifications.find(n => n.taskId === task.id && n.type === 'escalation');

          if (analysis.needsEscalation && !existingNotification) {
            addNotification({
              type: 'escalation',
              message: `Task "${task.title}" needs attention: ${analysis.reason}`,
              taskId: task.id,
            }, volume);
          }
        } catch (err) {
          console.error('Error analyzing blockers:', err);
        }
      }
    }
  }, [notifications, shownNotifications, volume]);

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
    localStorage.setItem('taskNotifications', JSON.stringify(notifications.slice(-MAX_NOTIFICATIONS)));
    localStorage.setItem('shownNotifications', JSON.stringify(Array.from(shownNotifications)));
  }, [notifications, shownNotifications]);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setShownNotifications(new Set());
  }, []);

  const cleanupOldNotifications = useCallback((notifications: Notification[]) => {
    const now = new Date();
    return notifications.filter(notification => {
      const timeDiff = now.getTime() - notification.timestamp.getTime();
      return timeDiff < NOTIFICATION_CLEANUP_INTERVAL;
    });
  }, []);

  useEffect(() => {
    const cleanup = () => {
      setNotifications(prev => cleanupOldNotifications(prev));
    };
    const cleanupInterval = setInterval(cleanup, NOTIFICATION_CLEANUP_INTERVAL);
    return () => clearInterval(cleanupInterval);
  }, [cleanupOldNotifications]);

  return {
    notifications,
    addNotification,
    markAsRead,
    checkDeadlines,
    checkProgress,
    checkBlockers,
    clearAllNotifications,
    ttsEnabled,
    setTtsEnabled,
    playTestTts
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
    clearAllNotifications,
    ttsEnabled,
    setTtsEnabled,
    playTestTts
  } = useNotificationSystem();
  const { volume, setNotificationVolume } = useNotificationVolume();
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);

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
  }, [tasks, checkDeadlines, checkProgress, checkBlockers]);

  const unreadCount = notifications.filter((n: Notification) => !n.read).length;

  return (
    <div className="relative">
      <div className="fixed bottom-4 right-4 z-50">
        <div className="relative">
          <button
            ref={notificationButtonRef}
            className="p-3 bg-accent text-white rounded-full shadow-lg hover:bg-accent/80 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v0.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
      
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 max-h-[70vh] overflow-y-auto bg-background rounded-lg shadow-xl border border-border z-50">
          <div className="p-4 border-b border-border">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Notifications</h3>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-background/50 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            {showSettings && (
              <div className="mt-2 p-4 bg-background/50 rounded-lg border border-border/10">
                <h4 className="text-sm font-medium mb-2">Notification Settings</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Volume:</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => {
                      setNotificationVolume(Number(e.target.value));
                      playTestTts(Number(e.target.value));
                    }}
                    className="w-32"
                  />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm">TTS Enabled:</span>
                  <input
                    type="checkbox"
                    checked={ttsEnabled}
                    onChange={(e) => setTtsEnabled(e.target.checked)}
                    className="w-5 h-5"
                  />
                </div>
                <button
                  onClick={clearAllNotifications}
                  className="mt-2 px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                >
                  Clear All Notifications
                </button>
              </div>
            )}
          </div>
          {notifications.length > 0 && !showSettings && (
            <div className="divide-y divide-border">
              {notifications.map((notification: Notification) => (
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
          )}
        </div>
      )}
    </div>
  );
}