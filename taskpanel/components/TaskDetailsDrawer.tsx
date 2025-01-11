import React, { useState } from 'react';
import { Calendar } from './Calendar';
import { format } from 'date-fns';
import SubtaskGenerator from './SubtaskGenerator';

export interface SubTask {
  id: number;
  title: string;
  description: string;
  estimatedTime: number;
  completed: boolean;
}

export interface TaskNote {
  id: number;
  content: string;
  timestamp: Date;
}

interface TaskDetailsDrawerProps {
  task: any;
  onClose: () => void;
  onUpdate?: (updatedTask: any) => void;
}

const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

type TaskPriorityType = typeof TaskPriority[keyof typeof TaskPriority];

const TaskStatus = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  BLOCKED: 'blocked',
  COMPLETED: 'completed'
} as const;

type TaskStatusType = typeof TaskStatus[keyof typeof TaskStatus];

const identifyDependencies = async (title: string, description: string) => {
  // Placeholder for dependency identification logic
  console.log("Identifying dependencies for:", title, description);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return ["dependency 1", "dependency 2"];
};

const TaskDetailsDrawer: React.FC<TaskDetailsDrawerProps> = ({ task, onClose, onUpdate }) => {
  const [taskState, setTaskState] = useState(task);
  const [aiStatus, setAIStatus] = useState({ processing: false });
  const [error, setError] = useState<string | null>(null);
  const [subtasks, setSubtasks] = useState<SubTask[]>(task.subtasks || []);
  const [showCalendar, setShowCalendar] = useState(false);
  const [notes, setNotes] = useState<({ id: number, content: string, timestamp: Date, isEditing: boolean })[]>(task.notes?.map((note: TaskNote) => ({ ...note, isEditing: false })) || []);
  const [newNote, setNewNote] = useState('');

  const handleSubtasksGenerated = (newSubtasks: SubTask[]) => {
    const updatedTask = {
      ...taskState,
      subtasks: [...subtasks, ...newSubtasks],
    };
    setTaskState(updatedTask);
    onUpdate?.(updatedTask);
    setSubtasks(updatedTask.subtasks);
  };

  const handlePriorityChange = (priority: TaskPriorityType) => {
    const updatedTask = {
      ...taskState,
      priority
    };
    setTaskState(updatedTask);
    onUpdate?.(updatedTask);
  };

  const handleStatusChange = (status: TaskStatusType) => {
    const updatedTask = {
      ...taskState,
      status
    };
    setTaskState(updatedTask);
    onUpdate?.(updatedTask);
  };

  const handleDueDateChange = (date: Date) => {
    const updatedTask = {
      ...taskState,
      dueDate: date
    };
    setTaskState(updatedTask);
    onUpdate?.(updatedTask);
    setShowCalendar(false);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    
    const newNoteObj = {
      id: Date.now(),
      content: newNote.trim(),
      timestamp: new Date(),
      isEditing: false
    };
    const updatedNotes = [...notes, newNoteObj];
    const updatedTask = {
      ...taskState,
      notes: updatedNotes
    };
    
    setNotes(updatedNotes);
    setTaskState(updatedTask);
    onUpdate?.(updatedTask);
    setNewNote('');
  };

  const handleEditNote = (id: number) => {
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === id ? { ...note, isEditing: true } : note
      )
    );
  };

  const handleRenameNote = (id: number, newContent: string) => {
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === id ? { ...note, content: newContent, isEditing: false } : note
      )
    );
  };

  const handleDeleteNote = (id: number) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
  };

  const handleIdentifyDependencies = async () => {
    setAIStatus((prev) => ({ ...prev, processing: true }));
    try {
      const dependencies = await identifyDependencies(task.title, task.description || "");
      console.log("Dependencies identified:", dependencies);
    } catch (error) {
      console.error("Error identifying dependencies:", error);
      setError(String(error));
    }
    finally {
      setAIStatus((prev) => ({ ...prev, processing: false }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
      <div className="bg-background dark:bg-background rounded-lg p-6 max-w-2xl mx-auto mt-20 max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-2">{taskState.title}</h2>
        <p className="text-muted-foreground mb-4">{taskState.description}</p>
        <input
          type="text"
          value={taskState.title}
          onChange={(e) => {
            const updatedTask = {...taskState, title: e.target.value};
            setTaskState(updatedTask);
            onUpdate?.(updatedTask);
          }}
          className="text-lg font-medium mb-2 bg-transparent border-b border-border/20 focus:outline-none w-full text-softWhite"
          placeholder="Task Title"
        />
        <textarea
          value={taskState.description}
          onChange={(e) => {
            const updatedTask = {...taskState, description: e.target.value};
            setTaskState(updatedTask);
            onUpdate?.(updatedTask);
          }}
          className="text-sm text-muted-foreground mb-4 bg-transparent border-b border-border/20 focus:outline-none w-full text-softWhite"
          placeholder="Task Description"
        />
        
        {/* Task Status and Priority */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select
              value={taskState.priority || TaskPriority.MEDIUM}
              onChange={(e) => handlePriorityChange(e.target.value as TaskPriorityType)}
              className="w-full p-2 rounded-md border border-border text-muted-foreground text-foreground bg-background"
            >
              <option value={TaskPriority.LOW}>Low</option>
              <option value={TaskPriority.MEDIUM}>Medium</option>
              <option value={TaskPriority.HIGH}>High</option>
              <option value={TaskPriority.URGENT}>Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={taskState.status || TaskStatus.NOT_STARTED}
              onChange={(e) => handleStatusChange(e.target.value as TaskStatusType)}
              className="w-full p-2 rounded-md border border-border text-muted-foreground bg-background text-foreground"
            >
              <option value={TaskStatus.NOT_STARTED}>Not Started</option>
              <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
              <option value={TaskStatus.BLOCKED}>Blocked</option>
              <option value={TaskStatus.COMPLETED}>Completed</option>
            </select>
          </div>
        </div>

        {/* Due Date */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Due Date</label>
          <div className="relative">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="w-full p-2 text-left rounded-md border border-border"
            >
              {taskState.dueDate ? format(new Date(taskState.dueDate), 'PPP') : 'Set due date'}
            </button>
            {showCalendar && (
              <div className="absolute z-10 mt-1">
                <input
                  type="date"
                  value={taskState.dueDate ? format(new Date(taskState.dueDate), 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    if (date) {
                      handleDueDateChange(date);
                    }
                    setShowCalendar(false);
                  }}
                  className="p-2 rounded-md border border-border"
                />
              </div>
            )}
          </div>
        </div>

        {/* AI Subtask Generator */}
        <div className="mb-6">
          <SubtaskGenerator
            task={taskState}
            onSubtasksGenerated={handleSubtasksGenerated}
          />
        </div>

        {/* AI Status and Error Messages */}
        {aiStatus.processing && (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            Analyzing tasks...
          </div>
        )}
        {error && <div className="text-red-500 mb-4">{error}</div>}

        {/* Subtasks List */}
        {subtasks.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium mb-3">Subtasks</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {subtasks.map((subtask, index) => (
                <div
                  key={index}
                  className="p-3 bg-background/50 rounded-lg border border-border/20"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => {
                        const updatedSubtasks = subtasks.map((st, i) =>
                          i === index ? { ...st, completed: !st.completed } : st
                        );
                        setSubtasks(updatedSubtasks);
                        const updatedTask = { ...taskState, subtasks: updatedSubtasks };
                        setTaskState(updatedTask);
                        onUpdate?.(updatedTask);
                      }}
                      className="h-4 w-4"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{subtask.title}</div>
                      <div className="text-sm text-muted-foreground">{subtask.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Estimated Time: {subtask.estimatedTime} minutes
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Task Notes */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Notes</h3>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                className="flex-1 p-2 rounded-md border border-border text-softWhite"
                onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
              />
              <button
                onClick={handleAddNote}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Add
              </button>
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 bg-background/50 rounded-lg border border-border/20 flex items-center gap-2"
                >
                  {note.isEditing ? (
                    <input
                      type="text"
                      className="flex-1 p-1 rounded-md border border-border"
                      value={note.content}
                      onChange={(e) => handleRenameNote(note.id, e.target.value)}
                      onBlur={() => setNotes(prevNotes => prevNotes.map(n => n.id === note.id ? {...n, isEditing: false} : n))}
                    />
                  ) : (
                    <div className="flex-1">
                      <p className="text-sm">{note.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(note.timestamp), 'PPp')}
                      </p>
                    </div>
                  )}
                  {!note.isEditing && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditNote(note.id)}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg px-4 py-2 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleIdentifyDependencies}
            className="bg-primary hover:bg-primary/80 text-primary-foreground rounded-lg px-4 py-2 transition-colors"
          >
            Identify Dependencies
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsDrawer;