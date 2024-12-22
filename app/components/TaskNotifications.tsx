"use client";

import React, { useState, useEffect } from 'react';
import { Task, Reminder } from '../types/task';

interface TaskNotificationsProps {
  task: Task;
  onUpdateTask: (task: Task) => void;
  className?: string;
}

const TaskNotifications: React.FC<TaskNotificationsProps> = ({
  task,
  onUpdateTask,
  className = '',
}) => {
  const [reminders, setReminders] = useState<Reminder[]>(task.reminders || []);
  const [newReminderTime, setNewReminderTime] = useState('');
  const [newReminderMessage, setNewReminderMessage] = useState('');
  const [isAddingReminder, setIsAddingReminder] = useState(false);

  useEffect(() => {
    // Initialize reminders from task
    if (task.dueDate && !reminders.some(r => r.type === 'due_date')) {
      const dueDateReminder: Reminder = {
        id: 'due-date',
        time: new Date(task.dueDate.getTime() - 24 * 60 * 60 * 1000), // 1 day before
        message: `Task "${task.title}" is due tomorrow!`,
        type: 'due_date',
        isEnabled: true,
      };
      setReminders(prev => [...prev, dueDateReminder]);
    }
  }, [task.dueDate, task.title]);

  useEffect(() => {
    // Check for reminders that need to be triggered
    const checkReminders = () => {
      const now = new Date();
      reminders.forEach(reminder => {
        if (reminder.isEnabled && reminder.time > now && reminder.time.getTime() - now.getTime() <= 60000) {
          // Show notification if reminder is within the next minute
          if (Notification.permission === 'granted') {
            new Notification(`Task Reminder: ${task.title}`, {
              body: reminder.message,
              icon: '/favicon.ico',
            });
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [reminders, task.title]);

  useEffect(() => {
    // Request notification permission if not already granted
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleAddReminder = () => {
    if (!newReminderTime || !newReminderMessage) return;

    const newReminder: Reminder = {
      id: Date.now().toString(),
      time: new Date(newReminderTime),
      message: newReminderMessage,
      type: 'custom',
      isEnabled: true,
    };

    const updatedReminders = [...reminders, newReminder];
    setReminders(updatedReminders);
    setNewReminderTime('');
    setNewReminderMessage('');
    setIsAddingReminder(false);

    // Update task with new reminders
    const updatedTask = {
      ...task,
      reminders: updatedReminders,
    };
    onUpdateTask(updatedTask);
  };

  const handleToggleReminder = (reminderId: string) => {
    const updatedReminders = reminders.map(reminder =>
      reminder.id === reminderId
        ? { ...reminder, isEnabled: !reminder.isEnabled }
        : reminder
    );
    setReminders(updatedReminders);

    // Update task with toggled reminders
    const updatedTask = {
      ...task,
      reminders: updatedReminders,
    };
    onUpdateTask(updatedTask);
  };

  const handleDeleteReminder = (reminderId: string) => {
    const updatedReminders = reminders.filter(reminder => reminder.id !== reminderId);
    setReminders(updatedReminders);

    // Update task with remaining reminders
    const updatedTask = {
      ...task,
      reminders: updatedReminders,
    };
    onUpdateTask(updatedTask);
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-300">Reminders</h4>
        <button
          onClick={() => setIsAddingReminder(true)}
          className="text-sm text-indigo-400 hover:text-indigo-300"
        >
          Add Reminder
        </button>
      </div>

      {isAddingReminder && (
        <div className="space-y-3 bg-gray-700 rounded-lg p-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              When
            </label>
            <input
              type="datetime-local"
              value={newReminderTime}
              onChange={(e) => setNewReminderTime(e.target.value)}
              className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Message
            </label>
            <input
              type="text"
              value={newReminderMessage}
              onChange={(e) => setNewReminderMessage(e.target.value)}
              placeholder="Reminder message"
              className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsAddingReminder(false)}
              className="px-3 py-1 text-sm text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleAddReminder}
              disabled={!newReminderTime || !newReminderMessage}
              className="px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 rounded-lg"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className="flex items-center justify-between p-3 bg-gray-700 rounded-lg group"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={reminder.isEnabled}
                onChange={() => handleToggleReminder(reminder.id)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="text-sm">{reminder.message}</p>
                <p className="text-xs text-gray-400">
                  {formatDateTime(reminder.time)}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDeleteReminder(reminder.id)}
              className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        ))}

        {reminders.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            <p>No reminders set</p>
            <p className="text-sm">Add a reminder to stay on track</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskNotifications;
