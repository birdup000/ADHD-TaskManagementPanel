import React, { useState } from 'react';
import { Calendar } from './Calendar';
import { Task } from './TaskPanel';
import { AICalendarEditor } from './AICalendarEditor';

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
  const [editingTask, setEditingTask] = useState<{
    task: Task;
    startDate: Date;
    endDate: Date;
  } | null>(null);

  const handleEditBlock = (taskId: string, startDate: Date, endDate: Date) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setEditingTask({ task, startDate, endDate });
    }
  };

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
          onEditBlock={handleEditBlock}
        />
        {editingTask && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="max-w-lg w-full mx-4">
              <AICalendarEditor
                task={editingTask.task}
                startDate={editingTask.startDate}
                endDate={editingTask.endDate}
                onSave={(updates) => {
                  // Update the scheduled block
                  const updatedBlocks = scheduledBlocks.map(block =>
                    block.taskId === updates.taskId
                      ? { ...block, startDate: updates.startDate, endDate: updates.endDate }
                      : block
                  );
                  onTimeBlockDrop(updates.taskId, updates.startDate);
                  setEditingTask(null);
                }}
                onCancel={() => setEditingTask(null)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarModal;