"use client";

import React from 'react';
import MainCalendar from '../../components/MainCalendar';
import { Task } from '../../components/TaskPanel';

export default function CalendarPage() {
  const [tasks, setTasks] = React.useState<Task[]>([
    {
      id: '1',
      title: 'Sample Task 1',
      description: 'This is a sample task',
      priority: 'medium',
      status: 'todo',
      dueDate: new Date(),
    }
  ]);
  const [scheduledBlocks, setScheduledBlocks] = React.useState<Array<{
    taskId: string;
    startDate: Date;
    endDate: Date;
  }>>([]);

  return (
    <div className="animate-fade-in">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-4 py-6">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <MainCalendar
          tasks={tasks}
          onTimeBlockDrop={(taskId: string, date: Date) => {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
              const endDate = new Date(date);
              endDate.setHours(endDate.getHours() + 2); // Default 2-hour block
              const updatedBlocks = [...scheduledBlocks.filter((b: { taskId: string }) => b.taskId !== taskId), {
                taskId,
                startDate: date,
                endDate
              }];
              setScheduledBlocks(updatedBlocks);
            }
          }}
          scheduledBlocks={scheduledBlocks}
        />
      </div>
    </div>
  );
}