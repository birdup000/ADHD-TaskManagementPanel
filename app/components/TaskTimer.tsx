"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Task, TimeEntry } from '../types/task';
import { ActivityLog } from '../types/collaboration';
import { useTaskTracking } from '../hooks/useTaskTracking';

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
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  
  const { isTracking, hasPermission, error, startTracking, stopTracking, checkPermissions } = useTaskTracking({
    task,
    onUpdateTask,
  });

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

  const startTimer = async () => {
    if (isRunning) return;
    
    if (!hasPermission) {
      setShowPermissionDialog(true);
      try {
        await checkPermissions();
        // Re-check permission state after permissions check
        const permissions = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (permissions.state !== 'granted') {
          console.error('Microphone permission was not granted');
          setError && setError('Microphone permission required');
          return;
        }
      } catch (err) {
        console.error('Failed to get microphone permission:', err);
        setError('Failed to get microphone permission');
        return;
      } finally {
        setShowPermissionDialog(false);
      }
    }

    try {
      console.log('Starting timer and tracking...');
      const now = new Date();
      startTimeRef.current = now;
      
      await startTracking();
      
      setIsRunning(true);
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
      console.log('Timer started successfully');
    } catch (err) {
      console.error('Failed to start timer:', err);
    }
  }

  const stopTimer = async () => {
    const startTime = startTimeRef.current;
    if (isRunning && startTime) {
      setIsRunning(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      await stopTracking();

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
      {showPermissionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md mx-4">
            <h3 className="text-lg font-medium text-white mb-4">Microphone Permission Required</h3>
            <p className="text-gray-300 mb-6">
              To enable task tracking features, we need access to your microphone. Please allow access when prompted.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPermissionDialog(false)}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={checkPermissions}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
              >
                Allow Access
              </button>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}
      
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
