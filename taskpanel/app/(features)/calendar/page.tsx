"use client";

import React from 'react';
import MainCalendar from '../../../components/MainCalendar';
import { Task } from '../../../components/TaskPanel';
import { AITaskScheduler } from '../../../components/AITaskScheduler';
import { getPuter, loadPuter } from '../../../lib/puter';

type TaskCategory = "work" | "personal" | "urgent";
type TaskPriority = "high" | "medium" | "low";

export default function CalendarPage() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [scheduledBlocks, setScheduledBlocks] = React.useState<Array<{
    taskId: string;
    startDate: Date;
    endDate: Date;
  }>>([]);
  const [aiSchedule, setAiSchedule] = React.useState<
    {
      taskId: string;
      suggestedStartDate: string;
      suggestedEndDate: string;
    }[]
  >([]);
  
  const [puter, setPuter] = React.useState<any>(null);

  React.useEffect(() => {
    const initPuter = async () => {
      const puterInstance = await loadPuter();
      setPuter(puterInstance);
    };
    initPuter();
  }, []);

  React.useEffect(() => {
    const loadTasks = async () => {
      if (puter?.kv) {
        const tasksString = await puter.kv.get("tasks");
        if (tasksString) {
          try {
            const parsedTasks = JSON.parse(tasksString);
            if (Array.isArray(parsedTasks)) {
              const parsedTasksWithDates = parsedTasks.map((task) => ({
                ...task,
                createdAt: new Date(task.createdAt),
                dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
              }));
              setTasks(parsedTasksWithDates);
            }
          } catch (error) {
            console.error("Error parsing tasks from storage:", error);
          }
        }
      }
    };
    loadTasks();
  }, [puter?.kv]);

  React.useEffect(() => {
    if (aiSchedule && aiSchedule.length > 0) {
      const newScheduledBlocks = aiSchedule.map(item => ({
        taskId: item.taskId,
        startDate: new Date(item.suggestedStartDate),
        endDate: new Date(item.suggestedEndDate)
      }));
      setScheduledBlocks(newScheduledBlocks);
    }
  }, [aiSchedule]);

  return (
    <div className="animate-fade-in">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-4 py-6">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <AITaskScheduler
          tasks={tasks}
          onScheduleUpdate={(schedule) => {
            setAiSchedule(schedule);
          }}
        />
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