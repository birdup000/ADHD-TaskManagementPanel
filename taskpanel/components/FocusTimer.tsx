"use client";

import { useState, useEffect } from "react";
import { loadPuter } from "../lib/puter";
import { playNotificationSound } from "../utils/notificationUtils";

interface FocusTimerProps {
  activeTask: string | null;
  onTaskComplete: () => void;
}

export function FocusTimer({ activeTask, onTaskComplete }: FocusTimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [currentTask, setCurrentTask] = useState<string | null>(null);

  const durations = [15, 25, 50, 90]; // Available focus durations in minutes

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        // Gentle reminder every 5 minutes
        if ((timeLeft - 1) % 300 === 0 && timeLeft > 60) {
          playNotificationSound("/reminder.mp3");
        }
      }, 1000);
    } else if (timeLeft === 0) {
      playNotificationSound("/notification.mp3");
      setIsActive(false);
      loadPuter().then(puter => {
        if (puter) {
          puter.ai.txt2speech("Timer is up! Feel free to take a break.").then(audio => {
            audio.play();
          });
        }
      });
      if (isBreakTime) {
        setIsBreakTime(false);
        setTimeLeft(selectedDuration * 60);
      } else {
        setSessionsCompleted(prev => prev + 1);
        setIsBreakTime(true);
        setTimeLeft(sessionsCompleted % 4 === 0 ? 15 * 60 : 5 * 60); // Longer break every 4 sessions
        
        if (currentTask) {
          setCompletedTasks((prev) => [...prev, currentTask]);
          setCurrentTask(null);
      }
    }
  }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, currentTask, selectedDuration, sessionsCompleted]);

  const startTimer = (duration?: number) => {
    const timerDuration = duration || selectedDuration;
    setTimeLeft(timerDuration * 60);
    setIsActive(true);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(selectedDuration * 60);
  };

  const handleDurationChange = (duration: number) => {
    setSelectedDuration(duration);
    if (!isActive) {
      setTimeLeft(duration * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="p-4 bg-white dark:bg-secondary rounded-lg shadow-sm dark:shadow-neutral-900/50">
      <h2 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-foreground">Focus Timer</h2>
      <div className="text-3xl font-mono mb-4 text-neutral-900 dark:text-foreground">
        {formatTime(timeLeft)}
      </div>
      
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 flex-wrap">
          {durations.map((duration) => (
            <button
              key={duration}
              onClick={() => handleDurationChange(duration)}
              disabled={isActive}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                selectedDuration === duration
                  ? "bg-blue-500 text-white"
                  : "bg-neutral-200 dark:bg-muted text-neutral-900 dark:text-foreground"
              }`}
            >
              {duration} min
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => startTimer()}
            disabled={isActive}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 dark:disabled:bg-blue-900/50 dark:disabled:text-neutral-400 transition-colors"
          >
            Start
          </button>
          <button
            onClick={resetTimer}
            className="px-4 py-2 bg-neutral-200 dark:bg-muted rounded hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors text-neutral-900 dark:text-foreground"
          >
            Reset
          </button>
        </div>

        {completedTasks.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2 text-neutral-900 dark:text-foreground">
              Completed Tasks
            </h3>
            <ul className="space-y-1">
              {completedTasks.map((task, index) => (
                <li key={index} className="text-sm text-neutral-700 dark:text-neutral-300">
                  ✓ {task}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}