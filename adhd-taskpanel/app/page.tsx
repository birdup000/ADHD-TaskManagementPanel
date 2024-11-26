"use client";

import type { NextPage } from 'next';
import Head from 'next/head';
import {
  FaHome,
  FaInbox,
  FaSearch,
  FaColumns,
  FaList,
  FaFileAlt,
  FaBook,
  FaPlus,
  FaCog,
  FaEllipsisH,
  FaTrash,
  FaEdit,
} from 'react-icons/fa';
import { useState, useEffect } from 'react';
import LocalForage from 'localforage';
import { FaArrowLeft, FaArrowRight, FaCheck } from 'react-icons/fa';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

// Define Task interface
interface Task {
  id: number;
  projectId: number; // Add this
  task: string;
  isComplete: boolean;
  description: string;
  dueDate: string | null; // Optional due date
  stage: 'toDo' | 'inProgress' | 'completed'; // Added stage property
}

// Define Project interface
interface Project {
  id: number;
  name: string;
}

// Define Credentials interface
interface Credentials {
  url: string;
  key: string;
}

const resizeHandleStyles = {
  padding: "0 4px",
  backgroundColor: "#1f2937", // gray-800
};

const ResizeHandle = () => (
  <PanelResizeHandle className="group flex items-center justify-center" style={{ width: '12px' }}>
    <div 
      className="w-1.5 h-16 rounded-full bg-gray-600 group-hover:bg-blue-500 group-active:bg-blue-600 cursor-col-resize transition-colors"
    >
      <div className="flex flex-col gap-1.5 h-full items-center justify-center">
        <div className="w-0.5 h-4 bg-gray-400 rounded group-hover:bg-blue-300" />
        <div className="w-0.5 h-4 bg-gray-400 rounded group-hover:bg-blue-300" />
      </div>
    </div>
  </PanelResizeHandle>
);

const Page: NextPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [useDatabase, setUseDatabase] = useState(false);
  const [dbCredentials, setDbCredentials] = useState<Credentials>({
    url: '',
    key: '',
  });
  const [newProjectName, setNewProjectName] = useState('');
  const [newTask, setNewTask] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const [draggedProject, setDraggedProject] = useState<Project | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);

  // Add task reorder handlers
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const handleTaskDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.currentTarget.classList.add('opacity-50');
  };

  const handleTaskDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
    setDraggedTask(null);
  };

  const handleTaskDragOver = (e: React.DragEvent, task: Task) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.id === task.id) return;
    
    const newTasks = [...tasks];
    const draggedIndex = tasks.findIndex(t => t.id === draggedTask.id);
    const dropIndex = tasks.findIndex(t => t.id === task.id);
    
    // Only allow vertical movement (adjacent positions)
    if (Math.abs(draggedIndex - dropIndex) !== 1) return;
    
    newTasks.splice(draggedIndex, 1);
    newTasks.splice(dropIndex, 0, draggedTask);
    
    setTasks(newTasks);
    LocalForage.setItem('tasks', newTasks);
  };

  useEffect(() => {
    LocalForage.config({
      driver: [
        LocalForage.INDEXEDDB, // Primary driver
        LocalForage.LOCALSTORAGE, // Fallback driver
      ],
      name: 'tasks-db',
      version: 1.0,
      size: 4980736,
      storeName: 'tasks',
    });
    LocalForage.ready()
   .then(() => console.log('LocalForage is ready'))
   .catch((error) => console.error('Error initializing LocalForage:', error));
  }, []);

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

  const handleAddProject = async () => {
    if (!newProjectName.trim()) {
      console.error('Project name cannot be empty');
      return;
    }
    try {
      const projectId = Date.now(); // Generate a unique ID
      const newProject = { id: projectId, name: newProjectName.trim() };
      const updatedProjects = [...projects, newProject];
      setProjects(updatedProjects);
      await LocalForage.setItem('projects', updatedProjects);
      setNewProjectName('');
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setSelectedTask(null); // Clear selected task when switching projects
  };

  const handleAddTask = async () => {
    if (!newTask.trim() || !selectedProject) {
      console.error('Cannot add task: missing name or project');
      return;
    }
    try {
      const taskId = Date.now(); // Generate a unique ID
      const newTaskData: Task = {
        id: taskId,
        projectId: selectedProject.id, // Add project ID
        task: newTask.trim(),
        description: newTaskDescription.trim(),
        isComplete: false,
        dueDate: newTaskDueDate || null,
        stage: 'toDo', // Default stage is 'toDo'
      };
      const updatedTasks = [...tasks, newTaskData];
      setTasks(updatedTasks);
      await LocalForage.setItem('tasks', updatedTasks);
      setNewTask('');
      setNewTaskDescription('');
      setNewTaskDueDate('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleToggleTaskCompletion = async (taskId: number) => {
    try {
      const updatedTasks = tasks.map((task) =>
        task.id === taskId
       ? {...task, isComplete:!task.isComplete }
          : task
      );
      setTasks(updatedTasks);
      await LocalForage.setItem('tasks', updatedTasks);
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const handleRemoveTask = async (taskId: number) => {
    try {
      const updatedTasks = tasks.filter((task) => task.id!== taskId);
      setTasks(updatedTasks);
      await LocalForage.setItem('tasks', updatedTasks);
    } catch (error) {
      console.error('Error removing task:', error);
    }
  };

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
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

  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData('taskId', taskId.toString());
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent, targetStage: 'toDo' | 'inProgress' | 'completed') => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('taskId'));
    if (!isNaN(taskId)) {
      handleMoveTaskToStage(taskId, targetStage);
    }
  };

  const handleUpdateTaskStage = async (taskId: number, newStage: 'toDo' | 'inProgress' | 'completed') => {
    try {
      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, stage: newStage } : task
      );
      setTasks(updatedTasks);
      await LocalForage.setItem('tasks', updatedTasks);
    } catch (error) {
      console.error('Error updating task stage:', error);
    }
  };

  const handleProjectDragStart = (e: React.DragEvent, project: Project) => {
    setDraggedProject(project);
    e.currentTarget.classList.add('opacity-50');
  };
  
  const handleProjectDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
    setDraggedProject(null);
  };
  
  const handleProjectDragOver = (e: React.DragEvent, project: Project) => {
    e.preventDefault();
    if (!draggedProject || draggedProject.id === project.id) return;
    
    const newProjects = [...projects];
    const draggedIndex = projects.findIndex(p => p.id === draggedProject.id);
    const dropIndex = projects.findIndex(p => p.id === project.id);
    
    newProjects.splice(draggedIndex, 1);
    newProjects.splice(dropIndex, 0, draggedProject);
    
    setProjects(newProjects);
    LocalForage.setItem('projects', newProjects);
  };
  
  const handleProjectRename = async (projectId: number, newName: string) => {
    if (!newName.trim()) return;
    
    const updatedProjects = projects.map(project => 
      project.id === projectId ? { ...project, name: newName.trim() } : project
    );
    
    setProjects(updatedProjects);
    await LocalForage.setItem('projects', updatedProjects);
    setEditingProjectId(null);
  };

  // Filter tasks by project in render
  const projectTasks = tasks.filter(task => 
    selectedProject && task.projectId === selectedProject.id
  );

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Head>
        <title>Enhanced Task Manager</title>
      </Head>
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-900 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold">Task Manager</h1>
          <FaCog size={24} onClick={() => setShowSettingsModal(true)} />
        </div>
        <ul className="mb-4">
          <li className="flex items-center mb-2">
            <FaHome size={20} className="mr-2" /> Home
          </li>
          <li className="flex items-center mb-2">
            <FaInbox size={20} className="mr-2" /> Inbox
          </li>
          <li className="flex items-center mb-2">
            <FaSearch size={20} className="mr-2" /> Insights
          </li>
          <li className="flex items-center mb-2">
            <FaColumns size={20} className="mr-2" /> Kanban View
          </li>
          <li className="flex items-center mb-2">
            <FaList size={20} className="mr-2" /> Task List
          </li>
        </ul>
        <h2 className="text-sm font-bold mb-2">Projects</h2>
        <ul>
          {projects.map((project: Project) => (
            <li
              key={project.id}
              draggable="true"
              onDragStart={(e) => handleProjectDragStart(e, project)}
              onDragEnd={handleProjectDragEnd}
              onDragOver={(e) => handleProjectDragOver(e, project)}
              className={`mb-2 flex items-center justify-between p-2 rounded cursor-move 
                ${selectedProject?.id === project.id ? 'bg-gray-700' : 'hover:bg-gray-800'}
                transition-colors duration-200`}
            >
              <div className="flex items-center gap-2 flex-1">
                {editingProjectId === project.id ? (
                  <input
                    type="text"
                    defaultValue={project.name}
                    className="bg-gray-700 px-2 py-1 rounded text-white w-full"
                    onBlur={(e) => handleProjectRename(project.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleProjectRename(project.id, e.currentTarget.value);
                      } else if (e.key === 'Escape') {
                        setEditingProjectId(null);
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <>
                    <span 
                      onClick={() => handleSelectProject(project)}
                      className="flex-1"
                    >
                      {project.name}
                    </span>
                    <button
                      onClick={() => setEditingProjectId(project.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white"
                    >
                      <FaEdit size={14} />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
          <li className="flex items-center mb-2">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded text-white"
              placeholder="New Project"
            />
            <button
              onClick={handleAddProject}
              className="bg-blue-500 px-2 py-1 rounded ml-2"
            >
              Add
            </button>
          </li>
        </ul>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header - Remove border-b and adjust styling */}
        <div className="p-4 flex justify-between">
          <h1 className="text-xl font-bold text-gray-200">
            {selectedProject?.name || 'Task Dashboard'}
          </h1>
          <div className="flex items-center">
            <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600 transition-colors">
              New Task
            </button>
            <FaEllipsisH size={24} className="text-gray-400 hover:text-gray-300 cursor-pointer" />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1">
          <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
            {/* Task List */}
            <Panel defaultSize={25} minSize={20} className="overflow-hidden">
              <div className="h-full p-4 bg-gray-800 rounded-xl shadow-md overflow-auto">
                <h2 className="text-2xl font-bold mb-4 text-white">Tasks</h2>
                <div className="flex items-center mb-4">
                  <input
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Task Name"
                    className="flex-1 p-2 bg-gray-700 rounded text-white mr-2"
                  />
                  <input
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    placeholder="Description"
                    className="flex-1 p-2 bg-gray-700 rounded text-white mr-2"
                  />
                  <button
                    onClick={handleAddTask}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                    style={{ minWidth: '100px' }} // Added minimum width for better visibility
                  >
                    Add Task
                  </button>
                </div>
                <ul>
                  {projectTasks.map((task) => (
                    <li 
                      key={task.id} 
                      className="mb-2 p-3 flex flex-col gap-2 rounded-lg bg-gray-800 hover:bg-gray-600 cursor-move"
                      draggable="true"
                      onDragStart={(e) => handleTaskDragStart(e, task)}
                      onDragEnd={handleTaskDragEnd}
                      onDragOver={(e) => handleTaskDragOver(e, task)}
                      onClick={() => setSelectedTask(task)} // Add click handler
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={task.isComplete}
                          onChange={() => handleToggleTaskCompletion(task.id)}
                          className="mr-2"
                          onClick={(e) => e.stopPropagation()} // Prevent task selection on checkbox click
                        />
                        <span className={task.isComplete ? "line-through" : ""}>
                          {task.task}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Panel>

            <ResizeHandle />

            {/* Kanban Board */}
            <Panel defaultSize={50} minSize={30} className="overflow-hidden">
              <div className="h-full p-4 bg-gray-800 rounded-xl shadow-md overflow-auto">
                <h2 className="text-2xl font-bold mb-4 text-white">Kanban Board</h2>
                <div className="flex" style={{ height: 'calc(100vh - 250px)', overflowY: 'auto' }}>
                  {[
                    { stage: "toDo" as 'toDo', title: "To Do", color: "bg-red-500" },
                      { stage: "inProgress" as 'inProgress', title: "In Progress", color: "bg-yellow-500" },
                      { stage: "completed" as 'completed', title: "Completed", color: "bg-green-500" },
                  ].map((column) => (
                    <div
                      key={column.stage}
                      className={`bg-gray-700 p-4 rounded-lg ${column.color} text-white transition-colors duration-200`}
                      style={{ minWidth: '250px', flex: 1, marginRight: '16px' }}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, column.stage)}
                    >
                      <h3 className="text-lg font-bold mb-2">{column.title}</h3>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, overflowY: 'auto' }}>
                        {projectTasks  // Change from tasks to projectTasks
                         .filter((task) => task.stage === column.stage)
                         .map((task) => (
                            <li 
                              key={task.id} 
                              className="mb-2 p-3 flex flex-col gap-2 rounded-lg bg-gray-800 hover:bg-gray-600 cursor-move"
                              draggable="true"
                              onDragStart={(e) => handleDragStart(e, task.id)}
                            >
                              {/* Task Content */}
                              <span className="text-lg break-words">{task.task}</span>
                              
                              {/* Action Buttons */}
                              <div className="flex items-center gap-2">
                                {column.stage === "inProgress" && (
                                  <button
                                    onClick={() => handleMoveTaskToStage(task.id, "toDo")}
                                    className="bg-gray-500 text-xs px-2 py-1 rounded hover:bg-gray-600"
                                    title="Move to To Do"
                                  >
                                    <FaArrowLeft size={8} className="inline mr-1" /> To Do
                                  </button>
                                )}
                                
                                {column.stage === "toDo" && (
                                  <button
                                    onClick={() => handleMoveTaskToStage(task.id, "inProgress")}
                                    className="bg-yellow-500 text-xs px-2 py-1 rounded hover:bg-yellow-600"
                                    title="Move to In Progress"
                                  >
                                    <FaArrowRight size={8} className="inline mr-1" /> In Progress
                                  </button>
                                )}
                                
                                {column.stage === "completed" && (
                                  <button
                                    onClick={() => handleMoveTaskToStage(task.id, "inProgress")}
                                    className="bg-yellow-500 text-xs px-2 py-1 rounded hover:bg-yellow-600"
                                    title="Move to In Progress"
                                  >
                                    <FaArrowLeft size={8} className="inline mr-1" /> In Progress
                                  </button>
                                )}
                                
                                {column.stage === "inProgress" && (
                                  <button
                                    onClick={() => handleMoveTaskToStage(task.id, "completed")}
                                    className="bg-green-500 text-xs px-2 py-1 rounded hover:bg-green-600"
                                    title="Move to Completed"
                                  >
                                    <FaArrowRight size={8} className="inline mr-1" /> Completed
                                  </button>
                                )}
                                
                                <FaTrash
                                  size={12}
                                  className="text-red-500 cursor-pointer ml-auto"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveTask(task.id);
                                  }}
                                  title="Delete Task"
                                />
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>

            <ResizeHandle />

            {/* Task Details */}
            <Panel defaultSize={25} minSize={20} className="overflow-hidden">
              <div className="h-full p-4 bg-gray-800 rounded-xl shadow-md border-l border-gray-700 overflow-auto">
                {selectedTask ? (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold mb-4">Task Details</h2>
                    <p><span className="font-bold">Name:</span> {selectedTask.task}</p>
                    <p><span className="font-bold">Description:</span> {selectedTask.description}</p>
                    <p><span className="font-bold">Status:</span> {selectedTask.stage}</p>
                    <p><span className="font-bold">Due Date:</span> {selectedTask.dueDate || 'Not set'}</p>
                    
                    {/* Add status update buttons if needed */}
                  </div>
                ) : (
                  <p className="text-gray-400">Select a task to view details</p>
                )}
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </div>
  );
};

export default Page;