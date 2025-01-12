import { Notification } from '../components/NotificationSystem';

export const playNotificationSound = async (soundUrl: string) => {
  try {
    const audio = new Audio(soundUrl);
    await audio.play();
  } catch (error) {
    console.warn('Failed to play notification sound:', error);
  }
};

export interface NotificationGroup {
  type: string;
  notifications: Notification[];
  timestamp: Date;
}

export const groupNotifications = (notifications: Notification[]): NotificationGroup[] => {
  const groups = new Map<string, NotificationGroup>();
  
  notifications.forEach(notification => {
    const key = `${notification.type}-${notification.taskId}`;
    if (!groups.has(key)) {
      groups.set(key, {
        type: notification.type,
        notifications: [],
        timestamp: new Date(notification.timestamp)
      });
    }
    groups.get(key)?.notifications.push(notification);
  });
  
  return Array.from(groups.values());
};

export const cleanupOldNotifications = (notifications: Notification[]): Notification[] => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return notifications.filter(n => new Date(n.timestamp) > oneDayAgo);
};

export const getNotificationPriority = (type: string): 'high' | 'medium' | 'low' => {
  switch (type) {
    case 'escalation':
      return 'high';
    case 'deadline':
      return 'medium';
    default:
      return 'low';
  }
};

export const getPriorityColor = (priority: 'high' | 'medium' | 'low'): string => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
  }
};