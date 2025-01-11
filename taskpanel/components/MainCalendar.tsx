import React, { useState } from 'react';
import { Calendar } from './Calendar';
import { Task } from './TaskPanel';
import { AICalendarEditor } from './AICalendarEditor';

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

  return (
    <div className="w-full bg-primary/5 backdrop-blur-sm rounded-xl p-6 border border-border/10">
      <Calendar
        tasks={tasks}
        onTimeBlockDrop={onTimeBlockDrop}
        scheduledBlocks={scheduledBlocks}
        onEditBlock={handleEditBlock}
      />
      
      {editingTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items
-center justify-center">
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
  );
};

export default MainCalendar;