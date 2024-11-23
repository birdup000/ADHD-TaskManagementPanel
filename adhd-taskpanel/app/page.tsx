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
} from 'react-icons/fa';
import { useState, useEffect } from 'react';
import LocalForage from 'localforage';
import { FaArrowLeft, FaArrowRight, FaCheck } from 'react-icons/fa';

// Define Task interface
interface Task {
  id: number;
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
    if (!newTask.trim()) {
      console.error('Cannot add an empty task');
      return;
    }
    if (!selectedProject) {
      console.error('No project selected');
      return;
    }
    try {
      const taskId = Date.now(); // Generate a unique ID
      const newTaskData: Task = {
        id: taskId,
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
        task.id === taskId
       ? {...task, stage }
          : task
      );
      setTasks(updatedTasks);
      await LocalForage.setItem('tasks', updatedTasks);
    } catch (error) {
      console.error('Error moving task to stage:', error);
    }
  };

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
              onClick={() => handleSelectProject(project)}
              className={`mb-2 cursor-pointer ${
                selectedProject?.id === project.id? 'text-blue-500' : ''
              }`}
            >
              {project.name}
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
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between">
          <h1 className="text-xl font-bold">
            {selectedProject?.name || 'Task Dashboard'}
          </h1>
          <div className="flex items-center">
            <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
              New Task
            </button>
            <FaEllipsisH size={24} />
          </div>
        </div>
        {/* Content */}
        <div className="flex flex-1">
          {/* Task List */}
          <div className="w-2/3 p-4 bg-gray-800 rounded-xl shadow-md">
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
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className={`mb-2 p-4 flex justify-between items-center rounded-lg ${
                    task.isComplete
                   ? "bg-green-500 text-white"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                  onClick={() => handleSelectTask(task)}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={task.isComplete}
                      onChange={() => handleToggleTaskCompletion(task.id)}
                      className="mr-2"
                    />
                    <span
                      className={` ${
                        task.isComplete? "line-through" : ""
                      } text-lg`}
                    >
                      {task.task}
                    </span>
                  </div>
                  <FaTrash
                    size={16}
                    className="text-red-500 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTask(task.id);
                    }}
                    style={{ marginLeft: 'auto' }} // Added margin to push to the right
                  />
                </li>
              ))}
            </ul>
          </div>
          {/* Kanban Board */}
          <div className="flex-1 p-4 bg-gray-800 rounded-xl shadow-md mt-8">
            <h2 className="text-2xl font-bold mb-4 text-white">Kanban Board</h2>
            <div className="flex" style={{ height: 'calc(100vh - 250px)', overflowY: 'auto' }}>
              {[
                { stage: "toDo", title: "To Do", color: "bg-red-500" },
                { stage: "inProgress", title: "In Progress", color: "bg-yellow-500" },
                { stage: "completed", title: "Completed", color: "bg-green-500" },
              ].map((column) => (
                <div
                  key={column.stage}
                  className={`bg-gray-700 p-4 rounded-lg ${column.color} text-white`}
                  style={{ minWidth: '250px', flex: 1, marginRight: '16px' }}
                >
                  <h3 className="text-lg font-bold mb-2">{column.title}</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, overflowY: 'auto' }}>
                    {tasks
                     .filter((task) => task.stage === column.stage)
                     .map((task) => (
                        <li key={task.id} className="mb-2 p-4 flex justify-between items-center rounded-lg bg-gray-800 hover:bg-gray-600 relative" style={{ lineHeight: '1.5' }}>
                          <span className="text-lg" style={{ maxWidth: '60%', marginRight: '16px', display: 'inline-block', verticalAlign: 'middle' }}>{task.task}</span>
                          <div className="absolute right-4 top-4 flex space-x-2" style={{ top: '50%', transform: 'translateY(-50%)' }}>
                            {column.stage!== "toDo" && (
                              <button
                                onClick={() => handleMoveTaskToStage(task.id, "toDo")}
                                className="bg-gray-500 text-xs px-2 py-1 rounded text-sm hover:bg-gray-600"
                                title="Move to To Do"
                                style={{ lineHeight: '1.2', padding: '4px 8px' }}
                              >
                                <FaArrowLeft size={8} /> To Do <span className="hidden md:inline">To Do</span>
                              </button>
                            )}
                            {column.stage === "toDo" && (
                              <button
                                onClick={() => handleMoveTaskToStage(task.id, "inProgress")}
                                className="bg-yellow-500 text-xs px-2 py-1 rounded text-sm hover:bg-yellow-600"
                                title="Move to In Progress"
                                style={{ lineHeight: '1.2', padding: '4px 8px' }}
                              >
                                <FaArrowRight size={8} /> In Progress <span className="hidden md:inline">In Progress</span>
                              </button>
                            )}
                            {column.stage === "inProgress" && (
                              <>
                                <button
                                  onClick={() => handleMoveTaskToStage(task.id, "toDo")}
                                  className="bg-gray-500 text-xs px-2 py-1 rounded text-sm hover:bg-gray-600"
                                  title="Move to To Do"
                                  style={{ lineHeight: '1.2', padding: '4px 8px' }}
                                >
                                  <FaArrowLeft size={8} /> To Do <span className="hidden md:inline">To Do</span>
                                </button>
                                <button
                                  onClick={() => handleMoveTaskToStage(task.id, "completed")}
                                  className="bg-green-500 text-xs px-2 py-1 rounded text-sm hover:bg-green-600"
                                  title="Move to Completed"
                                  style={{ lineHeight: '1.2', padding: '4px 8px' }}
                                >
                                  <FaArrowRight size={8} /> Completed <span className="hidden md:inline">Completed</span>
                                </button>
                              </>
                            )}
                            {column.stage === "completed" && (
                              <button
                                onClick={() => handleMoveTaskToStage(task.id, "inProgress")}
                                className="bg-yellow-500 text-xs px-2 py-1 rounded text-sm hover:bg-yellow-600"
                                title="Move to In Progress"
                                style={{ lineHeight: '1.2', padding: '4px 8px' }}
                              >
                                <FaArrowLeft size={8} /> In Progress <span className="hidden md:inline">In Progress</span>
                              </button>
                            )}
                            <FaTrash
                              size={12}
                              className="text-red-500 cursor-pointer"
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
          {/* Task Details */}
          <div className="w-1/3 p-4 border-l border-gray-700">
            {selectedTask? (
              <>
                <h2 className="text-2xl font-bold mb-2">Task Details</h2>
                <p>
                  <span className="font-bold">Name:</span> {selectedTask.task}
                </p>
                <p>
                  <span className="font-bold">Description:</span>{' '}
                  {selectedTask.description}
                </p>
                <p>
                  <span className="font-bold">Due Date:</span>{' '}
                  {selectedTask.dueDate || 'None'}
                </p>
                <p>
                  <span className="font-bold">Status:</span>{' '}
                  {selectedTask.isComplete? 'Completed' : 'Pending'}
                </p>
              </>
            ) : (
              <p>Select a task to view its details</p>
            )}
          </div>
          {/* Automation Panel */}
          <div className="w-1/4 bg-gray-900 p-4 border-l border-gray-700">
            <h2 className="text-2xl font-bold mb-4">Automation</h2>
            <div className="mb-4">
              <label htmlFor="agent-selection" className="block text-sm font-bold mb-2">
                Select Agent:
              </label>
              <select
                id="agent-selection"
                className="w-full p-2 bg-gray-800 rounded text-white mb-4"
              >
                <option value="agent-1">Agent 1</option>
                <option value="agent-2">Agent 2</option>
                <option value="agent-3">Agent 3</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="automation-type" className="block text-sm font-bold mb-2">
                Select Automation Type:
              </label>
              <select
                id="automation-type"
                className="w-full p-2 bg-gray-800 rounded text-white mb-4"
              >
                <option value="run-chain">Run Chain</option>
                <option value="run-prompt">Run Prompt</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="automation-input" className="block text-sm font-bold mb-2">
                Input:
              </label>
              <textarea
                id="automation-input"
                rows={4}
                placeholder="Enter your prompt or chain..."
                className="w-full p-2 bg-gray-800 rounded text-white mb-4"
              ></textarea>
            </div>
            <button className="bg-blue-500 text-white px-4 py-2 rounded w-full">
              Execute
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;