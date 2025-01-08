"use client";

import { useState } from "react";
import { FocusTimer } from "./FocusTimer";
import Reminders from "./Reminders";

interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  completed: boolean;
  dueDate?: Date;
  createdAt: Date;
}

type TaskCategory = "work" | "personal" | "urgent";
type TaskPriority = "high" | "medium" | "low";

type PriorityColors = Record<TaskPriority, string>;
type CategoryColors = Record<TaskCategory, string>;

interface NewTaskForm {
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
}

export default function TaskPanel() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Example Task",
      category: "work",
      priority: "medium",
      completed: false,
      createdAt: new Date(),
      dueDate: new Date(Date.now() + 86400000) // Tomorrow
    },
  ]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const priorityColors = {
    high: "bg-error/10",
    medium: "bg-warning/10",
    low: "bg-success/10",
  };

  const categoryColors = {
    work: "bg-accent/10",
    personal: "bg-success/10",
    urgent: "bg-error/10",
  };

  const [newTask, setNewTask] = useState({
    title: "",
    category: "work" as Task["category"],
    priority: "medium" as Task["priority"],
  });

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      setTasks((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          title: newTask.title,
          category: newTask.category,
          priority: newTask.priority,
          completed: false,
          createdAt: new Date(),
          dueDate: new Date(Date.now() + 86400000)
        },
      ]);
      setNewTask({ title: "", category: "work", priority: "medium" });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric"
    });
  };

  return (
    <div className="space-y-8 p-6 dark:bg-background">
      {/* Task Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Tasks", value: tasks.length },
          { label: "Completed", value: tasks.filter(t => t.completed).length },
          { label: "In Progress", value: tasks.filter(t => !t.completed).length },
          { label: "Overdue", value: tasks.filter(t => t.dueDate && t.dueDate < new Date()).length }
        ].map((stat, i) => (
          <div key={i} className="bg-primary dark:bg-primary rounded-lg p-4 hover:bg-primary/80 transition-colors animate-gentle-glow">
            <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
            <div className="text-2xl font-semibold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filter & Sort Controls */}
      <div className="bg-primary dark:bg-primary rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Filter & Sort</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select className="bg-background dark:bg-muted border border-border dark:border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-accent">
            <option value="all">All Tasks</option>
            <option value="completed">Completed</option>
            <option value="incomplete">Incomplete</option>
          </select>
          <select className="bg-background dark:bg-muted border border-border dark:border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-accent">
            <option value="priority">Sort by Priority</option>
            <option value="dueDate">Sort by Due Date</option>
            <option value="created">Sort by Created</option>
          </select>
          <button className="bg-secondary hover:bg-secondary/80 text-foreground rounded-lg px-4 py-2 transition-colors">
            Clear Filters
          </button>
        </div>
      </div>

      <FocusTimer
        activeTask={activeTaskId}
        onTaskComplete={() => {
          if (activeTaskId) {
            setTasks(prev =>
              prev.map(task =>
                task.id === activeTaskId
                  ? { ...task, completed: true }
                  : task
              )
            );
            setActiveTaskId(null);
          }
        }}
      />
      
      <Reminders />

      {/* New Task Form */}
      <div className="bg-primary dark:bg-primary rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={newTask.title}
            onChange={(e) =>
              setNewTask((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="What needs to be done?"
            className="bg-background dark:bg-muted border border-border dark:border-border rounded-lg px-4 py-2 flex-1 focus:ring-2 focus:ring-accent"
          />
          <div className="flex gap-2">
            <select
              value={newTask.category}
              onChange={(e) =>
                setNewTask((prev) => ({
                  ...prev,
                  category: e.target.value as Task["category"],
                }))
              }
              className="bg-background dark:bg-muted border border-border dark:border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-accent"
            >
              {Object.keys(categoryColors).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddTask}
              className="bg-accent hover:bg-accent/80 text-background rounded-lg px-4 py-2 transition-colors"
            >
              Add Task
            </button>
          </div>
        </div>
      </div>

      {/* Task Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`bg-primary dark:bg-primary rounded-lg p-6 group ${
              task.completed ? "opacity-75 scale-95" : "hover:scale-[1.02]"
            } transition-all animate-soft-bounce`}
            draggable
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className={`text-xl font-semibold leading-tight ${
                    task.completed ? "line-through text-muted-foreground dark:text-muted-foreground" : "dark:text-foreground"
                  }`}>
                    {task.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground">
                    <span>Created: {formatDate(task.createdAt)}</span>
                    {task.dueDate && (
                      <>
                        <span>•</span>
                        <span>Due: {formatDate(task.dueDate)}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <select
                      value={task.priority}
                      onChange={(e) =>
                        setTasks((prev) =>
                          prev.map((t) =>
                            t.id === task.id
                              ? { ...t, priority: e.target.value as Task["priority"] }
                              : t
                          )
                        )
                      }
                      className={`bg-background dark:bg-muted border border-border dark:border-border rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-accent ${
                        priorityColors[task.priority]
                      }`}
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center px-2">
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"></svg>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setTasks((prev) =>
                        prev.map((t) =>
                          t.id === task.id ? { ...t, completed: !t.completed } : t
                        )
                      )
                    }
                    className="p-1.5 rounded-full hover:bg-muted transition-colors"
                  >
                    {task.completed ? (
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-green-500 text-white">
                        ✓
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-full border-2 border-neutral-300 dark:border-neutral-500 hover:border-neutral-400 dark:hover:border-neutral-400 transition-colors" />
                    )}
                  </button>
                </div>
              </div>
              
              {!task.completed && (
                <div className="space-y-2">
                  <div className="w-full bg-neutral-100 dark:bg-neutral-700 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: "30%" }} // TODO: Calculate actual progress
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      Progress
                    </span>
                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      30% complete
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-700">
                <button
                  onClick={() =>
                    setTasks((prev) =>
                      prev.map((t) =>
                        t.id === task.id ? { ...t, completed: !t.completed } : t
                      )
                    )
                  }
                  className="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    task.completed
                      ? 'bg-green-100/50 hover:bg-green-100 text-green-700'
                      : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600'
                  }"
                >
                  {task.completed ? 'Completed ✓' : 'Mark Complete'}
                </button>
                <button
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                  title="More options"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-neutral-500 dark:text-neutral-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}