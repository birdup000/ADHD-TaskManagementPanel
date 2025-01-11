import React from 'react';
import { Calendar } from './Calendar';
import { Task } from './TaskPanel';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onTimeBlockDrop: (taskId: string, date: Date) => void;
  scheduledBlocks: Array<{
    taskId: string;
    startDate: Date;
    endDate: Date;
  }>;
}

const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onTimeBlockDrop,
  scheduledBlocks,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-background dark:bg-background rounded-lg p-6 max-w-4xl w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-muted/50 rounded-full transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <Calendar
          tasks={tasks}
          onTimeBlockDrop={onTimeBlockDrop}
          scheduledBlocks={scheduledBlocks}
        />
      </div>
    </div>
  );
};

export default CalendarModal;