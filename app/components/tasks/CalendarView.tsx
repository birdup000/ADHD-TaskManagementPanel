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
  };

  return (
    <div className="h-full flex flex-col bg-bg-primary">
      {/* Calendar Header */}
      <div className="p-4 border-b border-border-default">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Calendar View</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 rounded-md hover:bg-hover"
              aria-label="Previous month"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-lg font-medium">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 rounded-md hover:bg-hover"
              aria-label="Next month"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
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
      </div>

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
                className={`bg-bg-secondary rounded-lg p-2 flex flex-col min-h-[100px]
                          ${isToday ? 'ring-2 ring-accent-primary' : ''}`}
              >
                <div className="text-sm font-medium mb-1">{day}</div>
                <div className="flex-1 overflow-y-auto">
                  {dayTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onTaskSelect(task.id)}
                      className={`text-xs p-1 mb-1 rounded cursor-pointer
                                ${task.priority === 'high' ? 'bg-priority-high bg-opacity-20' :
                                  task.priority === 'medium' ? 'bg-priority-medium bg-opacity-20' :
                                  'bg-priority-low bg-opacity-20'}`}
                    >
                      <div className="truncate">{task.title}</div>
                    </div>
                  ))}
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