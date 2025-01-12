import React, { useState, useEffect } from 'react';
import { Calendar } from './Calendar';
import { Task } from './TaskPanel';
import { AICalendarEditor } from './AICalendarEditor';
import { useUnifiedScheduler } from '../hooks/useUnifiedScheduler';

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
  scheduledBlocks: initialScheduledBlocks,
}) => {
  const [editingTask, setEditingTask] = useState<{
    task: Task;
    startDate: Date;
    endDate: Date;
  } | null>(null);

  const [scheduledBlocks, setScheduledBlocks] = useState(initialScheduledBlocks);

  const {
    generateUnifiedSchedule,
    unifiedSchedule,
    loading,
    error
  } = useUnifiedScheduler(tasks);

  // Update schedule when unified scheduler provides new schedule
  useEffect(() => {
    if (unifiedSchedule) {
      const newBlocks = unifiedSchedule.schedule.map(item => ({
        taskId: item.taskId,
        startDate: item.startDate,
        endDate: item.endDate
      }));
      setScheduledBlocks(newBlocks);
    }
  }, [unifiedSchedule]);

  const handleEditBlock = (taskId: string, startDate: Date, endDate: Date) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setEditingTask({ task, startDate, endDate });
    }
  };

  return (
    <div className="w-full bg-primary/5 backdrop-blur-sm rounded-xl p-6 border border-border/10">
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <button
          onClick={() => generateUnifiedSchedule()}
          disabled={loading || tasks.length === 0}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 disabled:opacity-50"
        >
          {loading ? 'Optimizing Schedule...' : 'Optimize Schedule'}
        </button>
      </div>

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
                onTimeBlockDrop(updates.taskId, updates.startDate);
                // Trigger a new unified schedule generation to reconcile manual changes
                generateUnifiedSchedule().catch(console.error);
                setEditingTask(null);
              }}
              onCancel={() => setEditingTask(null)}
            />
          </div>
        </div>
      )}

      {unifiedSchedule?.conflicts && unifiedSchedule.conflicts.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="font-medium">Schedule Conflicts</h4>
          {unifiedSchedule.conflicts.map((conflict, index) => (
            <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                {conflict.message}
              </div>
            </div>
          ))}
        </div>
      )}

      {unifiedSchedule?.recommendations && unifiedSchedule.recommendations.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="font-medium">Schedule Recommendations</h4>
          <ul className="list-disc list-inside space-y-1">
            {unifiedSchedule.recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-muted-foreground">{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MainCalendar;