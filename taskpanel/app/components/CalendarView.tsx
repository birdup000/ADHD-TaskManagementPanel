"use client";

import React from 'react';
import { Task } from '../types/task';

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onTaskClick }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const weeks = Math.ceil((daysInMonth + firstDayOfMonth) / 7);
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddedDays = Array.from({ length: firstDayOfMonth }, () => null);
  const days = [...paddedDays, ...monthDays];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getTasksForDate = (date: number) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === date &&
        taskDate.getMonth() === currentDate.getMonth() &&
        taskDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(currentDate.setMonth(
      currentDate.getMonth() + (direction === 'next' ? 1 : -1)
    )));
  };

  return (
    <div className="bg-[#2A2A2A] rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-[#333333] rounded"
        >
          ←
        </button>
        <h2 className="text-xl font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button 
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-[#333333] rounded"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm text-gray-400">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <div
            key={index}
            className={`min-h-[100px] p-2 rounded ${
              day
                ? 'bg-[#333333] hover:bg-[#383838] cursor-pointer'
                : 'bg-transparent'
            }`}
            onClick={() => day && setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
          >
            {day && (
              <>
                <div className="text-sm text-gray-400 mb-2">{day}</div>
                <div className="space-y-1">
                  {getTasksForDate(day).map(task => (
                    <div
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskClick(task);
                      }}
                      className={`
                        text-xs p-1 rounded truncate
                        ${task.priority === 'high' ? 'bg-red-600/30 text-red-200' :
                          task.priority === 'medium' ? 'bg-yellow-600/30 text-yellow-200' :
                          'bg-green-600/30 text-green-200'}
                      `}
                    >
                      {task.title}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;