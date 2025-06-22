"use client";

import React from 'react';
import { Task } from '../../types/task';

interface CalendarViewProps {
  tasks: Task[];
  onTaskSelect: (taskId: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onTaskSelect,
}) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [focusedDay, setFocusedDay] = React.useState<number | null>(null);
  const [focusedTaskIndex, setFocusedTaskIndex] = React.useState<number | null>(null);
  
  // Get first day of the month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // Get days in month
  const daysInMonth = lastDayOfMonth.getDate();
  const firstDayWeekday = firstDayOfMonth.getDay();

  // Group tasks by date
  const tasksByDate = tasks.reduce((acc, task) => {
    if (task.dueDate) {
      const date = new Date(task.dueDate);
      const dateKey = date.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(task);
    }
    return acc;
  }, {} as Record<string, Task[]>);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    setFocusedDay(null); // Reset focus when changing months
  };

  const handleKeyDown = (event: React.KeyboardEvent, day: number, daysInMonth: number, dayTasks: Task[]) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (day > 1) {
        setFocusedDay(day - 1);
        setFocusedTaskIndex(null);
      } else {
        changeMonth(-1);
        setFocusedDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate());
        setFocusedTaskIndex(null);
      }
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (day < daysInMonth) {
        setFocusedDay(day + 1);
        setFocusedTaskIndex(null);
      } else {
        changeMonth(1);
        setFocusedDay(1);
        setFocusedTaskIndex(null);
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (day > 7) {
        setFocusedDay(day - 7);
        setFocusedTaskIndex(null);
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (day <= daysInMonth - 7) {
        setFocusedDay(day + 7);
        setFocusedTaskIndex(null);
      }
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (dayTasks.length > 0) {
        setFocusedTaskIndex(0);
        onTaskSelect(dayTasks[0].id);
      }
    } else if (event.key >= '1' && event.key <= '9' && dayTasks.length >= parseInt(event.key)) {
      event.preventDefault();
      const taskIndex = parseInt(event.key) - 1;
      setFocusedTaskIndex(taskIndex);
      onTaskSelect(dayTasks[taskIndex].id);
    } else if (event.key === 't') {
      event.preventDefault();
      setCurrentDate(new Date());
      setFocusedDay(new Date().getDate());
      setFocusedTaskIndex(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-bg-primary" role="main" aria-label="Calendar view for task management">
      {/* Calendar Header - Improved for mobile touch targets */}
      <header className="p-4 md:p-6 border-b border-border-default bg-bg-primary">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="heading-secondary">Calendar View</h1>
          <div className="flex items-center justify-center sm:justify-end gap-2">
            <button
              onClick={() => changeMonth(-1)}
              className="p-3 rounded-lg hover:bg-accent-muted transition-colors duration-200
                      focus:outline-none focus:ring-2 focus:ring-accent-focus touch-manipulation"
              aria-label="Previous month navigation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="px-4 py-2 min-w-[180px] text-center">
              <span className="text-lg font-medium text-text-primary">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            <button
              onClick={() => changeMonth(1)}
              className="p-3 rounded-lg hover:bg-accent-muted transition-colors duration-200
                      focus:outline-none focus:ring-2 focus:ring-accent-focus touch-manipulation"
              aria-label="Next month navigation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="btn-secondary btn-sm ml-2 touch-manipulation"
              aria-label="Go to current month (shortcut: t)"
            >
              Today
            </button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-text-secondary py-2">
              {day}
            </div>
          ))}
        </div>
      </header>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-7 gap-1 auto-rows-fr">
          {/* Empty cells for days before the first of the month */}
          {Array.from({ length: firstDayWeekday }).map((_, index) => (
            <div key={`empty-start-${index}`} className="bg-bg-secondary rounded-lg p-2" />
          ))}

          {/* Calendar days */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dateKey = date.toISOString().split('T')[0];
            const dayTasks = tasksByDate[dateKey] || [];
            const isToday = new Date().toDateString() === date.toDateString();

            return (
              <div
                key={day}
                className={`bg-bg-secondary rounded-lg p-2 flex flex-col min-h-[100px] sm:min-h-[120px] md:min-h-[140px]
                          ${isToday ? 'ring-2 ring-accent-primary' : ''}
                          ${focusedDay === day ? 'outline outline-2 outline-accent-primary' : ''}`}
                role="gridcell"
                aria-label={`Day ${day}, ${dayTasks.length} tasks${isToday ? ', Today' : ''}${focusedDay === day ? ', Focused' : ''}`}
                tabIndex={0}
                onFocus={() => setFocusedDay(day)}
                onKeyDown={(e) => handleKeyDown(e, day, daysInMonth, dayTasks)}
              >
                <div className="text-sm font-medium mb-1">{day}</div>
                <div className="flex-1 overflow-y-hidden max-h-20 sm:max-h-24 md:max-h-28 relative">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onTaskSelect(task.id)}
                      className={`text-xs p-1 mb-1 rounded cursor-pointer
                                ${task.priority === 'high' ? 'bg-priority-high bg-opacity-20 text-text-primary' :
                                  task.priority === 'medium' ? 'bg-priority-medium bg-opacity-20 text-text-primary' :
                                  'bg-priority-low bg-opacity-20 text-text-primary'}
                                ${focusedDay === day && focusedTaskIndex === dayTasks.indexOf(task) ? 'outline outline-1 outline-accent-primary' : ''}`}
                      tabIndex={0}
                      role="button"
                      aria-label={`Task: ${task.title}, Priority: ${task.priority}${focusedDay === day && focusedTaskIndex === dayTasks.indexOf(task) ? ', Focused' : ''}`}
                    >
                      <div className="truncate">{task.title}</div>
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-accent-primary hover:underline cursor-pointer"
                      onClick={() => {
                        // Show a scrollable list or tooltip for additional tasks
                        const additionalTasks = dayTasks.slice(3);
                        const taskList = additionalTasks.map(t => t.title).join('\n');
                        alert(`Additional tasks on day ${day}:\n${taskList}`);
                      }}
                      aria-label={`Show ${dayTasks.length - 3} more tasks`}
                    >
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Empty cells for days after the last of the month */}
          {Array.from({ length: (7 - ((daysInMonth + firstDayWeekday) % 7)) % 7 }).map((_, index) => (
            <div key={`empty-end-${index}`} className="bg-bg-secondary rounded-lg p-2" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;