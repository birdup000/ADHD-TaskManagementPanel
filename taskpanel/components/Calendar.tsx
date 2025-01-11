import React, { useState, useEffect } from 'react';
import { Task } from './TaskPanel';

interface CalendarProps {
  tasks: Task[];
  onTimeBlockDrop: (taskId: string, date: Date) => void;
  scheduledBlocks: Array<{
    taskId: string;
    startDate: Date;
    endDate: Date;
  }>;
  onEditBlock?: (taskId: string, startDate: Date, endDate: Date) => void;
}

export function Calendar({ tasks, onTimeBlockDrop, scheduledBlocks, onEditBlock }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    if (draggedTask) {
      onTimeBlockDrop(draggedTask.id, date);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Generate calendar grid
  const generateCalendarDays = () => {
    const days = [];
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const scheduledTasksForDay = scheduledBlocks.filter(block => {
        const blockDate = new Date(block.startDate);
        return blockDate.toDateString() === date.toDateString();
      });

      days.push(
        <div
          key={date.toISOString()}
          onDrop={(e) => handleDrop(e, date)}
          onDragOver={handleDragOver}
          className="min-h-[100px] border border-border/20 p-2"
        >
          <div className="font-medium mb-2">{day}</div>
          {scheduledTasksForDay.map(block => {
            const task = tasks.find(t => t.id === block.taskId);
            return task ? (
              <div
                key={block.taskId}
                onClick={() => onEditBlock && onEditBlock(block.taskId, block.startDate, block.endDate)}
                className={`p-2 rounded text-sm mb-1 cursor-pointer hover:opacity-80 ${
                  task.priority === 'high' ? 'bg-red-100 text-red-800' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}
              >
                <div className="font-medium">{task.title}</div>
                <div className="text-xs">
                  {block.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                  {block.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ) : null;
          })}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="bg-primary/5 backdrop-blur-sm rounded-xl p-6 border border-border/10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Calendar</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
            className="p-2 rounded-lg hover:bg-background/50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
            className="p-2 rounded-lg hover:bg-background/50"
          >
            Next
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-medium p-2">{day}</div>
        ))}
        {generateCalendarDays()}
      </div>
    </div>
  );
}