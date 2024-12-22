"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Task, TimeEntry } from '../types/task';
import { ActivityLog } from '../types/collaboration';

interface TaskTimerProps {
  task: Task;
  onUpdateTask: (task: Task) => void;
  className?: string;
}

const TaskTimer: React.FC<TaskTimerProps> = ({
  task,
  onUpdateTask,
  className = '',
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
    parts.push(`${remainingSeconds}s`);

    return parts.join(' ');
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const startTimer = () => {
    if (!isRunning) {
      const now = new Date();
      startTimeRef.current = now;
      setIsRunning(true);
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    }
  };

  const stopTimer = () => {
    const startTime = startTimeRef.current;
    if (isRunning && startTime) {
      setIsRunning(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const endTime = new Date();
      const timeEntry: TimeEntry = {
        id: Date.now().toString(),
        startTime,
        endTime,
        duration: currentTime,
        description: description.trim() || undefined,
      };

      const activityLogEntry: ActivityLog = {
        id: Date.now().toString(),
        taskId: task.id,
        userId: 'current-user',
        action: 'updated',
        timestamp: endTime,
      };

      const updatedTask = {
        ...task,
        timeEntries: [...(task.timeEntries || []), timeEntry],
        activityLog: [...(task.activityLog || []), activityLogEntry],
      };

      onUpdateTask(updatedTask);
      setCurrentTime(0);
      setDescription('');
      startTimeRef.current = null;
    }
  };

  const getTotalTime = () => {
    return (task.timeEntries || []).reduce((total: number, entry: TimeEntry) => total + entry.duration, 0);
  };

  const deleteTimeEntry = (entryId: string) => {
    const updatedTask = {
      ...task,
      timeEntries: task.timeEntries?.filter(entry => entry.id !== entryId) || [],
    };
    onUpdateTask(updatedTask);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-300">Time Tracking</h4>
        <span className="text-xs text-gray-400">
          Total: {formatTime(getTotalTime())}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 text-2xl font-mono tabular-nums">
            {formatTime(currentTime)}
          </div>
          <button
            onClick={isRunning ? stopTimer : startTimer}
            className={`px-4 py-2 rounded-lg text-sm ${
              isRunning
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            } transition-colors`}
          >
            {isRunning ? 'Stop' : 'Start'}
          </button>
        </div>

        {isRunning && (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What are you working on? (optional)"
            className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows={2}
          />
        )}
      </div>

      {/* Time entries list */}
      <div className="space-y-2 mt-4">
        {task.timeEntries?.map((entry: TimeEntry) => (
          <div
            key={entry.id}
            className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {formatTime(entry.duration)}
                  </span>
                  <button
                    onClick={() => deleteTimeEntry(entry.id)}
                    className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {formatDateTime(entry.startTime)}
                  {entry.endTime && ` - ${formatDateTime(entry.endTime)}`}
                </div>
                {entry.description && (
                  <p className="text-sm text-gray-300 mt-2">{entry.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {(!task.timeEntries || task.timeEntries.length === 0) && !isRunning && (
          <div className="text-center py-6 text-gray-400">
            <p>No time entries yet</p>
            <p className="text-sm">Start the timer to track your work</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskTimer;
