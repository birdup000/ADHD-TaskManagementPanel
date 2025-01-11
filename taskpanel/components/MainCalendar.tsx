import React, { useState } from 'react';
import { Calendar } from './Calendar';
import { Task } from './TaskPanel';

interface MainCalendarProps {
  tasks: Task[];
  onTimeBlockDrop: (taskId: string, date: Date) => void;
  scheduledBlocks: Array<{
    taskId: string;
    startDate: Date;
    endDate: Date;
  }>;
}

const MainCalendar: React.FC<MainCalendarProps> = ({
  tasks,
  onTimeBlockDrop,
  scheduledBlocks,
}) => {
  return (
    <div className="w-full bg-primary/5 backdrop-blur-sm rounded-xl p-6 border border-border/10">
      <Calendar
        tasks={tasks}
        onTimeBlockDrop={onTimeBlockDrop}
        scheduledBlocks={scheduledBlocks}
      />
    </div>
  );
};

export default MainCalendar;