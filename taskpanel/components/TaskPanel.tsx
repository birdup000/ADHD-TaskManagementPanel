"use client";

import { useState } from "react";
import { FocusTimer } from "./FocusTimer";
import Reminders from "./Reminders";
import { SubTask, useAISubtaskGenerator } from "./AISubtaskGenerator";
import TaskDetailsDrawer from "./TaskDetailsDrawer";
import { getPuter } from "@/lib/puter";

interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  completed: boolean;
  dueDate?: Date;
  createdAt: Date;
}

type TaskCategory = "work" | "personal" | "urgent";
type TaskPriority = "high" | "medium" | "low";

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
    processing: false,
  });
  const [generatedSubtasks, setGeneratedSubtasks] = useState<SubTask[]>([]);
  const { generateSubtasks, identifyDependencies, loading, error, aiResponse } = useAISubtaskGenerator();

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Example Task",
      description: "This is an example task",
      category: "work",
      priority: "medium",
      completed: false,
      createdAt: new Date(),
      dueDate: new Date(Date.now() + 86400000), // Tomorrow
    },
  ]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const handleAddTask = () => {
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
      };
      setTasks((prev) => [...prev, newTaskObject]);
      setNewTask({ title: "", category: "work", priority: "medium" });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  const [newTask, setNewTask] = useState<NewTaskForm>({
    title: "",
    category: "work",
    priority: "medium",
  });

  const [showAITools, setShowAITools] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [chatHistory, setChatHistory] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [chatInput, setChatInput] = useState("");

  const handleSendMessage = async () => {
    if (chatInput.trim()) {
      const taskContext = tasks
        .map(
          (task) =>
            `- ${task.title}: ${task.description} (Category: ${task.category}, Priority: ${task.priority})`
        )
        .join("\n");
      const prompt = `Current tasks:\n${taskContext}\n\nUser message: ${chatInput}\n\nRespond with a JSON object with the following format:\n\n{\n  "command": "create" | "edit" | "delete" | "complete" | "editDueDate",\n  "taskId": "task id (required for edit, delete, complete, editDueDate)",\n  "title": "task title (required for create and edit)",\n  "description": "task description (required for create and edit)",\n  "category": "work" | "personal" | "urgent" (required for create and edit),\n  "priority": "high" | "medium" | "low" (required for create and edit),\n  "dueDate": "YYYY-MM-DD" (required for create and editDueDate)\n}\n\nIf the user does not ask to perform any of these actions, respond with a normal message.`;
      setChatHistory((prev) => [...prev, { role: "user", content: chatInput }]);
      const puter = getPuter();
      try {
        const response = await puter.ai.chat(prompt);
        setChatHistory((prev) => [
          ...prev,
          { role: "assistant", content: String(response) },
        ]);

        // Attempt to parse task command from AI response
        try {
          const parsedResponse = JSON.parse(response);
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
                  };
                  setTasks((prev) => [...prev, newTask]);
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
                  setTasks((prev) =>
                    prev.map((task) =>
                      task.id === String(parsedResponse.taskId)
                        ? {
                            ...task,
                            title: parsedResponse.title.trim(),
                            description: parsedResponse.description.trim(),
                            category: parsedResponse.category.trim() as TaskCategory,
                            priority: parsedResponse.priority.trim() as TaskPriority,
                          }
                        : task
                    )
                  );
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
                  setTasks((prev) =>
                    prev.filter((task) => task.id !== String(parsedResponse.taskId))
                  );
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
                  setTasks((prev) =>
                    prev.map((task) =>
                      task.id === String(parsedResponse.taskId)
                        ? { ...task, completed: true }
                        : task
                    )
                  );
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
                  setTasks((prev) =>
                    prev.map((task) =>
                      task.id === String(parsedResponse.taskId)
                        ? {
                            ...task,
                            dueDate: new Date(parsedResponse.dueDate),
                          }
                        : task
                    )
                  );
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
    <div className="container mx-auto p-6 dark:bg-background">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold">Task Dashboard</span>
          {/* AI Status and Toggle */}
          <button
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              aiStatus.active
                ? aiStatus.processing
                  ? "bg-yellow-500 text-black"
                  : "bg-green-500 text-white"
                : "bg-gray-500 text-white"
            }`}
            onClick={() =>
              setAIStatus((prev) => ({ ...prev, active: !prev.active }))
            }
          >
            <div
              className={`w-3 h-3 rounded-full ${
                aiStatus.active
                  ? aiStatus.processing
                    ? "bg-yellow-500 animate-pulse"
                    : "bg-green-500"
                  : "bg-gray-500"
              }`}
            />
            {aiStatus.active ? (aiStatus.processing ? "AI: Processing..." : "AI: ON") : "AI: OFF"}
          </button>
        </div>
        <div className="flex items-center gap-4">
          {/* Search Field */}
          <input
            type="text"
            placeholder="Search tasks..."
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent/50 transition-all"
          />
          {/* Profile or Settings Icon */}
          <button className="p-2 rounded-lg hover:bg-background/50 transition-colors">
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Task Statistics & Filters */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-4 mb-4">
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
                  className="bg-primary/50 backdrop-blur-sm rounded-lg p-4 border border-border/20 transition-all"
                >
                  <div className="text-sm text-muted-foreground mb-1">
                    {stat.label}
                  </div>
                  <div className="text-2xl font-semibold">{stat.value}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <select className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent/50 transition-all">
                <option value="all">All Statuses</option>
                <option value="incomplete">Incomplete</option>
                <option value="complete">Complete</option>
              </select>
              <select className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent/50 transition-all">
                <option value="priority">Sort by Priority</option>
                <option value="dueDate">Sort by Due Date</option>
                <option value="created">Sort by Created</option>
              </select>
              <button className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors">
                Clear Filters
              </button>
            </div>
          </div>

          {/* AI Tools Panel (Collapsible) */}
          <div className="border rounded-lg">
            <button
              onClick={() => setShowAITools((prev) => !prev)}
              className="flex items-center justify-between w-full p-4"
            >
              <span className="text-lg font-semibold">AI Tools</span>
              <span className="text-lg">{showAITools ? "▲" : "▼"}</span>
            </button>

            {showAITools && (
              <div className="p-4 pt-0 space-y-4">
                <button
                  className="w-full bg-accent/90 hover:bg-accent text-background rounded-lg px-4 py-2 transition-colors"
                  onClick={async () => {
                    setAIStatus((prev) => ({ ...prev, processing: true }));
                    if (!activeTaskId) {
                      
                      setAIStatus((prev) => ({ ...prev, processing: false }));
                      return;
                    }
                    
                    const activeTask = tasks.find(
                      (t) => t.id === activeTaskId
                    );
                    if (activeTask) {
                      
                      try {
                        const response = await generateSubtasks(
                          activeTask.title,
                          activeTask.description || "",
                          activeTask.dueDate?.toISOString(),
                          activeTask.priority,
                          ""
                        );
                        
                        setGeneratedSubtasks(response as SubTask[]);
                      }
                       catch (e) {
                        console.error("Error generating subtasks", e);
                      }
                    }
                    setAIStatus((prev) => ({ ...prev, processing: false }));
                  }}
                >
                  Generate Subtasks
                </button>
                <button
                  className="w-full bg-accent/90 hover:bg-accent text-background rounded-lg px-4 py-2 transition-colors"
                  onClick={() => {
                    setAIStatus((prev) => ({...prev, processing: true}));
                    if (!activeTaskId) {
                      setAIStatus((prev) => ({...prev, processing: false}));
                      return;
                    }
                    const activeTask = tasks.find(
                      (t) => t.id === activeTaskId
                    );
                    if (activeTask) {
                      identifyDependencies(activeTask.title, activeTask.description || "")
                      .then((response) => {
                        console.log("Dependencies identified:", response);
                      })
                      .catch((error) => {
                        console.error("Error identifying dependencies:", error);
                      })
                      .finally(() => {
                        setAIStatus((prev) => ({...prev, processing: false}));
                      });
                    }
                  }}
                >
                  Identify Dependencies
                </button>
                {generatedSubtasks.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h3 className="font-medium">Generated Subtasks</h3>
                    <div className="space-y-2">
                      {generatedSubtasks.map((subtask, index) => (
                        <div
                          key={index}
                          className="p-3 bg-background/50 rounded-lg border border-border/20"
                        >
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
                    {aiResponse ? (
                      <div className="text-red-500">{aiResponse}</div>
                    ) : aiStatus.active ? (
                      aiStatus.processing ? (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                          Analyzing tasks...
                          <br />
                          This can also help debug as well if you are a dev of the program but it is cool to use if you are a user as well
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
            )}
          </div>

          {/* Task List / Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`bg-gradient-to-br from-primary/50 to-secondary/50 backdrop-blur-sm rounded-lg p-4 border border-border/20 group ${
                  task.completed
                    ? "opacity-75 scale-95"
                    : "hover:backdrop-blur-md hover:border-accent/30"
                } transition-all duration-300 glow-effect hover:glow-effect-hover min-w-[240px] cursor-pointer`}
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
                          value={task.priority}
                          onChange={(e) =>
                            setTasks((prev) =>
                              prev.map((t) =>
                                t.id === task.id
                                  ? {
                                      ...t,
                                      priority: e.target.value as TaskPriority,
                                    }
                                  : t
                              )
                            )
                          }
                          className={`bg-background/20 dark:bg-background/30 text-foreground/90 backdrop-blur-sm border border-border/30 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-accent/50 transition-all hover:border-accent/40 hover:bg-background/30 dark:hover:bg-background/40 font-medium outline-none appearance-none cursor-pointer`}
                        >
                          <option value="high" className="bg-background/20">
                            High
                          </option>
                          <option value="medium" className="bg-background/20">
                            Medium
                          </option>
                          <option value="low" className="bg-background/20">
                            Low
                          </option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center px-2">
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          ></svg>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setTasks((prev) =>
                            prev.map((t) =>
                              t.id === task.id
                                ? { ...t, completed: !t.completed }
                                : t
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
                            t.id === task.id
                              ? { ...t, completed: !t.completed }
                              : t
                          )
                        )
                      }
                      className="flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        task.completed
                          ? 'bg-success/10 hover:bg-success/20 text-success'
                          : 'bg-background/50 hover:bg-background/70 text-foreground'
                      } glow-effect hover:glow-effect-hover"
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
            />
          )}
        </div>

        {/* Side Column */}
        <div className="col-span-1 flex flex-col gap-6">
          {/* Focus Timer & Reminders */}
          <div className="sticky top-6 space-y-6">
            <div className="bg-background/95 backdrop-blur-sm border border-border/20 p-6 space-y-6">
              <FocusTimer
                activeTask={activeTaskId}
                onTaskComplete={() => {
                  if (activeTaskId) {
                    setTasks((prev) =>
                      prev.map((task) =>
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
            </div>

            {/* New Task Form */}
            <div className="bg-primary dark:bg-primary rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="What needs to be done?"
                  className="bg-background dark:bg-muted border border-border dark:border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-accent"
                />
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
                  <button
                    onClick={handleAddTask}
                    className="bg-accent hover:bg-accent/80 text-background rounded-lg px-4 py-2 transition-colors"
                  >
                    Add Task
                  </button>
                </div>
              </div>
            </div>
            {/* Chat Interface */}
            <div className="bg-primary dark:bg-primary rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Chat with Tasks</h2>
              <div className="flex flex-col gap-4">
                <div className="h-48 overflow-y-auto border border-border/20 rounded-lg p-2">
                  {/* Chat History */}
                  {chatHistory.map((message, index) => (
                    <div
                      key={index}
                      className={`mb-2 p-2 rounded-md ${
                        message.role === "user"
                          ? "bg-background/50 text-right"
                          : "bg-muted/50 text-left"
                      }`}
                    >
                      {message.content}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your message..."
                    className="bg-background dark:bg-muted border border-border dark:border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-accent flex-1"
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

      {/* Bottom Utility Bar (Optional) */}
      <div className="mt-6">
        <div className="bg-background/95 backdrop-blur-sm border-t border-border/20 p-4">
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
  );
}