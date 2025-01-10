"use client";

import React, { useState, useEffect } from "react";
import { FocusTimer } from "./FocusTimer";
import { SubTask } from "./TaskDetailsDrawer";
import Tutorial from "./Tutorial";
import TaskDetailsDrawer from "./TaskDetailsDrawer";
import AITaskCheckin from "./AITaskCheckin";
import AITaskScheduler from "./AITaskScheduler";
import { useNotificationSystem } from "./NotificationSystem";
import NotificationSystem from "./NotificationSystem";
import { useAISubtaskGenerator } from "./AISubtaskGenerator";
import { getPuter } from "../lib/puter";

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  completed: boolean;
  dueDate?: Date;
  createdAt: Date;
  subtasks?: SubTask[];
  lastUpdate?: Date;
}

type TaskCategory = "work" | "personal" | "urgent";
type TaskPriority = "high" | "medium" | "low";

interface NewTaskForm {
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
}

interface TaskPanelProps {
  onLogout: () => void;
}

export default function TaskPanel({ onLogout }: TaskPanelProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const { notifications, checkDeadlines, checkProgress, checkBlockers } = useNotificationSystem();

  const [newTask, setNewTask] = useState<NewTaskForm>({
    title: "",
    category: "work",
    priority: "medium",
  });

  const puter = getPuter();

  useEffect(() => {
    const loadTasks = async () => {
      if (puter.kv) {
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
              
              // Check notifications after loading tasks
              checkDeadlines(parsedTasksWithDates);
              checkProgress(parsedTasksWithDates);
              checkBlockers(parsedTasksWithDates);
            }
          } catch (error) {
            console.error("Error parsing tasks from storage:", error);
          }
        }
      }
    };
    loadTasks();
  }, [puter.kv]);

  const handleAddTask = async () => {
    if (newTask.title.trim()) {
      const newTaskObject: Task = {
        id: Date.now().toString(),
        title: newTask.title,
        category: newTask.category,
        priority: newTask.priority,
        completed: false,
        createdAt: new Date(),
        dueDate: new Date(Date.now() + 86400000),
        description: "",
        subtasks: [],
      };
      if (puter.kv) {
        const updatedTasks = [...tasks, newTaskObject];
        await puter.kv.set("tasks", JSON.stringify(updatedTasks));
        setTasks(updatedTasks);
      }
      setNewTask({ title: "", category: "work", priority: "medium" });
    }
  };
  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const handleTaskUpdate = async (updatedTask: Task) => {
    const updatedTasks = tasks.map(t => 
      t.id === updatedTask.id ? updatedTask : t
    );
    if (puter.kv) {
      await puter.kv.set('tasks', JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
    }
    setSelectedTask(updatedTask);
  };
  const [chatHistory, setChatHistory] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [chatInput, setChatInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(() => {
    const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
    return hasSeenTutorial ? false : true;
  });

  const handleLogout = async () => {
    console.log("handleLogout called", puter);
    if (puter.auth) {
      try {
        await puter.auth.signOut();
        console.log("signOut successful");
        onLogout();
      } catch (error) {
        console.error("signOut error", error);
      }
    } else {
      console.error("puter.auth is undefined, cannot sign out");
      // Optionally display a user-friendly message here
    }
    if (puter.kv) {
      await puter.kv.del("tasks");
    }
    setMenuOpen(false);
  };

  const handleSendMessage = async () => {
    if (chatInput.trim()) {
      const taskContext = tasks
        .map(
          (task) =>
            `- ${task.title}: ${task.description} (Category: ${task.category}, Priority: ${task.priority})`
        )
        .join("\n");
      const prompt = `Current tasks:\n${taskContext}\n\nUser message: ${chatInput}\n\nRespond with a helpful message. If the user is requesting to manage tasks, provide your response as a JSON object with this format:\n{\n  "command": "create" | "edit" | "delete" | "complete" | "editDueDate",\n  "taskId": "task id (for edit/delete/complete/editDueDate)",\n  "title": "task title (for create/edit)",\n  "description": "task description (for create/edit)",\n  "category": "work|personal|urgent (for create/edit)",\n  "priority": "high|medium|low (for create/edit)",\n  "dueDate": "YYYY-MM-DD (for create/editDueDate)"\n}\n\nOtherwise, respond with a simple text message.`;
      setChatHistory((prev) => [...prev, { role: "user", content: chatInput }]);
      const puter = getPuter();
      try {
        const response = await puter.ai.chat(prompt);
        // Ensure the response is properly formatted as a string
        const responseText = typeof response === 'object' ? 
          JSON.stringify(response, null, 2) : // Pretty print JSON if it's an object
          String(response); // Otherwise convert to string
        
        // Debug logging
        console.log('AI Response type:', typeof response);
        console.log('AI Response:', response);
        // Convert response to string before adding to chat history
        let contentToAdd = '';
        try {
          contentToAdd = typeof responseText === 'string' ? 
            responseText : 
            JSON.stringify(responseText, null, 2);
        } catch (e) {
          console.error('Error stringifying response:', e);
          contentToAdd = 'Error processing response';
        }
        
        setChatHistory((prev) => [
          ...prev,
          { role: "assistant", content: contentToAdd },
        ]);

        // Attempt to parse task command from AI response
        try {
          let parsedResponse;
          try {
            parsedResponse = JSON.parse(response);
          } catch (e) {
            console.error("AI response is not valid JSON", response);
            return;
          }
          if (parsedResponse && parsedResponse.command) {
            switch (parsedResponse.command) {
              case "create":
                if (
                  parsedResponse.title &&
                  parsedResponse.description &&
                  parsedResponse.category &&
                  parsedResponse.priority
                ) {
                  const newTask: Task = {
                    id: Date.now().toString(),
                    title: parsedResponse.title.trim(),
                    description: parsedResponse.description.trim(),
                    category: parsedResponse.category.trim() as TaskCategory,
                    priority: parsedResponse.priority.trim() as TaskPriority,
                    completed: false,
                    createdAt: new Date(),
                    dueDate: parsedResponse.dueDate
                      ? new Date(parsedResponse.dueDate)
                      : undefined,
                    subtasks: [],
                  };
                  const updatedTasks = [...tasks, newTask];
                  if (puter.kv) {
                    await puter.kv.set("tasks", JSON.stringify(updatedTasks));
                    setTasks(updatedTasks);
                  }
                  setChatHistory((prev) => [
                    ...prev,
                    {
                      role: "assistant",
                      content: `Task created: ${parsedResponse.title.trim()}`,
                    },
                  ]);
                }
                break;
              case "edit":
                if (
                  parsedResponse.taskId &&
                  parsedResponse.title &&
                  parsedResponse.description &&
                  parsedResponse.category &&
                  parsedResponse.priority
                ) {
                  const updatedTasks = tasks.map((task) =>
                    task.id === String(parsedResponse.taskId)
                      ? {
                          ...task,
                          title: parsedResponse.title.trim(),
                          description: parsedResponse.description.trim(),
                          category: parsedResponse.category.trim() as TaskCategory,
                          priority: parsedResponse.priority.trim() as TaskPriority,
                        }
                      : task
                  );
                  if (puter.kv) {
                    await puter.kv.set("tasks", JSON.stringify(updatedTasks));
                    setTasks(updatedTasks);
                  }
                  setChatHistory((prev) => [
                    ...prev,
                    {
                      role: "assistant",
                      content: `Task ${parsedResponse.taskId} edited.`,
                    },
                  ]);
                }
                break;
              case "delete":
                if (parsedResponse.taskId) {
                  const updatedTasks = tasks.filter(
                    (task) => task.id !== String(parsedResponse.taskId)
                  );
                  if (puter.kv) {
                    await puter.kv.set("tasks", JSON.stringify(updatedTasks));
                    setTasks(updatedTasks);
                  }
                  setChatHistory((prev) => [
                    ...prev,
                    {
                      role: "assistant",
                      content: `Task ${parsedResponse.taskId} deleted.`,
                    },
                  ]);
                }
                break;
              case "complete":
                if (parsedResponse.taskId) {
                  const updatedTasks = tasks.map((task) =>
                    task.id === String(parsedResponse.taskId)
                      ? { ...task, completed: true }
                      : task
                  );
                  if (puter.kv) {
                    await puter.kv.set("tasks", JSON.stringify(updatedTasks));
                    setTasks(updatedTasks);
                  }
                  setChatHistory((prev) => [
                    ...prev,
                    {
                      role: "assistant",
                      content: `Task ${parsedResponse.taskId} marked as complete.`,
                    },
                  ]);
                }
                break;
              case "editDueDate":
                if (parsedResponse.taskId && parsedResponse.dueDate) {
                  const updatedTasks = tasks.map((task) =>
                    task.id === String(parsedResponse.taskId)
                      ? {
                          ...task,
                          dueDate: new Date(parsedResponse.dueDate),
                        }
                      : task
                  );
                  if (puter.kv) {
                    await puter.kv.set("tasks", JSON.stringify(updatedTasks));
                    setTasks(updatedTasks);
                  }
                  setChatHistory((prev) => [
                    ...prev,
                    {
                      role: "assistant",
                      content: `Due date for task ${parsedResponse.taskId} updated.`,
                    },
                  ]);
                }
                break;
              default:
                break;
            }
          }
        } catch (e) {
          console.error("Error parsing AI response for task command", e);
        }
      } catch (error) {
        console.error("Error sending message:", error);
        setChatHistory((prev) => [
          ...prev,
          { role: "assistant", content: "Error sending message." },
        ]);
      }
      setChatInput("");
    }
  };

  return (
    <React.Fragment>
      <div className="min-h-screen bg-gradient-to-b from-background via-background/98 to-background/95 overflow-x-hidden">
      </div>
        {/* Top Navigation Bar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/20 shadow-sm shadow-primary/5"></nav>
        <div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold flex items-center gap-3">
                <button className="md:hidden p-2 hover:bg-primary/10 rounded-lg transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16m-7 6h7"
                    />
                  </svg>
                </button>
                Task Dashboard
              </h1>
              <div className="hidden md:flex items-center space-x-2 animate-fade-in bg-background/30 backdrop-blur-sm rounded-full px-2 border border-border/5">
                <button className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/10 transition-colors">
                  All Tasks
                </button>
                <button className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/10 transition-colors">
                  Calendar
                </button>
                <button className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/10 transition-colors">
                  Analytics
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="hidden md:flex items-center space-x-3 sm:space-x-2 lg:space-x-3">
                <select className="px-4 py-2 bg-secondary/50 hover:bg-secondary/80 text-foreground rounded-lg transition-colors backdrop-blur-sm">
                  <option value="all">All Statuses</option>
                  <option value="incomplete">Incomplete</option>
                  <option value="complete">Complete</option>
                </select>
                <select className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors">
                  <option value="priority">Sort by Priority</option>
                  <option value="dueDate">Sort by Due Date</option>
                  <option value="created">Sort by Created</option>
                </select>

                {/* Search Field */}
                <input
                  type="text"
                  placeholder="Search tasks..."
                  className="w-48 px-4 py-2 bg-background/50 border border-border/20 rounded-lg focus:ring-2 focus:ring-accent/50 transition-all placeholder:text-muted-foreground/60"
                />

                {/* Profile or Settings Icon */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setMenuOpen(!menuOpen);
                    }}
                    className="p-2 rounded-lg hover:bg-background/50 transition-colors"
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
                        d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-background/95 backdrop-blur-sm border border-border/20 rounded-lg shadow-xl z-10">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 hover:bg-muted/50 transition-colors"
                      >
                        Log Out
                      </button>
                      <button
                        onClick={() => {
                          setShowTutorial(true);
                          setTimeout(() => setMenuOpen(false), 100);
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-muted/50 transition-colors"
                      >
                        View Tutorial
                      </button>
                    </div>
                  )}
                  {showTutorial && (
                    <Tutorial onClose={() => setShowTutorial(false)} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 min-h-[calc(100vh-4rem)]">
            {/* Task Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8 animate-fade-in">
              {[
                { label: "Total Tasks", value: tasks.length },
                {
                  label: "Completed",
                  value: tasks.filter((t) => t.completed).length,
                },
                {
                  label: "In Progress",
                  value: tasks.filter((t) => !t.completed).length,
                },
                {
                  label: "Overdue",
                  value: tasks.filter(
                    (t) => t.dueDate && t.dueDate < new Date()
                  ).length,
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-primary/5 backdrop-blur-sm rounded-xl p-6 border border-border/10 hover:border-border/20 transition-all"
                >
                  <div className="text-sm text-muted-foreground/80 mb-1">
                    {stat.label}
                  </div>
                  <div className="text-3xl font-semibold bg-gradient-to-br from-foreground to-foreground/80 text-transparent bg-clip-text">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* Task List Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Add New Task */}
                <div className="bg-primary/5 backdrop-blur-sm rounded-xl p-6 border border-border/10">
                  <h2 className="text-lg font-semibold mb-4">Add New Task</h2>
                  <div className="space-y-4 animate-fade-in">
                    <div className="group relative">
                      <input
                        type="text"
                        value={newTask.title}
                        onChange={(e) =>
                          setNewTask((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder="What needs to be done?"
                        className="w-full bg-background/50 border border-border/20 rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent/50 transition-colors placeholder:text-muted-foreground/60 group-hover:border-border/40"
                      />
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg
                          className="w-5 h-5 text-muted-foreground/40"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={newTask.category}
                        onChange={(e) =>
                          setNewTask((prev) => ({
                            ...prev,
                            category: e.target.value as TaskCategory,
                          }))
                        }
                        className="bg-background dark:bg-muted border border-border dark:border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-accent"
                      >
                        {["work", "personal", "urgent"].map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      <select
                        value={newTask.priority}
                        onChange={(e) =>
                          setNewTask((prev) => ({
                            ...prev,
                            priority: e.target.value as TaskPriority,
                          }))
                        }
                        className="bg-background dark:bg-muted border border-border dark:border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-accent"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
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

                {/* Task List / Cards */}
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`group bg-primary/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-border/10 
                  ${
                    task.completed
                      ? "opacity-75 scale-95"
                      : "hover:backdrop-blur-md hover:border-accent/30 hover:shadow-lg hover:shadow-primary/5"
                  } transition-all duration-300 hover:-translate-y-0.5 glow-effect hover:glow-effect-hover cursor-pointer`}
                      onClick={() => {
                        setSelectedTask(task);
                        setActiveTaskId(task.id);
                      }}
                      draggable
                    >
                      {/* Task Card Content */}
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <h3
                              className={`text-base font-semibold ${
                                task.completed
                                  ? "line-through text-muted-foreground"
                                  : "text-foreground"
                              }`}
                            >
                              {task.title}
                            </h3>
                            <div className="grid grid-cols-[auto_1fr] gap-x-2.5 gap-y-1 text-xs">
                              <span className="font-medium text-muted-foreground/80">
                                Created:
                              </span>
                              <span className="text-muted-foreground">
                                {formatDate(task.createdAt)}
                              </span>
                              {task.dueDate && (
                                <>
                                  <span className="font-medium text-muted-foreground/80">
                                    Due:
                                  </span>
                                  <span className="text-muted-foreground">
                                    {formatDate(task.dueDate)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <select
                                title="Set task priority"
                                value={task.priority}
                                onChange={async (e) => {
                                  const updatedTasks = tasks.map((t) =>
                                    t.id === task.id
                                      ? {
                                          ...t,
                                          priority: e.target.value as TaskPriority,
                                        }
                                      : t
                                  );
                                  if (puter.kv) {
                                    await puter.kv.set(
                                      "tasks",
                                      JSON.stringify(updatedTasks)
                                    );
                                    setTasks(updatedTasks);
                                  }
                                }}
                                className={`px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors font-medium outline-none appearance-none cursor-pointer`}
                              >
                                <option value="high" className="bg-background/20">
                                  High
                                </option>
                                <option
                                  value="medium"
                                  className="bg-background/20"
                                >
                                  Medium
                                </option>
                                <option value="low" className="bg-background/20">
                                  Low
                                </option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center px-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-4 h-4 text-muted-foreground/60"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </div>
                            </div>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                const updatedTasks = tasks.map((t) =>
                                  t.id === task.id
                                    ? { ...t, completed: !t.completed }
                                    : t
                                );
                                if (puter.kv) {
                                  await puter.kv.set(
                                    "tasks",
                                    JSON.stringify(updatedTasks)
                                  );
                                  setTasks(updatedTasks);
                                }
                              }}
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
                          <div className="mt-2.5">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-muted-foreground">
                                Progress
                              </span>
                              <span className="text-xs font-semibold text-yodaGreen">
                                {task.subtasks
                                  ? `${Math.round(
                                      (task.subtasks.filter(
                                        (subtask) => subtask.completed
                                      ).length /
                                        task.subtasks.length) *
                                        100
                                    )}% complete`
                                  : "0% complete"}
                              </span>
                            </div>
                            <div className="w-full bg-background/30 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-accent to-yodaGreen h-2 rounded-full transition-all duration-300 glow-effect"
                                style={{
                                  width: task.subtasks
                                    ? `${
                                        (task.subtasks.filter(
                                          (subtask) => subtask.completed
                                        ).length /
                                          task.subtasks.length) *
                                        100
                                      }%`
                                    : "0%",
                                }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-3 border-t border-border/20">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTasks((prev) =>
                                prev.map((t) =>
                                  t.id === task.id
                                    ? { ...t, completed: !t.completed }
                                    : t
                                )
                              );
                            }}
                            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                              task.completed
                                ? "bg-success/10 hover:bg-success/20 text-success"
                                : "bg-background/50 hover:bg-background/70 text-foreground"
                            } glow-effect hover:glow-effect-hover`}
                          >
                            {task.completed ? "✓ Completed" : "Mark Complete"}
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
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const updatedTasks = tasks.filter(
                                (t) => t.id !== task.id
                              );
                              if (puter.kv) {
                                await puter.kv.set(
                                  "tasks",
                                  JSON.stringify(updatedTasks)
                                );
                                setTasks(updatedTasks);
                              }
                            }}
                            className="p-1.5 rounded-md hover:bg-background/50 transition-all glow-effect hover:glow-effect-hover"
                            title="Remove task"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-muted-foreground"
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
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Task Details Drawer (Modal or Side Drawer) */}
                {selectedTask && (
                  <TaskDetailsDrawer
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onUpdate={handleTaskUpdate}
                  />
                )}
              </div>

              {/* Side Column */}
              <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
                {/* AI Features Panel */}
                <div className="space-y-6">
                  <div className="bg-primary/5 backdrop-blur-sm rounded-xl p-6 border border-border/10 shadow-xl shadow-primary/5 space-y-4">
                    {/* AI Task Check-in */}
                    {selectedTask && (
                      <AITaskCheckin
                        task={{
                          id: selectedTask.id,
                          title: selectedTask.title,
                          description: selectedTask.description,
                          dueDate: selectedTask.dueDate,
                          lastUpdate: selectedTask.lastUpdate || new Date(),
                          progress: selectedTask.subtasks
                            ? Math.round(
                                (selectedTask.subtasks.filter((st) => st.completed).length /
                                  selectedTask.subtasks.length) *
                                  100
                              )
                            : 0,
                        }}
                        onProgressUpdate={(progress, blockers, nextSteps) => {
                          const updatedTasks = tasks.map((task) =>
                            task.id === selectedTask.id
                              ? {
                                  ...task,
                                  subtasks: task.subtasks?.map((st, index) =>
                                    index < Math.floor((progress / 100) * (task.subtasks?.length || 0))
                                      ? { ...st, completed: true }
                                      : st
                                  ),
                                }
                              : task
                          );
                          setTasks(updatedTasks);
                        }}
                      />
                    )}

                    {/* AI Task Scheduler */}
                    <AITaskScheduler
                      tasks={tasks}
                      onScheduleUpdate={(schedule) => {
                        console.log('Schedule received in onScheduleUpdate:', schedule);
                        const updatedTasks = tasks.map((task) => {
                          const scheduledTask = schedule.find((s) => s.taskId === task.id);
                          if (scheduledTask) {
                            return {
                              ...task,
                              dueDate: new Date(scheduledTask.suggestedEndDate),
                            };
                          }
                          return task;
                        });
                        setTasks(updatedTasks);
                      }}
                    />

                    {/* Focus Timer */}
                    <FocusTimer
                      activeTask={activeTaskId}
                      onTaskComplete={async () => {
                        if (activeTaskId) {
                          const updatedTasks = tasks.map((task) =>
                            task.id === activeTaskId
                              ? { ...task, completed: true }
                              : task
                          );
                          if (puter.kv) {
                            await puter.kv.set(
                              "tasks",
                              JSON.stringify(updatedTasks)
                            );
                            setTasks(updatedTasks);
                          }
                          setActiveTaskId(null);
                        }
                      }}
                    />

                  {/* Chat Interface */}
                  <div className="bg-primary/5 backdrop-blur-sm rounded-xl p-6 border border-border/10">
                    <h2 className="text-xl font-semibold mb-4">
                      Chat with Tasks
                    </h2>
                    <div className="flex flex-col gap-4">
                      <div className="h-[300px] overflow-y-auto border border-border/10 rounded-lg p-4 bg-background/30 backdrop-blur-sm space-y-3">
                        {chatHistory.length === 0 ? (
                          <div className="flex items-center justify-center h-full text-muted-foreground/60">
                            No messages yet. Start a conversation!
                          </div>
                        ) : (
                          chatHistory.map((message, index) => (
                            <div
                              key={index}
                              className={`mb-2 p-3 rounded-lg ${
                                message.role === "user"
                                  ? "bg-accent/10 ml-auto max-w-[80%]"
                                  : "bg-background/50 mr-auto max-w-[80%]"
                              }`}
                            >
                              {typeof message.content === 'string' ? message.content : JSON.stringify(message.content, null, 2)}
                            </div>
                          ))
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 bg-background/50 border border-border/20 rounded-lg px-4 py-2 focus:ring-2 focus:ring-accent/50"
                        />
                        <button
                          onClick={handleSendMessage}
                          className="bg-accent hover:bg-accent/80 text-background rounded-lg px-4 py-2 transition-colors"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification System */}
            <NotificationSystem tasks={tasks} />

            {/* Bottom Utility Bar (Optional) */}
            <div className="mt-auto pt-6">
              <div className="bg-background/95 backdrop-blur-sm border-t border-border/20 py-4 px-4 sm:px-6 lg:px-8 shadow-lg shadow-primary/5">
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <span className="text-sm text-muted-foreground">
                      Page 1 of 3
                    </span>
                    <button className="p-2 rounded-lg hover:bg-background/50 transition-colors">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}