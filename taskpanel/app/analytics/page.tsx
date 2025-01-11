"use client";

import { useState, useEffect } from 'react';
import { getPuter } from '../../lib/puter';
import type { Task } from '../../components/TaskPanel';

export default function Analytics() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [analytics, setAnalytics] = useState({
    completionRate: 0,
    avgCompletionTime: 0,
    tasksByPriority: { high: 0, medium: 0, low: 0 },
    tasksByCategory: { work: 0, personal: 0, urgent: 0 },
    productiveHours: [] as { hour: number; completions: number }[],
  });

  useEffect(() => {
    const loadTasks = async () => {
      const puter = getPuter();
      if (puter.kv) {
        const tasksString = await puter.kv.get("tasks");
        if (tasksString) {
          const parsedTasks = JSON.parse(tasksString);
          setTasks(parsedTasks.map((task: any) => ({
            ...task,
            createdAt: new Date(task.createdAt),
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          })));
        }
      }
    };
    loadTasks();
  }, []);

  useEffect(() => {
    // Calculate analytics when tasks change
    const calculateAnalytics = async () => {
      // Completion rate
      const completedTasks = tasks.filter(task => task.completed);
      const completionRate = (completedTasks.length / tasks.length) * 100;

      // Average completion time
      const completionTimes = completedTasks.map(task => {
        const created = new Date(task.createdAt).getTime();
        const completed = task.lastUpdate ? new Date(task.lastUpdate).getTime() : Date.now();
        return (completed - created) / (1000 * 60 * 60); // hours
      });
      const avgCompletionTime = completionTimes.length > 0 
        ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length 
        : 0;

      // Tasks by priority
      const tasksByPriority = tasks.reduce((acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Tasks by category
      const tasksByCategory = tasks.reduce((acc, task) => {
        acc[task.category] = (acc[task.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Most productive hours
      const productiveHours = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        completions: completedTasks.filter(task => 
          task.lastUpdate && new Date(task.lastUpdate).getHours() === i
        ).length
      }));

      setAnalytics({
        completionRate,
        avgCompletionTime,
        tasksByPriority: {
          high: tasksByPriority.high || 0,
          medium: tasksByPriority.medium || 0,
          low: tasksByPriority.low || 0,
        },
        tasksByCategory: {
          work: tasksByCategory.work || 0,
          personal: tasksByCategory.personal || 0,
          urgent: tasksByCategory.urgent || 0,
        },
        productiveHours,
      });
    };

    calculateAnalytics();
  }, [tasks]);

  return (
    <div className="animate-fade-in space-y-6 py-8">
      <h1 className="text-3xl font-bold">Task Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Key Metrics */}
        <div className="bg-primary/5 backdrop-blur-sm rounded-xl p-6 border border-border/10">
          <h3 className="text-lg font-semibold mb-2">Completion Rate</h3>
          <p className="text-3xl font-bold text-accent">{analytics.completionRate.toFixed(1)}%</p>
        </div>
        
        <div className="bg-primary/5 backdrop-blur-sm rounded-xl p-6 border border-border/10">
          <h3 className="text-lg font-semibold mb-2">Avg. Completion Time</h3>
          <p className="text-3xl font-bold text-accent">{analytics.avgCompletionTime.toFixed(1)}h</p>
        </div>

        <div className="bg-primary/5 backdrop-blur-sm rounded-xl p-6 border border-border/10">
          <h3 className="text-lg font-semibold mb-2">Total Tasks</h3>
          <p className="text-3xl font-bold text-accent">{tasks.length}</p>
        </div>

        <div className="bg-primary/5 backdrop-blur-sm rounded-xl p-6 border border-border/10">
          <h3 className="text-lg font-semibold mb-2">Active Tasks</h3>
          <p className="text-3xl font-bold text-accent">
            {tasks.filter(t => !t.completed).length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <div className="bg-primary/5 backdrop-blur-sm rounded-xl p-6 border border-border/10">
          <h3 className="text-lg font-semibold mb-4">Tasks by Priority</h3>
          <div className="space-y-4">
            {Object.entries(analytics.tasksByPriority).map(([priority, count]) => (
              <div key={priority}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium capitalize">{priority}</span>
                  <span className="text-sm text-muted-foreground">{count}</span>
                </div>
                <div className="w-full bg-background/30 rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full"
                    style={{
                      width: `${(count / tasks.length) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-primary/5 backdrop-blur-sm rounded-xl p-6 border border-border/10">
          <h3 className="text-lg font-semibold mb-4">Tasks by Category</h3>
          <div className="space-y-4">
            {Object.entries(analytics.tasksByCategory).map(([category, count]) => (
              <div key={category}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium capitalize">{category}</span>
                  <span className="text-sm text-muted-foreground">{count}</span>
                </div>
                <div className="w-full bg-background/30 rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full"
                    style={{
                      width: `${(count / tasks.length) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Productive Hours */}
      <div className="bg-primary/5 backdrop-blur-sm rounded-xl p-6 border border-border/10">
        <h3 className="text-lg font-semibold mb-4">Most Productive Hours</h3>
        <div className="h-64">
          <div className="flex h-full items-end space-x-2">
            {analytics.productiveHours.map(({ hour, completions }) => {
              const maxCompletions = Math.max(...analytics.productiveHours.map(h => h.completions));
              const height = maxCompletions > 0 ? (completions / maxCompletions) * 100 : 0;
              
              return (
                <div key={hour} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-accent/80 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs mt-2">{hour}:00</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}