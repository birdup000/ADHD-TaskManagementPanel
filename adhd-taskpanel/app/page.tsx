"use client";

import type { NextPage } from 'next';
import type { DragEvent, ChangeEvent, MouseEvent } from 'react';
import Head from 'next/head';
import {
  FaChevronDown,
  FaChevronRight,
  FaChevronLeft,
  FaPlus,
  FaCog,
  FaEllipsisH,
  FaTrash,
  FaEdit,
  FaCheck,
  FaRegCircle,
} from 'react-icons/fa';
import dynamic from 'next/dynamic';
import { useState, useEffect, useRef } from 'react';
import LocalForage from 'localforage';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

// Interfaces
// Global styles for animations
const globalStyles = `
  @keyframes pulseScale {
    0% {
      opacity: 0.5;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.02);
    }
    100% {
      opacity: 0.5;
      transform: scale(1);
    }
  }

  .task-placeholder {
    background-color: rgba(75, 85, 99, 0.5);
    border: 1px dashed rgba(156, 163, 175, 0.5);
    border-radius: 0.5rem;
    margin: 0.5rem 0;
    transition: all 0.2s ease-in-out;
  }

  .task-list {
    min-height: 50px;
    transition: min-height 0.2s ease-in-out;
  }

  .task-list:empty {
    min-height: 100px;
    background: rgba(75, 85, 99, 0.1);
    border-radius: 0.5rem;
    border: 1px dashed rgba(156, 163, 175, 0.2);
  }
`;

interface NotesEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
}

interface Settings {
  useWindowMode: boolean;
  theme: 'dark' | 'darker' | 'system';
  accentColor: string;
  sidebarCollapsed: boolean;
  showCompletedTasks: boolean;
  defaultView: 'list' | 'kanban';
  database: {
    enabled: boolean;
    url: string;
    key: string;
  };
  agixt: {
    enabled: boolean;
    uri: string;
    apiKey: string;
    defaultAgent: string;
  };
}

interface Task {
  id: number;
  projectId: number;
  task: string;
  isComplete: boolean;
  description: string;
  dueDate: string | null;
  stage: 'toDo' | 'inProgress' | 'completed';
  notes: string;
  lastEdited?: Date;
}

interface Project {
  id: number;
  name: string;
  isExpanded?: boolean;
}

// Keep other existing interfaces...

const ResizeHandle = () => (
  <PanelResizeHandle className="w-1 hover:w-1.5 transition-all bg-gray-100/10 rounded-full mx-1" />
);

const NotesEditor = dynamic(() => import('./components/NotesEditor'), { ssr: false });

const Page: NextPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newTask, setNewTask] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hoveredTaskId, setHoveredTaskId] = useState<number | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, taskId: number) => {
    e.dataTransfer.setData('taskId', taskId.toString());
    const task = tasks.find(t => t.id === taskId);
    if (task) setDraggedTask(task);
  };
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>, stage: string) => {
    e.preventDefault();
    if (dragOverStage !== stage && draggedTask && draggedTask.stage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    // Only clear dragOverStage if we're leaving the column (not entering a child element)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverStage(null);
    }
  };
  
  const handleDrop = (e: DragEvent<HTMLDivElement>, targetStage: 'toDo' | 'inProgress' | 'completed') => {
    e.preventDefault();
    setDragOverStage(null);
    setDraggedTask(null);
    const taskId = parseInt(e.dataTransfer.getData('taskId'));
    if (!isNaN(taskId)) {
      handleMoveTaskToStage(taskId, targetStage);
    }
  };

  const handleMoveTaskToStage = async (taskId: number, stage: 'toDo' | 'inProgress' | 'completed') => {
    try {
      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, stage } : task
      );
      setTasks(updatedTasks);
      
      // Update selected task if it's the one being moved
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, stage });
      }
      
      await LocalForage.setItem('tasks', updatedTasks);
    } catch (error) {
      console.error('Error moving task to stage:', error);
    }
  };

  // Filter tasks by project
  const projectTasks = tasks.filter(task => 
    selectedProject && task.projectId === selectedProject.id
  );

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setSelectedTask(null);
  };

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
  };

  const handleToggleTaskCompletion = async (taskId: number) => {
    try {
      const taskToUpdate = tasks.find(task => task.id === taskId);
      if (!taskToUpdate) return;

      // First update the completion status
      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, isComplete: !task.isComplete } : task
      );
      setTasks(updatedTasks);

      // If task is being completed, move it to completed stage after a short delay
      if (!taskToUpdate.isComplete) {
        setTimeout(async () => {
          const finalTasks = updatedTasks.map((task) =>
            task.id === taskId ? { ...task, stage: 'completed' as const } : task
          );
          setTasks(finalTasks);
          await LocalForage.setItem('tasks', finalTasks);
        }, 300);
      } else {
        await LocalForage.setItem('tasks', updatedTasks);
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const handleRemoveTask = async (taskId: number) => {
    try {
      const updatedTasks = tasks.filter((task) => task.id !== taskId);
      setTasks(updatedTasks);
      await LocalForage.setItem('tasks', updatedTasks);
    } catch (error) {
      console.error('Error removing task:', error);
    }
  };

  const handleUpdateNotes = async (taskId: number, notes: string) => {
    try {
      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, notes, lastEdited: new Date() } : task
      );
      setTasks(updatedTasks);
      await LocalForage.setItem('tasks', updatedTasks);
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  // Add global styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = globalStyles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const tasksData = await LocalForage.getItem('tasks');
        if (tasksData) setTasks(tasksData as Task[]);

        const projectsData = await LocalForage.getItem('projects');
        if (projectsData) setProjects(projectsData as Project[]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    loadInitialData();
  }, []);

  // Notion-style breadcrumb component
  const Breadcrumb = () => (
    <div className="flex items-center gap-2 text-gray-400 text-sm py-2 px-4 border-b border-gray-800">
      <span className="hover:bg-gray-800 px-2 py-1 rounded cursor-pointer">
        {selectedProject?.name || 'All Tasks'}
      </span>
      {selectedTask && (
        <>
          <FaChevronRight size={12} />
          <span className="hover:bg-gray-800 px-2 py-1 rounded cursor-pointer">
            {selectedTask.task}
          </span>
        </>
      )}
    </div>
  );

  // Notion-style sidebar section
  const SidebarSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-4">
      <div className="flex items-center gap-2 text-gray-400 text-sm mb-2 px-2 py-1 hover:bg-gray-800 rounded cursor-pointer">
        <FaChevronDown size={12} />
        <span>{title}</span>
      </div>
      {children}
    </div>
  );

  // Notion-style task item
  interface TaskItemProps {
    task: Task;
  }

  const TaskItem: React.FC<TaskItemProps> = ({ task }) => (
    <div
      className={`group flex items-start gap-3 p-2 rounded-lg transition-all duration-200 relative
        ${draggedTask?.id === task.id ? 'opacity-50 bg-gray-700' : 'hover:bg-gray-800/50'}`}
      onMouseEnter={(e: MouseEvent<HTMLDivElement>) => setHoveredTaskId(task.id)}
      onMouseLeave={(e: MouseEvent<HTMLDivElement>) => setHoveredTaskId(null)}
      onClick={() => handleSelectTask(task)}
      draggable
      onDragStart={(e) => handleDragStart(e, task.id)}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 group-hover:w-1.5 opacity-0 group-hover:opacity-100 bg-gray-600 rounded-l transition-all duration-200" />
      <div className="flex items-center gap-3 w-full">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleTaskCompletion(task.id);
          }}
          className="flex-shrink-0 hover:bg-gray-700 rounded p-0.5 transition-colors"
        >
          {task.isComplete ? (
            <FaCheck size={14} className="text-blue-500" />
          ) : (
            <FaRegCircle size={14} className="text-gray-500 group-hover:text-gray-400" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`${task.isComplete ? 'line-through text-gray-500' : 'text-gray-200'} 
            transition-all duration-300 ease-in-out group-hover:text-gray-100`}>
            {task.task}
          </p>
          {task.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2 group-hover:text-gray-400 transition-colors">
              {task.description}
            </p>
          )}
        </div>
      </div>
      {hoveredTaskId === task.id && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-gray-800/90 backdrop-blur-sm rounded px-1 py-0.5 shadow-lg">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveTask(task.id);
            }}
            className="p-1.5 hover:bg-gray-700 rounded-sm transition-colors"
          >
            <FaTrash size={12} className="text-gray-400 hover:text-red-500 transition-colors" />
          </button>
          {task.dueDate && (
            <span className="text-xs text-gray-400 px-2 py-1">
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      )}
    </div>
  );

  // Add Project Modal
  const AddProjectModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#191919] rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">New Project</h3>
        <input
          type="text"
          value={newProjectName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNewProjectName(e.target.value)}
          placeholder="Project name"
          className="w-full p-2 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          autoFocus
        />
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => setShowAddProjectModal(false)}
            className="px-4 py-2 text-gray-400 hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              if (!newProjectName.trim()) return;
              const newProject: Project = {
                id: Date.now(),
                name: newProjectName.trim(),
                isExpanded: true
              };
              const updatedProjects = [...projects, newProject];
              setProjects(updatedProjects);
              await LocalForage.setItem('projects', updatedProjects);
              setNewProjectName('');
              setShowAddProjectModal(false);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );

  // Add Task Modal
  const AddTaskModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#191919] rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">New Task</h3>
        <div className="space-y-4">
          <input
            type="text"
            value={newTask}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTask(e.target.value)}
            placeholder="Task name"
            className="w-full p-2 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
          <textarea
            value={newTaskDescription}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewTaskDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full p-2 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none h-24"
          />
          <input
            type="date"
            value={newTaskDueDate}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTaskDueDate(e.target.value)}
            className="w-full p-2 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => setShowAddTaskForm(false)}
            className="px-4 py-2 text-gray-400 hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              if (!selectedProject || !newTask.trim()) return;
              const newTaskItem: Task = {
                id: Date.now(),
                projectId: selectedProject.id,
                task: newTask.trim(),
                description: newTaskDescription.trim(),
                isComplete: false,
                dueDate: newTaskDueDate || null,
                stage: 'toDo',
                notes: '',
                lastEdited: new Date()
              };
              const updatedTasks = [...tasks, newTaskItem];
              setTasks(updatedTasks);
              await LocalForage.setItem('tasks', updatedTasks);
              setNewTask('');
              setNewTaskDescription('');
              setNewTaskDueDate('');
              setShowAddTaskForm(false);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#191919] text-gray-100">
      <Head>
        <title>Task Manager</title>
      </Head>

      {/* Notion-style sidebar */}
      <div className={`bg-[#191919] border-r border-gray-800 transition-all ${
        sidebarCollapsed ? 'w-16' : 'w-60'
      }`}>
        <div className="p-4">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full text-left text-sm font-medium hover:bg-gray-800 rounded p-2 transition-colors"
          >
            {sidebarCollapsed ? (
              <FaChevronRight size={16} />
            ) : (
              <div className="flex items-center gap-2">
                <span>Task Manager</span>
                <FaChevronLeft size={12} className="ml-auto" />
              </div>
            )}
          </button>

          {!sidebarCollapsed && (
            <>
              <SidebarSection title="Quick Access">
                <div className="space-y-1">
                  {['All Tasks', 'Today', 'Upcoming'].map((item) => (
                    <button
                      key={item}
                      className="w-full text-left text-sm text-gray-400 hover:bg-gray-800 rounded px-4 py-1"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </SidebarSection>

              <SidebarSection title="Projects">
                <div className="space-y-1">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className={`group flex items-center gap-2 px-4 py-1 rounded text-sm ${
                        selectedProject?.id === project.id
                          ? 'bg-gray-800 text-gray-100'
                          : 'text-gray-400 hover:bg-gray-800'
                      }`}
                      onClick={() => handleSelectProject(project)}
                    >
                      <span className="truncate">{project.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProjectId(project.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 ml-auto"
                      >
                        <FaEllipsisH size={12} className="text-gray-500 hover:text-gray-300" />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => setShowAddProjectModal(true)}
                    className="w-full text-left text-sm text-gray-400 hover:bg-gray-800 rounded px-4 py-1 flex items-center gap-2"
                  >
                    <FaPlus size={12} />
                    <span>Add Project</span>
                  </button>
                </div>
              </SidebarSection>
            </>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Breadcrumb />
        
        <div className="flex-1 overflow-hidden">
          <PanelGroup direction="horizontal">
            {/* Tasks list */}
            <Panel defaultSize={40} minSize={30}>
              <div className="h-full p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-medium">Tasks</h2>
                  <button
                    onClick={() => setShowAddTaskForm(true)}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded px-3 py-1"
                  >
                    <FaPlus size={12} />
                    <span>New</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {[
                    { stage: 'toDo' as const, title: "To Do", color: "border-red-500" },
                    { stage: 'inProgress' as const, title: "In Progress", color: "border-yellow-500" },
                    { stage: 'completed' as const, title: "Completed", color: "border-green-500" }
                  ].map(({ stage, title, color }) => (
                    <div
                      key={stage}
                      className={`bg-gray-800/50 rounded-lg p-4 border-t-2 ${color} 
                        ${dragOverStage === stage ? 'ring-2 ring-blue-500 ring-opacity-50 scale-[1.02]' : ''}
                        transition-all duration-200 ease-in-out
                        hover:bg-gray-800/70`}
                      onDragOver={(e) => handleDragOver(e, stage)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, stage)}
                    >
                      <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center justify-between">
                        <span>{title}</span>
                        <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">
                          {projectTasks.filter(task => task.stage === stage).length}
                        </span>
                      </h3>
                      <div className="task-list space-y-2 min-h-[50px] transition-all duration-300">
                        {dragOverStage === stage && draggedTask?.stage !== stage && (
                          <div 
                            className="h-[60px] bg-gray-700/50 rounded-lg border border-dashed border-gray-600 
                              transform transition-all duration-200 animate-pulse"
                            style={{
                              animation: 'pulseScale 1.5s ease-in-out infinite'
                            }}
                          />
                        )}
                        {projectTasks
                          .filter(task => task.stage === stage)
                          .map((task, index) => (
                            <div
                              key={task.id}
                              className="transform transition-transform duration-200"
                              style={{
                                transform: `translateY(${index * 2}px)`,
                                zIndex: projectTasks.length - index
                              }}
                            >
                              <TaskItem task={task} />
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>

            <ResizeHandle />

            {/* Task details */}
            <Panel defaultSize={60} minSize={30}>
              <div className="h-full p-4 overflow-y-auto">
                {selectedTask ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <h1 className="text-2xl font-medium flex-1">{selectedTask.task}</h1>
                      <button className="text-gray-400 hover:text-gray-200">
                        <FaEllipsisH size={16} />
                      </button>
                    </div>

                    <div className="prose prose-invert max-w-none">
                      <NotesEditor
                        initialContent={selectedTask.notes}
                        onChange={(content) => handleUpdateNotes(selectedTask.id, content)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    Select a task to view details
                  </div>
                )}
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </div>

      {showAddProjectModal && <AddProjectModal />}
      {showAddTaskForm && <AddTaskModal />}
    </div>
  );
};

export default Page;
