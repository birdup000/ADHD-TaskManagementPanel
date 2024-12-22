"use client";

import React, { useState } from 'react';
import { Task } from '../types/task';

interface TaskRecurrenceProps {
  task: Task;
  onUpdateTask: (task: Task) => void;
  className?: string;
}

type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly';

interface RecurrencePattern {
  frequency: RecurrenceFrequency;
  interval?: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
}

const TaskRecurrence: React.FC<TaskRecurrenceProps> = ({
  task,
  onUpdateTask,
  className = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [frequency, setFrequency] = useState<RecurrenceFrequency>(
    task.recurring?.frequency || 'daily'
  );
  const [interval, setInterval] = useState(1);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [dayOfMonth, setDayOfMonth] = useState(1);

  const daysOfWeek = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
  ];

  const handleSaveRecurrence = () => {
    const recurrencePattern: RecurrencePattern = {
      frequency,
      interval,
      ...(frequency === 'weekly' && { daysOfWeek: selectedDays }),
      ...(frequency === 'monthly' && { dayOfMonth }),
    };

    const updatedTask = {
      ...task,
      recurring: recurrencePattern,
    };

    onUpdateTask(updatedTask);
    setIsEditing(false);
  };

  const handleRemoveRecurrence = () => {
    const updatedTask = {
      ...task,
      recurring: undefined,
    };

    onUpdateTask(updatedTask);
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const formatRecurrence = (pattern?: RecurrencePattern) => {
    if (!pattern) return 'No recurrence';

    const intervalText = pattern.interval && pattern.interval > 1
      ? `every ${pattern.interval} `
      : '';

    switch (pattern.frequency) {
      case 'daily':
        return `Repeats ${intervalText}days`;
      case 'weekly':
        if (pattern.daysOfWeek?.length) {
          const days = pattern.daysOfWeek
            .sort()
            .map(d => daysOfWeek[d].label)
            .join(', ');
          return `Repeats ${intervalText}weeks on ${days}`;
        }
        return `Repeats ${intervalText}weeks`;
      case 'monthly':
        const day = pattern.dayOfMonth || 1;
        const suffix = ['st', 'nd', 'rd'][day - 1] || 'th';
        return `Repeats ${intervalText}months on the ${day}${suffix}`;
      default:
        return 'No recurrence';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-300">Recurrence</h4>
        {task.recurring ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            Edit
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            Add Recurrence
          </button>
        )}
      </div>

      {!isEditing && (
        <div className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
          <span className="text-sm">{formatRecurrence(task.recurring)}</span>
          {task.recurring && (
            <button
              onClick={handleRemoveRecurrence}
              className="text-gray-400 hover:text-red-400"
            >
              ×
            </button>
          )}
        </div>
      )}

      {isEditing && (
        <div className="space-y-4 bg-gray-700 rounded-lg p-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)}
              className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Interval
            </label>
            <input
              type="number"
              min="1"
              value={interval}
              onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value)))}
              className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Repeat every {interval} {frequency}(s)
            </p>
          </div>

          {frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Days of Week
              </label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => toggleDay(value)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedDays.includes(value)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {frequency === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Day of Month
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(Math.min(31, Math.max(1, parseInt(e.target.value))))}
                className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-sm text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveRecurrence}
              className="px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskRecurrence;
