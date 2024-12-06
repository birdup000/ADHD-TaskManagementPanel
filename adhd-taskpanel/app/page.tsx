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
import React, { useState, useEffect, useRef } from 'react';
import LocalForage from 'localforage';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";


const NotesEditor = dynamic(() => import('./components/NotesEditor'), { ssr: false });
const ProjectNotesEditor = dynamic(() => import('./components/ProjectNotesEditor'), { ssr: false });
const AddProjectModal = dynamic(() => import('./components/AddProjectModal'), { ssr: false });
const AddTaskModal = dynamic(() => import('./components/AddTaskModal'), { ssr: false });
const TaskItem = dynamic(() => import('./components/TaskItem'), { ssr: false });
const Breadcrumb = dynamic(() => import('./components/Breadcrumb'), { ssr: false });
const Sidebar = dynamic(() => import('./components/Sidebar'), { ssr: false });

const ResizeHandle = () => (
  <PanelResizeHandle className="w-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" />
);

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

import type { Task, Project } from './types';

// Global styles
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

const Page: NextPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Load tasks and projects from LocalForage
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedTasks = await LocalForage.getItem('tasks');
        const savedProjects = await LocalForage.getItem('projects');
        if (savedTasks) setTasks(savedTasks as Task[]);
        if (savedProjects) setProjects(savedProjects as Project[]);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hoveredTaskId, setHoveredTaskId] = useState<number | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverStage, setDragOverStage] = useState<'toDo' | 'inProgress' | 'completed' | null>(null);
  const projectTasks = tasks.filter(task => selectedProject && task.projectId === selectedProject.id);

  const handleDragOver = (e: DragEvent<HTMLDivElement>, stage: 'toDo' | 'inProgress' | 'completed') => {
    e.preventDefault();
    setDragOverStage(stage);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>, stage: 'toDo' | 'inProgress' | 'completed') => {
    e.preventDefault();
    setDragOverStage(null);
    if (draggedTask && draggedTask.stage !== stage) {
      const updatedTasks = tasks.map(t =>
        t.id === draggedTask.id ? { ...t, stage } : t
      ) as Task[];
      setTasks(updatedTasks);
      try {
        await LocalForage.setItem('tasks', updatedTasks);
      } catch (error) {
        console.error('Error saving tasks:', error);
      }
    }
  };

  const handleUpdateNotes = async (taskId: number, content: string) => {
    const updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, notes: content, lastEdited: new Date() } : t
    ) as Task[];
    setTasks(updatedTasks);
    try {
      await LocalForage.setItem('tasks', updatedTasks);
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
  };

  const handleProjectNotesChange = async (content: string) => {
    if (selectedProject) {
      const updatedProjects = projects.map(p =>
        p.id === selectedProject.id ? { ...p, notes: content } : p
      ) as Project[];
      setProjects(updatedProjects);
      try {
        await LocalForage.setItem('projects', updatedProjects);
      } catch (error) {
        console.error('Error saving projects:', error);
      }
    }
  };

  return (
    <div className="flex h-screen bg-white text-gray-900 dark:bg-[#191919] dark:text-gray-100">
      <Head>
        <title>Task Manager</title>
      </Head>

      {/* Sidebar */}
      <Sidebar
        projects={projects}
        selectedProject={selectedProject}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        onProjectSelect={setSelectedProject}
        onAddProject={() => setShowAddProjectModal(true)}
        onDeleteProject={(project) => {
          setProjects(projects.filter(p => p.id !== project.id));
          if (selectedProject?.id === project.id) setSelectedProject(null);
        }}
        onEditProject={async (project) => {
          const updatedProject = { ...project, name: newProjectName };
          const updatedProjects = projects.map(p => 
            p.id === project.id ? updatedProject : p
          );
          setProjects(updatedProjects);
          try {
            await LocalForage.setItem('projects', updatedProjects);
          } catch (error) {
            console.error('Error saving projects:', error);
          }
          setEditingProjectId(null);
        }}
        onProjectExpandToggle={(project) => {
          setProjects(projects.map(p =>
            p.id === project.id ? { ...p, isExpanded: !p.isExpanded } : p
          ));
        }}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Breadcrumb items={selectedProject ? [{ label: selectedProject.name }] : []} />
        <div className="flex-1 overflow-hidden">
          <PanelGroup direction="horizontal">
            {/* Tasks list */}
            <Panel defaultSize={40} minSize={30}>
              <div className="h-full p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Tasks</h2>
                  <button
                    onClick={() => setShowAddTaskForm(true)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors duration-200"
                  >
                    <FaPlus size={12} className="text-blue-100" />
                    <span>Add Task</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {[
                    { stage: 'toDo' as const, title: "To Do", color: "border-red-500", icon: "🎯" },
                    { stage: 'inProgress' as const, title: "In Progress", color: "border-yellow-500", icon: "⚡" },
                    { stage: 'completed' as const, title: "Completed", color: "border-green-500", icon: "✨" }
                  ].map(({ stage, title, color, icon }) => (
                    <div
                      key={stage}
                      className={`bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4
                        ${dragOverStage === stage ? 'ring-2 ring-blue-500 ring-opacity-50 scale-[1.02]' : ''}
                        transition-all duration-200 ease-in-out
                        hover:shadow-lg dark:shadow-none
                        border-t-4 ${color}`}
                      role="region"
                      aria-label={`${title} tasks`}
                      onDragOver={(e) => handleDragOver(e, stage)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, stage)}
                    >
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-200 mb-4 flex items-center gap-2">
                        <span>{icon}</span>
                        <span>{title}</span>
                        <span className="ml-auto text-sm bg-gray-200/70 dark:bg-gray-700/70 px-2.5 py-0.5 rounded-full text-gray-600 dark:text-gray-400">
                          {projectTasks.filter(task => task.stage === stage).length}
                        </span>
                      </h3>
                      <div className="task-list space-y-3 min-h-[50px] transition-all duration-200" role="list">
                        {dragOverStage === stage && draggedTask?.stage !== stage && (
                          <div 
                            className="h-[60px] bg-gray-100 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600 transform transition-all duration-200 animate-pulse"
                            style={{
                              animation: 'pulseScale 1.5s ease-in-out infinite'
                            }}
                          />
                        )}
                        {projectTasks
                          .filter(task => task.stage === stage)
                          .map((task, index) => (
                            <TaskItem
                              key={task.id}
                              task={task}
                              onDragStart={setDraggedTask}
                              onDragEnd={() => setDraggedTask(null)}
                              onDelete={async (task) => {
                                const updatedTasks = tasks.filter(t => t.id !== task.id);
                                setTasks(updatedTasks);
                                if (selectedTask?.id === task.id) setSelectedTask(null);
                                try {
                                  await LocalForage.setItem('tasks', updatedTasks);
                                } catch (error) {
                                  console.error('Error saving tasks:', error);
                                }
                              }}
                              onEdit={(task) => {
                                setSelectedTask(task);
                              }}
                              onToggleComplete={async (task) => {
                                const updatedTasks = tasks.map(t =>
                                  t.id === task.id 
                                    ? { ...t, isComplete: !t.isComplete }
                                    : t
                                );
                                setTasks(updatedTasks);
                                try {
                                  await LocalForage.setItem('tasks', updatedTasks);
                                } catch (error) {
                                  console.error('Error saving tasks:', error);
                                }
                              }}
                            />
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>

            <ResizeHandle />

            {/* Task details panel */}
            <Panel defaultSize={60} minSize={30}>
              <div className="h-full p-4 overflow-y-auto">
                {selectedTask ? (
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <h1 className="text-3xl font-bold flex-1 text-gray-900 dark:text-gray-100">{selectedTask?.task}</h1>
                      <button className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
                        <FaEllipsisH size={14} />
                      </button>
                    </div>
                    <div className="prose dark:prose-invert max-w-none">
                      <NotesEditor
                        className="p-4 bg-gray-50/5 rounded-lg border border-gray-200 dark:border-gray-700/30 shadow-sm"
                        initialContent={selectedTask?.notes || ''}
                        onChange={(content) => selectedTask && handleUpdateNotes(selectedTask.id, content)}
                      />
                    </div>
                  </div>
                ) : selectedProject ? (
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <h1 className="text-3xl font-bold flex-1 text-gray-900 dark:text-gray-100">{selectedProject?.name}</h1>
                      <button className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
                        <FaEllipsisH size={14} />
                      </button>
                    </div>
                    <div className="prose dark:prose-invert max-w-none">
                      {selectedProject && (
                        <ProjectNotesEditor
                          project={selectedProject as Project}
                          tasks={tasks.filter(t => selectedProject && t.projectId === selectedProject.id)}
                          onProjectNotesChange={handleProjectNotesChange}
                          onTaskNotesChange={handleUpdateNotes}
                          onTaskSelect={(taskId: number) => {
                            const task = tasks.find(t => t.id === taskId) as Task | undefined;
                            if (task) handleSelectTask(task);
                          }}
                          permissions={{
                            canEditProjectNotes: selectedProject?.permissions?.canEditProjectNotes ?? true,
                            canEditTaskNotes: selectedProject?.permissions?.canEditTaskNotes ?? true,
                            canViewTaskNotes: selectedProject?.permissions?.canViewTaskNotes ?? true
                          }}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    Select a project or task to view details
                  </div>
                )}
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </div>

      {showAddProjectModal && (
        <AddProjectModal 
          onClose={() => setShowAddProjectModal(false)}
          onAdd={async (name) => {
            const newProject: Project = {
              id: Date.now(),
              name,
              isExpanded: false,
            };
            const updatedProjects = [...projects, newProject] as Project[];
            setProjects(updatedProjects);
            try {
              await LocalForage.setItem('projects', updatedProjects);
            } catch (error) {
              console.error('Error saving projects:', error);
            }
            setShowAddProjectModal(false);
          }}
        />
      )}
      {showAddTaskForm && (
        <AddTaskModal 
          onClose={() => setShowAddTaskForm(false)}
          onAdd={async (taskData) => {
            const newTask: Task = {
              id: Date.now(),
              projectId: selectedProject?.id || 0,
              ...taskData,
              isComplete: false,
              notes: ''
            };
            const updatedTasks = [...tasks, newTask] as Task[];
            setTasks(updatedTasks);
            try {
              await LocalForage.setItem('tasks', updatedTasks);
            } catch (error) {
              console.error('Error saving tasks:', error);
            }
            setShowAddTaskForm(false);
          }}
        />
      )}
    </div>
  );
};

export default Page;