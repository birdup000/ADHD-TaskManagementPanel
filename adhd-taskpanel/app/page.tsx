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
import { useRef } from 'react';


// Define Task interface
interface Task {
  id: number;
  projectId: number; // Add this
  task: string;
  isComplete: boolean;
  description: string;
  dueDate: string | null; // Optional due date
  stage: 'toDo' | 'inProgress' | 'completed'; // Added stage property
  notes: string;
  lastEdited?: Date;
};

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

// Add to Settings interface
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

// Types for document structure
interface NotesDocument {
  id: string;
  title: string;
  content: string;
  parent?: string;
  children: string[];
  createdAt: Date;
  updatedAt: Date;
  icon?: string;
}

// Removed unused resizeHandleStyles

const ResizeHandle: React.FC = () => (
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

interface NotesPanelProps {
  task: Task | null;
  onUpdate: (notes: string) => void;
}

// Types
interface TextSelection {
  start: number;
  end: number;
}

interface EditorState {
  content: string;
  selection: TextSelection | null;
}

// Custom Editor Component
const RichEditor: React.FC<{
  value: string;
  onChange: (content: string) => void;
}> = ({ value, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<EditorState>({
    content: value,
    selection: null
  });

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const Toolbar = () => (
    <div className="flex gap-2 p-2 border-b border-gray-700">
      <button onClick={() => execCommand('bold')} className="p-1 hover:bg-gray-700 rounded">
        <strong>B</strong>
      </button>
      <button onClick={() => execCommand('italic')} className="p-1 hover:bg-gray-700 rounded">
        <em>I</em>
      </button>
      <button onClick={() => execCommand('underline')} className="p-1 hover:bg-gray-700 rounded">
        <u>U</u>
      </button>
      <div className="w-px bg-gray-700" />
      <button onClick={() => execCommand('insertOrderedList')} className="p-1 hover:bg-gray-700 rounded">
        1.
      </button>
      <button onClick={() => execCommand('insertUnorderedList')} className="p-1 hover:bg-gray-700 rounded">
        •
      </button>
    </div>
  );

  return (
    <div className="flex flex-col border border-gray-700 rounded">
      <Toolbar />
      <div
        ref={editorRef}
        contentEditable
        className="flex-1 p-4 focus:outline-none prose prose-invert max-w-none"
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
};

// Modified NotesPanel component
const NotesPanel: React.FC<NotesPanelProps> = ({ task, onUpdate }) => {
  const [documents, setDocuments] = useState<NotesDocument[]>([]);
  const [activeDocument, setActiveDocument] = useState<NotesDocument | null>(null);
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');

  const createNewDocument = () => {
    const newDoc: NotesDocument = {
      id: Date.now().toString(),
      title: 'Untitled',
      content: '',
      children: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setDocuments(prev => [...prev, newDoc]);
    setActiveDocument(newDoc);
  };

  const updateDocument = (content: string) => {
    if (activeDocument) {
      const updatedDoc = {
        ...activeDocument,
        content,
        updatedAt: new Date()
      };
      setDocuments(prev => 
        prev.map(doc => doc.id === activeDocument.id ? updatedDoc : doc)
      );
      setActiveDocument(updatedDoc);
    }
  };

  return (
    <div className="h-full flex bg-gray-800">
      {/* Document tree */}
      <div className="w-64 border-r border-gray-700 p-4">
        <DocumentTree 
          documents={documents}
          activeDoc={activeDocument?.id || null}
          onSelect={id => setActiveDocument(documents.find(d => d.id === id) || null)}
        />
      </div>

      {/* Editor */}
      <div className="flex-1">
        {activeDocument ? (
          <RichEditor
            value={activeDocument.content}
            onChange={updateDocument}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a document to start editing
          </div>
        )}
      </div>
    </div>
  );
};

// Document tree component
const DocumentTree: React.FC<{
  documents: NotesDocument[];
  activeDoc: string | null;
  onSelect: (id: string) => void;
}> = ({ documents, activeDoc, onSelect }) => {
  const rootDocs = documents.filter(d => !d.parent);
  
  return (
    <div className="space-y-1">
      {rootDocs.map(doc => (
        <DocumentNode 
          key={doc.id}
          document={doc}
          documents={documents}
          level={0}
          activeDoc={activeDoc}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

// Individual document node component
const DocumentNode: React.FC<{
  document: NotesDocument;
  documents: NotesDocument[];
  level: number;
  activeDoc: string | null;
  onSelect: (id: string) => void;
}> = ({ document, documents, level, activeDoc, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const children = documents.filter(d => d.parent === document.id);
  
  return (
    <div>
      <div 
        className={`
          flex items-center px-2 py-1 rounded cursor-pointer
          ${activeDoc === document.id ? 'bg-gray-700' : 'hover:bg-gray-700'}
        `}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(document.id)}
      >
        {children.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="mr-1"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
        {document.icon && <span className="mr-2">{document.icon}</span>}
        <span className="truncate">{document.title || 'Untitled'}</span>
      </div>
      
      {isExpanded && children.length > 0 && (
        <div>
          {children.map(child => (
            <DocumentNode
              key={child.id}
              document={child}
              documents={documents}
              level={level + 1}
              activeDoc={activeDoc}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SettingsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onUpdate: (newSettings: Settings) => void;
}> = ({ isOpen, onClose, settings, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [tempSettings, setTempSettings] = useState(settings);

  const handleSave = async () => {
    onUpdate(tempSettings);
    await LocalForage.setItem('settings', tempSettings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg w-full max-w-3xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FaEllipsisH size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-48 border-r border-gray-700 p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('general')}
                className={`w-full text-left px-4 py-2 rounded ${
                  activeTab === 'general' ? 'bg-blue-500' : 'hover:bg-gray-700'
                }`}
              >
                General
              </button>
              <button
                onClick={() => setActiveTab('appearance')}
                className={`w-full text-left px-4 py-2 rounded ${
                  activeTab === 'appearance' ? 'bg-blue-500' : 'hover:bg-gray-700'
                }`}
              >
                Appearance
              </button>
              <button
                onClick={() => setActiveTab('database')}
                className={`w-full text-left px-4 py-2 rounded ${
                  activeTab === 'database' ? 'bg-blue-500' : 'hover:bg-gray-700'
                }`}
              >
                Database
              </button>
              <button
                onClick={() => setActiveTab('shortcuts')}
                className={`w-full text-left px-4 py-2 rounded ${
                  activeTab === 'shortcuts' ? 'bg-blue-500' : 'hover:bg-gray-700'
                }`}
              >
                Shortcuts
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`w-full text-left px-4 py-2 rounded ${
                  activeTab === 'about' ? 'bg-blue-500' : 'hover:bg-gray-700'
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab('agixt')}
                className={`w-full text-left px-4 py-2 rounded ${
                  activeTab === 'agixt' ? 'bg-blue-500' : 'hover:bg-gray-700'
                }`}
              >
                AGiXT
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Layout</h3>
                  <div className="space-y-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={tempSettings.useWindowMode}
                        onChange={(e) => setTempSettings(prev => ({
                          ...prev,
                          useWindowMode: e.target.checked
                        }))}
                        className="rounded border-gray-600"
                      />
                      <span>Enable Window Mode</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={tempSettings.showCompletedTasks}
                        onChange={(e) => setTempSettings(prev => ({
                          ...prev,
                          showCompletedTasks: e.target.checked
                        }))}
                        className="rounded border-gray-600"
                      />
                      <span>Show Completed Tasks</span>
                    </label>
                    <div>
                      <p className="mb-2">Default View</p>
                      <select
                        value={tempSettings.defaultView}
                        onChange={(e) => setTempSettings(prev => ({
                          ...prev,
                          defaultView: e.target.value as 'list' | 'kanban'
                        }))}
                        className="bg-gray-700 rounded p-2 w-full"
                      >
                        <option value="list">List View</option>
                        <option value="kanban">Kanban View</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Theme</h3>
                  <select
                    value={tempSettings.theme}
                    onChange={(e) => setTempSettings(prev => ({
                      ...prev,
                      theme: e.target.value as 'dark' | 'darker' | 'system'
                    }))}
                    className="bg-gray-700 rounded p-2 w-full"
                  >
                    <option value="dark">Dark</option>
                    <option value="darker">Darker</option>
                    <option value="system">System</option>
                  </select>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Accent Color</h3>
                  <div className="flex gap-2">
                    {['blue', 'green', 'purple', 'red', 'yellow'].map(color => (
                      <button
                        key={color}
                        onClick={() => setTempSettings(prev => ({
                          ...prev,
                          accentColor: color
                        }))}
                        className={`w-8 h-8 rounded-full bg-${color}-500 
                          ${tempSettings.accentColor === color ? 'ring-2 ring-white' : ''}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'database' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Database Configuration</h3>
                  <div className="space-y-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={tempSettings.database.enabled}
                        onChange={(e) => setTempSettings(prev => ({
                          ...prev,
                          database: {
                            ...prev.database,
                            enabled: e.target.checked
                          }
                        }))}
                        className="rounded border-gray-600"
                      />
                      <span>Enable Database Sync</span>
                    </label>
                    <input
                      type="text"
                      value={tempSettings.database.url}
                      onChange={(e) => setTempSettings(prev => ({
                        ...prev,
                        database: {
                          ...prev.database,
                          url: e.target.value
                        }
                      }))}
                      placeholder="Database URL"
                      className="w-full p-2 bg-gray-700 rounded"
                    />
                    <input
                      type="password"
                      value={tempSettings.database.key}
                      onChange={(e) => setTempSettings(prev => ({
                        ...prev,
                        database: {
                          ...prev.database,
                          key: e.target.value
                        }
                      }))}
                      placeholder="API Key"
                      className="w-full p-2 bg-gray-700 rounded"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shortcuts' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Keyboard Shortcuts</h3>
                <div className="space-y-4">
                  {[
                    { desc: 'New Task', keys: ['Ctrl', 'N'] },
                    { desc: 'Save Changes', keys: ['Ctrl', 'S'] },
                    { desc: 'Toggle Window Mode', keys: ['Ctrl', 'W'] },
                    { desc: 'Focus Search', keys: ['Ctrl', 'K'] },
                    { desc: 'Toggle Sidebar', keys: ['Ctrl', 'B'] },
                  ].map(shortcut => (
                    <div key={shortcut.desc} className="flex justify-between items-center">
                      <span>{shortcut.desc}</span>
                      <div className="flex gap-2">
                        {shortcut.keys.map(key => (
                          <kbd key={key} className="px-2 py-1 bg-gray-700 rounded">
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">About ADHD Task Panel</h3>
                <p className="text-gray-400">Made with ❤️ by Birdup000</p>
              </div>
            )}

            {activeTab === 'agixt' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">AGiXT Configuration</h3>
                  <div className="space-y-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={tempSettings.agixt.enabled}
                        onChange={(e) => setTempSettings(prev => ({
                          ...prev,
                          agixt: {
                            ...prev.agixt,
                            enabled: e.target.checked
                          }
                        }))}
                        className="rounded border-gray-600"
                      />
                      <span>Enable AGiXT Integration</span>
                    </label>
                    
                    <div>
                      <label className="block text-sm mb-2">AGiXT API URI</label>
                      <input
                        type="text"
                        value={tempSettings.agixt.uri}
                        onChange={(e) => setTempSettings(prev => ({
                          ...prev,
                          agixt: {
                            ...prev.agixt,
                            uri: e.target.value
                          }
                        }))}
                        className="w-full p-2 bg-gray-700 rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-2">API Key</label>
                      <input
                        type="password"
                        value={tempSettings.agixt.apiKey}
                        onChange={(e) => setTempSettings(prev => ({
                          ...prev,
                          agixt: {
                            ...prev.agixt,
                            apiKey: e.target.value
                          }
                        }))}
                        className="w-full p-2 bg-gray-700 rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-2">Default Agent</label>
                      <input
                        type="text"
                        value={tempSettings.agixt.defaultAgent}
                        onChange={(e) => setTempSettings(prev => ({
                          ...prev,
                          agixt: {
                            ...prev.agixt,
                            defaultAgent: e.target.value
                          }
                        }))}
                        className="w-full p-2 bg-gray-700 rounded"
                      />
                    </div>

                    <button
                      onClick={async () => {
                        const success = await (async function updateAGiXTConfig(uri: string, apiKey: string) {
                          // Add your logic to update AGiXT configuration here
                          // For now, let's assume it returns true for success
                          return true;
                        })(tempSettings.agixt.uri, tempSettings.agixt.apiKey);
                        if (success) {
                          showAlert("Success", "AGiXT configuration validated successfully");
                        }
                      }}
                      className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
                    >
                      Test Connection
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const showAlert = (title: string, message: string) => {
  alert(`${title}: ${message}`);
};

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

  // Add state for context menu
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    projectId: number;
  } | null>(null);

  // Add state for Kanban window
  const [isKanbanMinimized, setIsKanbanMinimized] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Add layout state
  const [layouts, setLayouts] = useState({
    taskList: { x: 0, y: 0, width: '25%', height: '100%' },
    kanban: { x: 25, y: 0, width: '50%', height: '100%' },
    notes: { x: 75, y: 0, width: '25%', height: '100%' }
  });

  // Add state
  const [settings, setSettings] = useState<Settings>({
    useWindowMode: false,
    theme: 'dark',
    accentColor: 'blue',
    sidebarCollapsed: false,
    showCompletedTasks: true,
    defaultView: 'list',
    database: {
      enabled: false,
      url: '',
      key: ''
    },
    agixt: {
      enabled: false,
      uri: '',
      apiKey: '',
      defaultAgent: ''
    }
  });

  // Add layout management
  const [layout, setLayout] = useState({
    mode: 'tiled' as 'tiled' | 'windowed',
    splits: [
      { id: 'taskList', size: 25 },
      { id: 'kanban', size: 50 },
      { id: 'notes', size: 25 }
    ]
  });

  const [showAddTaskForm, setShowAddTaskForm] = useState(false);

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

  // Add error state
  const [taskError, setTaskError] = useState<string | null>(null);

  // Update handleAddTask function
  const handleAddTask = async () => {
    setTaskError(null); // Reset error state
  
    if (!selectedProject) {
      setTaskError('Please select a project first');
      return;
    }
  
    if (!newTask.trim()) {
      setTaskError('Task name cannot be empty');
      return;
    }
  
    try {
      const taskId = Date.now();
      const newTaskData: Task = {
        id: taskId,
        projectId: selectedProject.id,
        task: newTask.trim(),
        description: newTaskDescription.trim(),
        isComplete: false,
        dueDate: newTaskDueDate || null,
        stage: 'toDo',
        notes: '',
        lastEdited: new Date()
      };
      
      const updatedTasks = [...tasks, newTaskData];
      setTasks(updatedTasks);
      await LocalForage.setItem('tasks', updatedTasks);
      
      // Clear inputs
      setNewTask('');
      setNewTaskDescription('');
      setNewTaskDueDate('');
      setTaskError(null);
    } catch (error) {
      console.error('Error adding task:', error);
      setTaskError('Failed to add task');
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

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
      if (!editingProjectId) return;
      setEditingProjectId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [editingProjectId]);

  // Filter tasks by project in render
  const projectTasks = tasks.filter(task => 
    selectedProject && task.projectId === selectedProject.id
  );

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

  // Add custom window component
  interface WindowProps {
    id: string;
    title: string;
    children: React.ReactNode;
    initialPos: { x: number; y: number };
    onDrag?: (pos: { x: number; y: number }) => void;
    canMinimize?: boolean;
  }

  interface DragPosition {
    x: number;
    y: number;
  }

  interface WindowPosition {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  const DraggableWindow: React.FC<WindowProps> = ({ id, title, children, initialPos, canMinimize }) => {
    const [pos, setPos] = useState<WindowPosition>({
      x: initialPos.x,
      y: initialPos.y,
      width: 400,
      height: 300
    });
    const [isDragging, setIsDragging] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isSnapping, setIsSnapping] = useState(false);
    const windowRef = useRef<HTMLDivElement>(null);
  
    const handleMouseDown = (e: React.MouseEvent) => {
      if (!windowRef.current) return;
      e.preventDefault();
      
      const rect = windowRef.current.getBoundingClientRect();
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      
      setIsDragging(true);
      document.body.style.cursor = 'grabbing'; // Keep cursor style even outside
    };
  
    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || !windowRef.current) return;
  
        const container = windowRef.current.parentElement;
        if (!container) return;
        const containerRect = container.getBoundingClientRect();
  
        const newX = e.clientX - dragStart.x - containerRect.left;
        const newY = e.clientY - dragStart.y - containerRect.top;
  
        // Corner snap zones
        const corners = [
          { x: 0, y: 0 }, // Top-left
          { x: containerRect.width - pos.width, y: 0 }, // Top-right
          { x: 0, y: containerRect.height - pos.height }, // Bottom-left
          { x: containerRect.width - pos.width, y: containerRect.height - pos.height }, // Bottom-right
        ];
  
        // Center snap zones
        const centers = [
          { x: (containerRect.width - pos.width) / 2, y: newY }, // Center vertical
          { x: newX, y: (containerRect.height - pos.height) / 2 }, // Center horizontal
        ];
  
        const snapThreshold = 30;
        let snappedX = newX;
        let snappedY = newY;
        let shouldSnap = false;
  
        // Check corner snaps
        corners.forEach(corner => {
          if (Math.abs(newX - corner.x) < snapThreshold && Math.abs(newY - corner.y) < snapThreshold) {
            snappedX = corner.x;
            snappedY = corner.y;
            shouldSnap = true;
          }
        });
  
        // Check center snaps
        centers.forEach(center => {
          if (Math.abs(newX - center.x) < snapThreshold) {
            snappedX = center.x;
            shouldSnap = true;
          }
          if (Math.abs(newY - center.y) < snapThreshold) {
            snappedY = center.y;
            shouldSnap = true;
          }
        });
  
        if (shouldSnap && !isSnapping) {
          setIsSnapping(true);
          setTimeout(() => setIsSnapping(false), 300);
        }
  
        setPos(prev => ({
          ...prev,
          x: Math.max(0, Math.min(snappedX, containerRect.width - pos.width)),
          y: Math.max(0, Math.min(snappedY, containerRect.height - pos.height))
        }));
      };
  
      const handleMouseUp = () => {
        setIsDragging(false);
        document.body.style.cursor = ''; // Reset cursor
        
        if (windowRef.current) {
          windowRef.current.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
          setTimeout(() => {
            if (windowRef.current) {
              windowRef.current.style.transition = '';
            }
          }, 200);
        }
      };
  
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
  
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
      };
    }, [isDragging, dragStart, pos.width, pos.height]);
  
    return (
      <div
        ref={windowRef}
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${isSnapping ? 0.98 : 1})`,
          width: pos.width,
          height: isMinimized ? 'auto' : pos.height,
          position: 'absolute',
          transition: isDragging ? 'none' : 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className={`
          bg-gray-800 rounded-lg shadow-lg
          ${isDragging ? 'shadow-2xl' : ''}
          ${isSnapping ? 'ring-2 ring-blue-500' : ''}
        `}
      >
        <div
          className={`
            flex items-center justify-between p-2 bg-gray-900 rounded-t-lg 
            cursor-grab active:cursor-grabbing select-none
            ${isDragging ? 'bg-gray-800' : ''}
          `}
          onMouseDown={handleMouseDown}
        >
          <h3 className="text-sm font-semibold text-gray-300">{title}</h3>
          {canMinimize && (
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
            >
              {isMinimized ? '⊞' : '⊟'}
            </button>
          )}
        </div>
        <div 
          className={`
            overflow-hidden transition-all duration-300
            ${isMinimized ? 'h-0' : 'h-[calc(100%-2.5rem)]'}
          `}
        >
          {children}
        </div>
      </div>
    );
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
              draggable="true"
              onDragStart={(e) => handleProjectDragStart(e, project)}
              onDragEnd={handleProjectDragEnd}
              onDragOver={(e) => handleProjectDragOver(e, project)}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({
                  x: e.clientX,
                  y: e.clientY,
                  projectId: project.id
                });
              }}
              className={`mb-2 flex items-center justify-between p-2 rounded cursor-move group
                ${selectedProject?.id === project.id ? 'bg-gray-700' : 'hover:bg-gray-800'}
                transition-colors duration-200`}
            >
              <div className="flex items-center gap-2 flex-1">
                {editingProjectId === project.id ? (
                  <input
                    type="text"
                    defaultValue={project.name}
                    className="bg-gray-700 px-2 py-1 rounded text-white w-full 
                      border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-opacity"
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
        {/* Header */}
        <div className="p-4 flex justify-between">
          <h1 className="text-xl font-bold text-gray-200">
            {selectedProject?.name || 'Task Dashboard'}
          </h1>
          <button
            onClick={() => setShowAddTaskForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <FaPlus size={14} />
            New Task
          </button>
        </div>

        {/* Task Add Modal */}
        {showAddTaskForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">Add New Task</h3>
              <div className="space-y-4">
                <input
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Task name"
                  className="w-full p-2 bg-gray-700 rounded text-white"
                  autoFocus
                />
                <textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Description (optional)"
                  className="w-full p-2 bg-gray-700 rounded text-white resize-none h-20"
                />
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded text-white"
                />
                {taskError && (
                  <p className="text-red-500 text-sm">{taskError}</p>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowAddTaskForm(false)}
                    className="px-4 py-2 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddTask}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Add Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="relative flex-1 overflow-hidden" ref={containerRef}>
          {/* Windows Container */}
          <div className="absolute inset-0">
            {settings.useWindowMode ? (
              // Windowed mode
              <div className="absolute inset-0">
                <DraggableWindow
                  id="taskList"
                  title="Task List"
                  initialPos={{ x: 0, y: 0 }}
                >
                  <div className="h-full p-4 bg-gray-800 rounded-xl shadow-md overflow-auto">
                    {/* Task list content */}
                    <h2 className="text-2xl font-bold mb-4 text-white">Tasks</h2>
                    <div className="space-y-2">
                      {taskError && (
                        <div className="text-red-500 text-sm">{taskError}</div>
                      )}
                      <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder={selectedProject ? "New task..." : "Select a project first"}
                        disabled={!selectedProject}
                        className={`w-full p-2 rounded bg-gray-700 
                          ${!selectedProject ? 'opacity-50 cursor-not-allowed' : ''}
                          ${taskError ? 'border border-red-500' : ''}`}
                      />
                      {/* Rest of task input fields */}
                    </div>
                    <div className="p-4 border-b border-gray-700">
                      <div className="flex flex-col gap-3">
                        <textarea
                          value={newTaskDescription}
                          onChange={(e) => setNewTaskDescription(e.target.value)}
                          placeholder="Description (optional)"
                          className="w-full p-2 bg-gray-700 rounded text-white resize-none h-20"
                        />
                        {taskError && (
                          <p className="text-red-500 text-sm">{taskError}</p>
                        )}
                        <button
                          onClick={handleAddTask}
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                          Add Task
                        </button>
                      </div>
                    </div>

                    {/* Task List */}
                    <ul className="mt-4 space-y-2">
                      {projectTasks.map((task) => (
                        <li
                          key={task.id}
                          onClick={() => handleSelectTask(task)}
                          draggable="true"
                          onDragStart={(e) => handleTaskDragStart(e, task)}
                          onDragEnd={handleTaskDragEnd}
                          onDragOver={(e) => handleTaskDragOver(e, task)}
                          className={`
                            p-3 rounded-lg cursor-pointer
                            ${selectedTask?.id === task.id ? 'bg-gray-700' : 'bg-gray-800'}
                            hover:bg-gray-700 transition-colors
                          `}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={task.isComplete}
                              onChange={() => handleToggleTaskCompletion(task.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="rounded border-gray-600"
                            />
                            <div className="flex-1 min-w-0">
                              <p className={`truncate ${task.isComplete ? 'line-through text-gray-500' : ''}`}>
                                {task.task}
                              </p>
                              {task.description && (
                                <p className="text-sm text-gray-400 truncate mt-0.5">
                                  {task.description}
                                </p>
                              )}
                            </div>
                            {task.dueDate && (
                              <span className="text-xs text-gray-400">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </DraggableWindow>

                <DraggableWindow
                  id="kanban"
                  title="Kanban Board"
                  initialPos={{ x: window.innerWidth / 3, y: 0 }}
                  canMinimize
                >
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between p-2 bg-gray-800 rounded-t">
                      <h2 className="text-lg font-bold">Kanban Board</h2>
                      <button
                        onClick={() => setIsKanbanMinimized(!isKanbanMinimized)}
                        className="p-1.5 hover:bg-gray-700 rounded"
                      >
                        {isKanbanMinimized ? '⊞' : '⊟'}
                      </button>
                    </div>
                    
                    <div className={`flex-1 transition-all duration-300 ${isKanbanMinimized ? 'h-0' : 'h-full'}`}>
                      {/* Kanban content */}
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
                    </div>
                  </div>
                </DraggableWindow>

                <DraggableWindow
                  id="notes"
                  title="Notes"
                  initialPos={{ x: (window.innerWidth / 3) * 2, y: 0 }}
                >
                  <NotesPanel 
                    task={selectedTask}
                    onUpdate={(notes) => {
                      if (!selectedTask) return;
                      handleUpdateNotes(selectedTask.id, notes);
                    }}
                  />
                </DraggableWindow>
              </div>
            ) : (
              // Tiled mode
              <PanelGroup direction="horizontal" className="h-full">
                <Panel defaultSize={25} minSize={20}>
                  <div className="h-full p-4 bg-gray-800 rounded-xl">
                    {/* Task List */}
                    <h2 className="text-2xl font-bold mb-4 text-white">Tasks</h2>
                    <div className="space-y-2">
                      {taskError && (
                        <div className="text-red-500 text-sm">{taskError}</div>
                      )}
                      <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder={selectedProject ? "New task..." : "Select a project first"}
                        disabled={!selectedProject}
                        className={`w-full p-2 rounded bg-gray-700 
                          ${!selectedProject ? 'opacity-50 cursor-not-allowed' : ''}
                          ${taskError ? 'border border-red-500' : ''}`}
                      />
                      {/* Rest of task input fields */}
                    </div>
                    <div className="p-4 border-b border-gray-700">
                      <div className="flex flex-col gap-3">
                        <textarea
                          value={newTaskDescription}
                          onChange={(e) => setNewTaskDescription(e.target.value)}
                          placeholder="Description (optional)"
                          className="w-full p-2 bg-gray-700 rounded text-white resize-none h-20"
                        />
                        {taskError && (
                          <p className="text-red-500 text-sm">{taskError}</p>
                        )}
                        <button
                          onClick={handleAddTask}
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                          Add Task
                        </button>
                      </div>
                    </div>

                    {/* Task List */}
                    <ul className="mt-4 space-y-2">
                      {projectTasks.map((task) => (
                        <li
                          key={task.id}
                          onClick={() => handleSelectTask(task)}
                          draggable="true"
                          onDragStart={(e) => handleTaskDragStart(e, task)}
                          onDragEnd={handleTaskDragEnd}
                          onDragOver={(e) => handleTaskDragOver(e, task)}
                          className={`
                            p-3 rounded-lg cursor-pointer
                            ${selectedTask?.id === task.id ? 'bg-gray-700' : 'bg-gray-800'}
                            hover:bg-gray-700 transition-colors
                          `}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={task.isComplete}
                              onChange={() => handleToggleTaskCompletion(task.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="rounded border-gray-600"
                            />
                            <div className="flex-1 min-w-0">
                              <p className={`truncate ${task.isComplete ? 'line-through text-gray-500' : ''}`}>
                                {task.task}
                              </p>
                              {task.description && (
                                <p className="text-sm text-gray-400 truncate mt-0.5">
                                  {task.description}
                                </p>
                              )}
                            </div>
                            {task.dueDate && (
                              <span className="text-xs text-gray-400">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Panel>
                
                <PanelResizeHandle />
                
                <Panel defaultSize={50} minSize={30}>
                  <div className="h-full p-4 bg-gray-800 rounded-xl">
                    {/* Kanban Board */}
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
                
                <PanelResizeHandle />
                
                <Panel defaultSize={25} minSize={20}>
                  <div className="h-full p-4 bg-gray-800 rounded-xl">
                    {/* Notes Panel */}
                    <NotesPanel 
                      task={selectedTask}
                      onUpdate={(notes) => {
                        if (!selectedTask) return;
                        handleUpdateNotes(selectedTask.id, notes);
                      }}
                    />
                  </div>
                </Panel>
              </PanelGroup>
            )}
          </div>
        </div>
      </div>
      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-gray-800 rounded shadow-lg py-1 min-w-[120px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-2"
            onClick={() => {
              setEditingProjectId(contextMenu.projectId);
              setContextMenu(null);
            }}
          >
            <FaEdit size={12} />
            <span>Rename</span>
          </button>
        </div>
      )}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={settings}
        onUpdate={setSettings}
      />
    </div>
  );
};

export default Page;