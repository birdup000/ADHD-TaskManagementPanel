"use client";

import { useState } from "react";
import { FocusTimer } from "./FocusTimer";
import Reminders from "./Reminders";
import { SubTask, useAISubtaskGenerator } from "./AISubtaskGenerator";

interface Task {
  id: string;
  title: string;
  description: string; // Added description property
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

interface AIStatus {
  active: boolean;
  processing: boolean;
}

export default function TaskPanel() {
  const [aiStatus, setAIStatus] = useState<AIStatus>({
    active: true,
    processing: false
  });

  const [generatedSubtasks, setGeneratedSubtasks] = useState<SubTask[]>([]);
  const { generateSubtasks, loading, error } = useAISubtaskGenerator();

  const [tasks, setTasks] = useState<Task[]>([ 
    {
      id: "1",
      title: "Example Task",
      description: "This is an example task", // Added description
      category: "work",
      priority: "medium",
      completed: false,
      createdAt: new Date(),
      dueDate: new Date(Date.now() + 86400000) // Tomorrow
    },
  ]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const priorityColors = {
    high: "text-error hover:text-error/80 dark:text-error/90",
    medium: "text-warning hover:text-warning/80 dark:text-warning/90",
    low: "text-success hover:text-success/80 dark:text-success/90"
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
      const newTaskObject = {
        id: Date.now().toString(),
        title: newTask.title,
        category: newTask.category,
        priority: newTask.priority,
        completed: false,
        createdAt: new Date(),
        dueDate: new Date(Date.now() + 86400000),
        description: "", // Add a default description
      };
      setTasks((prev) => [
        ...prev,
        newTaskObject,
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
    <div className="container mx-auto space-y-8 p-6 dark:bg-background relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Task Panel</h1>
        <div className="flex items-center gap-4">
          {/* AI Status Indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              aiStatus.active ?
                (aiStatus.processing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500')
                : 'bg-gray-500'
            }`} />
            <span className="text-sm text-muted-foreground">
              {aiStatus.active ?
                (aiStatus.processing ? 'Processing...' : 'AI Active')
                : 'AI Inactive'}
            </span>
          </div>
    
          {/* AI Enhanced Search Bar */}
          <div className="bg-primary/50 backdrop-blur-sm rounded-lg p-4 border border-border/20">
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search tasks..."
                className="flex-1 bg-background/20 dark:bg-background/30 backdrop-blur-sm border border-border/30 rounded-lg px-4 py-2 focus:ring-2 focus:ring-accent/50 transition-all hover:border-accent/40 outline-none"
              />
              <select className="bg-background/20 dark:bg-background/30 backdrop-blur-sm border border-border/30 rounded-lg px-4 py-2 focus:ring-2 focus:ring-accent/50 transition-all hover:border-accent/40 outline-none">
                <option value="all">All Tasks</option>
                <option value="ai-generated">AI Generated Tasks</option>
                <option value="user-created">User Created Tasks</option>
              </select>
              <button
                className="bg-accent/90 hover:bg-accent text-background rounded-lg px-4 py-2 transition-colors"
                onClick={() => setAIStatus(prev => ({...prev, active: !prev.active}))}
              >
                {aiStatus.active ? 'Disable AI' : 'Enable AI'}
              </button>
            </div>
          </div>
          
          {/* Settings Button */}
          <button className="p-2 rounded-lg hover:bg-background/50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Close Button */}
          <button className="p-2 rounded-lg hover:bg-background/50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      {/* Task Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Tasks", value: tasks.length },
          { label: "Completed", value: tasks.filter(t => t.completed).length },
          { label: "In Progress", value: tasks.filter(t => !t.completed).length },
          { label: "Overdue", value: tasks.filter(t => t.dueDate && t.dueDate < new Date()).length }
        ].map((stat, i) => (
          <div key={i} className="bg-primary/50 backdrop-blur-sm rounded-lg p-4 border border-border/20 hover:border-accent/30 transition-all glow-effect hover:glow-effect-hover">
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
            className={`z-0 bg-gradient-to-br from-primary/50 to-secondary/50 backdrop-blur-sm rounded-lg p-4 border border-border/20 group ${
              task.completed ? "opacity-75 scale-95" : "hover:backdrop-blur-md hover:border-accent/30"
            } transition-all duration-300 glow-effect hover:glow-effect-hover min-w-[320px]`}
            draggable
          >
            <div className="flex flex-col gap-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <h3 className={`text-base font-semibold ${
                    task.completed ? "line-through text-muted-foreground" : "text-foreground"
                  }`}>
                    {task.title}
                  </h3>
                  <div className="grid grid-cols-[auto_1fr] gap-x-2.5 gap-y-1 text-xs">
                    <span className="font-medium text-muted-foreground/80">Created:</span>
                    <span className="text-muted-foreground">{formatDate(task.createdAt)}</span>
                    {task.dueDate && (
                      <>
                        <span className="font-medium text-muted-foreground/80">Due:</span>
                        <span className="text-muted-foreground">{formatDate(task.dueDate)}</span>
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
                      className={`
                        bg-background/20
                        dark:bg-background/30
                        text-foreground/90
                        backdrop-blur-sm
                        border border-border/30
                        rounded-lg
                        px-4 py-2
                        pr-8
                        focus:ring-2
                        focus:ring-accent/50
                        transition-all
                        hover:border-accent/40
                        hover:bg-background/30
                        dark:hover:bg-background/40
                        font-medium
                        outline-none
                        appearance-none
                        cursor-pointer
                      `}
                    >
                      <option value="high" className="bg-background/20">High</option>
                      <option value="medium" className="bg-background/20">Medium</option>
                      <option value="low" className="bg-background/20">Low</option>
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
          
                {/* Bottom Navigation */}
                <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/20 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button className="px-4 py-2 rounded-lg hover:bg-background/50 transition-colors">
                        List View
                      </button>
                      <button className="px-4 py-2 rounded-lg hover:bg-background/50 transition-colors">
                        Timeline View
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg hover:bg-background/50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <span className="text-sm text-muted-foreground">Page 1 of 3</span>
                      <button className="p-2 rounded-lg hover:bg-background/50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
          
                {/* Right Sidebar */}
                <div className="fixed right-0 top-0 h-screen w-80 bg-background/95 backdrop-blur-sm border-l border-border/20 p-6 space-y-6">
                  <h2 className="text-lg font-semibold">AI Actions</h2>
                  
                  <div className="space-y-4">
                    <button
                      className="w-full bg-accent/90 hover:bg-accent text-background rounded-lg px-4 py-2 transition-colors"
                      onClick={async () => {
                        setAIStatus(prev => ({...prev, processing: true}));
                        if (activeTaskId) {
                          const activeTask = tasks.find(t => t.id === activeTaskId);
                          if (activeTask) {
const subtasks = await generateSubtasks(
  activeTask.title,
  activeTask.description || '', // Assuming a default empty string if description is not available
  activeTask.dueDate?.toISOString(), // Convert date to string if available
  activeTask.priority,
  '' // Assuming no additional context for now
);
                            setGeneratedSubtasks(subtasks);
                          }
                        }
                        setAIStatus(prev => ({...prev, processing: false}));
                      }}
                    >
                      Generate Subtasks
                    </button>
                    <button
                      className="w-full bg-accent/90 hover:bg-accent text-background rounded-lg px-4 py-2 transition-colors"
                      onClick={() => setAIStatus(prev => ({...prev, processing: true}))}
                    >
                      Auto-Schedule Tasks
                    </button>
                    <button
                      className="w-full bg-accent/90 hover:bg-accent text-background rounded-lg px-4 py-2 transition-colors"
                      onClick={() => setAIStatus(prev => ({...prev, processing: true}))}
                    >
                      Identify Dependencies
                    </button>
                  </div>
                  
                  {generatedSubtasks.length > 0 && (
                    <div className="mt-6 space-y-4">
                      <h3 className="font-medium">Generated Subtasks</h3>
                      <div className="space-y-2">
                        {generatedSubtasks.map((subtask, index) => (
                          <div key={index} className="p-3 bg-background/50 rounded-lg border border-border/20">
                            <div className="font-medium">{subtask.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {subtask.description}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Estimated Time: {subtask.estimatedTime} minutes
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
          
                  <div className="pt-6 border-t border-border/20">
                    <h3 className="text-sm font-medium mb-2">AI Suggestions</h3>
                    <div className="text-sm text-muted-foreground">
                      {aiStatus.active ? (
                        aiStatus.processing ? (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                            Analyzing tasks...
                          </div>
                        ) : (
                          "No suggestions available"
                        )
                      ) : (
                        "Enable AI for suggestions"
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {!task.completed && (
                <div className="mt-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      Progress
                    </span>
                    <span className="text-xs font-semibold text-yodaGreen">
                      30% complete
                    </span>
                  </div>
                  <div className="w-full bg-background/30 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-accent to-yodaGreen h-2 rounded-full transition-all duration-300 glow-effect"
                      style={{ width: "30%" }} // TODO: Calculate actual progress
                    />
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2 pt-3 border-t border-border/20">
                <button
                  onClick={() =>
                    setTasks((prev) =>
                      prev.map((t) =>
                        t.id === task.id ? { ...t, completed: !t.completed } : t
                      )
                    )
                  }
                  className="flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    task.completed
                      ? 'bg-success/10 hover:bg-success/20 text-success'
                      : 'bg-background/50 hover:bg-background/70 text-foreground'
                  } glow-effect hover:glow-effect-hover"
                >
                  {task.completed ? '✓ Completed' : 'Mark Complete'}
                </button>
                <button
                  className="p-1.5 rounded-md hover:bg-background/50 transition-all glow-effect hover:glow-effect-hover"
                  title="More options"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-muted-foreground"
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
