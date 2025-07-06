"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Task, SubTask } from '../../types/task'; // Assuming SubTask is defined in task.ts
import { useTasks } from '../../hooks/useTasks'; // Or a specific hook for subtasks if available
import { debounce } from 'lodash';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs for new subtasks

interface SubTasksListProps {
  parentTask: Task;
  onUpdateParentTask: (updatedFields: Partial<Task>) => Promise<void>; // To update the parent task with new subtasks array
}

// More visually appealing Pie Chart
const CompletionPieChart: React.FC<{ completed: number, total: number, size?: number }> = ({ completed, total, size = 10 }) => {
  if (total === 0) return null;
  const percentage = (completed / total) * 100;
  const radius = (size * 4) / 2 - 2; // size is tailwind h-X/w-X, so use it to calculate radius
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const strokeWidth = size >= 10 ? 4 : 3;

  return (
    <svg className={`w-${size} h-${size} transform -rotate-90`} viewBox={`0 0 ${size*4} ${size*4}`}>
      <circle
        className="text-border-default" // Softer background for the track
        strokeWidth={strokeWidth}
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx={size*2}
        cy={size*2}
      />
      <circle
        className="text-accent-primary transition-all duration-300 ease-in-out"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx={size*2}
        cy={size*2}
      />
    </svg>
  );
};


const SubTasksList: React.FC<SubTasksListProps> = ({ parentTask, onUpdateParentTask }) => {
  const [subTasks, setSubTasks] = useState<SubTask[]>(parentTask.subTasks || []);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
  const [showCompleted, setShowCompleted] = useState(false); // Default to hiding completed for cleaner view
  const [editingSubTaskId, setEditingSubTaskId] = useState<string | null>(null);
  const [editingSubTaskTitle, setEditingSubTaskTitle] = useState('');

  useEffect(() => {
    setSubTasks(parentTask.subTasks || []);
  }, [parentTask.subTasks]);

  const debouncedUpdateParent = useCallback(
    debounce(async (newSubTasks: SubTask[]) => {
      await onUpdateParentTask({ subTasks: newSubTasks });
    }, 750),
    [onUpdateParentTask]
  );

  const handleAddSubTask = () => {
    if (newSubTaskTitle.trim() === '') return;
    const newSubTask: SubTask = {
      id: uuidv4(),
      title: newSubTaskTitle.trim(),
      isCompleted: false,
      // parentId: parentTask.id, // Optional: if needed for backend
    };
    const updatedSubTasks = [...subTasks, newSubTask];
    setSubTasks(updatedSubTasks);
    debouncedUpdateParent(updatedSubTasks);
    setNewSubTaskTitle('');
  };

  const toggleSubTaskCompletion = (subTaskId: string) => {
    const updatedSubTasks = subTasks.map(st =>
      st.id === subTaskId ? { ...st, isCompleted: !st.isCompleted } : st
    );
    setSubTasks(updatedSubTasks);
    debouncedUpdateParent(updatedSubTasks);
  };

  const handleSubTaskTitleChange = (subTaskId: string, newTitle: string) => {
    const updatedSubTasks = subTasks.map(st =>
      st.id === subTaskId ? { ...st, title: newTitle } : st
    );
    setSubTasks(updatedSubTasks);
    // Debounce this update if it's directly typed, or update on blur/enter
    debouncedUpdateParent(updatedSubTasks);
  };

  const startEditingSubTask = (subTask: SubTask) => {
    setEditingSubTaskId(subTask.id);
    setEditingSubTaskTitle(subTask.title);
  };

  const cancelEditingSubTask = () => {
    setEditingSubTaskId(null);
    setEditingSubTaskTitle('');
  };

  const saveSubTaskTitle = (subTaskId: string) => {
    if (editingSubTaskTitle.trim() === '') {
        // Optionally delete if title is empty or revert
        const originalSubTask = subTasks.find(st => st.id === subTaskId);
        if (originalSubTask) setEditingSubTaskTitle(originalSubTask.title);
        setEditingSubTaskId(null);
        return;
    }
    handleSubTaskTitleChange(subTaskId, editingSubTaskTitle.trim());
    setEditingSubTaskId(null);
  };

  const deleteSubTask = (subTaskId: string) => {
    if (window.confirm("Are you sure you want to delete this sub-task?")) {
      const updatedSubTasks = subTasks.filter(st => st.id !== subTaskId);
      setSubTasks(updatedSubTasks);
      debouncedUpdateParent(updatedSubTasks);
    }
  };

  const completedCount = subTasks.filter(st => st.isCompleted).length;
  const totalCount = subTasks.length;

  const visibleSubTasks = showCompleted ? subTasks : subTasks.filter(st => !st.isCompleted);

  return (
    <section aria-labelledby="subtasks-heading" className="space-y-4 py-4 md:py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 id="subtasks-heading" className="heading-tertiary text-text-primary">
            Sub-tasks
          </h3>
          {totalCount > 0 && (
            <CompletionPieChart completed={completedCount} total={totalCount} size={6} />
          )}
          {totalCount > 0 && (
            <span className="text-sm text-text-secondary font-medium">
              {completedCount} / {totalCount}
            </span>
          )}
        </div>
        {totalCount > 0 && completedCount > 0 && ( // Only show toggle if there are completed tasks
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="btn btn-ghost btn-sm text-xs"
            aria-pressed={!showCompleted}
          >
            {showCompleted ? 'Hide Completed' : `Show ${completedCount} Completed`}
          </button>
        )}
      </div>

      {visibleSubTasks.length > 0 && (
        <ul className="space-y-2.5">
          {visibleSubTasks.map(subTask => (
            <li key={subTask.id} className="flex items-center gap-3 group p-2 rounded-lg hover:bg-bg-tertiary transition-colors duration-150 ease-in-out">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  id={`subtask-complete-${subTask.id}`}
                  checked={subTask.isCompleted}
                  onChange={() => toggleSubTaskCompletion(subTask.id)}
                  className="opacity-0 absolute h-5 w-5 cursor-pointer"
                  aria-label={`Mark sub-task ${subTask.title} as complete`}
                />
                <div
                    className={`w-5 h-5 border-2 rounded flex items-center justify-center cursor-pointer transition-all duration-150
                    ${subTask.isCompleted ? 'bg-accent-primary border-accent-primary' : 'border-border-light group-hover:border-accent-primary'}
                    focus-within:ring-2 focus-within:ring-accent-focus focus-within:ring-offset-1 focus-within:ring-offset-bg-tertiary`}
                    onClick={() => document.getElementById(`subtask-complete-${subTask.id}`)?.click()}
                >
                  {subTask.isCompleted && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-text-onAccent">
                      <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                    </svg>
                  )}
                </div>
              </div>
              {editingSubTaskId === subTask.id ? (
                  <input
                      type="text"
                      value={editingSubTaskTitle}
                      onChange={(e) => setEditingSubTaskTitle(e.target.value)}
                      onBlur={() => saveSubTaskTitle(subTask.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveSubTaskTitle(subTask.id); if (e.key === 'Escape') cancelEditingSubTask(); }}
                      className="flex-1 text-sm bg-transparent border-b border-accent-primary focus:outline-none py-0.5 text-text-primary"
                      autoFocus
                  />
              ) : (
                  <span
                      className={`flex-1 text-sm cursor-pointer ${subTask.isCompleted ? 'line-through text-text-disabled italic' : 'text-text-primary group-hover:text-accent-primaryHover'}`}
                      onClick={() => startEditingSubTask(subTask)}
                  >
                      {subTask.title}
                  </span>
              )}
              <button
                  onClick={() => deleteSubTask(subTask.id)}
                  className="text-text-tertiary hover:text-status-error opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-status-errorBg"
                  aria-label={`Delete sub-task ${subTask.title}`}
                  title="Delete sub-task"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
      {visibleSubTasks.length === 0 && subTasks.length > 0 && !showCompleted && (
        <p className="text-sm text-text-disabled italic pl-3">All remaining sub-tasks are completed. { totalCount > 0 && completedCount > 0 && (<button onClick={()=>setShowCompleted(true)} className="text-accent-primary hover:underline">Show completed.</button>)}</p>
      )}
      {totalCount === 0 && (
         <p className="text-sm text-text-disabled italic pl-3">No sub-tasks yet. Add one below.</p>
      )}


      <form onSubmit={(e)=>{e.preventDefault(); handleAddSubTask();}} className="flex items-center gap-2 pt-2 pl-1">
        <input
          type="text"
          value={newSubTaskTitle}
          onChange={(e) => setNewSubTaskTitle(e.target.value)}
          placeholder="+ Add a sub-task..."
          className="input-base flex-1 text-sm py-1.5 px-3 bg-bg-tertiary border-border-default rounded-md focus:ring-1 focus:ring-accent-focus focus:border-accent-focus placeholder-text-tertiary"
          aria-label="New sub-task title"
        />
        <button
          type="submit"
          className="btn btn-secondary btn-sm py-1.5 px-3 text-xs"
          disabled={newSubTaskTitle.trim() === ''}
          aria-label="Add sub-task"
        >
          Add
        </button>
      </form>
    </section>
  );
};

export default SubTasksList;
